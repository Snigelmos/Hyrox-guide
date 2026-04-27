/**
 * Per-station benchmark times by performance level and division/gender.
 *
 * Single source of truth used by:
 *   1. The trainer "diagnosis" inside the calculator (compares actual user
 *      times to peer benchmarks to surface weak stations).
 *   2. Station playbook pages — the "What good looks like" tables.
 *
 * Numbers are derived from the predictor's BASE_OPEN averages
 * (HyroxCalculator.tsx) which themselves come from 2026 aggregated race data
 * (hyroxinsider.com / hyroxy.com), then scaled to four performance levels:
 *
 *   beginner    ≈ 1.25× average — bottom ~25% of finishers
 *   average     ≈ 1.00× average — population median
 *   competitive ≈ 0.92× average — top ~25%
 *   elite       ≈ 0.78× average — top ~5–10%
 *
 * Pro division values multiply by station-specific PRO_MULTIPLIERS, mirroring
 * the calculator's existing model.
 *
 * For running we use slightly wider boundaries (elite 0.72×, beginner 1.30×)
 * because the gap between elite and average runners on race-day pace is
 * proportionally larger than on station execution.
 */

export type Level = "elite" | "competitive" | "average" | "beginner";
export type DivisionGender = "openMen" | "openWomen" | "proMen" | "proWomen";

export interface StationBenchmark {
  /** Slug — matches stations.ts for the 8 race stations, plus "running". */
  slug: string;
  name: string;
  /** "time" = total seconds for the station. "pace-per-km" = seconds per km. */
  unit: "time" | "pace-per-km";
  byDivision: Record<DivisionGender, Record<Level, number>>;
}

const STATION_LEVEL_FACTORS: Record<Level, number> = {
  elite: 0.78,
  competitive: 0.92,
  average: 1.0,
  beginner: 1.25,
};

const RUNNING_LEVEL_FACTORS: Record<Level, number> = {
  elite: 0.72,
  competitive: 0.88,
  average: 1.0,
  beginner: 1.3,
};

function makeStationLevels(avg: number): Record<Level, number> {
  return {
    elite: Math.round(avg * STATION_LEVEL_FACTORS.elite),
    competitive: Math.round(avg * STATION_LEVEL_FACTORS.competitive),
    average: Math.round(avg),
    beginner: Math.round(avg * STATION_LEVEL_FACTORS.beginner),
  };
}

function makeRunningLevels(avgPace: number): Record<Level, number> {
  return {
    elite: Math.round(avgPace * RUNNING_LEVEL_FACTORS.elite),
    competitive: Math.round(avgPace * RUNNING_LEVEL_FACTORS.competitive),
    average: Math.round(avgPace),
    beginner: Math.round(avgPace * RUNNING_LEVEL_FACTORS.beginner),
  };
}

/**
 * Population averages, in seconds, per station — Open division.
 * Order matches stations.ts (position 1–8).
 *
 *   SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps,
 *   Rowing, Farmers Carry, Sandbag Lunges, Wall Balls
 */
const OPEN_AVG_MEN = [260, 160, 170, 300, 285, 140, 270, 360];
const OPEN_AVG_WOMEN = [305, 155, 170, 330, 305, 145, 300, 420];

/** Station-specific pro multipliers — heavier loads offset by fitter athlete. */
const PRO_MULTIPLIERS = [0.92, 1.28, 1.2, 0.85, 0.92, 1.05, 1.08, 1.05];

const STATION_DEFS: { slug: string; name: string; index: number }[] = [
  { slug: "skierg", name: "SkiErg", index: 0 },
  { slug: "sled-push", name: "Sled Push", index: 1 },
  { slug: "sled-pull", name: "Sled Pull", index: 2 },
  { slug: "burpee-broad-jumps", name: "Burpee Broad Jumps", index: 3 },
  { slug: "rowing", name: "Rowing", index: 4 },
  { slug: "farmers-carry", name: "Farmers Carry", index: 5 },
  { slug: "sandbag-lunges", name: "Sandbag Lunges", index: 6 },
  { slug: "wall-balls", name: "Wall Balls", index: 7 },
];

const stationBenchmarks: StationBenchmark[] = STATION_DEFS.map((def) => {
  const openMenAvg = OPEN_AVG_MEN[def.index];
  const openWomenAvg = OPEN_AVG_WOMEN[def.index];
  const proMult = PRO_MULTIPLIERS[def.index];
  return {
    slug: def.slug,
    name: def.name,
    unit: "time",
    byDivision: {
      openMen: makeStationLevels(openMenAvg),
      openWomen: makeStationLevels(openWomenAvg),
      proMen: makeStationLevels(openMenAvg * proMult),
      proWomen: makeStationLevels(openWomenAvg * proMult),
    },
  };
});

/**
 * Running benchmark — race-day per-1km pace, including the typical
 * compromised-running fatigue layer Hyrox imposes.
 *
 * Open Men avg  ≈ 5:00/km
 * Open Women avg ≈ 5:45/km
 * Pro Men avg   ≈ 4:30/km
 * Pro Women avg ≈ 5:15/km
 */
const RUNNING_BENCHMARK: StationBenchmark = {
  slug: "running",
  name: "Running",
  unit: "pace-per-km",
  byDivision: {
    openMen: makeRunningLevels(300),
    openWomen: makeRunningLevels(345),
    proMen: makeRunningLevels(270),
    proWomen: makeRunningLevels(315),
  },
};

export const STATION_BENCHMARKS: StationBenchmark[] = [
  ...stationBenchmarks,
  RUNNING_BENCHMARK,
];

const benchmarkMap = new Map<string, StationBenchmark>(
  STATION_BENCHMARKS.map((b) => [b.slug, b]),
);

export function getBenchmark(slug: string): StationBenchmark | undefined {
  return benchmarkMap.get(slug);
}

export function getBenchmarkValue(
  slug: string,
  division: DivisionGender,
  level: Level,
): number | undefined {
  const bench = benchmarkMap.get(slug);
  if (!bench) return undefined;
  return bench.byDivision[division][level];
}

export const LEVEL_ORDER: Level[] = ["beginner", "average", "competitive", "elite"];

export const LEVEL_LABELS: Record<Level, string> = {
  elite: "Elite",
  competitive: "Competitive",
  average: "Average",
  beginner: "Beginner",
};

export const DIVISION_LABELS: Record<DivisionGender, string> = {
  openMen: "Open Men",
  openWomen: "Open Women",
  proMen: "Pro Men",
  proWomen: "Pro Women",
};
