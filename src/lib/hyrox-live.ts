/**
 * Live race tracking helpers.
 *
 * Hyrox publishes no live-data API. The official portal at results.hyrox.com is
 * server-rendered HTML from Mika timing, so `/api/live/search` and
 * `/api/live/athlete` read it server-side and we render splits on our own pages.
 *
 * Two hard constraints shape everything here:
 *
 *  1. A search must name one division-day id (e.g. `HPRO_LR3MS4JI16C0`). There
 *     is no cross-race or cross-season search — `event=ALL` is ignored. So
 *     finding an athlete without knowing their race means fanning out across
 *     every division of every candidate race.
 *  2. Neither the season bucket nor the division ids can be derived from a
 *     date, so they are discovered by scripts/build-results-index.mjs and
 *     committed to hyrox-results-index.generated.ts.
 *
 * The portal also exposes no per-athlete history: detail pages link only to
 * rankings and startlists. Race history therefore comes from our own ingested
 * dataset, not from a live lookup.
 */

import type { HyroxEvent } from "../data/events";
import { EVENTS } from "../data/events";
import {
  HYROX_RESULTS_INDEX,
  RESULTS_INDEX_CURRENT_SEASON,
  type ResultsIndexEntry,
} from "../data/hyrox-results-index.generated";
import { parseYmd, toYmd, weekdayShort } from "./race-status";

/**
 * Where a race lives on results.hyrox.com.
 *
 * The season bucket cannot be computed from a race date. The buckets are not
 * chronological: season-8 holds the completed 2025/26 season, season-9 the
 * current window, and season-10 is a 2018/2019 archive. An earlier version of
 * this file guessed the bucket from a 2026-08-15 cutoff, which pointed every
 * later race at the 2018 archive. The mapping is now discovered from the portal
 * by scripts/build-results-index.mjs and committed to the generated index.
 */
export function getResultsLocation(
  slug: string,
  year: number,
): ResultsIndexEntry | null {
  return RESULTS_INDEX_BY_KEY.get(`${year}:${slug}`) ?? null;
}

const RESULTS_INDEX_BY_KEY = new Map(
  HYROX_RESULTS_INDEX.map((e) => [`${e.year}:${e.slug}`, e] as const),
);

export function resultsHyroxSeason(event: HyroxEvent): string {
  return (
    getResultsLocation(event.slug, event.year)?.season ??
    RESULTS_INDEX_CURRENT_SEASON
  );
}

/**
 * The division ids to search for a race.
 *
 * `*_OVERALL` ids are dropped even though they look like a cheap way to cover a
 * whole weekend in one request: they are aggregate rankings and they drop
 * entries. Amsterdam 2026 returns three matches for "Smith" via
 * H_AMS26_OVERALL but four across the individual days, and the detail page
 * reached through an overall id reports its race as "General Ranking" instead
 * of the city. Per-day ids are the only complete, correctly-labelled set.
 */
export function getSearchDivisionIds(entry: ResultsIndexEntry): string[] {
  return entry.divisions
    .filter((d) => !d.id.endsWith("_OVERALL"))
    .map((d) => d.id);
}

/**
 * Return events whose date range covers the supplied date (inclusive).
 *
 * `startDate` and `endDate` are ISO `YYYY-MM-DD` strings; we compare as
 * strings so timezones don't shift the result. An event that spans
 * 2026-05-08..2026-05-10 is "active" on all three of those days.
 */
export function getActiveEventsOn(
  date: Date = new Date(),
  events: HyroxEvent[] = EVENTS,
): HyroxEvent[] {
  const ymd = toYmd(date);
  return events.filter((e) => {
    const start = e.startDate;
    const end = e.endDate ?? e.startDate;
    return start <= ymd && ymd <= end;
  });
}

export function isEventLiveNow(
  event: HyroxEvent,
  date: Date = new Date(),
): boolean {
  const ymd = toYmd(date);
  const end = event.endDate ?? event.startDate;
  return event.startDate <= ymd && ymd <= end;
}

/**
 * Events that start within the next `days` days, excluding any that are
 * already live now (those belong in `getActiveEventsOn`). Sorted ascending
 * by start date so the soonest race is first.
 */
export function getUpcomingEvents(
  date: Date = new Date(),
  days = 60,
  events: HyroxEvent[] = EVENTS,
): HyroxEvent[] {
  const todayYmd = toYmd(date);
  const horizon = new Date(date.getTime());
  horizon.setDate(horizon.getDate() + days);
  const horizonYmd = toYmd(horizon);
  return events
    .filter((e) => e.startDate > todayYmd && e.startDate <= horizonYmd)
    .sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
}

/** Events that start within the next 7 days (exclusive of today). */
export function getThisWeekEvents(
  date: Date = new Date(),
  events: HyroxEvent[] = EVENTS,
): HyroxEvent[] {
  return getUpcomingEvents(date, 7, events);
}

/**
 * Events whose race weekend ended within the last `days` days. Excludes
 * events still active today. Sorted descending by end date so the most
 * recently finished race is first — that's almost always what spectators
 * are looking for ("how did Helsinki end?").
 *
 * Used on `/live/` to render a "Recently finished — see results" rail
 * that keeps tracking traffic on-site after the gun, instead of bouncing
 * to results.hyrox.com.
 */
export function getRecentlyFinishedEvents(
  date: Date = new Date(),
  days = 14,
  events: HyroxEvent[] = EVENTS,
): HyroxEvent[] {
  const todayYmd = toYmd(date);
  const cutoff = new Date(date.getTime());
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffYmd = toYmd(cutoff);
  return events
    .filter((e) => {
      const end = e.endDate ?? e.startDate;
      return end < todayYmd && end >= cutoffYmd;
    })
    .sort((a, b) => {
      const aEnd = a.endDate ?? a.startDate;
      const bEnd = b.endDate ?? b.startDate;
      return aEnd > bEnd ? -1 : 1;
    });
}

/** Days from `event.endDate` (or startDate) to `date`. 0 means ended today. */
export function daysSinceEvent(
  event: HyroxEvent,
  date: Date = new Date(),
): number {
  const end = parseYmd(event.endDate ?? event.startDate);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round(
    (today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/** Days from `date` until `event.startDate`. Negative if already past. */
export function daysUntilEvent(
  event: HyroxEvent,
  date: Date = new Date(),
): number {
  const start = parseYmd(event.startDate);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round(
    (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * Build the deep-link URL into results.hyrox.com.
 *
 * We can't reliably prefill the JS-rendered search box via URL parameters,
 * so the link points at the search page for the right season. The caller
 * is responsible for copying the actual query (name / bib) to the clipboard
 * so the spectator can paste into the search box with one keystroke.
 */
export function buildResultsHyroxUrl(event: HyroxEvent): string {
  return `https://results.hyrox.com/${resultsHyroxSeason(event)}/?pid=search`;
}

/** "Day 2 of 3 (Sun)"-style label for an active multi-day event. */
export function liveEventDayLabel(
  event: HyroxEvent,
  date: Date = new Date(),
): string {
  const start = parseYmd(event.startDate);
  const end = parseYmd(event.endDate ?? event.startDate);
  const totalDays =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (totalDays <= 1) {
    return weekdayShort(start);
  }
  const cur = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.max(
    1,
    Math.min(
      totalDays,
      Math.round((cur.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    ),
  );
  return `Day ${dayIndex} of ${totalDays} (${weekdayShort(cur)})`;
}

export type LiveSearchType = "name" | "bib";

export interface WatchlistEntry {
  eventSlug: string;
  year: number;
  eventCity: string;
  type: LiveSearchType;
  query: string;
  /** Epoch ms when the entry was added. */
  addedAt: number;
  /**
   * Mika timing's athlete ID. Present on entries created since the on-page
   * dashboard shipped — older entries fall back to the deep-link launcher.
   */
  idp?: string;
  /** Mika timing's event-and-division ID (e.g. HPRO_LR3MS4JI15A6). */
  event?: string;
  /** Friendly division label inferred from the event-id prefix. */
  divisionLabel?: string;
  /**
   * Season bucket the entry lives in. Absent on entries saved before the
   * tracker stopped assuming a single season.
   */
  season?: string;
}

/**
 * A single match returned by `/api/live/search`.
 *
 * The race fields are authoritative: they come from the division that actually
 * produced the match, not from whatever race the spectator had selected. That
 * distinction matters because the finder used to label every result with the
 * selected race even though the search never sent one upstream.
 */
export interface LiveMatch {
  idp: string;
  event: string;
  name: string;
  bib: string | null;
  country: string | null;
  ageGroup: string | null;
  totalTime: string | null;
  divisionLabel: string | null;
  detailUrl: string;
  /** Our event slug for the race this entry was found in. */
  raceSlug: string;
  raceYear: number;
  /** Display name for the race, e.g. "Hyrox Chiba 2026". */
  raceName: string;
  /** Season bucket the entry lives in, needed to re-fetch the athlete. */
  season: string;
}

/** One row in the splits table — either a 1 km run or a station. */
export interface LiveSplit {
  kind: "run" | "station";
  index: number;
  label: string;
  time: string;
  place: number | null;
}

/** Full snapshot returned by `/api/live/athlete`. */
export interface LiveAthleteSnapshot {
  athlete: {
    name: string;
    bib: string | null;
    country: string | null;
    ageGroup: string | null;
    division: string | null;
    race: string | null;
  };
  splits: LiveSplit[];
  totalTime: string | null;
  rankOverall: number | null;
  rankAge: number | null;
  isFinished: boolean;
  fetchedAt: string;
  source: string;
}

/** Convert "HH:MM:SS" → seconds. Returns 0 on bad input. */
export function timeStringToSeconds(t: string | null | undefined): number {
  if (!t) return 0;
  const m = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(t.trim());
  if (!m) return 0;
  return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10);
}

/** Convert seconds → "H:MM:SS" or "MM:SS" depending on size. */
export function secondsToTimeString(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export const WATCHLIST_STORAGE_KEY = "hyroxvault.live.watchlist";
export const WATCHLIST_CAP = 20;

/**
 * Insert (or refresh) an entry, dedupe on (eventSlug + type + query), and
 * cap the list at {@link WATCHLIST_CAP}. Pure function — caller owns
 * persistence.
 */
export function upsertWatchlist(
  list: WatchlistEntry[],
  next: WatchlistEntry,
): WatchlistEntry[] {
  const normQuery = next.query.trim().toLowerCase();
  const filtered = list.filter(
    (e) =>
      !(
        e.eventSlug === next.eventSlug &&
        e.type === next.type &&
        e.query.trim().toLowerCase() === normQuery
      ),
  );
  return [next, ...filtered].slice(0, WATCHLIST_CAP);
}

export function removeFromWatchlist(
  list: WatchlistEntry[],
  target: Pick<WatchlistEntry, "eventSlug" | "type" | "query">,
): WatchlistEntry[] {
  const normQuery = target.query.trim().toLowerCase();
  return list.filter(
    (e) =>
      !(
        e.eventSlug === target.eventSlug &&
        e.type === target.type &&
        e.query.trim().toLowerCase() === normQuery
      ),
  );
}

// toYmd, parseYmd and weekdayShort used to be defined here as well, character
// for character. They now come from src/lib/race-status.ts, so a timezone fix
// lands in one place instead of three.
