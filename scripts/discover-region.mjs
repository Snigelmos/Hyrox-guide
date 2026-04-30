#!/usr/bin/env node
/**
 * Universal city-anchor discovery script.
 *
 * Usage: node scripts/discover-region.mjs <regionId>
 *
 * Reads _research/regions/<regionId>.config.json:
 *   {
 *     regionId: "uk",
 *     regionLabel: "United Kingdom",
 *     anchors: [
 *       { city: "London", lat: 51.5072, lng: -0.1276, radiusKm: 30 },
 *       ...
 *     ],
 *     countryNames: ["United Kingdom", "England", "Scotland", "Wales", "Northern Ireland"],
 *     bbox: [49.5, 59, -7, 2],     // [latMin, latMax, lngMin, lngMax]
 *     stateAllowlist: [...],         // optional, used for US per-state filtering
 *     slugDenylist: [...],           // optional
 *   }
 *
 * Emits _research/<regionId>-discovered.json (array of normalized records).
 * Caches each anchor's response to _research/discover-cache-<regionId>.json
 * so re-runs are free.
 *
 * Rate limit: 1 req per 1.5s. Multiple parallel sub-agent invocations
 * against different regionIds share the same upstream domain but each
 * has its own cache file.
 */

import { existsSync, writeFileSync } from "node:fs";
import {
  buildSlugMap,
  cachedStoreSearch,
  loadJson,
  normalizeRow,
  saveJson,
} from "./lib/store-search.mjs";
import {
  classifyRecord,
  STRICT_REASONS,
} from "./lib/qa-rules.mjs";

const ROOT = process.cwd();
const ALL_STORES = `${ROOT}/_research/all-stores.json`;

const regionId = process.argv[2];
if (!regionId) {
  console.error("Usage: node scripts/discover-region.mjs <regionId>");
  process.exit(1);
}

const CONFIG_PATH = `${ROOT}/_research/regions/${regionId}.config.json`;
const CACHE_PATH = `${ROOT}/_research/discover-cache-${regionId}.json`;
const OUT_PATH = `${ROOT}/_research/${regionId}-discovered.json`;

if (!existsSync(CONFIG_PATH)) {
  console.error(`Missing config: ${CONFIG_PATH}`);
  process.exit(1);
}
const config = JSON.parse(
  // eslint-disable-next-line no-undef
  (await import("node:fs")).readFileSync(CONFIG_PATH, "utf8"),
);

console.log(`Discovering region ${regionId} (${config.regionLabel})`);
console.log(`Anchors: ${config.anchors.length}`);

const slugById = buildSlugMap(ALL_STORES);
const cache = loadJson(CACHE_PATH, {});

const byId = new Map(); // id -> normalized record
const seenIds = new Set();
let queries = 0;
let cacheHits = 0;
let totalRows = 0;

for (const anchor of config.anchors) {
  console.log(
    `  ${anchor.city} (${anchor.lat}, ${anchor.lng}) r=${anchor.radiusKm}km`,
  );
  let res;
  try {
    res = await cachedStoreSearch(
      cache,
      anchor.lat,
      anchor.lng,
      anchor.radiusKm,
      anchor.maxResults ?? 500,
    );
  } catch (e) {
    console.error(`    FAIL: ${e.message}`);
    continue;
  }
  if (res.cached) cacheHits++;
  else queries++;
  // Persist cache after each query so a crash doesn't lose progress.
  saveJson(CACHE_PATH, cache);

  totalRows += res.results.length;
  console.log(`    ${res.results.length} rows${res.cached ? " (cached)" : ""}`);

  for (const row of res.results) {
    const rec = normalizeRow(row, slugById);
    if (byId.has(rec.id)) continue; // dedupe across anchors
    byId.set(rec.id, rec);
  }
}

const allRecords = [...byId.values()];

// Pre-filter: apply strict rules now so the discovered file only
// contains region-eligible records. The QA pass refines further.
const filtered = [];
const earlyDropped = [];
for (const rec of allRecords) {
  const { reasons } = classifyRecord(rec, config, seenIds);
  // Only "country" / "bbox" / "state" mismatches are early-dropped (they
  // are clearly not in this region). Everything else is kept for QA so
  // the report can show why it was excluded.
  const hardFails = reasons.filter((r) =>
    [STRICT_REASONS.country, STRICT_REASONS.bbox, STRICT_REASONS.state].includes(r),
  );
  if (hardFails.length > 0) {
    earlyDropped.push({ id: rec.id, slug: rec.slug, name: rec.name, country: rec.country, state: rec.state, reasons: hardFails });
    continue;
  }
  seenIds.add(rec.id);
  filtered.push(rec);
}

saveJson(OUT_PATH, filtered);
saveJson(`${OUT_PATH}.dropped.json`, earlyDropped);

console.log("");
console.log(`Done. ${queries} live queries, ${cacheHits} cache hits.`);
console.log(`Saw ${totalRows} rows -> ${byId.size} unique IDs -> ${filtered.length} in-region.`);
console.log(`Early-dropped (country/bbox/state mismatch): ${earlyDropped.length}`);
console.log(`Output: ${OUT_PATH}`);

const byCountry = {};
for (const r of filtered) byCountry[r.country] = (byCountry[r.country] ?? 0) + 1;
for (const [k, v] of Object.entries(byCountry).sort()) {
  console.log(`  ${k}: ${v}`);
}
