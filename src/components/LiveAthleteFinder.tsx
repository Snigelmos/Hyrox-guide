import { useEffect, useMemo, useState } from "react";
import {
  WATCHLIST_STORAGE_KEY,
  WATCHLIST_CAP,
  upsertWatchlist,
  removeFromWatchlist,
  type LiveSearchType,
  type WatchlistEntry,
} from "../lib/hyrox-live";

/**
 * Lightweight projection of HyroxEvent that the page passes in. We
 * intentionally do not import HyroxEvent itself so the component stays
 * decoupled from the events dataset shape.
 */
export interface LiveEventOption {
  slug: string;
  year: number;
  city: string;
  country: string;
  /** Pre-built results.hyrox.com deep link for this event's season. */
  searchUrl: string;
}

interface Props {
  /** Events the user can choose between. The first entry is the default. */
  events: LiveEventOption[];
  /**
   * If supplied, the picker is hidden and the form is pinned to this slug.
   * Use this when the component is embedded on a single-event page.
   */
  pinnedEventSlug?: string;
  /** Show the saved-searches list under the form. Defaults to true. */
  showWatchlist?: boolean;
  /** Optional Tailwind class merged into the outer container. */
  className?: string;
}

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      // Ignore corrupted storage and start fresh.
    }
  }, []);

  function persist(next: WatchlistEntry[]) {
    setWatchlist(next);
    try {
      window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota exceeded or storage unavailable — UI still works for this session.
    }
  }

  const selectedEvent = useMemo(
    () => events.find((e) => e.slug === selectedSlug) ?? events[0] ?? null,
    [events, selectedSlug],
  );

  const hasNoEvents = events.length === 0;

  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to legacy fallback.
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  async function openTracker(entry: WatchlistEntry, url: string) {
    const copied = await copyToClipboard(entry.query);
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      setError(
        "Pop-up was blocked. Allow pop-ups for hyroxvault.com or open the link below manually.",
      );
      return;
    }
    setError(null);
    setFeedback(
      copied
        ? `${entry.query} copied — paste with ${navigator?.platform?.toLowerCase().includes("mac") ? "Cmd+V" : "Ctrl+V"} into the search box.`
        : `Search opened — type "${entry.query}" into the search box on the new tab.`,
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!selectedEvent) {
      setError("Pick an active event to start tracking.");
      return;
    }
    const trimmed = query.trim();
    if (!trimmed) {
      setError(
        searchType === "name"
          ? "Enter the athlete's last name (or full name)."
          : "Enter the bib (start) number.",
      );
      return;
    }
    if (searchType === "bib" && !/^\d{1,6}$/.test(trimmed)) {
      setError("Bib numbers are digits only — e.g. 1234.");
      return;
    }

    const entry: WatchlistEntry = {
      eventSlug: selectedEvent.slug,
      year: selectedEvent.year,
      eventCity: selectedEvent.city,
      type: searchType,
      query: trimmed,
      addedAt: Date.now(),
    };
    persist(upsertWatchlist(watchlist, entry));
    await openTracker(entry, selectedEvent.searchUrl);
  }

  function handleReopen(entry: WatchlistEntry) {
    const event = events.find((e) => e.slug === entry.eventSlug);
    if (!event) {
      setError(
        `${entry.eventCity} is no longer in the active events list. Open the official portal directly.`,
      );
      return;
    }
    const refreshed: WatchlistEntry = { ...entry, addedAt: Date.now() };
    persist(upsertWatchlist(watchlist, refreshed));
    void openTracker(refreshed, event.searchUrl);
  }

  function handleRemove(entry: WatchlistEntry) {
    persist(removeFromWatchlist(watchlist, entry));
  }

  return (
    <div className={`bg-bg-card border border-border rounded-2xl p-5 md:p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            {searchType === "name" ? "Athlete name" : "Start (bib) number"}
          </span>
          <div className="flex gap-2">
            <input
              type={searchType === "bib" ? "text" : "text"}
              inputMode={searchType === "bib" ? "numeric" : "text"}
              pattern={searchType === "bib" ? "[0-9]*" : undefined}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                searchType === "name"
                  ? "e.g. Stahl, or Hunter McIntyre"
                  : "e.g. 1234"
              }
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={hasNoEvents}
              className="inline-flex items-center gap-2 bg-accent text-bg font-bold px-5 py-2.5 rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Track
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
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

        <p className="text-xs text-text-muted leading-relaxed">
          Splits land on the official Hyrox portal (results.hyrox.com). We open
          the search page in a new tab and copy your query so you can paste
          straight into Hyrox's search box. Refresh that tab between stations
          to see new splits.
        </p>
      </form>

      {showWatchlist && watchlist.length > 0 && (
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
              const event = events.find((e) => e.slug === entry.eventSlug);
              const eventLabel = event
                ? `Hyrox ${event.city} ${event.year}`
                : `Hyrox ${entry.eventCity} ${entry.year}`;
              const isLive = Boolean(event);
              return (
                <li
                  key={`${entry.eventSlug}-${entry.type}-${entry.query}`}
                  className="flex items-center gap-3 bg-bg border border-border rounded-lg px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-text-heading truncate">
                        {entry.query}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-bg-card border border-border rounded-full px-1.5 py-0.5">
                        {entry.type === "bib" ? "Bib" : "Name"}
                      </span>
                      {isLive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-1.5 py-0.5">
                          Live
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted truncate">
                      {eventLabel} · added {formatRelative(entry.addedAt)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReopen(entry)}
                    disabled={!isLive}
                    className="text-xs font-bold text-accent hover:bg-accent/10 disabled:opacity-30 disabled:cursor-not-allowed border border-accent/30 rounded-md px-2.5 py-1.5"
                    title={
                      isLive
                        ? "Reopen the official tracker for this athlete"
                        : "This event is no longer live"
                    }
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

      {showWatchlist && (
        <details className="mt-6 pt-4 border-t border-border group">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text">
            What you'll see on Hyrox's tracker
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
            Hyrox tracks each station as the athlete enters and leaves the box,
            with a 1 km run between every station. Splits update on the
            official portal within seconds of the timing mat being crossed.
          </p>
        </details>
      )}
    </div>
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
