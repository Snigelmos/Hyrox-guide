import { useEffect, useMemo, useState } from "react";
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const trimmed = query.trim();
    if (!trimmed) {
      setError(
        searchType === "name"
          ? "Enter the athlete's last name."
          : "Enter the bib (start) number.",
      );
      return;
    }
    if (searchType === "bib" && !/^\d{1,6}$/.test(trimmed)) {
      setError("Bib numbers are digits only — e.g. 1234.");
      return;
    }

    setView({ kind: "loading", query: trimmed, type: searchType });
    try {
      const res = await fetch(
        `/api/live/search?q=${encodeURIComponent(trimmed)}&type=${searchType}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        await fallbackToDeepLink(trimmed);
        return;
      }
      const data = (await res.json()) as { matches: LiveMatch[] };
      const matches = data.matches ?? [];
      if (matches.length === 0) {
        setError(
          `No matches for "${trimmed}". Check spelling or try the surname only. The official portal opens with your query in the clipboard.`,
        );
        await fallbackToDeepLink(trimmed);
        return;
      }
      if (matches.length === 1) {
        const m = matches[0];
        openDashboard(m, { matches, query: trimmed, type: searchType });
        return;
      }
      setView({ kind: "matches", query: trimmed, type: searchType, matches });
    } catch {
      await fallbackToDeepLink(trimmed);
    }
  }

  async function fallbackToDeepLink(q: string) {
    setView({ kind: "form" });
    if (!selectedEvent) {
      setError("Pick an active event first.");
      return;
    }
    let copied = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(q);
        copied = true;
      }
    } catch {
      /* ignore */
    }
    const win = window.open(selectedEvent.searchUrl, "_blank", "noopener,noreferrer");
    if (!win) {
      setError("Pop-up blocked. Allow pop-ups, or open results.hyrox.com directly.");
    } else {
      setFeedback(
        copied
          ? `Live tracker is offline — opened the official portal with "${q}" copied to clipboard.`
          : `Live tracker is offline — opened the official portal. Search "${q}" there.`,
      );
    }
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
    // Legacy entry without idp/event — re-trigger the search to land on dashboard.
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
    <div className={`bg-bg-card border border-border rounded-2xl p-5 md:p-6 ${className}`}>
      {view.kind === "dashboard" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-text-muted">
              Tracking <strong className="text-text">{view.name}</strong>
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
            raceLabel={view.raceLabel}
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
                  Active event
                </span>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-text font-medium focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  aria-label="Choose the live event to track"
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
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5 font-bold uppercase tracking-wider text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live now
                </span>
                <span>
                  Tracking <strong className="text-text">Hyrox {pinnedEvent.city} {pinnedEvent.year}</strong>
                </span>
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
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
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
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
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
                {searchType === "name" ? "Athlete name (last name works)" : "Start (bib) number"}
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode={searchType === "bib" ? "numeric" : "text"}
                  pattern={searchType === "bib" ? "[0-9]*" : undefined}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    searchType === "name" ? "e.g. Emilsson" : "e.g. 124001"
                  }
                  className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={hasNoEvents || view.kind === "loading"}
                  className="inline-flex items-center gap-2 bg-accent text-bg font-bold px-5 py-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          </form>

          {view.kind === "matches" && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-baseline justify-between mb-3">
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
                  <li key={`${m.idp}-${m.event}`}>
                    <button
                      type="button"
                      onClick={() => openDashboard(m, view as { matches: LiveMatch[]; query: string; type: LiveSearchType })}
                      className="w-full text-left bg-bg border border-border hover:border-accent/40 hover:bg-bg-card rounded-lg px-3 py-2.5 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <div className="font-bold text-text-heading truncate">
                            {m.name}
                          </div>
                          <div className="text-xs text-text-muted">
                            {[m.divisionLabel, m.country, m.ageGroup ? `AG ${m.ageGroup}` : null]
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
                  className="flex items-center gap-3 bg-bg border border-border rounded-lg px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-text-heading truncate">
                        {entry.query}
                      </span>
                      {entry.divisionLabel && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-bg-card border border-border rounded-full px-1.5 py-0.5">
                          {entry.divisionLabel}
                        </span>
                      )}
                      {isLiveable && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-1.5 py-0.5">
                          Live tracker
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
                    className="text-xs font-bold text-accent hover:bg-accent/10 border border-accent/30 rounded-md px-2.5 py-1.5"
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
