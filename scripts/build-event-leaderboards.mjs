#!/usr/bin/env node
/**
 * scripts/build-event-leaderboards.mjs
 *
 * Builds src/data/event-leaderboards.generated.json — a per-race, per-division
 * top 10 plus field size and median finish, for every race that has already
 * happened. Rendered on /events/<year>/<city>/results/ as a provisional
 * leaderboard until (or unless) an editorial recap replaces it.
 *
 * WHY THE SEX FILTER IS ALWAYS APPLIED:
 *   An unfiltered division listing interleaves categories. Amsterdam 2026 Pro
 *   Doubles returns two rows ranked "1" — a women's team at 57:21 followed by a
 *   men's team at 49:45 — so row order is not finish order and row 1 is not the
 *   winner. Adding search[sex] collapses the list to a single category, and it
 *   then comes back strictly time-sorted with rank 1 = fastest. Filtering also
 *   makes the result count exact: unfiltered totals are bucketed ("> 1000
 *   Results") while filtered ones are precise ("298 Results").
 *
 * WHY THE PORTAL'S OWN TOTAL IS NOT THE FIELD SIZE:
 *   Many listings emit one row per team member rather than one per team, and a
 *   few duplicate the odd singles entrant too. Istanbul's open doubles returns
 *   100 rows for 50 teams and reports "636 Results"; the real field is 318.
 *   Where duplication is detected, the field size is read off the highest rank
 *   the portal itself prints on the last page, which is exact. This also matters
 *   for the median, which is a position in the field: indexing a de-duplicated
 *   list with a row-space position lands twice as deep as it should, which is
 *   how a relay division with ten teams ended up publishing the slowest of them
 *   as its median.
 *
 * THE OPEN-DOUBLES EXCEPTION:
 *   Some divisions never had the sex attribute populated — Amsterdam's open
 *   doubles reports 6 men and 0 women against a field of 1000+. When both sexes
 *   come back essentially empty we fall back to the unfiltered listing, re-sort
 *   it by time ourselves, and label the division "(all categories)". Field size
 *   is then the portal's bucketed figure and the median is omitted rather than
 *   guessed.
 *
 * PROVISIONAL BY DESIGN:
 *   Disqualifications and time corrections land days after a race, which is why
 *   podiums were human-gated before. Re-syncing on a schedule is what makes
 *   automation safe here: a race stays in the re-sync window for RESYNC_DAYS and
 *   every entry carries the date it was synced, surfaced on the page.
 *
 * PRECEDENCE:
 *   This file never overrides src/data/event-results.ts. Where an editorial
 *   division exists, the renderer prefers it.
 *
 * USAGE:
 *   node scripts/build-event-leaderboards.mjs                 # incremental
 *   node scripts/build-event-leaderboards.mjs --force         # re-sync everything
 *   node scripts/build-event-leaderboards.mjs --race milan --year 2026
 *   node scripts/build-event-leaderboards.mjs --max-races 2   # smoke test
 */

import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.resolve(__dirname, "../src/data/events.ts");
const INDEX_PATH = path.resolve(__dirname, "../src/data/hyrox-results-index.generated.ts");
const OUT_PATH = path.resolve(__dirname, "../src/data/event-leaderboards.generated.json");
const CACHE_DIR = path.resolve(__dirname, "../_research/leaderboard-cache");

const HX_BASE = "https://results.hyrox.com";
/** The portal 403s on a bare User-Agent — the fuller header set is required. */
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
const TOP_N = 10;
/** How long a finished race keeps getting re-synced, to absorb late DQs. */
const RESYNC_DAYS = 21;
/**
 * Guard rails on what counts as a finish time. The Hyrox world best is a shade
 * under 53 minutes and the slowest finishers come in around three hours, so a
 * value outside this range means we read the wrong cell rather than that someone
 * ran a 4-minute race.
 */
const MIN_PLAUSIBLE_SECONDS = 40 * 60;
const MAX_PLAUSIBLE_SECONDS = 5 * 3600;
/**
 * A leading row this much faster than the one behind it is a timing error, not a
 * performance. Incheon's Open Women list opens with a 34:20 ahead of a 1:05:41 —
 * nobody wins a Hyrox by half an hour. Relative rather than absolute, so it
 * stays correct as the sport gets faster.
 */
const OUTLIER_GAP_RATIO = 0.75;
/**
 * Ceiling on how deep the merged-median walk will page through one division id.
 * The largest field we have seen is a shade under 2,000, so 40 pages is a stop
 * for a runaway loop rather than a limit anyone should hit.
 */
const MAX_MEDIAN_PAGES = 40;

/**
 * Divisions worth a public leaderboard, in the order they should render.
 * Company Challenge (THD) and Adaptive (HA) are left out: the first is a
 * corporate side event and the second is a small field where a scraped ranking
 * invites more harm than value.
 */
const DIVISIONS = [
  { prefix: "HE", name: "Elite 15" },
  { prefix: "HPRO", name: "Pro" },
  { prefix: "H", name: "Open" },
  { prefix: "HDE", name: "Elite 15 Doubles" },
  { prefix: "HDP", name: "Pro Doubles" },
  { prefix: "HD", name: "Doubles" },
  { prefix: "HMR", name: "Team Relay" },
];
const SEX_LABEL = { M: "Men", W: "Women" };

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2);
const FLAGS = {
  force: false,
  fresh: false,
  delayMs: 350,
  maxRaces: 0,
  race: null,
  year: null,
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--force") FLAGS.force = true;
  else if (a === "--fresh") FLAGS.fresh = true;
  else if (a === "--delay") FLAGS.delayMs = Number(argv[++i]);
  else if (a === "--max-races") FLAGS.maxRaces = Number(argv[++i]);
  else if (a === "--race") FLAGS.race = argv[++i];
  else if (a === "--year") FLAGS.year = Number(argv[++i]);
  else {
    console.error(`Unknown flag: ${a}`);
    process.exit(2);
  }
}

// ----------------------------------------------------------------------------
// Reading the committed inputs
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
  const m = stripComments(text).match(new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*"([^"]*)"`));
  return m ? m[1] : null;
}
function numField(text, name) {
  const m = stripComments(text).match(new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*(\\d+)`));
  return m ? Number(m[1]) : null;
}

async function loadEvents() {
  const src = await readFile(EVENTS_PATH, "utf8");
  const map = new Map();
  for (const text of splitTopLevelObjects(src, /const\s+\w+\s*:\s*HyroxEvent\[\]\s*=\s*\[/)) {
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

async function loadResultsIndex() {
  const src = await readFile(INDEX_PATH, "utf8");
  const entries = [];
  for (const text of splitTopLevelObjects(
    src,
    /const\s+HYROX_RESULTS_INDEX\s*:\s*ResultsIndexEntry\[\]\s*=\s*\[/,
  )) {
    const slug = field(text, "slug");
    const year = numField(text, "year");
    const season = field(text, "season");
    if (!slug || !year || !season) continue;
    const divisions = [];
    const rx = /\{\s*id:\s*"([^"]+)",\s*label:\s*"([^"]*)"\s*\}/g;
    let m;
    while ((m = rx.exec(text)) !== null) divisions.push({ id: m[1], label: m[2] });
    entries.push({ slug, year, season, divisions });
  }
  return entries;
}

// ----------------------------------------------------------------------------
// Fetching
// ----------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Names carry accents; a wrong encoding guess corrupts them. */
function decodeBody(buf) {
  const utf8 = new TextDecoder("utf-8").decode(buf);
  return utf8.includes("\uFFFD") ? new TextDecoder("latin1").decode(buf) : utf8;
}

let fetchCount = 0;
async function fetchList(season, divisionId, sex, page) {
  const url =
    `${HX_BASE}/${season}/?pid=list&event=${encodeURIComponent(divisionId)}` +
    `&num_results=${PAGE_SIZE}&page=${page}` +
    (sex ? `&search%5Bsex%5D=${sex}` : "");
  const cacheFile = path.join(
    CACHE_DIR,
    `${createHash("sha1").update(url).digest("hex").slice(0, 16)}.html`,
  );
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
      const res = await fetch(url, { headers: { ...HEADERS, Referer: `${HX_BASE}/${season}/` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = decodeBody(await res.arrayBuffer());
      await writeFile(cacheFile, html, "utf8");
      fetchCount++;
      await sleep(FLAGS.delayMs);
      return html;
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(700 * attempt);
    }
  }
  return "";
}

// ----------------------------------------------------------------------------
// Parsing
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
 * Singles rows name a person in `type-fullname`; doubles and relay rows name the
 * whole team in `type-relay_member` ("Kim Evers, Cem Ter Burg"). Both are read
 * here, and the team form is kept verbatim — splitting on its comma would be
 * wrong, since that comma separates two people rather than surname from
 * forename.
 */
/**
 * Which cell holds the finish time is a per-page question, and it has to be
 * answered by outcome rather than by looking for the field.
 *
 * Elite 15 pages mention `type-time` somewhere in the markup while their data
 * rows carry the result in `type-eval` instead, so testing for the field's
 * presence drops every elite row. Choosing per row is worse still: a DNF has a
 * blank `type-time` and a station split in `type-eval`, which is how a "3:46
 * winner" gets published. Parsing the whole page each way and keeping whichever
 * actually produced times avoids both traps.
 */
function parseRows(html) {
  const byTime = extractRows(html, "time");
  if (byTime.some((r) => r.seconds !== null)) return byTime;
  const byEval = extractRows(html, "eval");
  return byEval.some((r) => r.seconds !== null) ? byEval : byTime;
}

function extractRows(html, timeField) {
  const rows = [];
  const liRx = /<li class="[^"]*list-group-item[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  let m;
  while ((m = liRx.exec(html)) !== null) {
    if (/list-group-header/.test(m[0])) continue;
    const block = m[1];
    const link = block.match(
      /type-(fullname|relay_member)"><a\s+href="([^"]*idp=[^"]*)"[^>]*>([\s\S]*?)<\/a>/,
    );
    if (!link) continue;
    const isTeam = link[1] === "relay_member";
    const idp = decodeHtml(link[2]).match(/[?&]idp=([^&]+)/)?.[1];
    const name = decodeHtml(link[3].replace(/<[^>]+>/g, "")).trim();
    if (!idp || !name) continue;
    const rank = Number(block.match(/type-place place-primary numeric"[^>]*>(\d+)</)?.[1] ?? "");
    const nation = block.match(/<span class="nation__abbr">([A-Z]+)<\/span>/)?.[1] ?? null;
    const ageGroup =
      block.match(/type-age_class"[^>]*>(?:<div[^>]*>[^<]*<\/div>)?\s*([^<]*)</)?.[1]?.trim() ||
      null;
    const finish = parseFinish(block, timeField);
    rows.push({
      idp: decodeURIComponent(idp),
      name: isTeam ? teamName(name) : toDisplayName(name),
      isTeam,
      rank: Number.isFinite(rank) && rank > 0 ? rank : null,
      nation,
      ageGroup: ageGroup && ageGroup !== "–" ? ageGroup : null,
      time: finish?.display ?? null,
      /** Kept at full precision purely so sorting can break whole-second ties. */
      seconds: finish?.seconds ?? null,
    });
  }
  return rows;
}

/**
 * Read a row's finish time.
 *
 * Most divisions put it in `type-time` as h:mm:ss. The Elite 15 races have no
 * `type-time` field at all and carry the result in `type-eval` as mm:ss.hh
 * ("53:47.18") — so requiring h:mm:ss silently dropped every elite row, which is
 * to say the marquee race of a World Championship weekend.
 */
function parseFinish(block, field) {
  const raw =
    block.match(
      new RegExp(`type-${field}"[^>]*>(?:<div[^>]*>[^<]*</div>)?\\s*([^<]*)<`),
    )?.[1]?.trim() ?? "";
  const m = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:\.(\d+))?$/.exec(raw);
  if (!m) return null;
  const [, h, a, b, frac] = m;
  const seconds =
    (h ? Number(h) * 3600 + Number(a) * 60 : Number(a) * 60) +
    Number(b) +
    (frac ? Number(`0.${frac}`) : 0);
  // A full Hyrox is eight runs and eight stations; the world's fastest are just
  // under 53 minutes. Anything far below that is not a finish time, it is a
  // single-station or partial split that has landed in the cell we read.
  if (seconds < MIN_PLAUSIBLE_SECONDS || seconds > MAX_PLAUSIBLE_SECONDS) return null;
  return { display: fmtTime(Math.floor(seconds)), seconds };
}

/**
 * The listing prints its own total, which is the cheapest possible field size —
 * but it is only exact for a filtered query. Unfiltered totals arrive bucketed
 * as "> 1000 Results".
 */
function parseTotal(html) {
  // Only the &gt; entity marks a bucketed total. Matching a bare ">" would
  // always match the one closing the enclosing <span>, flagging every count as
  // inexact and silently suppressing every median.
  const m = /(&gt;)?\s*([\d][\d.,]*)\s*Results/i.exec(html);
  if (!m) return { total: null, exact: false };
  return { total: Number(m[2].replace(/[.,]/g, "")), exact: !m[1] };
}

function fixCaps(name) {
  return name
    .split(/(\s+)/)
    .map((tok) => (/^[A-ZÀ-Þ'’-]{2,}$/.test(tok) ? tok[0] + tok.slice(1).toLowerCase() : tok))
    .join("");
}
/**
 * Team rosters arrive with members repeated, and not always the same number of
 * times: "Dexter Buchanan, Dexter Buchanan, Dexter Buchanan, Chris Woolley,
 * Chris Woolley" is one pair. Collapse repeats, keeping first-seen order.
 *
 * Matching folds accents and case, because the repeats are not always spelled
 * consistently — one Elite 15 Doubles row read "Viola Oberlander, Viola
 * Oberländer". Where spellings differ the accented one wins, since a stripped
 * diacritic is a transcription loss rather than a choice.
 *
 * Two teammates sharing a full name would collapse to one, which is a trade
 * worth making against 17% of team rows reading like a stutter.
 */
function teamName(raw) {
  const stripAccents = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const hasAccents = (s) => stripAccents(s) !== s;

  const best = new Map();
  const order = [];
  for (const part of raw.split(",")) {
    const member = part.trim();
    if (!member) continue;
    const key = stripAccents(member).toLowerCase();
    if (!best.has(key)) {
      best.set(key, member);
      order.push(key);
    } else if (!hasAccents(best.get(key)) && hasAccents(member)) {
      best.set(key, member);
    }
  }
  return order.map((k) => best.get(k)).join(", ");
}

/** "MENENDEZ FERNANDEZ, Pelayo" -> "Pelayo Menendez Fernandez" */
function toDisplayName(stored) {
  const trimmed = stored.trim();
  const i = trimmed.indexOf(",");
  const last = i === -1 ? trimmed : trimmed.slice(0, i);
  const first = i === -1 ? "" : trimmed.slice(i + 1);
  return [fixCaps(first.trim()), fixCaps(last.trim())].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

/** Match the editorial style in event-results.ts: h:mm:ss, no leading zero. */
const fmtTime = (s) =>
  `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function dedupe(rows) {
  const seen = new Set();
  return rows.filter((r) => (seen.has(r.idp) ? false : (seen.add(r.idp), true)));
}

// ----------------------------------------------------------------------------
// Median
// ----------------------------------------------------------------------------
/**
 * How many rows the portal prints per entrant on this listing.
 *
 * Usually 1. Doubles and relay listings repeat a team once per member, and the
 * odd singles entrant shows up twice for no visible reason, so it is measured
 * rather than assumed.
 */
function duplicationFactor(pageRows) {
  const distinct = new Set(pageRows.map((r) => r.idp)).size;
  return distinct > 0 ? pageRows.length / distinct : 1;
}

/**
 * How many entrants a duplicating listing actually holds.
 *
 * Scaling the reported row count by the first page's duplication factor is only
 * right when every entrant repeats the same number of times, and several races
 * mix the two — Katowice's Open Men repeats some athletes and not others, which
 * put a 22% error on a 1,332-strong field. The portal ranks entrants rather than
 * rows, so the highest rank on the last page is the answer, exactly, for one
 * extra fetch. Only duplicating listings pay for it.
 */
async function countEntrants(season, id, sex, reported) {
  const fallback = () => Math.round(reported.total / 2);
  if (!reported.exact) return reported.total;
  try {
    const lastPage = Math.max(1, Math.ceil(reported.total / PAGE_SIZE));
    const rows = parseRows(await fetchList(season, id, sex, lastPage));
    const maxRank = Math.max(...rows.map((r) => r.rank ?? 0), 0);
    // A listing whose last page carries no usable rank tells us nothing; halving
    // is the overwhelmingly common case and beats leaving the count doubled.
    return maxRank > 0 ? maxRank : fallback();
  } catch {
    return fallback();
  }
}

/**
 * Median of a division that lives under a single upstream id.
 *
 * The portal has already ranked the whole field, so the median is whatever sits
 * at the midpoint — which usually means fetching exactly one more page. The
 * target is found by its rank rather than by counting rows, because rows are
 * not entrants on a duplicating listing.
 */
async function singleIdMedian({ season, sex, total, rows, page: first }) {
  const targetRank = Math.ceil(total / 2);
  // `rows` is already de-duplicated and time-sorted, so on a field small enough
  // to fit in one page the midpoint is just an index into it.
  if (targetRank <= rows.length) return rows[targetRank - 1].time;
  if (targetRank > total) return null;

  // Estimate which page holds that rank, then confirm by reading the rank back.
  const pageNo = Math.max(1, Math.ceil((targetRank * first.dup) / PAGE_SIZE));
  for (const candidate of [pageNo, pageNo + 1, pageNo - 1]) {
    if (candidate < 1) continue;
    const pageRows = dedupe(parseRows(await fetchList(season, first.id, sex, candidate)));
    if (pageRows.length === 0) continue;
    const hit = pageRows.find((r) => r.rank === targetRank && r.time);
    if (hit) return hit.time;
    // Ranks skip when a listing carries DNFs, so settle for the closest one
    // that is on this page rather than paging around forever.
    if (pageRows.some((r) => r.rank !== null && r.rank >= targetRank)) {
      const near = pageRows.filter((r) => r.time && r.rank !== null);
      if (near.length === 0) continue;
      return near.reduce((best, r) =>
        Math.abs(r.rank - targetRank) < Math.abs(best.rank - targetRank) ? r : best,
      ).time;
    }
  }
  return null;
}

/**
 * Median of a division assembled from several upstream ids.
 *
 * Multi-day races that publish no Overall roll-up rank each day separately, and
 * the midpoint of the combined field is not the midpoint of any one day — which
 * is why this used to be skipped outright, costing 38 divisions their median
 * including every large Open field at Las Vegas, Bengaluru and Riga.
 *
 * There is no way to ask the portal for a merged ranking, so the field is pulled
 * in full and merged here. That is only a few hundred page fetches across the
 * whole calendar, and they are disk-cached, so the exact answer is cheaper than
 * a clever approximation would be to justify.
 */
async function mergedMedian({ season, pages, sex, total }) {
  const all = [];
  for (const p of pages) {
    // `reported` counts rows, which is what decides how many pages there are.
    const pageCount = Math.min(Math.ceil(p.reported / PAGE_SIZE), MAX_MEDIAN_PAGES);
    for (let page = 1; page <= pageCount; page++) {
      // Page 1 is already on disk from building the leaderboard itself.
      all.push(...parseRows(await fetchList(season, p.id, sex, page)));
    }
  }

  const finishers = dedupe(all)
    .filter((r) => r.seconds !== null)
    .sort((a, b) => a.seconds - b.seconds);
  if (finishers.length === 0) return null;

  // The portal ranks finishers ahead of anyone without a time, so the midpoint
  // of the field lands on a finisher unless most of the field failed to finish.
  // Clamping rather than returning null mirrors the walk-back in the single-id
  // path: the slowest recorded finish is the honest answer there.
  const midIndex = Math.min(Math.ceil(total / 2), finishers.length);
  return finishers[midIndex - 1].time;
}

// ----------------------------------------------------------------------------
// Building one division bucket
// ----------------------------------------------------------------------------
/**
 * Fetch the leading page(s) of one division/sex and reduce it to a leaderboard.
 * `ids` is usually a single "Overall" id; multi-day races that publish no
 * Overall roll-up are merged from their day ids instead.
 */
async function buildBucket({ season, ids, divisionName, sex }) {
  const pages = [];
  let total = 0;
  let exact = true;
  for (const id of ids) {
    const html = await fetchList(season, id, sex, 1);
    const t = parseTotal(html);
    if (t.total === null) return null;
    const firstPage = parseRows(html);
    // The portal counts rows, and rows are not entrants — see the header note.
    const count =
      duplicationFactor(firstPage) > 1
        ? await countEntrants(season, id, sex, t)
        : t.total;
    total += count;
    exact = exact && t.exact;
    pages.push({
      id,
      rows: firstPage,
      count,
      reported: t.total,
      /**
       * Average rows per entrant over the whole listing, used only to guess
       * which page holds the median. Derived from the two totals rather than
       * sampled from page 1, because the sample is what was unreliable.
       */
      dup: count > 0 ? t.total / count : 1,
      exact: t.exact,
    });
  }
  if (total === 0) return null;

  let rows = dedupe(pages.flatMap((p) => p.rows)).filter((r) => r.seconds !== null);
  if (rows.length === 0) return null;

  // Within a sex-filtered listing the portal's order is already finish order.
  // Sorting anyway costs nothing and is what makes the unfiltered fallback and
  // the multi-day merge correct.
  rows.sort((a, b) => a.seconds - b.seconds);

  // Discard impossibly fast leaders. Done after sorting and iteratively, since a
  // field can carry more than one bad chip read.
  while (rows.length >= 2 && rows[0].seconds < rows[1].seconds * OUTLIER_GAP_RATIO) {
    console.warn(
      `    ~ dropped outlier ${rows[0].name} ${rows[0].time} (next ${rows[1].time})`,
    );
    rows.shift();
  }
  if (rows.length === 0) return null;

  // Median. It needs the row at the midpoint of the whole field, so it is only
  // computable when the field is exactly counted.
  let medianTime = null;
  if (exact) {
    try {
      medianTime =
        ids.length === 1
          ? await singleIdMedian({ season, sex, total, rows, page: pages[0] })
          : await mergedMedian({ season, pages, sex, total });
    } catch {
      /* median is optional */
    }
  }

  return {
    division: `${divisionName} ${SEX_LABEL[sex] ?? "(all categories)"}`.trim(),
    sex: sex ?? null,
    /** Upstream division ids this was read from, so a figure can be traced back. */
    sourceIds: ids,
    /** Set when the division needed a fallback, to explain a missing median. */
    note: null,
    isTeam: rows[0].isTeam,
    fieldSize: total,
    fieldSizeExact: exact,
    fastestTime: rows[0].time,
    medianTime,
    top: rows.slice(0, TOP_N).map((r, i) => ({
      rank: i + 1,
      name: r.name,
      time: r.time,
      country: r.nation,
      ageGroup: r.ageGroup,
    })),
  };
}

async function buildRace(entry, meta, existing) {
  // Prefer the Overall roll-up: one query covers every day of the race.
  const byPrefix = new Map();
  for (const d of entry.divisions) {
    // Stockholm splits its open doubles across HD1_ (Saturday) and HD2_
    // (Sunday) instead of the usual HD_ with two day ids. Stripping the trailing
    // digit folds those back into the division they belong to; no real prefix
    // ends in a number.
    const prefix = d.id.split("_")[0].replace(/\d+$/, "");
    if (!byPrefix.has(prefix)) byPrefix.set(prefix, { overall: null, days: [] });
    const slot = byPrefix.get(prefix);
    if (d.id.endsWith("_OVERALL")) slot.overall = d.id;
    else slot.days.push(d.id);
  }

  const divisions = [];
  for (const { prefix, name } of DIVISIONS) {
    const slot = byPrefix.get(prefix);
    if (!slot) continue;
    const ids = slot.overall ? [slot.overall] : slot.days;
    if (ids.length === 0) continue;

    const buckets = [];
    for (const sex of ["M", "W"]) {
      try {
        const b = await buildBucket({ season: entry.season, ids, divisionName: name, sex });
        if (b) buckets.push(b);
      } catch (err) {
        console.warn(`    ! ${prefix} ${sex}: ${err.message}`);
      }
    }
    // The upstream sex attribute is not always usable, in two distinct ways.
    //
    //   Missing: Amsterdam's open doubles reports 6 men and 0 women against a
    //   field of 1000+, so one bucket comes back empty.
    //
    //   Wrong: Washington DC labels 2,080 of 2,082 Open entrants "W" on the
    //   Overall roll-up, and 940 of 941 "M" on the Sunday id. Both buckets are
    //   populated, so only the lopsidedness gives it away. A real Hyrox field is
    //   never 99% one sex.
    //
    // Either way the fix is the same: fall back to the unfiltered listing, which
    // is a superset of any filtered view, sort it ourselves, and label it so the
    // page does not claim a split it cannot support.
    const filteredTotal = buckets.reduce((n, b) => n + b.fieldSize, 0);
    const sizes = buckets.map((b) => b.fieldSize);
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);
    const lopsided = buckets.length === 2 && maxSize >= 50 && minSize / maxSize < 0.05;
    const incomplete = buckets.length < 2;

    if (lopsided || incomplete) {
      try {
        const combined = await buildBucket({
          season: entry.season,
          ids,
          divisionName: name,
          sex: null,
        });
        // For a lopsided split the unfiltered list is always the better source.
        // For a merely incomplete one it has to actually be bigger, which keeps
        // a legitimately tiny field (an Elite 15 wave) as a clean M/W split.
        if (combined && (lopsided || combined.fieldSize > filteredTotal)) {
          combined.division = `${name} (all categories)`;
          // The unfiltered total is bucketed and the order interleaves
          // categories, so neither an exact count nor a median is available.
          combined.fieldSizeExact = false;
          combined.medianTime = null;
          combined.note = "upstream sex data unusable for this division";
          divisions.push(combined);
          continue;
        }
      } catch (err) {
        console.warn(`    ! ${prefix} combined: ${err.message}`);
      }
    }
    divisions.push(...buckets);
  }

  if (divisions.length === 0) return null;
  return {
    slug: entry.slug,
    year: entry.year,
    city: meta?.city ?? entry.slug,
    season: entry.season,
    syncedAt: new Date().toISOString().slice(0, 10),
    raceEndDate: meta?.endDate ?? meta?.startDate ?? null,
    totalFinishers: divisions.reduce((n, d) => n + (d.fieldSizeExact ? d.fieldSize : 0), 0),
    divisions,
    previousSyncedAt: existing?.syncedAt ?? null,
  };
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  await mkdir(CACHE_DIR, { recursive: true });
  const events = await loadEvents();
  const index = await loadResultsIndex();

  let previous = { races: {} };
  try {
    previous = JSON.parse(await readFile(OUT_PATH, "utf8"));
  } catch {
    /* first run */
  }

  const today = new Date().toISOString().slice(0, 10);
  const resyncBefore = new Date(Date.now() - RESYNC_DAYS * 86400_000)
    .toISOString()
    .slice(0, 10);

  const queue = [];
  for (const entry of index) {
    if (FLAGS.race && entry.slug !== FLAGS.race) continue;
    if (FLAGS.year && entry.year !== FLAGS.year) continue;
    const meta = events.get(`${entry.year}:${entry.slug}`);
    const end = meta?.endDate ?? meta?.startDate;
    if (!end || end >= today) continue; // not raced yet

    const key = `${entry.year}/${entry.slug}`;
    const existing = previous.races?.[key];
    // Finished races stay in the re-sync window for a few weeks so late
    // disqualifications and time corrections get picked up; after that they are
    // settled and cost nothing to keep.
    const settled = existing && end < resyncBefore;
    if (settled && !FLAGS.force) continue;
    queue.push({ entry, meta, key, existing });
  }
  const work = FLAGS.maxRaces ? queue.slice(0, FLAGS.maxRaces) : queue;
  console.log(
    `Results index: ${index.length} races. ` +
      `${Object.keys(previous.races ?? {}).length} already synced. ` +
      `Building ${work.length}${FLAGS.force ? " (forced)" : ""}.`,
  );

  const races = { ...(previous.races ?? {}) };
  let built = 0;
  for (const job of work) {
    process.stdout.write(`  ${job.key} ... `);
    try {
      const race = await buildRace(job.entry, job.meta, job.existing);
      if (race) {
        races[job.key] = race;
        built++;
        console.log(
          `${race.divisions.length} divisions, ` +
            `${race.divisions.reduce((n, d) => n + d.top.length, 0)} ranked rows`,
        );
      } else {
        console.log("no published results");
      }
    } catch (err) {
      console.log(`FAILED ${err.message}`);
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    resyncDays: RESYNC_DAYS,
    note:
      "Provisional leaderboards synced from results.hyrox.com. Always queried with an explicit sex filter, because unfiltered division listings interleave categories and are not in finish order. Editorial data in event-results.ts takes precedence over anything here.",
    races,
  };
  await writeFile(OUT_PATH, JSON.stringify(payload, null, 2), "utf8");
  console.log(
    `\nBuilt ${built} race(s), ${Object.keys(races).length} total, ${fetchCount} fetches.\n` +
      `Wrote ${path.relative(process.cwd(), OUT_PATH)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
