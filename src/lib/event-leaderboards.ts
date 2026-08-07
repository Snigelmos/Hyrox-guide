/**
 * Accessors over the synced per-race leaderboards.
 *
 * See scripts/build-event-leaderboards.mjs for how the dataset is assembled.
 * Two properties of it matter to callers here:
 *
 *  - It is provisional. Disqualifications and time corrections land days after a
 *    race, so every race carries the date it was synced and the UI is expected
 *    to say so rather than presenting these as final.
 *  - It never outranks editorial data. src/data/event-results.ts is written by
 *    hand after a race weekend and is the authority wherever it has an opinion;
 *    this dataset fills the gaps and adds the long tail (ranks 4-10, field size,
 *    median) that nobody wants to transcribe by hand.
 */

import raw from "../data/event-leaderboards.generated.json";

export interface LeaderboardRow {
  rank: number;
  /** A person for singles; the whole team, comma-separated, for doubles/relay. */
  name: string;
  time: string;
  country: string | null;
  ageGroup: string | null;
}

export interface LeaderboardDivision {
  /** "Pro Men", "Doubles Women", "Team Relay Men", "Doubles (all categories)". */
  division: string;
  sex: "M" | "W" | null;
  /** Upstream division ids this was read from, so a figure can be traced back. */
  sourceIds: string[];
  /**
   * Set when the division fell back to the unfiltered listing because the
   * upstream sex attribute was missing or plainly wrong. Explains why such a
   * division carries no median and an approximate field size.
   */
  note: string | null;
  isTeam: boolean;
  fieldSize: number;
  /** False when the portal only gave a bucketed total ("> 1000 Results"). */
  fieldSizeExact: boolean;
  fastestTime: string;
  medianTime: string | null;
  top: LeaderboardRow[];
}

export interface RaceLeaderboard {
  slug: string;
  year: number;
  city: string;
  season: string;
  /** YYYY-MM-DD this race was last pulled from the portal. */
  syncedAt: string;
  raceEndDate: string | null;
  /** Sum of the exactly-counted division fields. */
  totalFinishers: number;
  divisions: LeaderboardDivision[];
}

interface Dataset {
  generatedAt: string;
  resyncDays: number;
  note: string;
  races: Record<string, RaceLeaderboard>;
}

const DATASET = raw as unknown as Dataset;

export const LEADERBOARDS_GENERATED_AT = DATASET.generatedAt;
export const LEADERBOARD_RACES = DATASET.races ?? {};

export function getEventLeaderboard(
  year: number,
  slug: string,
): RaceLeaderboard | undefined {
  return LEADERBOARD_RACES[`${year}/${slug}`];
}

/**
 * Find the division a page wants to headline, tolerating naming differences —
 * a race with no Pro field should fall through to Open rather than show nothing.
 */
export function pickDivision(
  leaderboard: RaceLeaderboard | undefined,
  matchers: string[],
): LeaderboardDivision | undefined {
  if (!leaderboard) return undefined;
  for (const matcher of matchers) {
    const hit = leaderboard.divisions.find((d) =>
      d.division.toLowerCase().startsWith(matcher.toLowerCase()),
    );
    if (hit) return hit;
  }
  return undefined;
}

/** "12 Feb 2026" — short enough to sit inside a provenance line. */
export function formatSyncedDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Editorial division names ("Pro Men") and synced ones ("Pro Men") mostly agree,
 * so a normalised compare is enough to tell whether a hand-written podium
 * already covers a synced division.
 */
export function sameDivision(a: string, b: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/\(all categories\)/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  return norm(a) === norm(b);
}
