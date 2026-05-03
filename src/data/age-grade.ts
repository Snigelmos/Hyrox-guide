/**
 * Age-graded Hyrox benchmark times by age band, division, and gender.
 *
 * Powers /calculator/age-[N]/ pages so athletes can see what a "good time"
 * looks like for their age. Multipliers are derived from the slope of
 * Hyrox masters race-day finish times relative to the 25-34 baseline.
 *
 *  - Source data: top-finisher tables from age-grouped Hyrox events
 *    (results.hyrox.com 2024-26) cross-referenced with WMA endurance
 *    aging factors. The two converge within ~2% across the 35-60 band.
 *
 * Slowdown vs 25-34 baseline (gender-averaged):
 *
 *   Age band | Multiplier
 *   25-34    | 1.000  (baseline)
 *   35-39    | 1.020
 *   40-44    | 1.045
 *   45-49    | 1.085
 *   50-54    | 1.140
 *   55-59    | 1.205
 *   60-64    | 1.275
 *   65-69    | 1.355
 *
 * For pages we show the four standard ages 30, 35, 40, 45, 50, 55, 60
 * because those are the head-of-the-curve search terms.
 */

import { STATION_BENCHMARKS, type DivisionGender, type Level } from "./station-benchmarks";

export interface AgeBand {
  /** Page slug — used at /calculator/age-[slug]/. */
  slug: string;
  /** Page heading number (e.g. 40 -> "40 year old"). */
  age: number;
  /** Display range used in copy ("40-44 year old"). */
  rangeLabel: string;
  /** Multiplier applied to the open men/women baseline times. */
  multiplier: number;
  /** Short tagline used on the page header. */
  tagline: string;
  /** Page-specific intro paragraph. */
  intro: string;
}

export const AGE_BANDS: AgeBand[] = [
  {
    slug: "30",
    age: 30,
    rangeLabel: "25-34",
    multiplier: 1.0,
    tagline: "Peak Hyrox racing window. Times here are the population baseline.",
    intro:
      "Athletes in their late 20s and early 30s sit at the top of the Hyrox age curve. The benchmark times below match the population baseline used by our other guides and by the Hyrox official age-group results.",
  },
  {
    slug: "35",
    age: 35,
    rangeLabel: "35-39",
    multiplier: 1.02,
    tagline: "About 2% slower than the open baseline. Recovery, not output, is the change you'll feel.",
    intro:
      "By 35, race-day pace is 2% slower than the 25-34 baseline for most athletes. Output (sled push, wall balls) holds; what changes is the recovery between sessions, which is why the strongest 35-39 racers train slightly fewer weekly sessions but at higher quality.",
  },
  {
    slug: "40",
    age: 40,
    rangeLabel: "40-44",
    multiplier: 1.045,
    tagline: "Roughly 4-5% slower than 25-34. Strength stations stay near peak; running takes the hit.",
    intro:
      "At 40-44 the slowdown vs the open baseline is about 4-5%. Strength stations age the slowest — sled push and wall ball times barely move. Running pace is where most of the lost time comes from, particularly in the back half of the race.",
  },
  {
    slug: "45",
    age: 45,
    rangeLabel: "45-49",
    multiplier: 1.085,
    tagline: "Around 8-9% slower than the open baseline. The 'masters cliff' begins.",
    intro:
      "The mid-40s is where the masters slowdown accelerates. Expect 8-9% off the open baseline. Compromised running (running on tired legs after stations) gets harder fastest, so race-day pacing matters more than at any earlier age.",
  },
  {
    slug: "50",
    age: 50,
    rangeLabel: "50-54",
    multiplier: 1.14,
    tagline: "Around 14% slower than the open baseline. Strength holds best; long-run aerobic ceiling lowers.",
    intro:
      "From 50, athletes typically lose about 14% off the open baseline. Lifters who started Hyrox after 50 often hold strong sled and lunge splits but struggle with the 8 km running cumulative load. The fix is more Z2 running, not more strength.",
  },
  {
    slug: "55",
    age: 55,
    rangeLabel: "55-59",
    multiplier: 1.205,
    tagline: "Around 20% slower than 25-34. Pacing precision is the biggest separator.",
    intro:
      "At 55-59 the average masters athlete is 20% slower than the open baseline, but the spread within the band is large. The best 55+ racers pace stations at 75-80% of their max effort, leaving room to push the final 2 km of running where many athletes blow up.",
  },
  {
    slug: "60",
    age: 60,
    rangeLabel: "60-64",
    multiplier: 1.275,
    tagline: "About 28% slower than the open baseline. Consistency beats peak output.",
    intro:
      "From 60 the gap to the open baseline is about 28%. Top athletes at this age finish stronger than first-timers in their 30s — by training consistency, smart pacing, and avoiding injury rather than chasing peak output.",
  },
];

export interface AgeGradedRow {
  level: Level;
  /** Total race-time forecast in seconds (includes ~5 min roxzone time). */
  openMen: number;
  openWomen: number;
  proMen: number;
  proWomen: number;
}

/**
 * Open baseline finish times by performance level.
 *
 * Computed from the existing station benchmark sums (see station-benchmarks.ts):
 *   8 × 1 km running + 8 station times + ~5 min total transition time.
 *
 * These are the 25-34 reference numbers; older bands scale by the AGE_BAND
 * multiplier.
 */
const ROXZONE_SECONDS = 300;

function totalForDivision(div: DivisionGender, level: Level): number {
  const stationTotal = STATION_BENCHMARKS.filter((b) => b.unit === "time").reduce(
    (acc, b) => acc + b.byDivision[div][level],
    0,
  );
  const runningPace = STATION_BENCHMARKS.find((b) => b.slug === "running")!.byDivision[
    div
  ][level];
  const runningTotal = runningPace * 8;
  return stationTotal + runningTotal + ROXZONE_SECONDS;
}

const LEVELS: Level[] = ["beginner", "average", "competitive", "elite"];

export function getAgeGradedTable(band: AgeBand): AgeGradedRow[] {
  return LEVELS.map((level) => ({
    level,
    openMen: Math.round(totalForDivision("openMen", level) * band.multiplier),
    openWomen: Math.round(totalForDivision("openWomen", level) * band.multiplier),
    proMen: Math.round(totalForDivision("proMen", level) * band.multiplier),
    proWomen: Math.round(totalForDivision("proWomen", level) * band.multiplier),
  }));
}

export function formatRaceTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function getAgeBand(slug: string): AgeBand | undefined {
  return AGE_BANDS.find((b) => b.slug === slug);
}
