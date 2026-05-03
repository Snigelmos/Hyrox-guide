// AUTO-GENERATED FILE — do not edit by hand.
// Source: /_research/cz-discovered.json
// Pipeline: scripts/discover-region.mjs + scripts/qa-region.mjs
//
// Records are pulled from the official Hyrox affiliated training
// club directory (gyms.elbnetz.cloud) via the WPSL admin-ajax
// store_search endpoint and quality-checked against a strict rule set.
// Region: Czech Republic (Prague race city)

import type { Gym } from "./gym-finder";

export const CZ_GYMS: Gym[] = [
  {
    slug: "crossfit-with-us",
    name: "CrossFit With Us",
    address: "K Červenému Dvoru 3156/25, 130 00 Praha 3, Czech Republic",
    city: "Prague",
    citySlug: "prague",
    country: "Czech Republic",
    countryCode: "CZ",
    countrySlug: "czech-republic",
    region: "EU",
    lat: 50.0839505,
    lng: 14.480646,
    website: "http://www.crossfitwithus.cz/",
    phone: "we don't have a phone",
    affiliationType: "crossfit-box",
    offerings: ["hyrox-classes"],
    verifiedAt: "2026-05",
  },
  {
    slug: "vt-gym-complex-s-r-o",
    name: "Vt gym complex s.r.o",
    address: "Mladoboleslavská 1116, 19700 Praha 9, Czech Republic",
    city: "Prague",
    citySlug: "prague",
    country: "Czech Republic",
    countryCode: "CZ",
    countrySlug: "czech-republic",
    region: "EU",
    lat: 50.1308078,
    lng: 14.5424795,
    phone: "420605885202",
    affiliationType: "official-training-club",
    offerings: ["hyrox-classes"],
    verifiedAt: "2026-05",
  },
];
