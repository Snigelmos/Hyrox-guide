/**
 * Accessors over the ingested Pro/Elite athlete dataset.
 *
 * The dataset exists because results.hyrox.com has no per-athlete history: its
 * search is scoped to a single division-day and detail pages link only to
 * rankings. See scripts/ingest-pro-results.mjs for how it's assembled and what
 * it deliberately excludes (doubles, relays, open divisions, one-race entrants).
 */

import raw from "../data/pro-athletes.generated.json";
import { EVENTS } from "../data/events";

export interface AthleteRace {
  raceSlug: string;
  raceYear: number;
  raceCity: string;
  date: string | null;
  /** "Hyrox Pro" | "Hyrox Elite 15" */
  division: string;
  /** Upstream label, e.g. "HYROX PRO - Sunday". */
  divisionLabel: string;
  sex: "M" | "W";
  ageGroup: string | null;
  rank: number | null;
  time: string | null;
  season: string;
  idp: string;
  event: string;
}

export interface ProAthlete {
  slug: string;
  name: string;
  nation: string | null;
  sex: "M" | "W";
  races: AthleteRace[];
}

interface Dataset {
  generatedAt: string;
  seasons: string[];
  divisionsIngested: number;
  rawEntries: number;
  note: string;
  athletes: ProAthlete[];
}

const DATASET = raw as unknown as Dataset;

/**
 * A profile is only worth a public page when there's a genuine progression to
 * read. Publishing a page per two-race entrant would add thousands of
 * near-empty URLs, which is exactly the kind of thin-content bulk that drags on
 * a site's overall quality signals. Below this bar the history still shows
 * inside the live tracker, it just doesn't get its own indexable page.
 */
export const MIN_RACES_FOR_PAGE = 3;

export const PRO_ATHLETES: ProAthlete[] = DATASET.athletes ?? [];
export const PRO_DATASET_GENERATED_AT = DATASET.generatedAt;
export const PRO_DATASET_SEASONS = DATASET.seasons ?? [];

const BY_SLUG = new Map(PRO_ATHLETES.map((a) => [a.slug, a] as const));

/** Normalised-name index so the tracker can match a live result to a profile. */
const BY_NAME = new Map<string, ProAthlete[]>();
for (const athlete of PRO_ATHLETES) {
  const key = normaliseAthleteName(athlete.name);
  const list = BY_NAME.get(key);
  if (list) list.push(athlete);
  else BY_NAME.set(key, [athlete]);
}

export function normaliseAthleteName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

export function getAthleteBySlug(slug: string): ProAthlete | null {
  return BY_SLUG.get(slug) ?? null;
}

export function getPublishableAthletes(): ProAthlete[] {
  return PRO_ATHLETES.filter((a) => a.races.length >= MIN_RACES_FOR_PAGE);
}

/**
 * Find a profile for a name as the timing portal stores it ("Lastname,
 * Firstname"). Nation disambiguates when two athletes share a name; without it
 * an ambiguous match returns nothing rather than the wrong person.
 */
export function findAthlete(
  storedName: string,
  nation?: string | null,
): ProAthlete | null {
  const display = storedNameToDisplay(storedName);
  const candidates = BY_NAME.get(normaliseAthleteName(display)) ?? [];
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  if (nation) {
    const byNation = candidates.filter((c) => c.nation === nation);
    if (byNation.length === 1) return byNation[0];
  }
  return null;
}

/** "Menendez Fernandez, Pelayo" -> "Pelayo Menendez Fernandez" */
export function storedNameToDisplay(stored: string): string {
  const i = stored.indexOf(",");
  if (i === -1) return stored.replace(/\s+/g, " ").trim();
  return `${stored.slice(i + 1).trim()} ${stored.slice(0, i).trim()}`
    .replace(/\s+/g, " ")
    .trim();
}

export function timeToSeconds(time: string | null): number | null {
  if (!time) return null;
  const parts = time.split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

export function secondsToTime(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.round(total % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export interface AthleteSummary {
  raceCount: number;
  /** Fastest finish across all ingested races. */
  personalBest: AthleteRace | null;
  /** Fastest finish in the most recent 12 months of ingested data. */
  seasonBest: AthleteRace | null;
  bestRank: AthleteRace | null;
  /** Signed seconds: negative means the athlete got faster. */
  improvementSeconds: number | null;
  divisions: string[];
  /** Races that resolve to one of our event pages, for internal linking. */
  linkableRaces: AthleteRace[];
}

export function summariseAthlete(athlete: ProAthlete): AthleteSummary {
  const timed = athlete.races.filter((r) => timeToSeconds(r.time) !== null);
  const byTime = [...timed].sort(
    (a, b) => (timeToSeconds(a.time) ?? 0) - (timeToSeconds(b.time) ?? 0),
  );
  const ranked = athlete.races.filter((r) => typeof r.rank === "number");
  const byRank = [...ranked].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

  // races arrive newest-first from the ingest
  const chronological = [...timed].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? ""),
  );
  const first = chronological[0];
  const last = chronological[chronological.length - 1];
  const improvement =
    chronological.length >= 2
      ? (timeToSeconds(last.time) ?? 0) - (timeToSeconds(first.time) ?? 0)
      : null;

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  const cutoffYmd = cutoff.toISOString().slice(0, 10);
  const recent = byTime.filter((r) => (r.date ?? "") >= cutoffYmd);

  const eventKeys = new Set(EVENTS.map((e) => `${e.year}:${e.slug}`));

  return {
    raceCount: athlete.races.length,
    personalBest: byTime[0] ?? null,
    seasonBest: recent[0] ?? null,
    bestRank: byRank[0] ?? null,
    improvementSeconds: improvement,
    divisions: [...new Set(athlete.races.map((r) => r.division))],
    linkableRaces: athlete.races.filter((r) =>
      eventKeys.has(`${r.raceYear}:${r.raceSlug}`),
    ),
  };
}

export function athleteUrl(slug: string): string {
  return `/athletes/${slug}/`;
}
