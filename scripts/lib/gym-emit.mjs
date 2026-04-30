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
  const city = rec.city || country;
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

/**
 * Venue dedupe: when two records share city + rounded coords (~10m),
 * keep the one with the lowest canonicalScore.
 */
export function venueDedupe(gyms) {
  const groups = new Map();
  for (const g of gyms) {
    const key = `${g.citySlug}|${g.lat.toFixed(4)}|${g.lng.toFixed(4)}`;
    const arr = groups.get(key) ?? [];
    arr.push(g);
    groups.set(key, arr);
  }
  const dropped = [];
  const kept = [];
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
      });
    }
  }
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
