import { useEffect, useMemo, useState } from "react";
import LiveAthleteFinder, { type LiveEventOption } from "./LiveAthleteFinder";
import {
  daysSinceEvent,
  daysUntilEvent,
  formatEventDate,
  getActiveEventsOnDate,
  getRecentlyFinishedEventsOnDate,
  getThisWeekEventsOnDate,
  getUpcomingEventsOnDate,
  liveEventDayLabel,
  type RaceStatusEvent,
} from "../lib/race-status";

interface Props {
  events: RaceStatusEvent[];
  initialDateYmd: string;
}

export default function LiveTrackerExperience({ events, initialDateYmd }: Props) {
  const [dateYmd, setDateYmd] = useState(initialDateYmd);

  useEffect(() => {
    const update = () => setDateYmd(todayYmd());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const now = useMemo(() => parseLocalDate(dateYmd), [dateYmd]);
  const activeEvents = useMemo(() => getActiveEventsOnDate(now, events), [events, now]);
  const thisWeekEvents = useMemo(() => getThisWeekEventsOnDate(now, events), [events, now]);
  const upcomingEvents = useMemo(
    () =>
      getUpcomingEventsOnDate(now, 60, events).filter(
        (e) => !thisWeekEvents.some((tw) => tw.slug === e.slug && tw.year === e.year),
      ),
    [events, now, thisWeekEvents],
  );
  const recentlyFinishedEvents = useMemo(
    () => getRecentlyFinishedEventsOnDate(now, 14, events),
    [events, now],
  );

  // Include recently finished events so users can still search for results
  // from races that ended in the past 14 days.
  const finderEvents: LiveEventOption[] = useMemo(() => {
    const seen = new Set<string>();
    return [...activeEvents, ...recentlyFinishedEvents, ...thisWeekEvents, ...upcomingEvents]
      .filter((event) => {
        const key = `${event.year}-${event.slug}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((event) => ({
        slug: event.slug,
        year: event.year,
        city: event.city,
        country: event.country,
        searchUrl: `https://results.hyrox.com/${event.startDate < "2026-08-15" ? "season-9" : "season-10"}/?pid=search`,
        startDate: event.startDate,
        endDate: event.endDate ?? event.startDate,
      }));
  }, [activeEvents, recentlyFinishedEvents, thisWeekEvents, upcomingEvents]);

  return (
    <>
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {activeEvents.length > 0 ? (
          <span className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {activeEvents.length === 1 ? "1 race live now" : `${activeEvents.length} races live now`}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 bg-bg-card border border-border rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-text-muted">
            No race live right now
          </span>
        )}
        {thisWeekEvents.length > 0 && (
          <span className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
            {thisWeekEvents.length === 1 ? "1 race this week" : `${thisWeekEvents.length} races this week`}
          </span>
        )}
        {recentlyFinishedEvents.length > 0 && (
          <span className="inline-flex items-center gap-2 bg-bg-card border border-border rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-text-muted">
            {recentlyFinishedEvents.length === 1 ? "1 just finished" : `${recentlyFinishedEvents.length} just finished`}
          </span>
        )}
        {upcomingEvents.length > 0 && (
          <span className="inline-flex items-center gap-2 bg-bg-card border border-border rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-text-muted">
            {upcomingEvents.length} more in next 60 days
          </span>
        )}
      </div>

      <LiveRails
        activeEvents={activeEvents}
        recentlyFinishedEvents={recentlyFinishedEvents}
        thisWeekEvents={thisWeekEvents}
        upcomingEvents={upcomingEvents}
        now={now}
      />

      <section id="track-an-athlete" className="mb-12 scroll-mt-24">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-text-heading mb-3">
              Track an athlete or team
            </h2>
            <p className="text-text-muted mb-5 max-w-2xl">
              {activeEvents.length > 0
                ? "Pick the race, search by athlete/team name or bib, and hit Track. The on-site dashboard updates every 30 seconds and you can copy a share link to send to family."
                : thisWeekEvents.length > 0
                  ? "Race weekend is coming up. Find an athlete or team now and copy a share link — the dashboard goes live the moment the start gun fires."
                  : "Pick a race, find an athlete or team, and the dashboard streams every split as it happens. Outside race weekends you can still build share links from upcoming startlists."}
            </p>
            <LiveAthleteFinder events={finderEvents} />
          </div>

          <aside className="bg-bg-card border border-border rounded-2xl p-5 md:p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-3">
              How to read the splits
            </h3>
            <ul className="space-y-3 text-sm text-text leading-relaxed">
              {[
                ["Run splits", "are the 1 km between stations. Look for late-race fade from Run 5 onward."],
                ["Station splits", "show the functional workout time. Sleds, lunges, and wall balls are usually the biggest improvement levers."],
                ["Cumulative time", "is the elapsed clock since the start gun for that wave."],
                ["Rank", "is provisional while the race is live and confirmed after the division closes."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-3">
                  <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>
                    <strong className="text-text-heading">{title}</strong> {body}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-text-muted leading-relaxed">
              Finished dashboards highlight biggest station gaps and link to the right station playbooks.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

function LiveRails({
  activeEvents,
  recentlyFinishedEvents,
  thisWeekEvents,
  upcomingEvents,
  now,
}: {
  activeEvents: RaceStatusEvent[];
  recentlyFinishedEvents: RaceStatusEvent[];
  thisWeekEvents: RaceStatusEvent[];
  upcomingEvents: RaceStatusEvent[];
  now: Date;
}) {
  return (
    <>
      {activeEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">Live right now</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeEvents.map((event) => (
              <a
                key={`${event.year}-${event.slug}`}
                href={`/events/${event.year}/${event.slug}/#live-tracker`}
                className="group relative block bg-gradient-to-br from-emerald-500/10 via-bg-card to-bg-card border border-emerald-500/30 rounded-2xl p-5 hover:border-emerald-400/60 hover:from-emerald-500/15 transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                aria-label={`Open the live tracker for Hyrox ${event.city} ${event.year}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {liveEventDayLabel(event, now)}
                  </span>
                </div>
                <h3 className="text-xl font-black text-text-heading leading-tight group-hover:text-emerald-300 transition-colors">
                  Hyrox {event.city}
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  {formatEventDate(event.startDate, event.endDate)} · {event.venue}
                </p>
                <div className="mt-4 flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <ArrowIcon />
                  <span>Open live tracker — splits, share link, dashboard</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {recentlyFinishedEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent mb-3">
            Recently finished — see results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentlyFinishedEvents.map((event) => {
              const since = daysSinceEvent(event, now);
              const sinceLabel = since === 0 ? "Just finished" : since === 1 ? "Yesterday" : `${since} days ago`;
              const href = event.hasReport
                ? `/events/${event.year}/${event.slug}/results/`
                : `/events/${event.year}/${event.slug}/#race-report`;
              return (
                <a
                  key={`${event.year}-${event.slug}`}
                  href={href}
                  className="group relative block bg-bg-card border border-border rounded-2xl p-5 hover:border-accent/50 hover:bg-bg-card-hover transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckIcon />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{sinceLabel}</span>
                  </div>
                  <h3 className="text-xl font-black text-text-heading leading-tight group-hover:text-accent transition-colors">
                    Hyrox {event.city}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {formatEventDate(event.startDate, event.endDate)} · {event.venue}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-accent font-bold text-sm">
                    <ArrowIcon />
                    <span>{event.hasReport ? "Read the race report — podium, splits, takeaways" : "Race report being compiled — open event page"}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {thisWeekEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3">This week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {thisWeekEvents.map((event) => {
              const days = daysUntilEvent(event, now);
              const countdown = days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
              return (
                <a
                  key={`${event.year}-${event.slug}`}
                  href={`/events/${event.year}/${event.slug}/`}
                  className="group relative block bg-gradient-to-br from-amber-500/10 via-bg-card to-bg-card border border-amber-500/30 rounded-2xl p-5 hover:border-amber-400/60 hover:from-amber-500/15 transition-colors no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">{countdown}</span>
                  </div>
                  <h3 className="text-xl font-black text-text-heading leading-tight group-hover:text-amber-200 transition-colors">
                    Hyrox {event.city}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {formatEventDate(event.startDate, event.endDate)} · {event.venue}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-amber-200 font-bold text-sm">
                    <ArrowIcon />
                    <span>Race-week guide + pre-build a share link</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {upcomingEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Coming up — next 60 days</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {upcomingEvents.map((event) => {
              const days = daysUntilEvent(event, now);
              return (
                <li key={`${event.year}-${event.slug}`}>
                  <a
                    href={`/events/${event.year}/${event.slug}/`}
                    className="block bg-bg-card border border-border hover:border-accent/40 rounded-xl px-4 py-3 transition-colors no-underline"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-text-heading truncate">Hyrox {event.city}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted whitespace-nowrap">
                        {days < 14 ? `In ${days}d` : formatEventDate(event.startDate, event.endDate)}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">{event.country}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function todayYmd(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
