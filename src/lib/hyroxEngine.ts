/**
 * Hyrox race-time prediction engine.
 *
 * Single source of truth for the math behind the calculator. Imported by
 * both <HyroxCalculator /> (the interactive form on /calculator/) and
 * <ShareableResult /> (the screenshot-friendly /calculator/share/ page).
 *
 * Inputs and outputs are intentionally minimal so a result can be encoded
 * into a URL query string and re-rendered server-side or in a fresh tab.
 */
import { LEVEL_LABELS, type Level } from "../data/station-benchmarks";

export type Gender = "men" | "women";
export type Division = "open" | "pro";

export interface StationResult {
  slug: string;
  name: string;
  time: number;
}

export interface CalculationInputs {
  gender: Gender;
  division: Division;
  fiveKmMinutes: number;
  fiveKmSeconds: number;
  benchKg: number;
  deadliftKg: number;
  bodyweightKg: number;
}

export interface CalculationResult {
  totalRunning: number;
  totalStations: number;
  transitions: number;
  total: number;
  stations: StationResult[];
  runTimePerKm: number;
}

export interface LevelInfo {
  token: Level;
  label: string;
  color: string;
}

export const STATION_NAMES = [
  "SkiErg",
  "Sled Push",
  "Sled Pull",
  "Burpee Broad Jumps",
  "Rowing",
  "Farmers Carry",
  "Sandbag Lunges",
  "Wall Balls",
];

export const STATION_SLUGS = [
  "skierg",
  "sled-push",
  "sled-pull",
  "burpee-broad-jumps",
  "rowing",
  "farmers-carry",
  "sandbag-lunges",
  "wall-balls",
];

// Base station times in seconds, derived from 2026 aggregated race averages.
const BASE_OPEN: Record<Gender, number[]> = {
  men:   [260, 160, 170, 300, 285, 140, 270, 360],
  women: [305, 155, 170, 330, 305, 145, 300, 420],
};

// Per-station multipliers for Pro division.
const PRO_MULTIPLIERS: number[] = [0.92, 1.28, 1.20, 0.85, 0.92, 1.05, 1.08, 1.05];

function getStrengthRatios(gender: Gender, division: Division) {
  if (gender === "men") {
    return division === "pro"
      ? { benchPerBw: 1.25, deadliftPerBw: 1.85 }
      : { benchPerBw: 1.0, deadliftPerBw: 1.5 };
  }
  return division === "pro"
    ? { benchPerBw: 1.0, deadliftPerBw: 1.4 }
    : { benchPerBw: 0.75, deadliftPerBw: 1.1 };
}

function getReferenceBodyweight(gender: Gender, division: Division): number {
  if (gender === "men") return division === "pro" ? 82 : 80;
  return division === "pro" ? 67 : 65;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function calculate(inputs: CalculationInputs): CalculationResult {
  const {
    gender,
    division,
    fiveKmMinutes,
    fiveKmSeconds,
    benchKg,
    deadliftKg,
    bodyweightKg,
  } = inputs;

  const fiveKmTotal = fiveKmMinutes * 60 + fiveKmSeconds;
  const pacePerKm = fiveKmTotal / 5;

  const targets = getStrengthRatios(gender, division);
  const benchNorm    = (benchKg / bodyweightKg) / targets.benchPerBw;
  const deadliftNorm = (deadliftKg / bodyweightKg) / targets.deadliftPerBw;

  const upperFactor    = Math.max(0.75, Math.min(1.30, 1.5 - benchNorm * 0.5));
  const lowerFactor    = Math.max(0.75, Math.min(1.30, 1.5 - deadliftNorm * 0.5));
  const combinedFactor = (upperFactor + lowerFactor) / 2;

  const proRunBonus = division === "pro" ? 0.03 : 0;
  const fatigueFactor =
    combinedFactor < 0.90
      ? 1.05 - proRunBonus
      : combinedFactor < 1.05
      ? 1.13 - proRunBonus
      : 1.22 - proRunBonus;

  const refBw   = getReferenceBodyweight(gender, division);
  const bwDelta = (bodyweightKg - refBw) / refBw;

  const runWeightFactor = clamp(1 + bwDelta * 0.18, 0.95, 1.10);

  const weightFactors = [
    1.0,
    clamp(1 - bwDelta * 0.30, 0.85, 1.15),
    clamp(1 - bwDelta * 0.30, 0.85, 1.15),
    clamp(1 + bwDelta * 0.35, 0.90, 1.20),
    1.0,
    1.0,
    clamp(1 + bwDelta * 0.15, 0.95, 1.10),
    clamp(1 + bwDelta * 0.18, 0.95, 1.10),
  ];

  const runTimePerKm = pacePerKm * fatigueFactor * runWeightFactor;
  const totalRunning = runTimePerKm * 8;

  const stationFactors = [
    upperFactor,
    lowerFactor,
    upperFactor,
    lowerFactor,
    combinedFactor,
    upperFactor,
    lowerFactor,
    upperFactor,
  ];

  const bases = BASE_OPEN[gender];
  const stations: StationResult[] = STATION_NAMES.map((name, i) => {
    const base = bases[i] * (division === "pro" ? PRO_MULTIPLIERS[i] : 1.0);
    return {
      slug: STATION_SLUGS[i],
      name,
      time: base * stationFactors[i] * weightFactors[i],
    };
  });

  const totalStations = stations.reduce((sum, st) => sum + st.time, 0);

  const roxBase = division === "pro" ? 300 : 420;
  const transitions =
    combinedFactor < 0.90
      ? roxBase * 0.75
      : combinedFactor < 1.05
      ? roxBase
      : roxBase * 1.35;
  const total = totalRunning + totalStations + transitions;

  return {
    totalRunning,
    totalStations,
    transitions,
    total,
    stations,
    runTimePerKm,
  };
}

export function getLevel(
  totalSeconds: number,
  gender: Gender,
  division: Division,
): LevelInfo {
  const mins = totalSeconds / 60;
  const make = (token: Level, color: string): LevelInfo => ({
    token,
    label: LEVEL_LABELS[token],
    color,
  });
  if (division === "pro") {
    if (gender === "men") {
      if (mins < 65) return make("elite", "#10b981");
      if (mins < 80) return make("competitive", "#38bdf8");
      if (mins < 100) return make("average", "#f59e0b");
      return make("beginner", "#f87171");
    }
    if (mins < 75) return make("elite", "#10b981");
    if (mins < 90) return make("competitive", "#38bdf8");
    if (mins < 110) return make("average", "#f59e0b");
    return make("beginner", "#f87171");
  }
  if (gender === "men") {
    if (mins < 70) return make("elite", "#10b981");
    if (mins < 90) return make("competitive", "#38bdf8");
    if (mins < 110) return make("average", "#f59e0b");
    return make("beginner", "#f87171");
  }
  if (mins < 80) return make("elite", "#10b981");
  if (mins < 100) return make("competitive", "#38bdf8");
  if (mins < 120) return make("average", "#f59e0b");
  return make("beginner", "#f87171");
}

export function divisionGenderToken(
  gender: Gender,
  division: Division,
): "openMen" | "openWomen" | "proMen" | "proWomen" {
  if (division === "pro") return gender === "men" ? "proMen" : "proWomen";
  return gender === "men" ? "openMen" : "openWomen";
}

export function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatTimeHM(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/** Encode the inputs into a URL query string for /calculator/share/. */
export function encodeShareParams(inputs: CalculationInputs): string {
  const params = new URLSearchParams({
    g: inputs.gender,
    d: inputs.division,
    rm: String(inputs.fiveKmMinutes),
    rs: String(inputs.fiveKmSeconds),
    b: String(inputs.benchKg),
    dl: String(inputs.deadliftKg),
    bw: String(inputs.bodyweightKg),
  });
  return params.toString();
}

/** Decode a query string into typed inputs. Returns null if anything is invalid. */
export function decodeShareParams(
  search: string,
): CalculationInputs | null {
  const params = new URLSearchParams(search);
  const g = params.get("g");
  const d = params.get("d");
  if (g !== "men" && g !== "women") return null;
  if (d !== "open" && d !== "pro") return null;
  const rm = parseInt(params.get("rm") ?? "", 10);
  const rs = parseInt(params.get("rs") ?? "", 10);
  const b = parseInt(params.get("b") ?? "", 10);
  const dl = parseInt(params.get("dl") ?? "", 10);
  const bw = parseInt(params.get("bw") ?? "", 10);
  if ([rm, rs, b, dl, bw].some((v) => isNaN(v) || v < 0)) return null;
  return {
    gender: g,
    division: d,
    fiveKmMinutes: rm,
    fiveKmSeconds: Math.max(0, Math.min(59, rs)),
    benchKg: Math.max(1, b),
    deadliftKg: Math.max(1, dl),
    bodyweightKg: Math.max(35, bw),
  };
}
