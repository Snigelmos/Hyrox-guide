/**
 * Render-time US state grouping for the gym directory.
 *
 * The Gym schema does not store a separate `state` field today, but the
 * `address` strings emitted by the WPSL pipeline follow a stable shape for
 * US records, e.g. "54 Murray Street, New York, NY 10007, United States".
 * This helper extracts the 2-letter state code with a single regex and
 * resolves it to a friendly label for headings.
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

const US_STATE_RE = /,\s*([A-Z]{2})\s+\d{5}(?:-\d{4})?,\s*United States/;

export function extractUsState(address: string | undefined | null): string | null {
  if (!address) return null;
  const m = address.match(US_STATE_RE);
  if (!m) return null;
  const code = m[1].toUpperCase();
  return US_STATE_NAMES[code] ? code : null;
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
