#!/usr/bin/env node
/**
 * scripts/ingest-pro-results.mjs
 *
 * Builds src/data/pro-athletes.generated.json — the athlete race-history dataset
 * behind /athletes/<slug>/ and the "Past races" panel in the live tracker.
 *
 * WHY WE HAVE TO INGEST AT ALL:
 *   results.hyrox.com exposes no per-athlete history. Search is scoped to a
 *   single division-day (`event=ALL` is ignored) and athlete detail pages link
 *   only to rankings and startlists. "Show me this athlete's last 10 races" is
 *   therefore impossible as a request-time lookup and has to come from a
 *   dataset we assemble ourselves.
 *
 * SCOPE — Pro and Elite singles only (HPRO_, HE_):
 *   Doubles and relay divisions are deliberately excluded. Their rows identify a
 *   team, not a person, so attributing a doubles result to an individual would
 *   be guesswork. Open divisions are excluded because they are enormous and
 *   would turn this into a multi-million-row job.
 *
 * WHY ONLY ATHLETES WITH 2+ RACES ARE KEPT:
 *   The whole point of the dataset is history. A one-race entrant has none, and
 *   keeping them would multiply the file size for no benefit.
 *
 * IDENTITY:
 *   Mika's `idp` is per-entry, not per-person, so there is no stable athlete id
 *   upstream. Athletes are fingerprinted on normalised name + nation. That is
 *   reliable for Pro fields but not perfect; the script reports how many
 *   fingerprints look like collisions (same name+nation appearing twice at one
 *   race) so the error rate is visible rather than assumed.
 *
 * RESUMABLE:
 *   Every (division, sex, page) fetch is cached in _research/pro-ingest-cache
 *   so an interrupted run picks up where it left off. Delete that folder or pass
 *   --fresh to re-fetch.
 *
 * USAGE:
 *   node scripts/ingest-pro-results.mjs                    # seasons 9 + 8
 *   node scripts/ingest-pro-results.mjs --seasons season-8
 *   node scripts/ingest-pro-results.mjs --max-divisions 4  # smoke test
 *   node scripts/ingest-pro-results.mjs --fresh
 */

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.resolve(__dirname, "../src/data/events.ts");
const INDEX_PATH = path.resolve(
  __dirname,
  "../src/data/hyrox-results-index.generated.ts",
);
const OUT_PATH = path.resolve(__dirname, "../src/data/pro-athletes.generated.json");
const CACHE_DIR = path.resolve(__dirname, "../_research/pro-ingest-cache");

const HX_BASE = "https://results.hyrox.com";
/**
 * The portal 403s on a bare User-Agent — the fuller header set is required.
 */
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

/** num_results only accepts a small set of values; anything else falls back to 25. */
const PAGE_SIZE = 100;
/** Divisions we can attribute to one person. */
const SINGLES_PREFIXES = ["HPRO", "HE"];
const DIVISION_NAMES = { HPRO: "Hyrox Pro", HE: "Hyrox Elite 15" };
/** History needs at least two races to be history. */
const MIN_RACES = 2;

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2);
const FLAGS = {
  seasons: ["season-9", "season-8"],
  concurrency: 4,
  delayMs: 200,
  maxDivisions: 0,
  fresh: false,
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--fresh") FLAGS.fresh = true;
  else if (a === "--seasons") FLAGS.seasons = argv[++i].split(",").map((s) => s.trim());
  else if (a === "--concurrency") FLAGS.concurrency = Number(argv[++i]);
  else if (a === "--delay") FLAGS.delayMs = Number(argv[++i]);
  else if (a === "--max-divisions") FLAGS.maxDivisions = Number(argv[++i]);
  else {
    console.error(`Unknown flag: ${a}`);
    process.exit(2);
  }
}

// ----------------------------------------------------------------------------
// Inputs
// ----------------------------------------------------------------------------
function splitTopLevelObjects(src, arrayDeclRe) {
  const m = arrayDeclRe.exec(src);
  if (!m) return [];
  let depthBracket = 0;
  let depthBrace = 0;
  let objStart = -1;
  const objects = [];
  for (let i = m.index + m[0].length - 1; i < src.length; i++) {
    const c = src[i];
    if (c === "[") depthBracket++;
    else if (c === "]") {
      depthBracket--;
      if (depthBracket === 0) break;
    } else if (c === "{") {
      if (depthBrace === 0 && depthBracket === 1) objStart = i;
      depthBrace++;
    } else if (c === "}") {
      depthBrace--;
      if (depthBrace === 0 && objStart !== -1) {
        objects.push(src.slice(objStart, i + 1));
        objStart = -1;
      }
    }
  }
  return objects;
}
function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}
function field(text, name) {
  const m = stripComments(text).match(
    new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*"([^"]*)"`),
  );
  return m ? m[1] : null;
}
function numField(text, name) {
  const m = stripComments(text).match(
    new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*(\\d+)`),
  );
  return m ? Number(m[1]) : null;
}

async function loadEventDates() {
  const src = await readFile(EVENTS_PATH, "utf8");
  const map = new Map();
  for (const text of splitTopLevelObjects(
    src,
    /const\s+\w+\s*:\s*HyroxEvent\[\]\s*=\s*\[/,
  )) {
    const slug = field(text, "slug");
    const year = numField(text, "year");
    if (!slug || !year) continue;
    map.set(`${year}:${slug}`, {
      city: field(text, "city"),
      country: field(text, "country"),
      startDate: field(text, "startDate"),
      endDate: field(text, "endDate"),
    });
  }
  return map;
}

/**
 * Read the committed results index. It is machine-generated, so parsing it back
 * with regexes is safe, and reusing it means every race in the dataset is one we
 * have an event page to link to.
 */
async function loadResultsIndex() {
  const src = await readFile(INDEX_PATH, "utf8");
  const entries = [];
  const objects = splitTopLevelObjects(
    src,
    /const\s+HYROX_RESULTS_INDEX\s*:\s*ResultsIndexEntry\[\]\s*=\s*\[/,
  );
  for (const text of objects) {
    const slug = field(text, "slug");
    const year = numField(text, "year");
    const season = field(text, "season");
    if (!slug || !year || !season) continue;
    const divisions = [];
    const rx = /\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]*)"\s*\}/g;
    let m;
    while ((m = rx.exec(text)) !== null) {
      divisions.push({ id: m[1], label: m[2] });
    }
    entries.push({ slug, year, season, divisions });
  }
  return entries;
}

// ----------------------------------------------------------------------------
// Fetching
// ----------------------------------------------------------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Decode as UTF-8, falling back to latin1 when that produces replacement
 * characters — athlete names carry accents and a wrong guess corrupts slugs.
 */
function decodeBody(buf) {
  const utf8 = new TextDecoder("utf-8").decode(buf);
  if (!utf8.includes("\uFFFD")) return utf8;
  return new TextDecoder("latin1").decode(buf);
}

async function cachePath(key) {
  const hash = createHash("sha1").update(key).digest("hex").slice(0, 16);
  return path.join(CACHE_DIR, `${hash}.html`);
}

async function fetchListPage(season, divisionId, sex, page) {
  const url =
    `${HX_BASE}/${season}/?pid=list&event=${encodeURIComponent(divisionId)}` +
    `&num_results=${PAGE_SIZE}&page=${page}&search%5Bsex%5D=${sex}`;
  const cacheFile = await cachePath(url);
  if (!FLAGS.fresh) {
    try {
      await stat(cacheFile);
      return await readFile(cacheFile, "utf8");
    } catch {
      /* not cached yet */
    }
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { ...HEADERS, Referer: `${HX_BASE}/${season}/` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = decodeBody(await res.arrayBuffer());
      await writeFile(cacheFile, html, "utf8");
      return html;
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(700 * attempt);
    }
  }
  return "";
}

// ----------------------------------------------------------------------------
// Row parsing
// ----------------------------------------------------------------------------
function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Rows come back with duplicates. Some races render the whole ranking twice —
 * once as `list-active` and once plain (Auckland 2026 Pro does; Amsterdam
 * doesn't) — so a "100 row" page can hold 50 actual results. Deduplication is
 * therefore done on `idp`, which is unique per athlete-entry, by the caller.
 * Pagination still keys off the raw row count, because that is what the portal
 * itself is counting when it decides whether a page is full.
 */
function parseRows(html) {
  const rows = [];
  const liRx = /<li class="[^"]*list-group-item[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = liRx.exec(html)) !== null) {
    const block = m[1];
    if (/list-group-header/.test(m[0])) continue;
    const link = block.match(
      /type-fullname"><a\s+href="([^"]*idp=[^"]*)"[^>]*>([\s\S]*?)<\/a>/,
    );
    if (!link) continue;
    const href = decodeHtml(link[1]);
    const name = decodeHtml(link[2].replace(/<[^>]+>/g, "")).trim();
    if (!name) continue;
    const idp = href.match(/[?&]idp=([^&]+)/)?.[1];
    if (!idp) continue;

    const rank = Number(
      block.match(/type-place place-primary numeric"[^>]*>(\d+)</)?.[1] ?? "",
    );
    const nation =
      block.match(/<span class="nation__abbr">([A-Z]+)<\/span>/)?.[1] ?? null;
    const ageGroup =
      block
        .match(/type-age_class"[^>]*>(?:<div[^>]*>[^<]*<\/div>)?\s*([^<]*)</)?.[1]
        ?.trim() || null;
    const total = block.match(
      /type-time"[^>]*>(?:<div[^>]*>[^<]*<\/div>)?\s*(\d{1,2}:\d{2}:\d{2})/,
    )?.[1];

    rows.push({
      idp: decodeURIComponent(idp),
      name,
      rank: Number.isFinite(rank) && rank > 0 ? rank : null,
      nation,
      ageGroup: ageGroup && ageGroup !== "–" ? ageGroup : null,
      time: total ?? null,
    });
  }
  return rows;
}

// ----------------------------------------------------------------------------
// Names and identity
// ----------------------------------------------------------------------------
/** ALL-CAPS tokens become Title Case; mixed names (McCroary) are left alone. */
function fixCaps(name) {
  return name
    .split(/(\s+)/)
    .map((tok) =>
      /^[A-ZÀ-Þ'’-]{2,}$/.test(tok) ? tok[0] + tok.slice(1).toLowerCase() : tok,
    )
    .join("");
}

/** "Menendez Fernandez, Pelayo" -> "Pelayo Menendez Fernandez" */
function toDisplayName(stored) {
  const fixed = fixCaps(stored.trim());
  const i = fixed.indexOf(",");
  if (i === -1) return fixed.replace(/\s+/g, " ").trim();
  const last = fixed.slice(0, i).trim();
  const first = fixed.slice(i + 1).trim();
  return `${first} ${last}`.replace(/\s+/g, " ").trim();
}

function normaliseName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function slugifyName(display) {
  return display
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  const eventDates = await loadEventDates();
  const index = await loadResultsIndex();
  console.log(`Results index: ${index.length} races`);

  // Build the work list: every singles Pro/Elite division of every mapped race
  // in the requested season buckets.
  const jobs = [];
  for (const entry of index) {
    if (!FLAGS.seasons.includes(entry.season)) continue;
    const meta = eventDates.get(`${entry.year}:${entry.slug}`);
    for (const d of entry.divisions) {
      if (d.id.endsWith("_OVERALL")) continue;
      const prefix = d.id.split("_")[0];
      if (!SINGLES_PREFIXES.includes(prefix)) continue;
      jobs.push({
        season: entry.season,
        divisionId: d.id,
        divisionLabel: d.label,
        divisionName: DIVISION_NAMES[prefix] ?? d.label,
        raceSlug: entry.slug,
        raceYear: entry.year,
        raceCity: meta?.city ?? entry.slug,
        raceDate: meta?.startDate ?? null,
      });
    }
  }
  const work = FLAGS.maxDivisions ? jobs.slice(0, FLAGS.maxDivisions) : jobs;
  console.log(
    `Ingesting ${work.length} Pro/Elite singles divisions across ${FLAGS.seasons.join(", ")}`,
  );

  const results = [];
  const seenIdp = new Set();
  let cursor = 0;
  let done = 0;
  let fetches = 0;
  let duplicateRows = 0;

  async function worker() {
    while (cursor < work.length) {
      const job = work[cursor++];
      for (const sex of ["M", "W"]) {
        for (let page = 1; page <= 30; page++) {
          let html;
          try {
            html = await fetchListPage(job.season, job.divisionId, sex, page);
          } catch (err) {
            console.warn(`  ! ${job.divisionId} ${sex} p${page}: ${err.message}`);
            break;
          }
          fetches++;
          const rows = parseRows(html);
          for (const r of rows) {
            if (seenIdp.has(r.idp)) {
              duplicateRows++;
              continue;
            }
            seenIdp.add(r.idp);
            results.push({ ...r, ...job, sex });
          }
          if (rows.length < PAGE_SIZE) break;
          await sleep(FLAGS.delayMs);
        }
      }
      done++;
      if (done % 10 === 0) {
        console.log(
          `  ...${done}/${work.length} divisions, ${results.length} entries, ${fetches} fetches`,
        );
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(FLAGS.concurrency, work.length) }, worker),
  );
  console.log(
    `Collected ${results.length} entries from ${fetches} fetches ` +
      `(${duplicateRows} duplicate rows discarded)`,
  );

  // Group into athletes on normalised name + nation.
  const athletes = new Map();
  let collisions = 0;
  for (const r of results) {
    const key = `${normaliseName(r.name)}|${r.nation ?? "?"}`;
    if (!athletes.has(key)) {
      athletes.set(key, {
        name: toDisplayName(r.name),
        nation: r.nation,
        sex: r.sex,
        races: [],
      });
    }
    const athlete = athletes.get(key);
    // Same person, same race, twice means the fingerprint merged two people.
    const dupe = athlete.races.find(
      (x) => x.raceSlug === r.raceSlug && x.raceYear === r.raceYear && x.division === r.divisionName,
    );
    if (dupe) {
      collisions++;
      continue;
    }
    athlete.races.push({
      raceSlug: r.raceSlug,
      raceYear: r.raceYear,
      raceCity: r.raceCity,
      date: r.raceDate,
      division: r.divisionName,
      divisionLabel: r.divisionLabel,
      sex: r.sex,
      ageGroup: r.ageGroup,
      rank: r.rank,
      time: r.time,
      season: r.season,
      idp: r.idp,
      event: r.divisionId,
    });
  }

  // Keep only athletes with real history, newest race first.
  const kept = [];
  const usedSlugs = new Map();
  for (const athlete of athletes.values()) {
    if (athlete.races.length < MIN_RACES) continue;
    athlete.races.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
    let slug = slugifyName(athlete.name);
    if (!slug) continue;
    // Two different people can share a name; keep slugs unique and stable by
    // appending the nation, then a counter.
    if (usedSlugs.has(slug)) {
      const withNation = `${slug}-${(athlete.nation ?? "x").toLowerCase()}`;
      slug = usedSlugs.has(withNation)
        ? `${withNation}-${usedSlugs.get(withNation) + 1}`
        : withNation;
    }
    usedSlugs.set(slug, (usedSlugs.get(slug) ?? 0) + 1);
    kept.push({ slug, ...athlete });
  }
  kept.sort((a, b) => b.races.length - a.races.length || a.slug.localeCompare(b.slug));

  const payload = {
    generatedAt: new Date().toISOString(),
    seasons: FLAGS.seasons,
    divisionsIngested: work.length,
    rawEntries: results.length,
    note:
      "Pro and Elite singles only. Doubles and relay rows identify a team rather than a person, so they are excluded. Athletes with a single race are dropped because they have no history to show.",
    athletes: kept,
  };
  await writeFile(OUT_PATH, JSON.stringify(payload), "utf8");

  const bytes = Buffer.byteLength(JSON.stringify(payload));
  console.log(
    `\nUnique fingerprints: ${athletes.size}\n` +
      `Athletes with ${MIN_RACES}+ races: ${kept.length}\n` +
      `Fingerprint collisions (same name+nation twice in one race/division): ${collisions}` +
      ` (${((collisions / Math.max(1, results.length)) * 100).toFixed(2)}% of entries)\n` +
      `Wrote ${path.relative(process.cwd(), OUT_PATH)} (${(bytes / 1024 / 1024).toFixed(2)} MB)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
