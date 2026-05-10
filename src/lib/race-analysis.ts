import {
  getBenchmarkValue,
  type DivisionGender,
  type Level,
} from "../data/station-benchmarks";
import { getPlaybook } from "../data/station-playbooks";
import {
  getLevel,
  type Division,
  type Gender,
} from "./hyroxEngine";
import {
  secondsToTimeString,
  timeStringToSeconds,
  type LiveAthleteSnapshot,
  type LiveSplit,
} from "./hyrox-live";

export type EntryKind = "single" | "doubles" | "mixed-doubles" | "pro-doubles" | "relay";

export interface RaceImprovementOpportunity {
  slug: string;
  label: string;
  actualSec: number;
  benchmarkSec: number;
  gapSec: number;
  gapLabel: string;
  actualLabel: string;
  benchmarkLabel: string;
  topFixHint?: string;
  playbookUrl?: string;
}

export interface RaceAnalysis {
  entryKind: EntryKind;
  isTeamEntry: boolean;
  benchmarkNote: string | null;
  divisionGender: DivisionGender;
  level: Level;
  totalRunSec: number;
  totalStationSec: number;
  averageRunPaceSec: number | null;
  runFadeSec: number | null;
  opportunities: RaceImprovementOpportunity[];
}

const STATION_SLUG_BY_INDEX = [
  "skierg",
  "sled-push",
  "sled-pull",
  "burpee-broad-jumps",
  "rowing",
  "farmers-carry",
  "sandbag-lunges",
  "wall-balls",
] as const;

export function analyzeRace(snapshot: LiveAthleteSnapshot): RaceAnalysis | null {
  if (snapshot.splits.length === 0) return null;

  const division = `${snapshot.athlete.division ?? ""} ${snapshot.athlete.race ?? ""}`;
  const entryKind = inferEntryKind(division);
  const isTeamEntry = entryKind !== "single";
  const gender = inferGender(division);
  const raceDivision = inferDivision(division);
  const divisionGender = toDivisionGender(gender, raceDivision);

  const runs = snapshot.splits
    .filter((s) => s.kind === "run")
    .sort((a, b) => a.index - b.index);
  const stations = snapshot.splits
    .filter((s) => s.kind === "station")
    .sort((a, b) => a.index - b.index);

  const totalRunSec = sumTimes(runs);
  const totalStationSec = sumTimes(stations);
  const totalSec =
    timeStringToSeconds(snapshot.totalTime) || totalRunSec + totalStationSec;
  const level = getLevel(totalSec || totalRunSec + totalStationSec, gender, raceDivision).token;
  const averageRunPaceSec = runs.length > 0 ? Math.round(totalRunSec / runs.length) : null;

  const runFadeSec = calculateRunFade(runs);
  const opportunities: RaceImprovementOpportunity[] = [];

  if (averageRunPaceSec != null) {
    const runBench = getBenchmarkValue("running", divisionGender, level);
    if (runBench != null) {
      opportunities.push(makeOpportunity("running", "Running pace", averageRunPaceSec, runBench, "/km"));
    }
  }

  for (const split of stations) {
    const slug = STATION_SLUG_BY_INDEX[split.index - 1];
    if (!slug) continue;
    const benchmarkSec = getBenchmarkValue(slug, divisionGender, level);
    if (benchmarkSec == null) continue;
    opportunities.push(makeOpportunity(slug, split.label, timeStringToSeconds(split.time), benchmarkSec));
  }

  const positive = opportunities
    .filter((o) => o.gapSec > 0)
    .sort((a, b) => b.gapSec - a.gapSec)
    .slice(0, 4);

  const benchmarkNote = isTeamEntry
    ? "Team/doubles benchmarks are approximate right now. We compare your split pattern against the closest singles benchmark so you can still see where time is leaking without pretending the target is exact."
    : null;

  return {
    entryKind,
    isTeamEntry,
    benchmarkNote,
    divisionGender,
    level,
    totalRunSec,
    totalStationSec,
    averageRunPaceSec,
    runFadeSec,
    opportunities: positive,
  };
}

export function entryKindLabel(kind: EntryKind): string {
  switch (kind) {
    case "mixed-doubles":
      return "Mixed Doubles";
    case "pro-doubles":
      return "Pro Doubles";
    case "doubles":
      return "Doubles";
    case "relay":
      return "Relay";
    default:
      return "Single";
  }
}

function makeOpportunity(
  slug: string,
  label: string,
  actualSec: number,
  benchmarkSec: number,
  unitLabel = "",
): RaceImprovementOpportunity {
  const gapSec = actualSec - benchmarkSec;
  const playbook = getPlaybook(slug);
  return {
    slug,
    label,
    actualSec,
    benchmarkSec,
    gapSec,
    gapLabel: `${formatSigned(gapSec)}${unitLabel}`,
    actualLabel: `${secondsToTimeString(actualSec)}${unitLabel}`,
    benchmarkLabel: `${secondsToTimeString(benchmarkSec)}${unitLabel}`,
    topFixHint: playbook?.topFixHint,
    playbookUrl: `/training/stations/${slug}/`,
  };
}

function inferEntryKind(label: string): EntryKind {
  const s = label.toLowerCase();
  if (s.includes("relay")) return "relay";
  if (s.includes("mixed") && s.includes("double")) return "mixed-doubles";
  if (s.includes("pro") && s.includes("double")) return "pro-doubles";
  if (s.includes("double")) return "doubles";
  return "single";
}

function inferGender(label: string): Gender {
  const s = label.toLowerCase();
  if (s.includes("women") || s.includes("female")) return "women";
  return "men";
}

function inferDivision(label: string): Division {
  return label.toLowerCase().includes("pro") ? "pro" : "open";
}

function toDivisionGender(gender: Gender, division: Division): DivisionGender {
  if (division === "pro") return gender === "women" ? "proWomen" : "proMen";
  return gender === "women" ? "openWomen" : "openMen";
}

function sumTimes(splits: LiveSplit[]): number {
  return splits.reduce((sum, split) => sum + timeStringToSeconds(split.time), 0);
}

function calculateRunFade(runs: LiveSplit[]): number | null {
  if (runs.length < 6) return null;
  const firstHalf = runs.slice(0, Math.floor(runs.length / 2));
  const secondHalf = runs.slice(Math.ceil(runs.length / 2));
  const firstAvg = sumTimes(firstHalf) / firstHalf.length;
  const secondAvg = sumTimes(secondHalf) / secondHalf.length;
  return Math.round(secondAvg - firstAvg);
}

function formatSigned(seconds: number): string {
  const sign = seconds >= 0 ? "+" : "-";
  const abs = Math.abs(seconds);
  return `${sign}${secondsToTimeString(abs)}`;
}
