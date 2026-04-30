#!/usr/bin/env node
/**
 * Transform _research/nordic-gyms.json (raw geocoded results)
 * into src/data/nordic-gyms.generated.ts (typed Gym[]).
 *
 * The output file is committed to the repo so the build remains
 * fully static. Re-run this script whenever the geocoded source
 * data changes.
 */

import { readFileSync, writeFileSync } from "node:fs";

const ROOT = process.cwd();
const INPUT = `${ROOT}/_research/nordic-gyms.json`;
const OUTPUT = `${ROOT}/src/data/nordic-gyms.generated.ts`;

const COUNTRY_SLUGS = {
  Sweden: "sweden",
  Norway: "norway",
  Denmark: "denmark",
  Finland: "finland",
  Iceland: "iceland",
};

function slugify(s) {
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
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Classify affiliation type from slug + title. Rules of thumb:
 *  - "crossfit" anywhere in slug/title → crossfit-box
 *  - matches a known major chain → chain-partner
 *  - otherwise → official-training-club (since the entire dataset comes
 *    from the official Hyrox affiliated training club directory)
 */
function classifyAffiliation(slug, title) {
  const s = slug.toLowerCase();
  const t = String(title).toLowerCase();
  if (s.includes("crossfit") || t.includes("crossfit")) return "crossfit-box";
  const chains = [
    "sats-", "friskissvettis-", "friskis-svettis-", "friskis-", "actic-",
    "fitness24seven-", "fressi-", "elixia-", "easyfit-", "ladyline-",
    "fun-", "nordic-wellness-", "nw-",
  ];
  if (chains.some((c) => s.startsWith(c) || s.includes("-" + c))) {
    return "chain-partner";
  }
  return "official-training-club";
}

function buildName(title) {
  return String(title)
    .replace(/\s*&\s*/g, " & ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAddress(e) {
  if (!e.resolvedAddress) return `${e.resolvedCity ?? e.cityHint ?? ""}, ${e.country}`.trim();
  // Already a clean comma-separated Nominatim display name. Trim the country at end if duplicated.
  return e.resolvedAddress;
}

const raw = JSON.parse(readFileSync(INPUT, "utf8"));
const resolved = raw.filter((e) => !e.unresolved);

const records = resolved
  .map((e) => {
    const country = e.country;
    const countrySlug = COUNTRY_SLUGS[country];
    if (!countrySlug) {
      console.warn(`Skipping ${e.slug}: unknown country '${country}'`);
      return null;
    }
    const city = e.resolvedCity || e.cityHint || country;
    const citySlug = slugify(city);
    const neighbourhood = e.resolvedSuburb || undefined;
    const aff = classifyAffiliation(e.slug, e.title);
    return {
      slug: e.slug,
      name: buildName(e.title),
      address: buildAddress(e),
      neighbourhood,
      city,
      citySlug,
      country,
      countryCode: e.countryCode,
      countrySlug,
      region: "EU",
      lat: e.lat,
      lng: e.lng,
      hyroxOfficialUrl: `https://hyrox.com/find-a-hyrox-partner-gym/?gym=${e.slug}`,
      affiliationType: aff,
      offerings: ["hyrox-classes"],
      verifiedAt: "2026-04",
    };
  })
  .filter(Boolean)
  .sort((a, b) => {
    if (a.country !== b.country) return a.country.localeCompare(b.country);
    if (a.city !== b.city) return a.city.localeCompare(b.city);
    return a.name.localeCompare(b.name);
  });

// Deduplicate by slug.
const seen = new Set();
const deduped = records.filter((r) => {
  if (seen.has(r.slug)) return false;
  seen.add(r.slug);
  return true;
});

const literal = (v) =>
  typeof v === "string"
    ? JSON.stringify(v)
    : Array.isArray(v)
      ? `[${v.map(literal).join(", ")}]`
      : String(v);

const formatRecord = (r) => {
  const lines = [
    `  {`,
    `    slug: ${literal(r.slug)},`,
    `    name: ${literal(r.name)},`,
    `    address: ${literal(r.address)},`,
  ];
  if (r.neighbourhood) lines.push(`    neighbourhood: ${literal(r.neighbourhood)},`);
  lines.push(
    `    city: ${literal(r.city)},`,
    `    citySlug: ${literal(r.citySlug)},`,
    `    country: ${literal(r.country)},`,
    `    countryCode: ${literal(r.countryCode)},`,
    `    countrySlug: ${literal(r.countrySlug)},`,
    `    region: "EU",`,
    `    lat: ${r.lat},`,
    `    lng: ${r.lng},`,
    `    hyroxOfficialUrl: ${literal(r.hyroxOfficialUrl)},`,
    `    affiliationType: ${literal(r.affiliationType)},`,
    `    offerings: ${literal(r.offerings)},`,
    `    verifiedAt: ${literal(r.verifiedAt)},`,
    `  },`,
  );
  return lines.join("\n");
};

const banner =
  `// AUTO-GENERATED FILE — do not edit by hand.\n` +
  `// Source: _research/nordic-gyms.json\n` +
  `// Generator: scripts/generate-nordic-gyms.mjs\n` +
  `//\n` +
  `// Records are pulled from the official Hyrox affiliated training\n` +
  `// club directory (gyms.elbnetz.cloud) and geocoded via OpenStreetMap\n` +
  `// Nominatim. Coordinates are venue- or neighbourhood-accurate.\n` +
  `\n` +
  `import type { Gym } from "./gym-finder";\n` +
  `\n` +
  `export const NORDIC_GYMS: Gym[] = [\n` +
  deduped.map(formatRecord).join("\n") +
  `\n];\n`;

writeFileSync(OUTPUT, banner);
console.log(`Wrote ${deduped.length} Nordic gym records to ${OUTPUT}`);

const byCountry = {};
for (const r of deduped) {
  byCountry[r.country] = (byCountry[r.country] ?? 0) + 1;
}
for (const [c, n] of Object.entries(byCountry).sort()) {
  console.log(`  ${c}: ${n}`);
}
