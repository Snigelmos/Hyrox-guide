#!/usr/bin/env node
/**
 * Enrich each Nordic gym record with the website URL, exact address,
 * phone, and authoritative coordinates pulled from the WPSL admin-ajax
 * search endpoint at https://gyms.elbnetz.cloud/wp-admin/admin-ajax.php
 * (action=store_search).
 *
 * The REST API exposes only basic post fields. The WPSL plugin meta
 * (url, address, lat, lng, phone) is exposed via the admin-ajax store
 * search action used by the actual store-finder iframe.
 *
 * Strategy:
 *  1. Build a slug -> WPSL post-id map from _research/all-stores.json
 *     (the full unfiltered catalog already on disk).
 *  2. For each gym in _research/nordic-gyms.json, query store_search
 *     at the gym's geocoded lat/lng with a small radius and look up
 *     the record whose `id` matches the gym's WPSL post id.
 *  3. Cache responses by lat/lng + radius so we can re-run without
 *     hammering the upstream server.
 *  4. Write the merged output back to _research/nordic-gyms.json.
 *
 * The follow-up `scripts/generate-nordic-gyms.mjs` re-emits the typed
 * module with the new website + address fields.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = process.cwd();
const STORES_PATH = `${ROOT}/_research/all-stores.json`;
const NORDIC_PATH = `${ROOT}/_research/nordic-gyms.json`;
const CACHE_PATH = `${ROOT}/_research/wpsl-search-cache.json`;

const UA = "HyroxVault/1.0 (https://hyroxvault.com - hyrox training club locator)";

async function storeSearch(lat, lng, radius = 5, maxResults = 25) {
  const url = new URL("https://gyms.elbnetz.cloud/wp-admin/admin-ajax.php");
  url.searchParams.set("action", "store_search");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("max_results", String(maxResults));
  url.searchParams.set("search_radius", String(radius));

  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept": "application/json" },
      });
      if (!res.ok) throw new Error(`store_search ${res.status}: ${await res.text()}`);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error(`Unexpected response shape: ${JSON.stringify(json).slice(0, 200)}`);
      return json;
    } catch (e) {
      lastErr = e;
      await sleep(2000 * (attempt + 1) ** 2);
    }
  }
  throw lastErr ?? new Error("store_search failed after retries");
}

function decodeHtml(s) {
  return String(s ?? "")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function normalizeUrl(u) {
  if (!u) return undefined;
  let url = String(u).trim();
  if (!url) return undefined;
  // Drop common WPSL placeholder values.
  if (/^https?:\/\/(www\.)?(example|placeholder)\.com\/?$/i.test(url)) return undefined;
  // Upgrade http -> https where reasonable, keep otherwise.
  return url;
}

async function main() {
  const stores = JSON.parse(readFileSync(STORES_PATH, "utf8"));
  const slugToId = new Map();
  for (const s of stores) slugToId.set(s.slug, s.id);

  const gyms = JSON.parse(readFileSync(NORDIC_PATH, "utf8"));
  const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, "utf8")) : {};

  let enriched = 0;
  let cacheHits = 0;
  let queries = 0;
  const missingIds = [];

  for (let i = 0; i < gyms.length; i++) {
    const g = gyms[i];
    if (g.unresolved) continue;
    const wpslId = slugToId.get(g.slug);
    if (!wpslId) {
      missingIds.push(g.slug);
      continue;
    }

    const cacheKey = `${g.lat.toFixed(4)}|${g.lng.toFixed(4)}|5`;
    let results = cache[cacheKey];
    if (results) {
      cacheHits++;
    } else {
      try {
        await sleep(800);
        results = await storeSearch(g.lat, g.lng, 5, 25);
        queries++;
        cache[cacheKey] = results;
        writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
      } catch (e) {
        console.error(`[${i + 1}/${gyms.length}] ${g.slug}: search failed: ${e.message}`);
        continue;
      }
    }

    // Match by post id; fall back to closest match by name + city.
    let match = results.find((r) => String(r.id) === String(wpslId));
    if (!match) {
      // Sometimes admin-ajax returns numeric id only. Match by exact title+city.
      match = results.find(
        (r) =>
          decodeHtml(r.store).toLowerCase() === g.title.toLowerCase() &&
          decodeHtml(r.city).toLowerCase().includes(g.cityHint?.toLowerCase() ?? ""),
      );
    }
    if (!match) {
      // Try a wider search if 5km wasn't enough.
      const wideKey = `${g.lat.toFixed(4)}|${g.lng.toFixed(4)}|25`;
      let wide = cache[wideKey];
      if (!wide) {
        try {
          await sleep(800);
          wide = await storeSearch(g.lat, g.lng, 25, 75);
          queries++;
          cache[wideKey] = wide;
          writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
        } catch (e) {
          console.error(`[${i + 1}/${gyms.length}] ${g.slug}: wide search failed: ${e.message}`);
        }
      }
      if (wide) match = wide.find((r) => String(r.id) === String(wpslId));
    }

    if (match) {
      const websiteUrl = normalizeUrl(match.url);
      const phone = match.phone ? String(match.phone).trim() : undefined;
      const exactAddress = decodeHtml(match.address);
      const exactCity = decodeHtml(match.city);
      const exactZip = decodeHtml(match.zip);
      const exactCountry = decodeHtml(match.country);
      const composedAddress = [exactAddress, [exactZip, exactCity].filter(Boolean).join(" "), exactCountry]
        .filter((x) => x && x.trim())
        .join(", ");

      g.website = websiteUrl;
      g.phone = phone || undefined;
      g.exactAddress = composedAddress || g.resolvedAddress;
      g.exactCity = exactCity || g.resolvedCity;
      g.exactPostcode = exactZip || g.resolvedPostcode;
      // Replace the geocoded lat/lng with the WPSL canonical coordinates.
      g.lat = parseFloat(match.lat) || g.lat;
      g.lng = parseFloat(match.lng) || g.lng;
      enriched++;
      console.log(
        `[${i + 1}/${gyms.length}] ${g.slug} -> ${websiteUrl ? "OK url=" + websiteUrl : "no url"}${phone ? `, phone=${phone}` : ""}`,
      );
    } else {
      console.warn(`[${i + 1}/${gyms.length}] ${g.slug}: no match in results`);
    }
  }

  writeFileSync(NORDIC_PATH, JSON.stringify(gyms, null, 2));
  console.log(`\nDone. Enriched ${enriched}/${gyms.length} gyms. Queries: ${queries}, cache hits: ${cacheHits}.`);
  if (missingIds.length) console.log(`Missing WPSL ids for: ${missingIds.join(", ")}`);
  console.log(`Output: ${NORDIC_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
