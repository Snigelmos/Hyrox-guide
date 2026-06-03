#!/usr/bin/env node
/**
 * scripts/fetch-race-podiums.mjs
 *
 * Turns a finished Hyrox weekend into a ready-to-paste RACE_RESULTS entry for
 * src/data/event-results.ts — so the /events/[year]/[city]/results/ page and
 * the "recently finished" rail on /live stop saying "Race report being
 * compiled" and start showing real podiums.
 *
 * WHY THIS IS PRINT-ONLY (no --write):
 *   Results data is editorial and occasionally messy — e.g. an official rank 1
 *   can be vacant after a post-race disqualification (Lyon 2026 Pro Women did
 *   exactly this). Blindly writing the scraped top-3 would publish a 2nd-place
 *   finisher as the winner. So this script gathers the numbers and prints a
 *   block for a human to eyeball and paste. Maps (low-risk) are auto-committed
 *   by scan-venue-maps.yml; podiums (high-risk) stay human-gated on purpose.
 *
 * SOURCE:
 *   hyresult.com ranking pages are server-rendered — the full results table is
 *   in the initial HTML (no headless browser needed), so a plain fetch works
 *   locally and in CI. URL shape:
 *     https://www.hyresult.com/ranking/s<season>-<year>-<city>-hyrox-<division>
 *   e.g. s8-2026-berlin-hyrox-pro-men
 *
 * USAGE:
 *   node scripts/fetch-race-podiums.mjs <event-slug> [more slugs...]
 *   node scripts/fetch-race-podiums.mjs berlin riga
 *   node scripts/fetch-race-podiums.mjs --pending          # every finished event with no results entry
 *   node scripts/fetch-race-podiums.mjs berlin --season 8 --year 2026
 *   node scripts/fetch-race-podiums.mjs london-spring --hyrox-slug london   # when our slug != hyresult's
 *   node scripts/fetch-race-podiums.mjs berlin --divisions pro-men,pro-women,pro-doubles-men
 *
 * The <event-slug> is OUR slug from src/data/events.ts. hyresult usually uses
 * the same city token; pass --hyrox-slug to override the city portion when it
 * doesn't (championship / multi-event cities).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.resolve(__dirname, "../src/data/events.ts");
const RESULTS_PATH = path.resolve(__dirname, "../src/data/event-results.ts");
const USER_AGENT =
  "Mozilla/5.0 (compatible; hyroxvault-podiumfetch/1.0; +https://www.hyroxvault.com)";

// Map a hyresult URL division segment -> the division label we store, and
// whether we publish a podium (pro) or just an athlete count (open is huge).
const DIVISIONS = {
  "pro-men": { label: "Pro Men", podium: true },
  "pro-women": { label: "Pro Women", podium: true },
  "pro-doubles-men": { label: "Pro Doubles Men", podium: true },
  "pro-doubles-women": { label: "Pro Doubles Women", podium: true },
  "pro-doubles-mixed": { label: "Pro Doubles Mixed", podium: true },
  "open-men": { label: "Open Men", podium: false },
  "open-women": { label: "Open Women", podium: false },
};

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2);
const FLAGS = { season: 8, year: 2026, top: 3, divisions: null, hyroxSlug: null, pending: false };
const slugs = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--pending") FLAGS.pending = true;
  else if (a === "--season") FLAGS.season = Number(argv[++i]);
  else if (a === "--year") FLAGS.year = Number(argv[++i]);
  else if (a === "--top") FLAGS.top = Number(argv[++i]);
  else if (a === "--hyrox-slug") FLAGS.hyroxSlug = argv[++i];
  else if (a === "--divisions") FLAGS.divisions = argv[++i].split(",").map((s) => s.trim()).filter(Boolean);
  else if (a.startsWith("--")) { console.error(`Unknown flag: ${a}`); process.exit(2); }
  else slugs.push(a);
}
const DIVISION_KEYS = FLAGS.divisions ?? ["pro-men", "pro-women", "open-men", "open-women"];

// ----------------------------------------------------------------------------
// Minimal events.ts / event-results.ts readers (same approach as scan-venue-maps.mjs)
// ----------------------------------------------------------------------------
function splitTopLevelObjects(src, arrayDeclRe) {
  // arrayDeclRe must END at the array's opening "[" (so a "Type[]" annotation
  // in the declaration can't be mistaken for the array opener).
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
  const m = stripComments(text).match(new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*"([^"]*)"`));
  return m ? m[1] : null;
}
function numField(text, name) {
  const m = stripComments(text).match(new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*(\\d+)`));
  return m ? Number(m[1]) : null;
}

async function loadEvents() {
  const src = await readFile(EVENTS_PATH, "utf8");
  return splitTopLevelObjects(src, /const\s+\w+\s*:\s*HyroxEvent\[\]\s*=\s*\[/).map((text) => ({
    slug: field(text, "slug"),
    city: field(text, "city"),
    countryCode: field(text, "countryCode"),
    year: numField(text, "year"),
    startDate: field(text, "startDate"),
    endDate: field(text, "endDate"),
    venue: field(text, "venue"),
  })).filter((e) => e.slug);
}
async function loadResultSlugs() {
  const src = await readFile(RESULTS_PATH, "utf8");
  const set = new Set();
  for (const text of splitTopLevelObjects(src, /const\s+\w+\s*:\s*RaceResult\[\]\s*=\s*\[/)) {
    const slug = field(text, "citySlug");
    const year = numField(text, "year");
    if (slug) set.add(`${year}:${slug}`);
  }
  return set;
}
function isPast(ev) {
  const end = new Date(ev.endDate ?? ev.startDate);
  end.setDate(end.getDate() + 1);
  return Date.now() >= end.getTime();
}

// ----------------------------------------------------------------------------
// Parsing a hyresult ranking page
// ----------------------------------------------------------------------------
function toTitleCaseName(name) {
  // hyresult occasionally stores names ALL CAPS ("ALEJANDRO PAREJA VILLAR").
  // Title-case fully-uppercase tokens; leave already-mixed names (McCroary,
  // de St Pern) untouched.
  return name
    .split(/(\s+)/)
    .map((tok) => (/^[A-ZÀ-Þ'’-]{2,}$/.test(tok) ? tok[0] + tok.slice(1).toLowerCase() : tok))
    .join("")
    .trim();
}
function normalizeTime(t) {
  // mm:ss -> 0:mm:ss ; h:mm:ss stays as-is.
  return /^\d{1,2}:\d{2}$/.test(t) ? `0:${t}` : t;
}

function parseRanking(html, top) {
  const fieldSizeMatch = html.match(/Ranking\s*\((\d+)\)/);
  const athleteCount = fieldSizeMatch ? Number(fieldSizeMatch[1]) : undefined;

  // The overall-rank cell is the only one tagged "whitespace-nowrap" with a
  // bare integer; the AG-rank and name cells use other classes, so anchoring
  // there reliably grabs the overall rank. From there, lazily skip to the
  // flag + /athlete/ link, then to the first finish time. Age groups use a
  // dash ("25-29") so they never collide with the colon time pattern.
  // Anchor the lazy skip on the name cell class ("font-semibold") rather than
  // on the flag — some athletes have no flag <img> (unknown nationality), and
  // anchoring on the flag would then pair a rank with the NEXT athlete's name.
  // Flag code can be a sub-region too (gb-eng, gb-sct, gb-wls) — capture the
  // whole code and normalise to ISO later. Flag is optional (some athletes
  // have none), hence the (?:...)?.
  const rowRe =
    /whitespace-nowrap">(\d+)<\/td>[\s\S]*?<td class="[^"]*font-semibold[^"]*">(?:<img[^>]*flags\/([a-z-]{2,})\.svg[^>]*>)?\s*<a href="\/athlete\/[^"]+">([^<]+)<\/a>[\s\S]*?(\d{1,2}:\d{2}(?::\d{2})?)/g;

  const seen = new Set();
  const rows = [];
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    const rank = Number(m[1]);
    if (seen.has(rank)) continue;
    seen.add(rank);
    rows.push({
      rank,
      // gb-eng / gb-sct / gb-wls / gb-nir all map to the ISO country "GB".
      country: m[2] ? m[2].split("-")[0].toUpperCase() : undefined,
      athlete: toTitleCaseName(m[3].trim()),
      time: normalizeTime(m[4]),
    });
    if (rows.length >= Math.max(top, 1) + 4) break; // buffer for gaps/DQs
  }
  rows.sort((a, b) => a.rank - b.rank);
  return { athleteCount, rows };
}

async function fetchDivision(season, year, citySlug, divisionKey, top) {
  const url = `https://www.hyresult.com/ranking/s${season}-${year}-${citySlug}-hyrox-${divisionKey}`;
  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html" } });
  } catch (err) {
    return { url, error: `fetch failed: ${err.message}` };
  }
  if (!res.ok) return { url, error: `HTTP ${res.status}` };
  const html = await res.text();
  const { athleteCount, rows } = parseRanking(html, top);
  return { url, athleteCount, rows };
}

// ----------------------------------------------------------------------------
// Rendering a ready-to-paste TS block
// ----------------------------------------------------------------------------
function tsString(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}
function renderEntry(ev, divisions) {
  const today = new Date().toISOString().slice(0, 10);
  const L = [];
  L.push(`  // ---- ${ev.city} (${ev.startDate}${ev.endDate && ev.endDate !== ev.startDate ? `–${ev.endDate}` : ""}) ----`);
  L.push(`  {`);
  L.push(`    year: ${ev.year},`);
  L.push(`    citySlug: ${tsString(ev.slug)},`);
  L.push(`    recapPublished: ${tsString(today)},`);
  L.push(`    notableStories: [`);
  L.push(`      // TODO: 1–2 sentence human summary per marquee division.`);
  L.push(`    ],`);
  L.push(`    divisions: [`);
  for (const d of divisions) {
    const meta = DIVISIONS[d.key] ?? { label: d.key, podium: true };
    L.push(`      {`);
    L.push(`        division: ${tsString(meta.label)},`);
    if (d.athleteCount != null) L.push(`        athleteCount: ${d.athleteCount},`);
    if (meta.podium && d.rows.length) {
      L.push(`        podium: [`);
      for (const r of d.rows.slice(0, FLAGS.top)) {
        const rankTok = r.rank > 3 ? `/* CHECK rank ${r.rank} */ ${r.rank}` : r.rank;
        const countryTok = r.country ? `, country: ${tsString(r.country)}` : "";
        L.push(
          `          { rank: ${rankTok}, athlete: ${tsString(r.athlete)}, time: ${tsString(r.time)}${countryTok} },`,
        );
      }
      L.push(`        ],`);
    }
    L.push(`      },`);
  }
  L.push(`    ],`);
  L.push(`    takeaways: [`);
  L.push(`      // TODO: one editorial takeaway.`);
  L.push(`    ],`);
  L.push(`  },`);
  return L.join("\n");
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  const events = await loadEvents();
  const haveResults = await loadResultSlugs();

  let targets = slugs;
  if (FLAGS.pending) {
    const pending = events
      .filter((e) => isPast(e) && !haveResults.has(`${e.year}:${e.slug}`))
      .map((e) => e.slug);
    targets = [...new Set([...targets, ...pending])];
  }
  if (!targets.length) {
    console.error("No event slugs given. Pass one or more slugs, or --pending.");
    console.error("Example: node scripts/fetch-race-podiums.mjs berlin riga");
    process.exit(2);
  }

  for (const slug of targets) {
    const ev =
      events.find((e) => e.slug === slug && e.year === FLAGS.year) ||
      events.find((e) => e.slug === slug);
    if (!ev) {
      console.error(`\n# ${slug}: not found in events.ts — skipping`);
      continue;
    }
    const citySlug = FLAGS.hyroxSlug ?? slug;
    const divisions = [];
    const notes = [];
    for (const key of DIVISION_KEYS) {
      const r = await fetchDivision(FLAGS.season, ev.year, citySlug, key, FLAGS.top);
      if (r.error) {
        notes.push(`#   ${key}: ${r.error} (${r.url})`);
        continue;
      }
      if (!r.rows.length && r.athleteCount == null) {
        notes.push(`#   ${key}: no rows parsed — results may not be published yet (${r.url})`);
        continue;
      }
      // Flag a vacant official rank 1 (Lyon-style DQ) so a human decides.
      if (DIVISIONS[key]?.podium && r.rows.length && r.rows[0].rank !== 1) {
        notes.push(`#   ${key}: WARNING official rank 1 is missing (top row is rank ${r.rows[0].rank}) — likely a DQ/withdrawal; verify before publishing the podium.`);
      }
      divisions.push({ key, athleteCount: r.athleteCount, rows: r.rows });
    }

    console.log(`\n# ============================================================`);
    console.log(`# ${ev.city} ${ev.year} — paste into src/data/event-results.ts`);
    console.log(`# hyresult: https://www.hyresult.com/event/s${FLAGS.season}-${ev.year}-${citySlug}-hyrox`);
    if (notes.length) console.log(notes.join("\n"));
    console.log(`# ============================================================`);
    if (divisions.length) console.log(renderEntry(ev, divisions));
    else console.log(`# (no division data parsed — nothing to paste yet)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
