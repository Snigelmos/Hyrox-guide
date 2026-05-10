/**
 * Race-week query capture helpers.
 *
 * Search Console data shows a consistent pattern in the 7-14 days before any
 * Hyrox race: traffic spikes for "schedule", "start list", "live results",
 * and the local-language equivalents (e.g. `aikataulu` in Finland,
 * `Zeitplan` in Germany). This module centralises the logic that
 *
 *   1. detects whether an event is in its race-week capture window,
 *   2. returns the correct local-language synonym for "schedule" and
 *      "start list" based on the event's `countryCode`, and
 *   3. builds deep links into the official results.hyrox.com portal for
 *      both the start-list view and the live-results view.
 *
 * Keep this layer pure (no React, no DOM). It is consumed both by Astro
 * pages at build time and by the React live-tracker island.
 */
import type { HyroxEvent } from "../data/events";
import { resultsHyroxSeason } from "./hyrox-live";

/**
 * Window before the start date during which we treat an event as "race week"
 * for SEO/UX purposes. Wide enough to cover the full pre-race spike we see
 * in GSC (typically 10-14 days out) without leaking the panel onto pages
 * months in advance.
 */
const RACE_WEEK_LEAD_DAYS = 14;
/**
 * Trailing window after the event ends during which the panel is still
 * useful (for "live results" / "results" / start-list-archive queries). We
 * pull back to 2 days because the dedicated /results/ recap page takes over
 * from there.
 */
const RACE_WEEK_TRAIL_DAYS = 2;

/**
 * Local-language synonyms for the two highest-volume race-week query
 * fragments: "schedule" and "start list". Keyed by ISO country code.
 *
 * Values are lowercase except where the language conventionally uses
 * capitalised nouns (German). Each entry is the term native searchers use,
 * cross-checked against Hyrox-related searches and athlete venue posts.
 *
 * MAINTENANCE: only add a country once we have evidence that the local-
 * language term sees real search volume. Do not invent translations.
 */
const LOCAL_TERMS: Record<string, { schedule: string; startList: string }> = {
  // Nordics
  FI: { schedule: "aikataulu", startList: "lähtölista" },
  SE: { schedule: "schema", startList: "startlista" },
  NO: { schedule: "tidsplan", startList: "startliste" },
  DK: { schedule: "tidsplan", startList: "startliste" },
  // German-speaking
  DE: { schedule: "Zeitplan", startList: "Startliste" },
  AT: { schedule: "Zeitplan", startList: "Startliste" },
  CH: { schedule: "Zeitplan", startList: "Startliste" },
  // Romance languages
  FR: { schedule: "horaires", startList: "liste de départ" },
  IT: { schedule: "programma", startList: "lista di partenza" },
  ES: { schedule: "horario", startList: "lista de salida" },
  PT: { schedule: "horário", startList: "lista de partida" },
  // Latin America (Spanish-speaking — race-week search behaviour mirrors ES)
  MX: { schedule: "horario", startList: "lista de salida" },
  // Benelux
  NL: { schedule: "tijdschema", startList: "startlijst" },
  BE: { schedule: "tijdschema", startList: "startlijst" },
  // Central / Eastern Europe
  PL: { schedule: "harmonogram", startList: "lista startowa" },
  CZ: { schedule: "rozpis", startList: "startovní listina" },
  HU: { schedule: "menetrend", startList: "rajtlista" },
  // Asia
  JP: { schedule: "スケジュール", startList: "スタートリスト" },
  CN: { schedule: "赛程", startList: "出发名单" },
  KR: { schedule: "일정", startList: "출발 명단" },
  // ME
  AE: { schedule: "جدول السباق", startList: "قائمة المتسابقين" },
};

export interface LocalRaceWeekTerms {
  schedule: string;
  startList: string;
  /** Whether the local terms differ from the English defaults. */
  isLocalised: boolean;
}

/**
 * Return the local-language schedule + start-list synonym for an event,
 * falling back to English when we don't have data for that country.
 *
 * The English defaults are returned with `isLocalised: false` so callers
 * know not to render bilingual headings ("Schedule (Schedule)" looks silly).
 */
export function localRaceWeekTerms(event: HyroxEvent): LocalRaceWeekTerms {
  const entry = LOCAL_TERMS[event.countryCode];
  if (!entry) {
    return { schedule: "schedule", startList: "start list", isLocalised: false };
  }
  return { ...entry, isLocalised: true };
}

/** Number of whole days from `now` until the event's start date. Negative
 *  once the race is past the start. */
export function daysUntilRace(
  event: HyroxEvent,
  now: Date = new Date(),
): number {
  const start = parseYmd(event.startDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round(
    (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

/**
 * True when the event is inside the race-week capture window: from
 * {@link RACE_WEEK_LEAD_DAYS} before start through {@link RACE_WEEK_TRAIL_DAYS}
 * after end.
 */
export function isRaceWeek(
  event: HyroxEvent,
  now: Date = new Date(),
): boolean {
  const start = parseYmd(event.startDate);
  const end = parseYmd(event.endDate ?? event.startDate);
  const leadStart = addDays(start, -RACE_WEEK_LEAD_DAYS);
  const trailEnd = addDays(end, RACE_WEEK_TRAIL_DAYS);
  return now >= leadStart && now <= trailEnd;
}

/**
 * Return events that fall inside the race-week window, sorted by start date.
 * Used on /live/ to surface "this race weekend" alongside the strictly-live
 * cards.
 */
export function getRaceWeekEvents(
  events: HyroxEvent[],
  now: Date = new Date(),
): HyroxEvent[] {
  return events
    .filter((e) => isRaceWeek(e, now))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/**
 * Deep link into the official Hyrox results portal's start-list view.
 *
 * results.hyrox.com renders an event-list / start-list view at
 * `?pid=list` for the active season. Once the spectator picks the
 * specific city the start list is rendered server-side, so this link is
 * the closest "click → see athletes" path we can offer without scraping.
 */
export function buildResultsHyroxStartListUrl(event: HyroxEvent): string {
  return `https://results.hyrox.com/${resultsHyroxSeason(event)}/?pid=list`;
}

/**
 * Deep link into the official Hyrox results portal's main event page for
 * the season. Used for "live results" CTAs once the race has started.
 */
export function buildResultsHyroxEventUrl(event: HyroxEvent): string {
  return `https://results.hyrox.com/${resultsHyroxSeason(event)}/`;
}

/**
 * Title-case label like "8 days out" / "Race day" / "Race weekend live"
 * used in the race-week panel and the /live/ countdown chips. Returns
 * `null` outside the capture window so callers can branch cleanly.
 */
export function raceWeekStatusLabel(
  event: HyroxEvent,
  now: Date = new Date(),
): string | null {
  if (!isRaceWeek(event, now)) return null;
  const start = parseYmd(event.startDate);
  const end = parseYmd(event.endDate ?? event.startDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today >= start && today <= end) return "Race weekend live";
  if (today > end) return "Just finished";
  const days = daysUntilRace(event, now);
  if (days === 1) return "1 day to go";
  if (days === 0) return "Race day";
  return `${days} days to go`;
}

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}
