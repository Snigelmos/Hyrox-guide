#!/usr/bin/env node
/**
 * Nordic in-place refresher.
 *
 * Per the user's QA-only request for Denmark (and consistency for the
 * other Nordic countries), this script does NOT re-discover gyms via
 * city anchors. Instead it:
 *
 *   1. Reads _research/nordic-gyms.json (the existing 182-record raw
 *      seed produced by the legacy Nominatim pipeline).
 *   2. For each record, looks up its WPSL post id from all-stores.json
 *      and queries store_search at the record's lat/lng (5km radius)
 *      to refresh the canonical address, website, phone, and lat/lng.
 *   3. Writes a normalized "discovered" record to
 *      _research/nordic-discovered.json, ready for qa-region.mjs.
 *
 * The QA pass then applies strict rules and emits the typed module.
 *
 * Caching: re-uses _research/wpsl-search-cache.json so a re-run is
 * essentially free (no new HTTP traffic for unchanged coords).
 */

import { setTimeout as sleep } from "node:timers/promises";
import {
  buildSlugMap,
  cachedStoreSearch,
  decodeHtml,
  loadJson,
  normalizeRow,
  saveJson,
} from "./lib/store-search.mjs";

const ROOT = process.cwd();
const ALL_STORES = `${ROOT}/_research/all-stores.json`;
const NORDIC_RAW = `${ROOT}/_research/nordic-gyms.json`;
const CACHE_PATH = `${ROOT}/_research/wpsl-search-cache.json`;
const OUT_PATH = `${ROOT}/_research/nordic-discovered.json`;

const slugById = buildSlugMap(ALL_STORES);
// Reverse: slug -> id
const idBySlug = new Map();
for (const [id, slug] of slugById.entries()) idBySlug.set(slug, id);

const raw = loadJson(NORDIC_RAW, []);
const cache = loadJson(CACHE_PATH, {});

console.log(`Refreshing ${raw.length} Nordic records via store_search...`);

const out = [];
const missingId = [];
const noMatch = [];
let hits = 0;
let queries = 0;
let cacheHits = 0;

for (let i = 0; i < raw.length; i++) {
  const g = raw[i];
  if (g.unresolved) continue;

  const wpslId = idBySlug.get(g.slug);
  if (!wpslId) {
    missingId.push(g.slug);
    continue;
  }

  let res;
  try {
    res = await cachedStoreSearch(cache, g.lat, g.lng, 5, 25);
  } catch (e) {
    console.error(`[${i + 1}/${raw.length}] ${g.slug}: search failed: ${e.message}`);
    continue;
  }
  if (res.cached) cacheHits++;
  else queries++;
  if (queries % 5 === 0) saveJson(CACHE_PATH, cache);

  let match = res.results.find((r) => String(r.id) === String(wpslId));
  if (!match) {
    // Try a wider search.
    let wide;
    try {
      wide = await cachedStoreSearch(cache, g.lat, g.lng, 25, 75);
    } catch (e) {
      console.error(`[${i + 1}/${raw.length}] ${g.slug}: wide search failed: ${e.message}`);
    }
    if (wide) {
      if (wide.cached) cacheHits++;
      else queries++;
      match = wide.results.find((r) => String(r.id) === String(wpslId));
    }
  }

  if (!match) {
    // Final fallback: name + cityHint match.
    match = res.results.find(
      (r) =>
        decodeHtml(r.store).toLowerCase() === (g.title ?? "").toLowerCase() &&
        decodeHtml(r.city).toLowerCase().includes((g.cityHint ?? "").toLowerCase()),
    );
  }

  if (!match) {
    noMatch.push(g.slug);
    continue;
  }

  const rec = normalizeRow(match, slugById);
  out.push(rec);
  hits++;
  if ((i + 1) % 25 === 0) {
    console.log(`  ${i + 1}/${raw.length}: ${hits} matched, ${noMatch.length} no-match`);
  }
}

saveJson(CACHE_PATH, cache);
saveJson(OUT_PATH, out);

console.log("");
console.log(`Done. Matched ${hits}/${raw.length}.`);
console.log(`  ${queries} live queries, ${cacheHits} cache hits.`);
if (missingId.length) console.log(`  Missing WPSL id: ${missingId.length}`);
if (noMatch.length) console.log(`  No store_search match: ${noMatch.slice(0, 10).join(", ")}${noMatch.length > 10 ? ", ..." : ""}`);
console.log(`Output: ${OUT_PATH}`);
