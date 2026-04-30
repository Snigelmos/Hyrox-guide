/**
 * Convert normalized "discovered" records into the typed Gym shape used
 * by src/data/gym-finder.ts and emit them as a regional generated module.
 */

const COUNTRY_TO_SLUG = {
  "Sweden": "sweden",
  "Norway": "norway",
  "Denmark": "denmark",
  "Finland": "finland",
  "Iceland": "iceland",
  "United Kingdom": "united-kingdom",
  "England": "united-kingdom",
  "Scotland": "united-kingdom",
  "Wales": "united-kingdom",
  "Northern Ireland": "united-kingdom",
  "Germany": "germany",
  "France": "france",
  "United States": "united-states",
  "USA": "united-states",
};

const COUNTRY_TO_CODE = {
  "Sweden": "SE",
  "Norway": "NO",
  "Denmark": "DK",
  "Finland": "FI",
  "Iceland": "IS",
  "United Kingdom": "GB",
  "England": "GB",
  "Scotland": "GB",
  "Wales": "GB",
  "Northern Ireland": "GB",
  "Germany": "DE",
  "France": "FR",
  "United States": "US",
  "USA": "US",
};

const COUNTRY_TO_NAME = {
  "England": "United Kingdom",
  "Scotland": "United Kingdom",
  "Wales": "United Kingdom",
  "Northern Ireland": "United Kingdom",
  "USA": "United States",
};

// Canonical city aliases. Maps WPSL local-language / abbreviated /
// state-suffixed city values to a single canonical English form so we
// don't split the same physical city across multiple records.
const CITY_ALIASES = {
  // Germany
  "München": "Munich",
  "munchen": "Munich",
  // France: all-caps comes through as itself; we lower-case + title-case
  // generically below.
  // US: strip ", ST" suffix and expand common abbreviations
  "N Bellmore": "North Bellmore",
  "N. Bellmore": "North Bellmore",
  "Br2 9be": "London",
};

function titleCaseCity(c) {
  if (!c) return c;
  // Strip trailing ", NY" / ", CA" etc. (US data pattern)
  c = c.replace(/,\s*[A-Z]{2}\s*$/, "");
  // If the value is all-uppercase or all-lowercase, title-case it.
  // Preserves mixed-case values that were already cased correctly.
  if (c === c.toUpperCase() || c === c.toLowerCase()) {
    c = c
      .toLowerCase()
      .split(/(\s+|-)/)
      .map((part) => {
        if (part.length === 0 || /^\s+$/.test(part) || part === "-") return part;
        // Lowercase short connectives unless first word
        if (["of", "the", "and", "in", "on", "at", "for", "to", "de", "du", "la", "le", "les", "des", "von", "van", "der", "auf"].includes(part))
          return part;
        return part[0].toUpperCase() + part.slice(1);
      })
      .join("");
    // Always uppercase the very first letter.
    c = c.charAt(0).toUpperCase() + c.slice(1);
  }
  return c;
}

export function normalizeCity(c) {
  if (!c) return c;
  let v = c.trim();
  v = titleCaseCity(v);
  if (CITY_ALIASES[v]) return CITY_ALIASES[v];
  return v;
}

export function slugify(s) {
  if (!s) return "";
  return String(s)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o").replace(/Ø/g, "O")
    .replace(/æ/g, "ae").replace(/Æ/g, "Ae")
    .replace(/ä/g, "a").replace(/Ä/g, "A")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/å/g, "a").replace(/Å/g, "A")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function classifyAffiliation(slug, name) {
  const s = (slug ?? "").toLowerCase();
  const t = (name ?? "").toLowerCase();
  if (s.includes("crossfit") || t.includes("crossfit")) return "crossfit-box";
  const chains = [
    // Nordic
    "sats-", "friskissvettis-", "friskis-svettis-", "friskis-", "actic-",
    "fitness24seven-", "fressi-", "elixia-", "easyfit-", "ladyline-",
    "fun-", "nordic-wellness-", "nw-",
    // UK
    "puregym", "the-gym-group", "the-gym-", "1rebel", "blok-",
    // DE
    "mcfit", "john-reed", "holmes-place", "fitx", "kieser",
    "fitness-first", "easyfitness", "clever-fit",
    // FR
    "klay", "episod", "basic-fit", "fitness-park", "keep-cool", "neoness",
    // US
    "equinox", "crunch-fitness", "crunch-", "f45-", "barrys", "rumble",
    "orangetheory", "solidcore", "lifetime-fitness", "anytime-fitness",
    "ymca-", "lifetime-",
  ];
  if (chains.some((c) => s.startsWith(c) || s.includes("-" + c))) {
    return "chain-partner";
  }
  return "official-training-club";
}

export function regionFromCountry(country) {
  if (!country) return "EU";
  if (
    [
      "Sweden",
      "Norway",
      "Denmark",
      "Finland",
      "Iceland",
      "United Kingdom",
      "England",
      "Scotland",
      "Wales",
      "Northern Ireland",
      "Germany",
      "France",
      "Spain",
      "Italy",
      "Netherlands",
      "Belgium",
      "Poland",
      "Czech Republic",
      "Austria",
      "Switzerland",
      "Ireland",
      "Portugal",
    ].includes(country)
  )
    return "EU";
  if (["United States", "Canada", "Mexico", "USA"].includes(country)) return "NA";
  return "EU";
}

/**
 * Map a normalized discovered record to the Gym shape.
 */
export function toGym(rec, options = {}) {
  const country = COUNTRY_TO_NAME[rec.country] ?? rec.country;
  const countryCode = COUNTRY_TO_CODE[rec.country] ?? options.fallbackCountryCode ?? "??";
  const countrySlug = COUNTRY_TO_SLUG[rec.country] ?? slugify(country);
  const city = normalizeCity(rec.city || country);
  const citySlug = slugify(city);
  const region = regionFromCountry(country);
  const aff = classifyAffiliation(rec.slug, rec.name);

  return {
    slug: rec.slug,
    name: rec.name,
    address: rec.address,
    city,
    citySlug,
    country,
    countryCode,
    countrySlug,
    region,
    lat: rec.lat,
    lng: rec.lng,
    website: rec.url || undefined,
    phone: rec.phone || undefined,
    affiliationType: aff,
    offerings: ["hyrox-classes"],
    verifiedAt: options.verifiedAt ?? "2026-04",
  };
}

const lit = (v) =>
  typeof v === "string"
    ? JSON.stringify(v)
    : Array.isArray(v)
      ? `[${v.map(lit).join(", ")}]`
      : String(v);

export function formatGym(g) {
  const lines = [
    `  {`,
    `    slug: ${lit(g.slug)},`,
    `    name: ${lit(g.name)},`,
    `    address: ${lit(g.address)},`,
  ];
  if (g.neighbourhood) lines.push(`    neighbourhood: ${lit(g.neighbourhood)},`);
  lines.push(
    `    city: ${lit(g.city)},`,
    `    citySlug: ${lit(g.citySlug)},`,
    `    country: ${lit(g.country)},`,
    `    countryCode: ${lit(g.countryCode)},`,
    `    countrySlug: ${lit(g.countrySlug)},`,
    `    region: ${lit(g.region)},`,
    `    lat: ${g.lat},`,
    `    lng: ${g.lng},`,
  );
  if (g.website) lines.push(`    website: ${lit(g.website)},`);
  if (g.phone) lines.push(`    phone: ${lit(g.phone)},`);
  lines.push(
    `    affiliationType: ${lit(g.affiliationType)},`,
    `    offerings: ${lit(g.offerings ?? ["hyrox-classes"])},`,
    `    verifiedAt: ${lit(g.verifiedAt)},`,
    `  },`,
  );
  return lines.join("\n");
}

export function emitModule({ exportName, regionLabel, gyms, sourceFile }) {
  const banner =
    `// AUTO-GENERATED FILE — do not edit by hand.\n` +
    `// Source: ${sourceFile}\n` +
    `// Pipeline: scripts/discover-region.mjs + scripts/qa-region.mjs\n` +
    `//\n` +
    `// Records are pulled from the official Hyrox affiliated training\n` +
    `// club directory (gyms.elbnetz.cloud) via the WPSL admin-ajax\n` +
    `// store_search endpoint and quality-checked against a strict rule set.\n` +
    `// Region: ${regionLabel}\n` +
    `\n` +
    `import type { Gym } from "./gym-finder";\n` +
    `\n` +
    `export const ${exportName}: Gym[] = [\n` +
    gyms.map(formatGym).join("\n") +
    `\n];\n`;
  return banner;
}

function normalizedNameKey(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// Pull out a postal-code-shaped token from an address string. Best-effort
// extraction across UK / US / Continental Europe formats.
function extractZip(address) {
  if (!address) return "";
  const s = String(address);
  // UK postcode like SW1A 1AA, KT15 2SD, BR2 9BE
  const uk = s.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i);
  if (uk) return uk[1].toUpperCase().replace(/\s+/g, "");
  // 5-digit (US, DE, FR, ES) or 4-digit (NO, DK, AT)
  const num = s.match(/\b(\d{4,5})\b/);
  if (num) return num[1];
  return "";
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Venue dedupe runs in two passes:
 *  1. Strict: same citySlug + lat/lng rounded to 4 decimals (~10m).
 *  2. Fuzzy: any two records with the same normalized name within 500m
 *     of each other, regardless of how their city field is written.
 *     This catches duplicates where one record uses the postcode as its
 *     city ("KT15 2SD") and another uses the actual city name
 *     ("Addlestone").
 *
 * Within each group the record with the lowest canonicalScore wins.
 */
export function venueDedupe(gyms) {
  const dropped = [];

  // Pass 1: rounded-coord groups.
  const groups = new Map();
  for (const g of gyms) {
    const key = `${g.citySlug}|${g.lat.toFixed(4)}|${g.lng.toFixed(4)}`;
    const arr = groups.get(key) ?? [];
    arr.push(g);
    groups.set(key, arr);
  }
  let kept = [];
  for (const [, group] of groups) {
    if (group.length === 1) {
      kept.push(group[0]);
      continue;
    }
    group.sort((a, b) => canonicalScore(a) - canonicalScore(b));
    kept.push(group[0]);
    for (const d of group.slice(1)) {
      dropped.push({
        slug: d.slug,
        keptSlug: group[0].slug,
        name: d.name,
        city: d.city,
        reason: "same-coords",
      });
    }
  }

  // Pass 2: fuzzy name + (proximity OR same postcode).
  // Same-name records are clustered together when EITHER they're within
  // 500m of each other (good geocoding) OR they share the same postcode
  // (catches dupes where one record has badly geocoded coords > 500m off
  // but the address text is otherwise identical, e.g. WPSL listings that
  // include a venue annotation in the street field).
  const byName = new Map();
  for (const g of kept) {
    const k = normalizedNameKey(g.name);
    if (!k) continue;
    const arr = byName.get(k) ?? [];
    arr.push(g);
    byName.set(k, arr);
  }
  const survivors = new Set(kept);
  for (const [, group] of byName) {
    if (group.length === 1) continue;
    const zipCache = group.map((g) => extractZip(g.address));
    const used = new Set();
    for (let i = 0; i < group.length; i++) {
      if (used.has(i)) continue;
      const cluster = [group[i]];
      used.add(i);
      for (let j = i + 1; j < group.length; j++) {
        if (used.has(j)) continue;
        const sameZip = zipCache[i] && zipCache[i] === zipCache[j];
        const closeBy = haversineMeters(group[i], group[j]) <= 500;
        if (sameZip || closeBy) {
          cluster.push(group[j]);
          used.add(j);
        }
      }
      if (cluster.length === 1) continue;
      cluster.sort((a, b) => canonicalScore(a) - canonicalScore(b));
      const winner = cluster[0];
      for (const d of cluster.slice(1)) {
        survivors.delete(d);
        dropped.push({
          slug: d.slug,
          keptSlug: winner.slug,
          name: d.name,
          city: d.city,
          reason: "same-name-near",
        });
      }
    }
  }
  kept = kept.filter((g) => survivors.has(g));

  return { kept, dropped };
}

function canonicalScore(g) {
  let score = 0;
  if (/-\d+$/.test(g.slug)) score += 10;
  if (/^nw-/.test(g.slug)) score += 5;
  if ((g.name ?? "").length < 12) score += 2;
  if (!g.website) score += 3;
  if (!g.phone) score += 1;
  score += (g.slug ?? "").length * 0.01;
  return score;
}
