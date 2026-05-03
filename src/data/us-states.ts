/**
 * Render-time US state grouping for the gym directory.
 *
 * The Gym schema does not store a separate `state` field today, but the
 * `address` strings emitted by the WPSL pipeline contain enough info to
 * recover one with two strategies:
 *
 *   1) Hand-curated records (and any record where the upstream WPSL row
 *      had an explicit state) follow the format
 *      "54 Murray Street, New York, NY 10007, United States" — a 2-letter
 *      state code is parsed directly with a regex.
 *
 *   2) Auto-generated records from `store_search` follow the format
 *      "73 W 92nd St, 10025 New York, United States" with no state code
 *      and only the 5-digit zip — we recover the state from the
 *      first three digits of the zip via a static lookup table.
 *
 * If both fail we return null and the gym is bucketed into "Other".
 */

import type { Gym } from "./gym-finder";

export const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  PR: "Puerto Rico",
};

// Match patterns we see in the field (most → least specific):
//   ", NY 10017, United States"             ← canonical "ST ZIP, US"
//   ", NY, United States"                   ← state code, no zip
//   ", New York, NY 10017"                  ← state before US suffix dropped
//   "10128 New York, NY, United States"     ← state code as third-to-last part
//   "1825 26th Rd, 11102 Queens, NY, US"    ← state code immediately before US
const US_STATE_RES: RegExp[] = [
  /,\s*([A-Z]{2})\s+\d{5}(?:-\d{4})?\s*,\s*United States/,
  /,\s*([A-Z]{2})\s*,\s*United States/,
  /,\s*([A-Z]{2})\s+\d{5}(?:-\d{4})?\b/,
];
// Zip with optional leading zero (some NJ/MA records drop it).
const US_ZIP_RE = /\b(\d{4,5})(?:-\d{4})?\b[^,]*,\s*United States/;

/**
 * Map of 3-digit zip prefix → state code. Sourced from USPS ZIP code
 * geographic boundaries; covers all 50 states + DC + PR. Not every prefix
 * is allocated (the gaps fall into adjacent ranges), so we look up the
 * exact prefix and fall back to null only if there is genuinely no match.
 */
const ZIP_PREFIX_TO_STATE: Record<string, string> = {};
function fillRange(start: number, end: number, state: string): void {
  for (let i = start; i <= end; i++) {
    ZIP_PREFIX_TO_STATE[String(i).padStart(3, "0")] = state;
  }
}
fillRange(5, 5, "NY"); // Fishers Island NY (within MA range historically; explicit)
fillRange(10, 27, "MA");
fillRange(28, 29, "RI");
fillRange(30, 38, "NH");
fillRange(39, 49, "ME");
fillRange(50, 59, "VT");
fillRange(60, 69, "CT");
fillRange(70, 89, "NJ");
fillRange(100, 149, "NY");
fillRange(150, 196, "PA");
fillRange(197, 199, "DE");
fillRange(200, 205, "DC");
fillRange(206, 219, "MD");
fillRange(220, 246, "VA");
fillRange(247, 268, "WV");
fillRange(270, 289, "NC");
fillRange(290, 299, "SC");
fillRange(300, 319, "GA");
fillRange(320, 349, "FL");
fillRange(350, 369, "AL");
fillRange(370, 385, "TN");
fillRange(386, 386, "TN");
fillRange(387, 397, "MS");
fillRange(398, 399, "GA");
fillRange(400, 427, "KY");
fillRange(430, 459, "OH");
fillRange(460, 479, "IN");
fillRange(480, 499, "MI");
fillRange(500, 528, "IA");
fillRange(530, 549, "WI");
fillRange(550, 567, "MN");
fillRange(570, 577, "SD");
fillRange(580, 588, "ND");
fillRange(590, 599, "MT");
fillRange(600, 629, "IL");
fillRange(630, 658, "MO");
fillRange(660, 679, "KS");
fillRange(680, 693, "NE");
fillRange(700, 714, "LA");
fillRange(716, 729, "AR");
fillRange(730, 749, "OK");
fillRange(750, 799, "TX");
fillRange(800, 816, "CO");
fillRange(820, 831, "WY");
fillRange(832, 838, "ID");
fillRange(840, 847, "UT");
fillRange(850, 865, "AZ");
fillRange(870, 884, "NM");
fillRange(889, 898, "NV");
fillRange(900, 961, "CA");
fillRange(967, 968, "HI");
fillRange(970, 979, "OR");
fillRange(980, 994, "WA");
fillRange(995, 999, "AK");
fillRange(6, 9, "PR");

export function extractUsState(address: string | undefined | null): string | null {
  if (!address) return null;

  for (const re of US_STATE_RES) {
    const m = address.match(re);
    if (m) {
      const code = m[1].toUpperCase();
      if (US_STATE_NAMES[code]) return code;
    }
  }

  const z = address.match(US_ZIP_RE);
  if (z) {
    // 4-digit zips happen when leading zeros are dropped (NJ/CT/MA).
    const padded = z[1].padStart(5, "0");
    const prefix = padded.slice(0, 3);
    const state = ZIP_PREFIX_TO_STATE[prefix];
    if (state && US_STATE_NAMES[state]) return state;
  }

  return null;
}

export interface UsStateGroup {
  code: string;
  label: string;
  gyms: Gym[];
}

/**
 * Group US gyms by 2-letter state code derived from the address. Records
 * whose address does not match the WPSL US pattern fall into an "Other"
 * bucket so they are still listed.
 */
export function groupUsGymsByState(gyms: Gym[]): UsStateGroup[] {
  const buckets = new Map<string, Gym[]>();
  for (const g of gyms) {
    const code = extractUsState(g.address) ?? "??";
    const bucket = buckets.get(code) ?? [];
    bucket.push(g);
    buckets.set(code, bucket);
  }
  return Array.from(buckets.entries())
    .map(([code, list]) => ({
      code,
      label: code === "??" ? "Other US locations" : (US_STATE_NAMES[code] ?? code),
      gyms: list.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      if (a.code === "??") return 1;
      if (b.code === "??") return -1;
      if (b.gyms.length !== a.gyms.length) return b.gyms.length - a.gyms.length;
      return a.label.localeCompare(b.label);
    });
}
