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
  // 2026 Season results — populated as events complete.
  // Source: hyrox.com/results, hyresult.com, and official press coverage.
  // ====================================================================

  // ---- Miami (Apr 3–5, 2026) -----------------------------------------
  {
    year: 2026,
    citySlug: "miami",
    recapPublished: "2026-04-07",
    totalAthletes: 9023,
    notableStories: [
      "Hunter McIntyre (USA) dominated the Pro Men field, winning in 53:59 at Miami Beach Convention Center.",
      "Rachael Wade (USA) took the Pro Women title in 1:00:45, edging out Morgan Schulz by over 80 seconds.",
      "Cole Learn and Ryan Douglas won the Pro Doubles Men in 50:01, narrowly breaking the 50-minute barrier.",
    ],
    divisions: [
      {
        division: "Pro Men",
        podium: [
          { rank: 1, athlete: "Hunter McIntyre", time: "0:53:59", country: "US" },
          { rank: 2, athlete: "Frederic Dube", time: "0:55:44", country: "CA" },
          { rank: 3, athlete: "Jude Reynolds", time: "0:56:43", country: "US" },
        ],
      },
      {
        division: "Pro Women",
        podium: [
          { rank: 1, athlete: "Rachael Wade", time: "1:00:45", country: "US" },
          { rank: 2, athlete: "Morgan Schulz", time: "1:02:07", country: "US" },
          { rank: 3, athlete: "Camilla Massa", time: "1:03:26", country: "BR" },
        ],
      },
      {
        division: "Pro Doubles Men",
        podium: [
          { rank: 1, athlete: "Cole Learn & Ryan Douglas", time: "0:50:01", country: "US" },
        ],
      },
      {
        division: "Pro Doubles Women",
        podium: [
          { rank: 1, athlete: "Kris Rugloski & Bridget Brown", time: "0:57:11", country: "US" },
        ],
      },
    ],
    takeaways: [
      "Miami's humidity made pacing strategy critical — athletes who went out hard in the first two runs paid heavily by station 5.",
      "Pro Men times were tighter at the top than at comparable NA events; the depth of the US domestic field continues to grow.",
    ],
  },

  // ---- Singapore (Apr 3–5, 2026) -------------------------------------
  {
    year: 2026,
    citySlug: "singapore",
    recapPublished: "2026-04-08",
    totalAthletes: 13213,
    notableStories: [
      "AIA Hyrox Singapore became the first three-day Hyrox in Southeast Asia, with 35% of athletes travelling internationally.",
      "Tanguy Cruz (France) won the Pro Men in 1:00:22, the first of two back-to-back Pro victories that week.",
      "The inaugural Friday Night Relays — a global first in a stadium setting — sold out within hours and drew a packed crowd.",
    ],
    divisions: [
      {
        division: "Pro Men",
        athleteCount: 192,
        podium: [
          { rank: 1, athlete: "Tanguy Cruz", time: "1:00:22", country: "FR" },
        ],
      },
      {
        division: "Open Men",
        athleteCount: 1571,
      },
      {
        division: "Open Women",
        athleteCount: 661,
      },
    ],
    takeaways: [
      "Singapore National Stadium's indoor track kept temperatures manageable — evidence that venue quality directly affects finishing times.",
      "The strong international turnout (35% from overseas) signals that APAC is now a premier destination on the global Hyrox calendar.",
    ],
  },

  // ---- Warsaw (Apr 16–19, 2026) — Elite 15 Major ---------------------
  {
    year: 2026,
    citySlug: "warsaw",
    recapPublished: "2026-04-21",
    totalAthletes: 3048,
    notableStories: [
      "Alexander Roncevic (Austria) set a new men's world record of 51:59 — the first sub-52 minute Hyrox in history.",
      "Joanna Wietrzyk (Australia) shattered the women's world record with 54:25, improving her own mark by 1:37 and completing an unprecedented Grand Slam — four Elite 15 Major wins in a single season.",
      "The Roncevic vs Wenisch rivalry headlined race weekend; both athletes had already set world records earlier in the season.",
    ],
    divisions: [
      {
        division: "Elite 15 Men",
        athleteCount: 15,
        fastestTime: "0:51:59",
        podium: [
          { rank: 1, athlete: "Alexander Roncevic", time: "0:51:59", country: "AT" },
          { rank: 2, athlete: "Dylan Scott", time: "0:52:40", country: "US" },
          { rank: 3, athlete: "Sebastian Ifversen", time: "0:53:18", country: "DK" },
        ],
      },
      {
        division: "Elite 15 Women",
        athleteCount: 15,
        fastestTime: "0:54:25",
        podium: [
          { rank: 1, athlete: "Joanna Wietrzyk", time: "0:54:25", country: "AU" },
        ],
      },
      {
        division: "Elite 15 Doubles Women",
        podium: [
          { rank: 1, athlete: "Lauren Weeks & Vivian Tafuto", time: "0:52:11", country: "US" },
          { rank: 2, athlete: "Charlie Searle & Lauren Stockley", time: "0:52:58", country: "GB" },
          { rank: 3, athlete: "Jade Skillen & Kat Parnell", time: "0:54:26", country: "GB" },
        ],
      },
    ],
    takeaways: [
      "World records can fall at any Major — if you're chasing a PB, race conservatively through the sled stations and unleash on the final run.",
      "Rope management on the sled pull decided several positions in the Elite field; practice it before any race where the prize matters.",
      "Wietrzyk's Warsaw run average of 3:48/km across eight kilometres under race fatigue is a useful benchmark for advanced athletes setting targets.",
    ],
  },

  // ---- Paris (Apr 23–27, 2026) ---------------------------------------
  {
    year: 2026,
    citySlug: "paris",
    recapPublished: "2026-04-28",
    totalAthletes: 20568,
    notableStories: [
      "French dominance at home: Julien Coquillaud-Salomon won Pro Men in 55:12, with Tommy Valentin (56:00) and CrossFit athlete Willy Georges (56:29) completing an all-French podium.",
      "Alice Schürer (Austria) took the Pro Women title in 1:03:37, just ahead of Viola Oberländer (Germany, 1:04:24) in a closely contested finish with no woman breaking the hour.",
      "Paris 2026 was the largest Hyrox to date in France — over 20,000 athletes across five days at the Grand Palais.",
    ],
    divisions: [
      {
        division: "Pro Men",
        athleteCount: 700,
        podium: [
          { rank: 1, athlete: "Julien Coquillaud-Salomon", time: "0:55:12", country: "FR" },
          { rank: 2, athlete: "Tommy Valentin", time: "0:56:00", country: "FR" },
          { rank: 3, athlete: "Willy Georges", time: "0:56:29", country: "FR" },
        ],
      },
      {
        division: "Pro Women",
        athleteCount: 285,
        podium: [
          { rank: 1, athlete: "Alice Schürer", time: "1:03:37", country: "AT" },
          { rank: 2, athlete: "Viola Oberländer", time: "1:04:24", country: "DE" },
          { rank: 3, athlete: "Anne-Caroline Charpentier", time: "1:04:24", country: "FR" },
        ],
      },
      {
        division: "Pro Doubles Men",
        athleteCount: 397,
        podium: [
          { rank: 1, athlete: "Quentin Garel & Alan Cao", time: "0:50:34", country: "FR" },
          { rank: 2, athlete: "Martin Lecorgne & Xavier Dufour", time: "0:50:40", country: "FR" },
          { rank: 3, athlete: "Olivier Jouve & Dimitry Martins", time: "0:50:49", country: "FR" },
        ],
      },
      {
        division: "Pro Doubles Women",
        athleteCount: 294,
        podium: [
          { rank: 1, athlete: "Lola Gomes & Apolline Cardon", time: "0:58:59", country: "FR" },
          { rank: 2, athlete: "Laura Germani & Lucille Golliau", time: "1:00:10", country: "FR" },
          { rank: 3, athlete: "Camille Bat & Camille Julien", time: "1:00:27", country: "FR" },
        ],
      },
      {
        division: "Open Men",
        athleteCount: 2547,
      },
      {
        division: "Open Women",
        athleteCount: 1665,
      },
    ],
    takeaways: [
      "The all-French Pro Men podium reflects years of domestic growth — France is now producing a depth of Pro-level athletes that rivals Germany and the UK.",
      "No Pro Women athlete broke the hour at Paris, despite the iconic venue — humidity and multi-day fatigue for athletes racing across the long weekend likely played a role.",
      "The Pro Doubles Men podium was also swept by France (all three spots), confirming the French doubles scene as the strongest in Europe.",
    ],
  },
];

export function getResults(year: number, citySlug: string): RaceResult | undefined {
  return RACE_RESULTS.find((r) => r.year === year && r.citySlug === citySlug);
}
