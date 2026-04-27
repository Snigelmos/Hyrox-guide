/**
 * Hyrox time standards dataset.
 *
 * Used to generate /times/[category]/[ageGroup] pages programmatically.
 * Numbers are based on publicly-reported Hyrox median/average finish times
 * aggregated across 2024-2025 seasons. These are estimates for informational
 * use, not official Hyrox data.
 *
 * Station order: SkiErg 1000m, Sled Push 50m, Sled Pull 50m, Burpee Broad
 * Jumps 80m, Row 1000m, Farmers Carry 200m, Sandbag Lunges 100m, Wall Balls
 * 100 reps. Runs: 8 x 1km between stations.
 */

export type HyroxCategory =
  | "open-men"
  | "open-women"
  | "pro-men"
  | "pro-women"
  | "doubles-men"
  | "doubles-women"
  | "doubles-mixed";

export type AgeGroup =
  | "u30"
  | "30-34"
  | "35-39"
  | "40-44"
  | "45-49"
  | "50-54"
  | "55-59"
  | "60-plus";

export interface CategoryMeta {
  id: HyroxCategory;
  label: string;
  slug: HyroxCategory;
  description: string;
  divisionFactor: number; // multiplier on base open-men times
}

export interface AgeGroupMeta {
  id: AgeGroup;
  label: string;
  slug: AgeGroup;
  ageFactor: number;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "open-men",
    label: "Open Men",
    slug: "open-men",
    description: "Standard weights, solo division for men.",
    divisionFactor: 1.0,
  },
  {
    id: "open-women",
    label: "Open Women",
    slug: "open-women",
    description: "Standard weights, solo division for women.",
    divisionFactor: 1.18,
  },
  {
    id: "pro-men",
    label: "Pro Men",
    slug: "pro-men",
    description: "Heavier sleds, heavier sandbag — competitive solo men.",
    divisionFactor: 0.88,
  },
  {
    id: "pro-women",
    label: "Pro Women",
    slug: "pro-women",
    description: "Heavier weights, competitive solo women.",
    divisionFactor: 1.04,
  },
  {
    id: "doubles-men",
    label: "Doubles Men",
    slug: "doubles-men",
    description: "Two-person team, splitting work between partners.",
    divisionFactor: 0.82,
  },
  {
    id: "doubles-women",
    label: "Doubles Women",
    slug: "doubles-women",
    description: "Two-person women's team.",
    divisionFactor: 0.97,
  },
  {
    id: "doubles-mixed",
    label: "Doubles Mixed",
    slug: "doubles-mixed",
    description: "Two-person team with one man and one woman.",
    divisionFactor: 0.9,
  },
];

export const AGE_GROUPS: AgeGroupMeta[] = [
  { id: "u30", label: "Under 30", slug: "u30", ageFactor: 0.98 },
  { id: "30-34", label: "30–34", slug: "30-34", ageFactor: 1.0 },
  { id: "35-39", label: "35–39", slug: "35-39", ageFactor: 1.03 },
  { id: "40-44", label: "40–44", slug: "40-44", ageFactor: 1.07 },
  { id: "45-49", label: "45–49", slug: "45-49", ageFactor: 1.11 },
  { id: "50-54", label: "50–54", slug: "50-54", ageFactor: 1.16 },
  { id: "55-59", label: "55–59", slug: "55-59", ageFactor: 1.22 },
  { id: "60-plus", label: "60+", slug: "60-plus", ageFactor: 1.32 },
];

// Base station times in seconds for Open Men, 30-34 age group.
// Derived from publicly reported medians.
export interface StationTime {
  station: string;
  slug: string;
  seconds: number;
  link: string;
}

export const BASE_STATION_TIMES: StationTime[] = [
  { station: "SkiErg 1,000m", slug: "skierg", seconds: 265, link: "/blog/hyrox-skierg-technique-pacing/" },
  { station: "Sled Push 50m", slug: "sled-push", seconds: 180, link: "/blog/hyrox-sled-push-technique/" },
  { station: "Sled Pull 50m", slug: "sled-pull", seconds: 200, link: "/blog/hyrox-sled-pull-technique/" },
  { station: "Burpee Broad Jumps 80m", slug: "burpee-broad-jumps", seconds: 330, link: "/blog/hyrox-burpee-broad-jumps-strategy/" },
  { station: "Row 1,000m", slug: "row", seconds: 245, link: "/blog/hyrox-rowing-technique/" },
  { station: "Farmers Carry 200m", slug: "farmers-carry", seconds: 125, link: "/racing-guide/stations/" },
  { station: "Sandbag Lunges 100m", slug: "sandbag-lunges", seconds: 250, link: "/racing-guide/stations/" },
  { station: "Wall Balls (100 reps)", slug: "wall-balls", seconds: 320, link: "/racing-guide/stations/" },
];

// Base total run time for 8km at median Open Men pace, in seconds.
export const BASE_RUN_SECONDS_PER_KM = 290; // ~4:50 /km — eight reps

// Transition time between stations (roxzone), seconds total across race.
export const TRANSITION_SECONDS = 120;

export interface ExpectedFinish {
  totalSeconds: number;
  runSeconds: number;
  stationSeconds: number;
  transitionSeconds: number;
  stations: (StationTime & { adjusted: number })[];
  runPerKm: number;
}

export function computeExpectedFinish(
  category: HyroxCategory,
  ageGroup: AgeGroup
): ExpectedFinish {
  const cat = CATEGORIES.find((c) => c.id === category)!;
  const age = AGE_GROUPS.find((a) => a.id === ageGroup)!;
  const factor = cat.divisionFactor * age.ageFactor;

  const stations = BASE_STATION_TIMES.map((s) => ({
    ...s,
    adjusted: Math.round(s.seconds * factor),
  }));
  const stationSeconds = stations.reduce((acc, s) => acc + s.adjusted, 0);

  const runPerKm = Math.round(BASE_RUN_SECONDS_PER_KM * factor);
  const runSeconds = runPerKm * 8;

  const transitionSeconds = Math.round(TRANSITION_SECONDS * factor);

  return {
    totalSeconds: stationSeconds + runSeconds + transitionSeconds,
    runSeconds,
    stationSeconds,
    transitionSeconds,
    stations,
    runPerKm,
  };
}

export function formatHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function allTimeCombinations(): { category: HyroxCategory; ageGroup: AgeGroup }[] {
  const out: { category: HyroxCategory; ageGroup: AgeGroup }[] = [];
  for (const c of CATEGORIES) {
    for (const a of AGE_GROUPS) {
      out.push({ category: c.id, ageGroup: a.id });
    }
  }
  return out;
}
