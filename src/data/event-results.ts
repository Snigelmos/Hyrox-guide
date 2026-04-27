/**
 * Hyrox event results dataset.
 *
 * After each race weekend, populate one entry per city to power the
 * `/events/[year]/[city]/results/` recap page. The page renders gracefully
 * with a "results pending" state when no entry exists yet — so the URL
 * is reserved and indexable from day one.
 *
 * Source data: results published on hyrox.com leaderboards within 24-48
 * hours of the final wave. Histogram buckets are aggregated finish-time
 * distributions across the Open Singles divisions unless noted.
 */

export interface PodiumEntry {
  rank: 1 | 2 | 3;
  athlete: string;
  time: string; // h:mm:ss
  country?: string; // ISO
  team?: string;
}

export interface DivisionResult {
  division: string; // "Open Men", "Pro Women", "Doubles Mixed", etc.
  athleteCount?: number;
  fastestTime?: string;
  medianTime?: string;
  podium?: PodiumEntry[];
}

export interface FinishTimeBucket {
  bucket: string; // "<60 min", "60-65 min", etc.
  count: number;
}

export interface RaceResult {
  year: number;
  citySlug: string;
  recapPublished: string; // YYYY-MM-DD when this recap was posted
  totalAthletes?: number;
  notableStories?: string[];
  divisions: DivisionResult[];
  histogram?: FinishTimeBucket[];
  takeaways?: string[];
}

export const RACE_RESULTS: RaceResult[] = [
  // ====================================================================
  // No results entries yet for the 2026 season. Once a race is over,
  // add an entry here and the /events/2026/[city]/results/ page becomes
  // a full recap automatically. Until then it shows a "results pending"
  // state with the race's date.
  //
  // Example structure (uncomment and edit after a race):
  //
  // {
  //   year: 2026,
  //   citySlug: "berlin",
  //   recapPublished: "2026-06-01",
  //   totalAthletes: 18000,
  //   notableStories: [
  //     "Alexander Roncevic took home the Pro Men title in 53:42.",
  //     "Three Open Men athletes broke 60 minutes for the first time at Berlin.",
  //   ],
  //   divisions: [
  //     {
  //       division: "Open Men",
  //       athleteCount: 4200,
  //       fastestTime: "0:54:18",
  //       medianTime: "1:18:24",
  //       podium: [
  //         { rank: 1, athlete: "Athlete A", time: "0:54:18", country: "DE" },
  //         { rank: 2, athlete: "Athlete B", time: "0:55:12", country: "GB" },
  //         { rank: 3, athlete: "Athlete C", time: "0:56:01", country: "DE" },
  //       ],
  //     },
  //   ],
  //   histogram: [
  //     { bucket: "<60 min", count: 80 },
  //     { bucket: "60-70 min", count: 540 },
  //     { bucket: "70-80 min", count: 1020 },
  //     { bucket: "80-90 min", count: 1190 },
  //     { bucket: "90-100 min", count: 870 },
  //     { bucket: "100+ min", count: 500 },
  //   ],
  //   takeaways: [
  //     "Sled push was the biggest time-equaliser — Open Men averaged 3:18, beginners 5+ minutes.",
  //     "Wall ball no-rep rate was 11% — practice depth before race day.",
  //   ],
  // },
];

export function getResults(year: number, citySlug: string): RaceResult | undefined {
  return RACE_RESULTS.find((r) => r.year === year && r.citySlug === citySlug);
}
