#!/usr/bin/env node
/**
 * scripts/build-results-index.mjs
 *
 * Maps every event in src/data/events.ts to its location on the official Hyrox
 * timing portal, and writes src/data/hyrox-results-index.generated.ts.
 *
 * WHY THIS EXISTS:
 *   results.hyrox.com groups races into opaque "season-N" buckets, and every
 *   search must name one division-day id (e.g. HPRO_LR3MS4JI16C0). Neither can
 *   be derived from a race date:
 *     - season-8  = the completed 2025/26 season (112 races, 1519 divisions)
 *     - season-9  = the current rolling window (8 races)
 *     - season-10 = a legacy archive (2018/2019 races + World Championships)
 *   The previous code guessed the bucket from a cutoff date, which sent every
 *   race after 2026-08-15 to the 2018 archive, and never sent a division id at
 *   all — so the portal silently answered with whichever race it felt like.
 *
 * HOW THE MAPPING IS DISCOVERED:
 *   `?pid=start` lists every division id in a bucket but not which race each
 *   belongs to. A division id is `<DIVISION>_<DAYTOKEN>`, and all divisions
 *   sharing a DAYTOKEN belong to the same race day — so we probe one id per
 *   token and read the race name out of the page heading:
 *     "Search: 2026 Cape Town / HYROX PRO (Friday)"
 *   That is ~26 probes for season-9 and ~388 for season-8 instead of 1519.
 *
 * INCREMENTAL:
 *   Already-resolved day tokens are read back out of the generated file, so a
 *   re-run only probes tokens it has never seen. Pass --full to re-probe all.
 *
 * USAGE:
 *   node scripts/build-results-index.mjs                 # season-9 + season-8
 *   node scripts/build-results-index.mjs --seasons 9     # just the live window
 *   node scripts/build-results-index.mjs --full          # ignore cached tokens
 *   node scripts/build-results-index.mjs --dry           # print, don't write
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.resolve(__dirname, "../src/data/events.ts");
const OUT_PATH = path.resolve(
  __dirname,
  "../src/data/hyrox-results-index.generated.ts",
);

const HX_BASE = "https://results.hyrox.com";
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

/**
 * Disambiguation for races the portal labels identically to more than one of
 * our events. The portal prints no date, so a city that we split into two
 * events in the same year ("Cape Town" in April and "Cape Town (Summer)" in
 * August) is indistinguishable from the label alone — but the season bucket
 * separates them, because season-9 is the current rolling window and season-8
 * is the completed season. Keyed `<season>|<label exactly as printed>`.
 *
 * Set a value to null to ignore an upstream race entirely. The script prints
 * the exact key to add whenever it hits an unhandled collision.
 */
const RACE_LABEL_OVERRIDES = {
  // The current rolling window carries the August editions.
  "season-9|2026 Cape Town": { slug: "cape-town-summer", year: 2026 },
  "season-9|2026 Istanbul": { slug: "istanbul-summer", year: 2026 },
  // Everything below is in the completed season, so each label belongs to the
  // spring edition — the autumn/winter edition of the same city hasn't been
  // raced yet and will appear in a later bucket.
  "season-8|2026 Cape Town": { slug: "cape-town", year: 2026 },
  "season-8|2026 Istanbul": { slug: "istanbul", year: 2026 },
  "season-8|2026 Nice": { slug: "nice", year: 2026 },
  "season-8|2026 Washington DC": { slug: "washington-dc", year: 2026 },
  "season-8|2026 Beijing": { slug: "beijing", year: 2026 },
  "season-8|2026 Sao Paulo": { slug: "sao-paulo", year: 2026 },
  "season-8|2026 Helsinki": { slug: "helsinki", year: 2026 },
  "season-8|2026 Barcelona": { slug: "barcelona", year: 2026 },
  "season-8|2026 Shanghai": { slug: "shanghai", year: 2026 },
  "season-8|2026 Johannesburg": { slug: "johannesburg", year: 2026 },
  // Cities the portal names differently to us.
  "season-8|2026 Lisboa": { slug: "lisbon", year: 2026 },
  "season-8|2026 Paris GP": { slug: "paris", year: 2026 },
  // The portal names both March London races after the venue, so neither
  // normalises to one of our slugs and both fell through silently. Which is
  // which was confirmed against the portal rather than inferred: the EMEA label
  // carries HYROX ELITE 15 DOUBLES and only Saturday/Sunday divisions (our
  // 21–22 March championship), while the plain label runs Tuesday through
  // Sunday (our 24–29 March city race).
  "season-8|2026 EMEA London Olympia": { slug: "london-emea-championships", year: 2026 },
  "season-8|2026 London Olympia": { slug: "london-spring", year: 2026 },
  // The February Istanbul carries a trailing "1", which is why the plain
  // "season-8|2026 Istanbul" key above never fired. Kept anyway in case the
  // portal renames it. Verified by its division set: PRO, DOUBLES, RELAY and
  // ADAPTIVE with no day suffix, and a day token before the March races.
  "season-8|2026 Istanbul 1": { slug: "istanbul", year: 2026 },

  // Not races of ours. Listed explicitly so the unmatched report stays short
  // enough that a genuinely missing city is visible in it.
  "season-8|2026 London Olympia - Youngstars": null,
  "season-8|2026 Amsterdam - Youngstars": null,
  "season-8|2026 Berlin - Youngstars": null,
  "season-8|2026 Red Bull Monday Night shift: HYROX Invitational": null,
};

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2);
const FLAGS = { seasons: [9, 8], full: false, dry: false, concurrency: 4, delayMs: 250 };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--full") FLAGS.full = true;
  else if (a === "--dry") FLAGS.dry = true;
  else if (a === "--seasons")
    FLAGS.seasons = argv[++i].split(",").map((s) => Number(s.trim())).filter(Boolean);
  else if (a === "--concurrency") FLAGS.concurrency = Number(argv[++i]);
  else if (a === "--delay") FLAGS.delayMs = Number(argv[++i]);
  else {
    console.error(`Unknown flag: ${a}`);
    process.exit(2);
  }
}

// ----------------------------------------------------------------------------
// events.ts reader (same shape as scripts/fetch-race-podiums.mjs)
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

async function loadEvents() {
  const src = await readFile(EVENTS_PATH, "utf8");
  return splitTopLevelObjects(src, /const\s+\w+\s*:\s*HyroxEvent\[\]\s*=\s*\[/)
    .map((text) => ({
      slug: field(text, "slug"),
      city: field(text, "city"),
      year: numField(text, "year"),
      startDate: field(text, "startDate"),
    }))
    .filter((e) => e.slug && e.year);
}

// ----------------------------------------------------------------------------
// Label normalisation
// ----------------------------------------------------------------------------
/** "Cape Town (Summer)" -> "capetown"; "Washington DC (Fall)" -> "washingtondc" */
function normaliseCity(city) {
  return city
    .replace(/\([^)]*\)/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase();
}

/** "2026 Cape Town" -> { year: 2026, cityKey: "capetown" } */
function parseRaceLabel(label) {
  const m = /^(\d{4})\s+(.*)$/.exec(label.trim());
  if (!m) return { year: null, cityKey: normaliseCity(label) };
  return { year: Number(m[1]), cityKey: normaliseCity(m[2]) };
}

// ----------------------------------------------------------------------------
// Upstream fetching
// ----------------------------------------------------------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchText(url, attempt = 1) {
  try {
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (err) {
    if (attempt >= 3) throw err;
    await sleep(600 * attempt);
    return fetchText(url, attempt + 1);
  }
}

/** Every division id + label advertised by a season bucket, in page order. */
async function fetchSeasonDivisions(season) {
  const html = await fetchText(`${HX_BASE}/${season}/?pid=start`);
  const select = /name="event"[\s\S]*?<\/select>/.exec(html)?.[0] ?? "";
  const out = [];
  const rx = /<option value="([^"]+)"[^>]*>([^<]*)<\/option>/g;
  let m;
  while ((m = rx.exec(select)) !== null) {
    out.push({ id: m[1], label: decodeEntities(m[2]).trim() });
  }
  return out;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "-")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

/** `HPRO_LR3MS4JI16C0` -> `LR3MS4JI16C0` (shared by every division that day). */
function dayToken(id) {
  const i = id.indexOf("_");
  return i === -1 ? id : id.slice(i + 1);
}

/**
 * Ask the portal which race a division belongs to. A search for a nonsense name
 * returns a ~35 KB page with a heading naming the race, versus ~300 KB for a
 * full result list — so this is the cheap way to resolve the mapping.
 */
async function probeRaceLabel(season, divisionId) {
  const url = `${HX_BASE}/${season}/?pid=search&event=${encodeURIComponent(divisionId)}&search%5Bname%5D=zzzzzzzzzz`;
  const html = await fetchText(url);
  const heading = /<h2>\s*(?:Results|Search):\s*([^<]+?)\s*<\/h2>/i.exec(html)?.[1];
  if (!heading) return null;
  // "2026 Cape Town / HYROX PRO (Friday)" -> race half only
  const race = heading.split("/")[0].trim();
  return race || null;
}

/** Resolve tokens with a small worker pool so we stay polite. */
async function resolveTokens(season, tokens, representativeById) {
  const results = new Map();
  let cursor = 0;
  let done = 0;
  async function worker() {
    while (cursor < tokens.length) {
      const token = tokens[cursor++];
      const divisionId = representativeById.get(token);
      try {
        const label = await probeRaceLabel(season, divisionId);
        if (label) results.set(token, label);
      } catch (err) {
        console.warn(`  ! ${season} ${token}: ${err.message}`);
      }
      done++;
      if (done % 25 === 0) {
        console.log(`  ...resolved ${done}/${tokens.length} race days`);
      }
      await sleep(FLAGS.delayMs);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(FLAGS.concurrency, tokens.length) }, worker),
  );
  return results;
}

// ----------------------------------------------------------------------------
// Read back already-resolved tokens so re-runs are cheap
// ----------------------------------------------------------------------------
async function loadCachedTokens() {
  if (FLAGS.full) return new Map();
  const cache = new Map();
  try {
    const src = await readFile(OUT_PATH, "utf8");
    const rx = /\/\* dayToken \*\/ "([^"]+)":\s*\{ season: "([^"]+)", race: "([^"]*)" \}/g;
    let m;
    while ((m = rx.exec(src)) !== null) {
      cache.set(`${m[2]}:${m[1]}`, m[3]);
    }
  } catch {
    /* first run */
  }
  return cache;
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  const events = await loadEvents();
  console.log(`Loaded ${events.length} events from events.ts`);

  const cached = await loadCachedTokens();
  if (cached.size) console.log(`Reusing ${cached.size} cached race days`);

  // dayToken -> { season, race }
  const tokenRace = new Map();
  // upstream race label -> { season, divisions: [{id,label}] }
  const races = new Map();

  for (const n of FLAGS.seasons) {
    const season = `season-${n}`;
    const divisions = await fetchSeasonDivisions(season);
    if (divisions.length === 0) {
      console.warn(`! ${season}: no divisions found, skipping`);
      continue;
    }

    const representative = new Map();
    for (const d of divisions) {
      const t = dayToken(d.id);
      if (!representative.has(t)) representative.set(t, d.id);
    }

    const allTokens = [...representative.keys()];
    const todo = allTokens.filter((t) => !cached.has(`${season}:${t}`));
    console.log(
      `${season}: ${divisions.length} divisions, ${allTokens.length} race days (${todo.length} to probe)`,
    );

    const resolved = await resolveTokens(season, todo, representative);
    for (const t of allTokens) {
      const label = resolved.get(t) ?? cached.get(`${season}:${t}`);
      if (label) tokenRace.set(`${season}:${t}`, { season, race: label });
    }

    for (const d of divisions) {
      const entry = tokenRace.get(`${season}:${dayToken(d.id)}`);
      if (!entry) continue;
      const key = `${season}|${entry.race}`;
      if (!races.has(key)) {
        races.set(key, { season, race: entry.race, divisions: [] });
      }
      races.get(key).divisions.push(d);
    }
  }

  // Join upstream races onto our events. A race can only claim an event when
  // the normalised city and year match exactly; anything else is reported and
  // skipped rather than guessed at.
  const byEventKey = new Map();
  const unmatched = [];
  for (const { season, race, divisions } of races.values()) {
    const overrideKey = `${season}|${race}`;
    if (Object.prototype.hasOwnProperty.call(RACE_LABEL_OVERRIDES, overrideKey)) {
      const forced = RACE_LABEL_OVERRIDES[overrideKey];
      if (!forced) continue;
      const ev = events.find((e) => e.slug === forced.slug && e.year === forced.year);
      if (ev) {
        addEntry(byEventKey, ev, season, race, divisions);
        continue;
      }
      console.warn(`! override "${overrideKey}" points at an event we don't have`);
      continue;
    }
    const { year, cityKey } = parseRaceLabel(race);
    const candidates = events.filter(
      (e) => e.year === year && normaliseCity(e.city) === cityKey,
    );
    if (candidates.length === 1) {
      addEntry(byEventKey, candidates[0], season, race, divisions);
    } else if (candidates.length > 1) {
      console.warn(
        `! ambiguous ${q(overrideKey)} matches ${candidates.map((c) => c.slug).join(", ")}\n` +
          `    add to RACE_LABEL_OVERRIDES: ${q(overrideKey)}: { slug: "…", year: ${year} }`,
      );
    } else {
      unmatched.push(race);
    }
  }

  const entries = [...byEventKey.values()].sort(
    (a, b) => a.year - b.year || a.slug.localeCompare(b.slug),
  );
  console.log(
    `Mapped ${entries.length} of our events; ${unmatched.length} upstream races have no event of ours`,
  );
  if (unmatched.length) {
    console.log("  upstream races with no event of ours (add an override if one is really ours):");
    for (const label of unmatched.sort()) console.log(`    - ${label}`);
  }

  const out = render(entries, tokenRace);
  if (FLAGS.dry) {
    console.log(out.slice(0, 2000));
    console.log("... (--dry, nothing written)");
    return;
  }
  await writeFile(OUT_PATH, out, "utf8");
  console.log(`Wrote ${path.relative(process.cwd(), OUT_PATH)}`);
}

function addEntry(map, ev, season, race, divisions) {
  const key = `${ev.year}:${ev.slug}`;
  const existing = map.get(key);
  // A race can appear in more than one bucket (the rolling window duplicates
  // some of the completed season). Prefer the bucket with more divisions.
  if (existing && existing.divisions.length >= divisions.length) return;
  map.set(key, {
    slug: ev.slug,
    year: ev.year,
    city: ev.city,
    startDate: ev.startDate,
    season,
    race,
    divisions: divisions.slice().sort((a, b) => a.id.localeCompare(b.id)),
  });
}

function q(s) {
  return JSON.stringify(s);
}

function currentSeason(entries) {
  let best = null;
  for (const e of entries) {
    if (!best || (e.startDate ?? "") > (best.startDate ?? "")) best = e;
  }
  return best?.season ?? "season-9";
}

function render(entries, tokenRace) {
  const lines = [];
  lines.push("// AUTO-GENERATED by scripts/build-results-index.mjs — do not edit by hand.");
  lines.push("//");
  lines.push("// Maps our events onto results.hyrox.com. The season bucket and the");
  lines.push("// division-day ids cannot be derived from a race date, so they are");
  lines.push("// discovered from the portal and committed here. Re-run the script when");
  lines.push("// new races appear on the calendar.");
  lines.push("");
  lines.push(`export const RESULTS_INDEX_GENERATED_AT = ${q(new Date().toISOString())};`);
  lines.push("");
  lines.push("/**");
  lines.push(" * The bucket holding the most recent race we could map. Races that Hyrox");
  lines.push(" * hasn't published a startlist for yet aren't in the index at all, so this");
  lines.push(" * is the best guess for where one will show up first.");
  lines.push(" */");
  lines.push(
    `export const RESULTS_INDEX_CURRENT_SEASON = ${q(currentSeason(entries))};`,
  );
  lines.push("");
  lines.push("export interface ResultsDivision {");
  lines.push("  /** Upstream division-day id, e.g. HPRO_LR3MS4JI16C0. */");
  lines.push("  id: string;");
  lines.push('  /** Upstream label, e.g. "HYROX PRO - Friday". */');
  lines.push("  label: string;");
  lines.push("}");
  lines.push("");
  lines.push("export interface ResultsIndexEntry {");
  lines.push("  slug: string;");
  lines.push("  year: number;");
  lines.push('  /** Season bucket on results.hyrox.com, e.g. "season-9". */');
  lines.push("  season: string;");
  lines.push('  /** Race label exactly as the portal prints it, e.g. "2026 Cape Town". */');
  lines.push("  raceLabel: string;");
  lines.push("  divisions: ResultsDivision[];");
  lines.push("}");
  lines.push("");
  lines.push("export const HYROX_RESULTS_INDEX: ResultsIndexEntry[] = [");
  for (const e of entries) {
    lines.push("  {");
    lines.push(`    slug: ${q(e.slug)},`);
    lines.push(`    year: ${e.year},`);
    lines.push(`    season: ${q(e.season)},`);
    lines.push(`    raceLabel: ${q(e.race)},`);
    lines.push("    divisions: [");
    for (const d of e.divisions) {
      lines.push(`      { id: ${q(d.id)}, label: ${q(d.label)} },`);
    }
    lines.push("    ],");
    lines.push("  },");
  }
  lines.push("];");
  lines.push("");
  lines.push("// Resolved race days, kept so re-running the builder only probes new ones.");
  lines.push("// Format is load-bearing: the script parses these lines back out.");
  lines.push("/* eslint-disable */");
  lines.push("const RESOLVED_RACE_DAYS = {");
  for (const [key, val] of [...tokenRace.entries()].sort()) {
    const token = key.slice(key.indexOf(":") + 1);
    lines.push(
      `  /* dayToken */ ${q(token)}: { season: ${q(val.season)}, race: ${q(val.race)} },`,
    );
  }
  lines.push("};");
  lines.push("export type ResolvedRaceDays = typeof RESOLVED_RACE_DAYS;");
  lines.push("");
  return lines.join("\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
