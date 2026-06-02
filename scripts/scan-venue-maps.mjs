#!/usr/bin/env node
/**
 * scripts/scan-venue-maps.mjs
 *
 * Discovers official Hyrox venue / course maps for upcoming events and (in
 * --write mode) backfills them into src/data/events.ts -> `courseMapUrl`.
 *
 * Discovery source: the Hyrox WordPress media library REST API
 *   https://hyrox.com/wp-json/wp/v2/media?search=<term>
 * Hyrox uploads each venue map as a media attachment with a predictable,
 * city-named filename (e.g. HYROX_Berlin_VenueMap_NEW.pdf,
 * HYROX_Helsinki_VenueMap_PRINT_2215x1864mm.jpg, HYROX_Puebla_Mapa.pdf,
 * Plano-BCN-scaled-1.png). The public event PAGES render the map client-side
 * (Beaver Builder / lazy gallery) so a static HTML fetch never sees it, but
 * the media endpoint exposes every map with a stable hyrox.com CDN URL and a
 * real mime_type. EventCourseSection.astro already renders image / PDF /
 * fallback, so a fresh `courseMapUrl` is all that is needed.
 *
 * Matching (so a wrong / garbage image never gets written):
 *   - search the media library across map terms (VenueMap, Plano, Mapa, ...)
 *   - keep only image/* or application/pdf attachments on hyrox.com
 *   - a media item matches an event only when BOTH hold:
 *       (a) the event city is an exact token of the filename/title
 *           (or, for cities >= 6 chars, a substring) — so "Gent" never
 *           matches an "argentina" map, etc.
 *       (b) the title looks like a map (VenueMap / Mapa / Plano / ... )
 *   - among matches, take the most-recently-uploaded one
 *   - skip if the newest match is older than ~11 months (stale / wrong year)
 *   - the chosen URL is re-validated (200 + image|pdf content-type) before use
 *
 * Usage:
 *   node scripts/scan-venue-maps.mjs            # report only (no file changes)
 *   node scripts/scan-venue-maps.mjs --write    # patch src/data/events.ts
 *   node scripts/scan-venue-maps.mjs --slug berlin
 *   node scripts/scan-venue-maps.mjs --all      # include past events too
 *   node scripts/scan-venue-maps.mjs --json     # machine-readable report
 *
 * Pairs with .github/workflows/scan-venue-maps.yml, which runs --write on a
 * schedule, builds, and (only if the build is green) commits and pushes.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_PATH = path.resolve(__dirname, "../src/data/events.ts");
const USER_AGENT =
  "Mozilla/5.0 (compatible; hyroxvault-mapscan/1.0; +https://www.hyroxvault.com)";

const MEDIA_API = "https://hyrox.com/wp-json/wp/v2/media";
const MEDIA_SEARCH_TERMS = [
  "VenueMap",
  "venue map",
  "course map",
  "Plano",
  "Mapa",
  "Streckenplan",
];
const MAX_PAGES_PER_TERM = 6; // 100/page -> up to 600 hits per term
const ASSET_EXT = /\.(jpe?g|png|webp|avif|pdf)(\?|#|$)/i;
const MAP_TITLE_RE = /venue.?map|course.?map|streckenplan|plano|mapa|\bmap\b/i;
const STALE_AFTER_DAYS = 330;
const HYROX_HOST_RE = /^https?:\/\/(?:www\.)?hyrox\.com\//i;

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------
const argv = process.argv.slice(2);
const FLAGS = {
  write: argv.includes("--write"),
  all: argv.includes("--all"),
  json: argv.includes("--json"),
};
const slugFilter = (() => {
  const i = argv.indexOf("--slug");
  return i !== -1 ? argv[i + 1] : null;
})();

// ----------------------------------------------------------------------------
// events.ts parsing (text-based — events.ts is TS, so we don't import it)
// ----------------------------------------------------------------------------

/**
 * Extract each top-level event object literal from the EVENTS array, with
 * source offsets so --write can splice patched objects back in.
 */
function extractEventObjects(src) {
  const arrMatch = src.match(/export\s+const\s+EVENTS\s*:\s*[^=]*=\s*\[/);
  if (!arrMatch) throw new Error("Could not locate `export const EVENTS` array");
  let i = arrMatch.index + arrMatch[0].length;

  const objects = [];
  let depthBrace = 0;
  let depthBracket = 1; // inside the opening [ of EVENTS
  let inStr = null;
  let objStart = -1;

  for (; i < src.length; i++) {
    const c = src[i];
    const prev = src[i - 1];

    if (inStr) {
      if (c === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      i = nl === -1 ? src.length : nl;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? src.length : end + 1;
      continue;
    }

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
        objects.push({ start: objStart, end: i + 1, text: src.slice(objStart, i + 1) });
        objStart = -1;
      }
    }
  }
  return objects;
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

function field(text, name) {
  const m = stripComments(text).match(
    new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*"([^"]*)"`)
  );
  return m ? m[1] : null;
}
function numField(text, name) {
  const m = stripComments(text).match(
    new RegExp(`(?:^|[\\s,{])${name}\\s*:\\s*(\\d+)`)
  );
  return m ? Number(m[1]) : null;
}

function parseEvent(obj) {
  const text = obj.text;
  return {
    ...obj,
    slug: field(text, "slug"),
    city: field(text, "city"),
    year: numField(text, "year"),
    startDate: field(text, "startDate"),
    endDate: field(text, "endDate"),
    courseMapUrl: field(text, "courseMapUrl"),
    courseMapSourceUrl: field(text, "courseMapSourceUrl"),
    hyroxEventUrl: field(text, "hyroxEventUrl"),
  };
}

function isPast(ev) {
  const end = new Date(ev.endDate ?? ev.startDate);
  end.setDate(end.getDate() + 1);
  return Date.now() >= end.getTime();
}

// ----------------------------------------------------------------------------
// Text normalisation + matching
// ----------------------------------------------------------------------------
function normalize(s) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}
function tokens(s) {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Does `haystackTokens`/`haystackNorm` contain the event's city/slug token? */
function locationMatches(ev, rawTitle, fileName) {
  const cityToken = normalize(ev.city);
  const slugToken = normalize(ev.slug);
  const hayTokens = new Set([...tokens(rawTitle), ...tokens(fileName)]);
  const hayNorm = normalize(rawTitle) + normalize(fileName);

  const tokenHit = (tok) =>
    tok.length >= 4 &&
    (hayTokens.has(tok) || (tok.length >= 6 && hayNorm.includes(tok)));

  return tokenHit(cityToken) || tokenHit(slugToken);
}

// ----------------------------------------------------------------------------
// Network
// ----------------------------------------------------------------------------
async function fetchMediaMaps() {
  const byUrl = new Map();
  for (const term of MEDIA_SEARCH_TERMS) {
    let page = 1;
    let totalPages = 1;
    do {
      const url = `${MEDIA_API}?search=${encodeURIComponent(
        term
      )}&per_page=100&page=${page}&_fields=source_url,title,date,mime_type`;
      let res;
      try {
        res = await fetch(url, {
          headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        });
      } catch {
        break;
      }
      if (!res.ok) break;
      totalPages = Number(res.headers.get("x-wp-totalpages") || "1");
      const items = await res.json().catch(() => []);
      if (!Array.isArray(items)) break;
      for (const m of items) {
        const src = m?.source_url;
        if (!src || !ASSET_EXT.test(src) || !HYROX_HOST_RE.test(src)) continue;
        const mime = (m?.mime_type ?? "").toLowerCase();
        if (!mime.startsWith("image/") && !mime.includes("pdf")) continue;
        byUrl.set(src, {
          url: src,
          title: (m?.title?.rendered ?? "").replace(/&amp;/g, "&"),
          date: m?.date ?? "",
          mime,
        });
      }
      page++;
    } while (page <= totalPages && page <= MAX_PAGES_PER_TERM);
  }
  return [...byUrl.values()];
}

async function validateAsset(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "User-Agent": USER_AGENT,
          ...(method === "GET" ? { Range: "bytes=0-0" } : {}),
        },
        redirect: "follow",
      });
      if (res.status >= 200 && res.status < 300) {
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (ct.startsWith("image/") || ct.includes("application/pdf")) return true;
        if ((ct.includes("octet-stream") || ct === "") && ASSET_EXT.test(url)) return true;
        return false;
      }
    } catch {
      /* try next method */
    }
  }
  return false;
}

// ----------------------------------------------------------------------------
// Match one event to the best available map
// ----------------------------------------------------------------------------
function matchEventMap(ev, mediaMaps) {
  const matches = mediaMaps.filter((m) => {
    const fileName = m.url.split("/").pop();
    if (!MAP_TITLE_RE.test(m.title) && !MAP_TITLE_RE.test(fileName)) return false;
    return locationMatches(ev, m.title, fileName);
  });
  if (matches.length === 0) return null;

  matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const newest = matches[0];
  const ageDays = (Date.now() - new Date(newest.date).getTime()) / 86_400_000;
  if (Number.isFinite(ageDays) && ageDays > STALE_AFTER_DAYS) {
    return { stale: true, ...newest };
  }
  return newest;
}

// ----------------------------------------------------------------------------
// Writer — patch a single event object's courseMapUrl in events.ts text
// ----------------------------------------------------------------------------
function patchObjectText(objText, mapUrl, sourceUrl) {
  const hasActive = /^(\s*)courseMapUrl:\s*"[^"]*"(,?)/m.test(objText);
  if (hasActive) {
    return objText.replace(
      /^(\s*)courseMapUrl:\s*"[^"]*"(,?)/m,
      (_m, indent, comma) => `${indent}courseMapUrl: "${mapUrl}"${comma || ","}`
    );
  }
  const fieldIndent = objText.match(/\n(\s+)[A-Za-z_]+\s*:/)?.[1] ?? "    ";
  const lines = [`${fieldIndent}courseMapUrl: "${mapUrl}",`];
  if (sourceUrl && !/courseMapSourceUrl\s*:/.test(stripComments(objText))) {
    lines.push(`${fieldIndent}courseMapSourceUrl: "${sourceUrl}",`);
  }
  if (/\n\s*officialUrl\s*:/.test(objText)) {
    return objText.replace(/(\n\s*officialUrl\s*:)/, `\n${lines.join("\n")}$1`);
  }
  return objText.replace(/\n(\s*)\}$/, `\n${lines.join("\n")}\n$1}`);
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
async function main() {
  const src = await readFile(EVENTS_PATH, "utf8");
  let events = extractEventObjects(src).map(parseEvent).filter((e) => e.slug);

  if (slugFilter) events = events.filter((e) => e.slug === slugFilter);
  if (!FLAGS.all) events = events.filter((e) => !isPast(e));

  if (events.length === 0) {
    console.log("No matching events to scan.");
    return;
  }

  console.log("Fetching Hyrox media library (venue maps)...");
  const mediaMaps = await fetchMediaMaps();
  console.log(`Found ${mediaMaps.length} candidate map asset(s) in the media library.`);

  console.log(
    `\nScanning ${events.length} event(s)${FLAGS.write ? " (write mode)" : " (report only)"}...`
  );

  const results = [];
  for (const ev of events) {
    const match = matchEventMap(ev, mediaMaps);
    let r;
    if (!match) {
      r = { slug: ev.slug, status: "no-map-found", current: ev.courseMapUrl };
    } else if (match.stale) {
      r = { slug: ev.slug, status: "stale-skipped", current: ev.courseMapUrl, found: match.url, date: match.date };
    } else if (!(await validateAsset(match.url))) {
      r = { slug: ev.slug, status: "invalid-asset", current: ev.courseMapUrl, found: match.url };
    } else {
      const status = !ev.courseMapUrl
        ? "new"
        : ev.courseMapUrl === match.url
          ? "unchanged"
          : "updated";
      r = { slug: ev.slug, status, current: ev.courseMapUrl, found: match.url, source: match.title };
    }
    results.push({ ...r, _ev: ev });

    if (!FLAGS.json) {
      const tag = r.status.toUpperCase().padEnd(14);
      const detail =
        r.found && r.status !== "unchanged"
          ? `-> ${r.found}`
          : r.status === "unchanged"
            ? "(already current)"
            : "";
      console.log(`  ${tag} ${r.slug}  ${detail}`);
    }
  }

  const toWrite = results.filter((r) => r.status === "new" || r.status === "updated");
  if (FLAGS.write && toWrite.length > 0) {
    let updated = src;
    const ordered = [...toWrite].sort((a, b) => b._ev.start - a._ev.start);
    for (const r of ordered) {
      const before = updated.slice(0, r._ev.start);
      const after = updated.slice(r._ev.end);
      const patched = patchObjectText(r._ev.text, r.found, null);
      updated = before + patched + after;
    }
    await writeFile(EVENTS_PATH, updated, "utf8");
    console.log(`\nWrote ${toWrite.length} map update(s) to src/data/events.ts`);
  } else if (toWrite.length > 0) {
    console.log(`\n${toWrite.length} map update(s) available. Re-run with --write to apply.`);
  } else {
    console.log("\nNo new maps to write.");
  }

  if (FLAGS.json) {
    console.log(JSON.stringify(results.map(({ _ev, ...r }) => r), null, 2));
  }

  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\nSummary: ${JSON.stringify(counts)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
