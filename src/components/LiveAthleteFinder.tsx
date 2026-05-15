import { useCallback, useEffect, useMemo, useState } from "react";
import {
  WATCHLIST_STORAGE_KEY,
  WATCHLIST_CAP,
  upsertWatchlist,
  removeFromWatchlist,
  type LiveSearchType,
  type LiveMatch,
  type WatchlistEntry,
} from "../lib/hyrox-live";
import LiveAthleteDashboard from "./LiveAthleteDashboard";

export interface LiveEventOption {
  slug: string;
  year: number;
  city: string;
  country: string;
  /** Pre-built results.hyrox.com search-page URL (fallback for legacy entries). */
  searchUrl: string;
  /** ISO YYYY-MM-DD start date. Optional for backwards compatibility. */
  startDate?: string;
  /** ISO YYYY-MM-DD end date. Optional. */
  endDate?: string;
}

interface Props {
  events: LiveEventOption[];
  pinnedEventSlug?: string;
  showWatchlist?: boolean;
  className?: string;
}

type ViewState =
  | { kind: "form" }
  | { kind: "loading"; query: string; type: LiveSearchType }
  | { kind: "matches"; query: string; type: LiveSearchType; matches: LiveMatch[] }
  | {
      kind: "dashboard";
      idp: string;
      event: string;
      name: string;
      raceLabel?: string;
      previousMatches?: LiveMatch[];
      previousQuery?: string;
      previousType?: LiveSearchType;
    };

const STATION_NAMES = [
  "SkiErg",
  "Sled Push",
  "Sled Pull",
  "Burpee Broad Jumps",
  "Rowing",
  "Farmer's Carry",
  "Sandbag Lunges",
  "Wall Balls",
];

const SHARE_PARAM_IDP = "idp";
const SHARE_PARAM_EVENT = "event";
const SHARE_PARAM_NAME = "name";
const SHARE_PARAM_RACE = "race";

export default function LiveAthleteFinder({
  events,
  pinnedEventSlug,
  showWatchlist = true,
  className = "",
}: Props) {
  const pinnedEvent = useMemo(
    () =>
      pinnedEventSlug
        ? events.find((e) => e.slug === pinnedEventSlug) ?? null
        : null,
    [events, pinnedEventSlug],
  );

  const initialSlug = pinnedEvent?.slug ?? events[0]?.slug ?? "";
  const [selectedSlug, setSelectedSlug] = useState(initialSlug);
  const [searchType, setSearchType] = useState<LiveSearchType>("name");
  const [query, setQuery] = useState("");
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [officialFallbackUrl, setOfficialFallbackUrl] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>({ kind: "form" });

  useEffect(() => {
    setSelectedSlug(initialSlug);
  }, [initialSlug]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as WatchlistEntry[];
      if (Array.isArray(parsed)) setWatchlist(parsed.slice(0, WATCHLIST_CAP));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // If the URL already carries ?idp&event, jump straight into the dashboard.
  // This is how share links land users on a tracker without searching.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const idp = params.get(SHARE_PARAM_IDP);
    const event = params.get(SHARE_PARAM_EVENT);
    if (!idp || !event) return;
    const name = params.get(SHARE_PARAM_NAME) ?? "";
    const race = params.get(SHARE_PARAM_RACE) ?? undefined;
    setView({
      kind: "dashboard",
      idp,
      event,
      name,
      raceLabel: race,
    });
  }, []);

  function persist(next: WatchlistEntry[]) {
    setWatchlist(next);
    try {
      window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota errors */
    }
  }

  const selectedEvent = useMemo(
    () => events.find((e) => e.slug === selectedSlug) ?? events[0] ?? null,
    [events, selectedSlug],
  );

  const hasNoEvents = events.length === 0;

  const isFutureEvent = useMemo(() => {
    if (!selectedEvent?.startDate) return false;
    const today = new Date();
    const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return selectedEvent.startDate > ymd;
  }, [selectedEvent]);

  const buildShareLink = useCallback(
    (match: { idp: string; event: string; name: string }) => {
      const params = new URLSearchParams();
      params.set(SHARE_PARAM_IDP, match.idp);
      params.set(SHARE_PARAM_EVENT, match.event);
      if (match.name) params.set(SHARE_PARAM_NAME, match.name);
      if (selectedEvent) {
        params.set(
          SHARE_PARAM_RACE,
          `Hyrox ${selectedEvent.city} ${selectedEvent.year}`,
        );
      }
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}/live/?${params.toString()}`;
    },
    [selectedEvent],
  );

  async function copyShareLink(match: LiveMatch) {
    const url = buildShareLink(match);
    let copied = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch {
      /* fall through */
    }
    if (!copied) {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* nothing more we can do */
      }
    }
    if (copied) {
      setError(null);
      setFeedback(`Share link copied — paste into iMessage / WhatsApp / Slack.`);
    } else {
      setError(
        `Couldn't copy automatically. Long-press to copy: ${url}`,
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFeedback(null);
    setOfficialFallbackUrl(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setError(
        searchType === "name"
          ? "Enter the athlete's surname (last name)."
          : "Enter the bib (start) number.",
      );
      return;
    }
    if (searchType === "bib" && !/^\d{1,6}$/.test(trimmed)) {
      setError("Bib numbers are digits only — e.g. 1234.");
      return;
    }

    // Hyrox stores names as "Lastname, Firstname" and only matches by
    // surname. If the user typed "Annie Emilsson" extract "Emilsson" and
    // search that; if they typed "Emilsson, Annie" extract "Emilsson".
    const effectiveQuery =
      searchType === "name" ? extractSurname(trimmed) : trimmed;
    const didExtract = effectiveQuery !== trimmed;

    setView({ kind: "loading", query: effectiveQuery, type: searchType });
    try {
      const res = await fetch(
        `/api/live/search?q=${encodeURIComponent(effectiveQuery)}&type=${searchType}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        offerManualFallback(
          `Tracker search is temporarily unavailable. Stay here and retry in a moment — no Hyrox tab was opened.`,
        );
        return;
      }
      const data = (await res.json()) as { matches: LiveMatch[] };
      const matches = data.matches ?? [];
      const fullNameMatches =
        searchType === "name" && hasMultipleNameParts(trimmed)
          ? matches.filter((match) => nameMatchesQuery(match.name, trimmed))
          : matches;
      const displayMatches = fullNameMatches.length > 0 ? fullNameMatches : matches;
      if (matches.length === 0) {
        setView({ kind: "form" });
        setOfficialFallbackUrl(selectedEvent?.searchUrl ?? null);
        if (isFutureEvent) {
          setError(
            `No startlist match for "${effectiveQuery}" yet. Hyrox publishes startlists a few days before race day — try again closer to the event.`,
          );
          return;
        }
        setError(
          `No matches for "${effectiveQuery}". Hyrox searches by surname — try the last name only (e.g. "Emilsson" not "Annie Emilsson").`,
        );
        return;
      }
      if (didExtract && fullNameMatches.length > 0) {
        setFeedback(`Showing results for surname "${effectiveQuery}".`);
      }
      if (displayMatches.length === 1 && (fullNameMatches.length > 0 || !hasMultipleNameParts(trimmed))) {
        const m = displayMatches[0];
        openDashboard(m, { matches: displayMatches, query: trimmed, type: searchType });
        return;
      }
      if (hasMultipleNameParts(trimmed) && fullNameMatches.length === 0) {
        setFeedback(
          `No exact match for "${trimmed}". Showing surname matches for "${effectiveQuery}" — choose manually only if it is the right athlete.`,
        );
      }
      setView({ kind: "matches", query: trimmed, type: searchType, matches: displayMatches });
    } catch {
      offerManualFallback(
        "Couldn't reach the local tracker search. Stay here and retry in a moment — no Hyrox tab was opened.",
      );
    }
  }

  function offerManualFallback(message: string) {
    setView({ kind: "form" });
    setError(message);
    setOfficialFallbackUrl(selectedEvent?.searchUrl ?? null);
  }

  function openDashboard(
    match: LiveMatch,
    fromMatches?: { matches: LiveMatch[]; query: string; type: LiveSearchType },
  ) {
    if (!selectedEvent) return;
    const entry: WatchlistEntry = {
      eventSlug: selectedEvent.slug,
      year: selectedEvent.year,
      eventCity: selectedEvent.city,
      type: "name",
      query: match.name,
      addedAt: Date.now(),
      idp: match.idp,
      event: match.event,
      divisionLabel: match.divisionLabel ?? undefined,
    };
    persist(upsertWatchlist(watchlist, entry));
    setView({
      kind: "dashboard",
      idp: match.idp,
      event: match.event,
      name: match.name,
      raceLabel: selectedEvent ? `Hyrox ${selectedEvent.city} ${selectedEvent.year}` : undefined,
      previousMatches: fromMatches?.matches,
      previousQuery: fromMatches?.query,
      previousType: fromMatches?.type,
    });
  }

  function handleReopen(entry: WatchlistEntry) {
    if (entry.idp && entry.event) {
      persist(upsertWatchlist(watchlist, { ...entry, addedAt: Date.now() }));
      setView({
        kind: "dashboard",
        idp: entry.idp,
        event: entry.event,
        name: entry.query,
        raceLabel: `Hyrox ${entry.eventCity} ${entry.year}`,
      });
      return;
    }
    setQuery(entry.query);
    setSearchType(entry.type);
    setError(null);
    setFeedback("Re-running the search to switch to the live dashboard…");
    setTimeout(() => {
      const formEl = document.querySelector("form[data-live-finder]") as HTMLFormElement | null;
      formEl?.requestSubmit();
    }, 50);
  }

  function handleRemove(entry: WatchlistEntry) {
    persist(removeFromWatchlist(watchlist, entry));
  }

  function backToMatches() {
    if (view.kind !== "dashboard" || !view.previousMatches) {
      // Strip any share-link query params so the form view shows cleanly.
      if (typeof window !== "undefined" && window.location.search) {
        const url = new URL(window.location.href);
        [SHARE_PARAM_IDP, SHARE_PARAM_EVENT, SHARE_PARAM_NAME, SHARE_PARAM_RACE].forEach(
          (k) => url.searchParams.delete(k),
        );
        window.history.replaceState({}, "", url.toString());
      }
      setView({ kind: "form" });
      return;
    }
    setView({
      kind: "matches",
      matches: view.previousMatches,
      query: view.previousQuery ?? "",
      type: view.previousType ?? "name",
    });
  }

  return (
    <div className={`bg-bg-card border border-border rounded-2xl p-4 sm:p-5 md:p-6 ${className}`}>
      {view.kind === "dashboard" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-text-muted min-w-0">
              Tracking <strong className="text-text">{view.name || "athlete/team"}</strong>
              {view.raceLabel && <> at {view.raceLabel}</>}
            </div>
            <button
              type="button"
              onClick={backToMatches}
              className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-accent border border-border hover:border-accent/40 rounded-full px-3 py-1.5"
            >
              ← {view.previousMatches ? "Back to results" : "New search"}
            </button>
          </div>
          <LiveAthleteDashboard
            idp={view.idp}
            event={view.event}
            athleteHint={view.name}
            raceLabel={view.raceLabel}
            shareUrl={buildShareLink({ idp: view.idp, event: view.event, name: view.name })}
            onClose={backToMatches}
          />
        </div>
      ) : (
        <>
          <form
            data-live-finder
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {!pinnedEvent && events.length > 0 && (
              <label className="block">
                <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Race
                </span>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  aria-label="Choose the event to track"
                >
                  {events.map((e) => (
                    <option key={`${e.year}-${e.slug}`} value={e.slug}>
                      Hyrox {e.city} {e.year}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {pinnedEvent && (
              <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live now
                </span>
                <span>
                  Tracking <strong className="text-text">Hyrox {pinnedEvent.city} {pinnedEvent.year}</strong>
                </span>
              </div>
            )}

            {isFutureEvent && selectedEvent && (
              <div className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg px-3 py-2">
                Hyrox {selectedEvent.city} {selectedEvent.year} hasn't started yet.
                If the official startlist is published you can still search and
                copy a share link to send your family — the dashboard activates
                the moment the gun goes off.
              </div>
            )}

            <fieldset>
              <legend className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                Search by
              </legend>
              <div className="inline-flex bg-bg border border-border rounded-lg p-0.5" role="radiogroup">
                <button
                  type="button"
                  role="radio"
                  aria-checked={searchType === "name"}
                  onClick={() => setSearchType("name")}
                  className={`px-3 sm:px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                    searchType === "name"
                      ? "bg-accent text-bg"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  Name
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={searchType === "bib"}
                  onClick={() => setSearchType("bib")}
                  className={`px-3 sm:px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                    searchType === "bib"
                      ? "bg-accent text-bg"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  Bib number
                </button>
              </div>
            </fieldset>

            <label className="block">
              <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  {searchType === "name" ? "Surname / last name (e.g. Emilsson)" : "Start (bib) number"}
              </span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  inputMode={searchType === "bib" ? "numeric" : "text"}
                  pattern={searchType === "bib" ? "[0-9]*" : undefined}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    searchType === "name" ? "e.g. Emilsson (surname only)" : "e.g. 1234"
                  }
                  className="flex-1 min-w-0 bg-bg border border-border rounded-lg px-3 py-2.5 text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={hasNoEvents || view.kind === "loading"}
                  className="inline-flex items-center justify-center gap-2 bg-accent text-bg font-bold px-5 py-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {view.kind === "loading" ? (
                    <>
                      <Spinner /> Searching
                    </>
                  ) : (
                    <>
                      Track
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </label>

            {hasNoEvents && (
              <p className="text-sm text-text-muted">
                No Hyrox races are running right now. The tracker re-activates the moment an event goes live.
              </p>
            )}

            {error && (
              <div className="text-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {feedback && !error && (
              <div className="text-sm bg-accent/10 border border-accent/30 text-accent rounded-lg px-3 py-2">
                {feedback}
              </div>
            )}

            {officialFallbackUrl && (
              <div className="text-xs text-text-muted leading-relaxed bg-bg border border-border rounded-lg px-3 py-2">
                Optional manual fallback:{" "}
                <a
                  href={officialFallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  open the official Hyrox results portal
                </a>
                . This link only opens if you choose it.
              </div>
            )}
          </form>

          {view.kind === "matches" && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                  {view.matches.length} match{view.matches.length === 1 ? "" : "es"} for "{view.query}"
                </h4>
                <button
                  type="button"
                  onClick={() => setView({ kind: "form" })}
                  className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors"
                >
                  ← New search
                </button>
              </div>
              <ul className="space-y-2">
                {view.matches.map((m) => (
                  <li
                    key={`${m.idp}-${m.event}`}
                    className="bg-bg border border-border rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => openDashboard(m, view as { matches: LiveMatch[]; query: string; type: LiveSearchType })}
                      className="w-full text-left hover:bg-bg-card px-3 py-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="font-bold text-text-heading truncate">
                            {m.name}
                          </div>
                          <div className="text-xs text-text-muted">
                            {[m.divisionLabel, m.bib ? `Bib ${m.bib}` : null, m.country, m.ageGroup ? `AG ${m.ageGroup}` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.totalTime && (
                            <span className="text-xs font-mono font-bold text-text-muted bg-bg-card border border-border rounded-full px-2 py-0.5">
                              {m.totalTime}
                            </span>
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider text-accent">
                            Watch live →
                          </span>
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-bg-card/50">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyShareLink(m);
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted hover:text-accent border border-border hover:border-accent/40 rounded-full px-2.5 py-1"
                        title="Copy a share link to this athlete's tracker"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Copy share link
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {showWatchlist && watchlist.length > 0 && view.kind !== "dashboard" && (
        <div className="mt-6 pt-5 border-t border-border">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Your watchlist
            </h3>
            <span className="text-xs text-text-muted">
              {watchlist.length} / {WATCHLIST_CAP} saved
            </span>
          </div>
          <ul className="space-y-2">
            {watchlist.map((entry) => {
              const isLiveable = Boolean(entry.idp && entry.event);
              return (
                <li
                  key={`${entry.eventSlug}-${entry.type}-${entry.query}-${entry.addedAt}`}
                  className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-text-heading truncate max-w-full">
                        {entry.query}
                      </span>
                      {entry.divisionLabel && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-bg-card border border-border rounded-full px-1.5 py-0.5">
                          {entry.divisionLabel}
                        </span>
                      )}
                      {isLiveable && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-1.5 py-0.5">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      Hyrox {entry.eventCity} {entry.year} · added {formatRelative(entry.addedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReopen(entry)}
                    className="text-xs font-bold text-accent hover:bg-accent/10 border border-accent/30 rounded-md px-2.5 py-1.5 whitespace-nowrap"
                    title="Open the live dashboard for this athlete"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(entry)}
                    className="text-text-muted hover:text-rose-300 p-1"
                    aria-label={`Remove ${entry.query} from watchlist`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {showWatchlist && view.kind !== "dashboard" && (
        <details className="mt-6 pt-4 border-t border-border group">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text">
            What you'll see on the dashboard
          </summary>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
            {STATION_NAMES.map((name, i) => (
              <div key={name} className="flex items-center gap-1.5 text-text-muted">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent/10 border border-accent/25 text-accent text-[10px] font-black">
                  {i + 1}
                </span>
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-muted leading-relaxed">
            We pull splits from the official Hyrox results portal every 30 seconds.
            Cards fill in as the athlete completes each station, with their place
            in the division if Hyrox has published it.
          </p>
        </details>
      )}
    </div>
  );
}

/**
 * Hyrox stores names as "Lastname, Firstname" and only matches by surname.
 * Accept common input patterns and extract just the surname so the search
 * works regardless of how the user types the name.
 *   "Annie Emilsson"    → "Emilsson"
 *   "Emilsson, Annie"   → "Emilsson"
 *   "Emilsson"          → "Emilsson"  (unchanged)
 */
function extractSurname(input: string): string {
  const s = input.trim();
  // "Lastname, Firstname" format
  if (s.includes(",")) {
    return s.split(",")[0].trim();
  }
  const parts = s.split(/\s+/);
  if (parts.length === 1) return s;
  // "Firstname Lastname" → take the last token as the surname
  return parts[parts.length - 1];
}

function hasMultipleNameParts(input: string): boolean {
  return input
    .replace(",", " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length > 1;
}

function nameMatchesQuery(resultName: string, query: string): boolean {
  const result = normalizeName(resultName);
  const tokens = normalizeName(query)
    .split(" ")
    .filter((token) => token.length > 1);
  return tokens.length > 0 && tokens.every((token) => result.includes(token));
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function formatRelative(epochMs: number): string {
  const diff = Date.now() - epochMs;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
