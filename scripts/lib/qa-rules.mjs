/**
 * Strict quality rules applied to discovered gym records.
 *
 * Philosophy: prefer fewer high-quality records over many noisy ones.
 * A record is KEPT only if:
 *   - country is in the region's whitelist
 *   - lat/lng falls inside the region's bbox
 *   - state is in the region's allowlist (when configured)
 *   - has either a non-placeholder website OR a street address with a
 *     visible house number AND a non-postcode-shaped city
 *   - is not in the slug denylist
 *
 * A record is FLAGGED (kept but noted) if:
 *   - phone is missing
 *   - name looks templated ("-2"/"-3" suffix, contains "test"/"draft")
 *   - state is missing for US/CA records
 */

const POSTCODE_LIKE = /^\s*[\d\s\-]+\s*$/; // "224 78", "10117", "61-100"
const HOUSE_NUMBER = /\b\d+[A-Za-z]?\b/;
// "84 Eccleston Square", "905 River Road", "307 W Grand Ave" — clearly
// a street address erroneously stored in the WPSL city field.
const STREET_LIKE_CITY =
  /\b(road|street|avenue|boulevard|blvd|ave|drive|dr|lane|ln|place|plaza|square|sq|court|ct|park|highway|hwy|way|terrace|ter|circle|cir|trail|loop|crescent|alley)\b/i;
const STARTS_WITH_NUMBER = /^\s*\d+/;

export const STRICT_REASONS = {
  country: "country mismatch",
  bbox: "outside country bbox",
  state: "state not in allowlist",
  noWebsiteNoStreet: "no website + address has no street number",
  postcodeCity: "city field is a postcode",
  streetLikeCity: "city field looks like a street address",
  denylisted: "slug is denylisted",
  noSlug: "no canonical slug in WPSL catalog",
  duplicateId: "duplicate WPSL id",
};

export function inBbox({ lat, lng }, bbox) {
  if (!bbox) return true;
  const [latMin, latMax, lngMin, lngMax] = bbox;
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}

export function matchesCountry(record, countryNames) {
  if (!countryNames || countryNames.length === 0) return true;
  const c = (record.country ?? "").trim().toLowerCase();
  return countryNames.map((n) => n.toLowerCase()).includes(c);
}

export function matchesState(record, stateAllowlist) {
  if (!stateAllowlist || stateAllowlist.length === 0) return true;
  const s = (record.state ?? "").trim();
  if (!s) return false;
  const lc = s.toLowerCase();
  return stateAllowlist.map((x) => x.toLowerCase()).includes(lc);
}

export function hasViableContact(record) {
  if (record.url) return true;
  // No URL: require both a clear street number AND a non-postcode city.
  if (!record.street || !HOUSE_NUMBER.test(record.street)) return false;
  if (!record.city || POSTCODE_LIKE.test(record.city)) return false;
  return true;
}

export function isPostcodeShapedCity(city) {
  if (!city) return false;
  return POSTCODE_LIKE.test(city.trim());
}

export function isStreetLikeCity(city) {
  if (!city) return false;
  const trimmed = city.trim();
  // Reject if the "city" starts with a number AND contains a street keyword
  // (covers "84 Eccleston Square", "905 River Road", "307 W Grand Ave").
  if (STARTS_WITH_NUMBER.test(trimmed) && STREET_LIKE_CITY.test(trimmed))
    return true;
  // Reject if it just contains a street keyword and is suspiciously long
  // (e.g. "Hamm Moor Lane" is genuinely a street but for a real city
  // the keyword would be part of a multi-word neighborhood).
  // Be conservative: only reject if it starts with a number.
  return false;
}

export function looksTemplated(name) {
  if (!name) return true;
  const lower = name.toLowerCase().trim();
  if (lower.length < 3) return true;
  if (/(test|draft|placeholder|todo)/i.test(lower)) return true;
  return false;
}

export function classifyRecord(record, config, seenIds) {
  const reasons = [];
  if (seenIds.has(record.id)) reasons.push(STRICT_REASONS.duplicateId);
  if (!record.slug) reasons.push(STRICT_REASONS.noSlug);
  if (!matchesCountry(record, config.countryNames))
    reasons.push(STRICT_REASONS.country);
  if (!inBbox(record, config.bbox)) reasons.push(STRICT_REASONS.bbox);
  if (
    config.stateAllowlist &&
    config.stateAllowlist.length > 0 &&
    !matchesState(record, config.stateAllowlist)
  )
    reasons.push(STRICT_REASONS.state);
  if (config.slugDenylist && config.slugDenylist.includes(record.slug))
    reasons.push(STRICT_REASONS.denylisted);
  if (isPostcodeShapedCity(record.city))
    reasons.push(STRICT_REASONS.postcodeCity);
  if (isStreetLikeCity(record.city))
    reasons.push(STRICT_REASONS.streetLikeCity);
  if (!hasViableContact(record))
    reasons.push(STRICT_REASONS.noWebsiteNoStreet);

  const warnings = [];
  if (!record.phone) warnings.push("no-phone");
  if (looksTemplated(record.name)) warnings.push("templated-name");
  if (
    (config.countryNames?.includes("United States") ||
      config.countryNames?.includes("Canada")) &&
    !record.state
  )
    warnings.push("no-state");

  return { reasons, warnings, passed: reasons.length === 0 };
}

/**
 * Concurrent URL HEAD validation. Returns Map<url, { ok, status }>.
 * Falls back to GET on HEAD-not-allowed (some WordPress hosts).
 */
export async function batchUrlHealth(urls, { concurrency = 20, timeoutMs = 8000 } = {}) {
  const out = new Map();
  const queue = [...new Set(urls.filter(Boolean))];
  let i = 0;

  async function checkOne(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      let res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: ctrl.signal,
        headers: {
          "User-Agent":
            "HyroxVault/1.0 (https://hyroxvault.com - link checker)",
        },
      });
      // Some sites return 405 for HEAD — fall back to GET.
      if (res.status === 405 || res.status === 403) {
        res = await fetch(url, {
          method: "GET",
          redirect: "follow",
          signal: ctrl.signal,
          headers: {
            "User-Agent":
              "HyroxVault/1.0 (https://hyroxvault.com - link checker)",
          },
        });
      }
      out.set(url, { ok: res.ok, status: res.status });
    } catch (e) {
      out.set(url, { ok: false, status: 0, error: String(e).slice(0, 200) });
    } finally {
      clearTimeout(timer);
    }
  }

  async function worker() {
    while (i < queue.length) {
      const url = queue[i++];
      await checkOne(url);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, queue.length) }, worker),
  );
  return out;
}
