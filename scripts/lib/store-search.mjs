/**
 * Shared helpers for hitting the WPSL admin-ajax store_search endpoint
 * at gyms.elbnetz.cloud and normalizing the results into a uniform
 * "discovered record" shape.
 *
 * This is the single source of truth for the new discovery pipeline.
 * The legacy Nominatim-based scripts (geocode-nordic-gyms.mjs,
 * enrich-nordic-gyms.mjs, generate-nordic-gyms.mjs) are kept for
 * historical reference but should not be used for new regions.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const UA =
  "HyroxVault/1.0 (https://hyroxvault.com - hyrox training club locator)";

const STORE_SEARCH_URL =
  "https://gyms.elbnetz.cloud/wp-admin/admin-ajax.php";

export async function storeSearch(lat, lng, radiusKm = 25, maxResults = 500) {
  const url = new URL(STORE_SEARCH_URL);
  url.searchParams.set("action", "store_search");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lng", String(lng));
  url.searchParams.set("max_results", String(maxResults));
  url.searchParams.set("search_radius", String(radiusKm));

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
      });
      if (!res.ok) {
        throw new Error(
          `store_search ${res.status}: ${(await res.text()).slice(0, 200)}`,
        );
      }
      const text = await res.text();
      // Upstream returns "" or "0" when no stores match the query.
      // Treat both as a successful empty result rather than an error.
      const trimmed = text.trim();
      if (trimmed === "" || trimmed === "0") return [];
      const json = JSON.parse(trimmed);
      if (!Array.isArray(json)) {
        // Some misconfigured queries return a single object — treat as
        // empty rather than throw so we don't waste 28s retrying.
        return [];
      }
      return json;
    } catch (e) {
      lastErr = e;
      await sleep(1000 * (attempt + 1));
    }
  }
  throw lastErr ?? new Error("store_search failed after retries");
}

export function decodeHtml(s) {
  return String(s ?? "")
    .replace(/&#038;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function normalizeUrl(u) {
  if (!u) return undefined;
  let url = String(u).trim();
  if (!url) return undefined;
  url = url.replace(/^["'\s]+|["'\s]+$/g, "");
  if (/^(https?:\/\/)?(www\.)?(example|placeholder|test)\.com?\/?$/i.test(url))
    return undefined;
  url = url.replace(/^http:\/\/[Ww]{3}\./, "http://www.");
  url = url.replace(/^https:\/\/[Ww]{3}\./, "https://www.");
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (
      /^(www\.)?(example|placeholder|test)\.com?$/i.test(parsed.host)
    )
      return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function normalizePhone(p) {
  if (!p) return undefined;
  const s = String(p).trim();
  if (!s || /^#error|^#n\/a/i.test(s)) return undefined;
  return s;
}

/**
 * Convert a raw WPSL store_search row into our normalized "discovered"
 * record. `slug` is filled from the all-stores slug-id map when found.
 */
export function normalizeRow(row, slugById) {
  const id = String(row.id);
  const slug = slugById.get(id);
  const name = decodeHtml(row.store);
  const street = decodeHtml(row.address);
  const address2 = decodeHtml(row.address2 ?? "");
  const city = decodeHtml(row.city ?? "").trim();
  const state = decodeHtml(row.state ?? "").trim();
  const zip = decodeHtml(row.zip ?? "").trim();
  const country = decodeHtml(row.country ?? "").trim();
  const lat = parseFloat(row.lat);
  const lng = parseFloat(row.lng);
  const url = normalizeUrl(row.url);
  const phone = normalizePhone(row.phone);

  const composedStreet = [street, address2].filter(Boolean).join(", ");
  const cityZip = [zip, city].filter(Boolean).join(" ");
  const fullAddress = [composedStreet, cityZip, country]
    .filter((x) => x && x.trim())
    .join(", ");

  return {
    id,
    slug,
    name,
    street: composedStreet,
    address: fullAddress,
    city,
    state,
    zip,
    country,
    lat,
    lng,
    url,
    phone,
    distanceKm:
      typeof row.distance === "number" ? row.distance : undefined,
  };
}

/**
 * Build a slug -> WPSL id map from _research/all-stores.json.
 * Returns a Map<id-as-string, slug>.
 */
export function buildSlugMap(allStoresPath) {
  const stores = JSON.parse(readFileSync(allStoresPath, "utf8"));
  const slugById = new Map();
  for (const s of stores) slugById.set(String(s.id), s.slug);
  return slugById;
}

export function loadJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

export function saveJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}

/**
 * Cached store_search wrapper. Cache key = "lat|lng|radius".
 */
export async function cachedStoreSearch(
  cache,
  lat,
  lng,
  radiusKm,
  maxResults = 500,
) {
  const key = `${lat.toFixed(4)}|${lng.toFixed(4)}|${radiusKm}|${maxResults}`;
  if (cache[key]) return { results: cache[key], cached: true };
  await sleep(1500);
  const results = await storeSearch(lat, lng, radiusKm, maxResults);
  cache[key] = results;
  return { results, cached: false };
}
