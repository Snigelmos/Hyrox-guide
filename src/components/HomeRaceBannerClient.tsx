import { useEffect, useMemo, useState } from "react";
import {
  daysUntilEvent,
  formatEventDate,
  getActiveEventsOnDate,
  getUpcomingEventsOnDate,
  liveEventDayLabel,
  type RaceStatusEvent,
} from "../lib/race-status";

interface Props {
  events: RaceStatusEvent[];
  initialDateYmd: string;
}

export default function HomeRaceBannerClient({ events, initialDateYmd }: Props) {
  const [dateYmd, setDateYmd] = useState(initialDateYmd);

  useEffect(() => {
    const update = () => setDateYmd(todayYmd());
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const now = useMemo(() => parseLocalDate(dateYmd), [dateYmd]);
  const liveEvents = useMemo(() => getActiveEventsOnDate(now, events), [events, now]);
  const upcoming14 = useMemo(() => getUpcomingEventsOnDate(now, 14, events), [events, now]);
  const allActiveOrUpcoming = [...liveEvents, ...upcoming14];
  const featured = allActiveOrUpcoming[0];
  const secondary = allActiveOrUpcoming.slice(1);

  if (!featured) return null;

  const featuredIsLive = liveEvents.some(
    (e) => e.slug === featured.slug && e.year === featured.year,
  );
  const featuredDays = daysUntilEvent(featured, now);
  const featuredDayLabel = featuredIsLive ? liveEventDayLabel(featured, now) : null;
  const statusLabel = featuredIsLive
    ? "Race live now"
    : featuredDays === 0
      ? "Race day"
      : featuredDays === 1
        ? "1 day to go"
        : `${featuredDays} days to go`;
  const featuredHref = featuredIsLive
    ? `/events/${featured.year}/${featured.slug}/#live-tracker`
    : `/events/${featured.year}/${featured.slug}/`;

  return (
    <section className="relative isolate border-b border-border overflow-hidden" aria-label="Upcoming Hyrox races">
      <div
        className={`absolute inset-0 -z-10 ${
          featuredIsLive
            ? "bg-gradient-to-b from-emerald-500/10 via-bg-card/30 to-bg-card/10"
            : "bg-gradient-to-b from-accent/10 via-bg-card/30 to-bg-card/10"
        }`}
      />

      <div className="container-main py-6 md:py-8">
        <a
          href={featuredHref}
          className={`group relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-5 md:p-6 rounded-2xl border no-underline transition-all hover:-translate-y-0.5 ${
            featuredIsLive
              ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50"
              : "bg-accent/5 border-accent/30 hover:border-accent/50"
          }`}
        >
          <div className="flex flex-col gap-1.5 md:min-w-[10rem]">
            <span
              className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                featuredIsLive
                  ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                  : "bg-accent/15 border border-accent/40 text-accent"
              }`}
            >
              {featuredIsLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              {statusLabel}
            </span>
            <span className="text-xs text-text-muted">
              {featuredIsLive && featuredDayLabel
                ? `${featuredDayLabel} · ${formatEventDate(featured.startDate, featured.endDate)}`
                : formatEventDate(featured.startDate, featured.endDate)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-black text-text-heading leading-tight mb-1 group-hover:text-accent transition-colors">
              {featuredIsLive
                ? `Hyrox ${featured.city} ${featured.year} is live now`
                : `Hyrox ${featured.city} ${featured.year}`}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed mb-0">
              {featured.venue}, {featured.country}
              {featuredIsLive
                ? " · track athletes on HyroxVault without leaving the site."
                : featured.populationDescriptor
                  ? ` · ${featured.populationDescriptor}`
                  : ""}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 md:flex-shrink-0">
            {featuredIsLive && (
              <span className="hidden sm:inline-flex items-center gap-1.5 bg-bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-text">
                Track an athlete →
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                featuredIsLive
                  ? "bg-emerald-500 text-white group-hover:bg-emerald-400"
                  : "bg-accent text-bg group-hover:bg-accent/90"
              }`}
            >
              {featuredIsLive ? "Open live tracker" : "View details"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </a>

        {featuredIsLive && (
          <div className="mt-3 text-center md:text-left">
            <a
              href="/live/"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 no-underline"
            >
              Or open the live-tracker hub →
            </a>
          </div>
        )}

        {secondary.length > 0 && (
          <div className="mt-5 md:mt-6">
            <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Also racing in the next 2 weeks
              </span>
              <a href="/events/2026/" className="text-xs font-bold uppercase tracking-wider text-accent hover:underline no-underline">
                Full {now.getFullYear()} calendar →
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {secondary.map((event) => {
                const isLive = liveEvents.some((e) => e.slug === event.slug && e.year === event.year);
                const days = daysUntilEvent(event, now);
                const chipLabel = isLive
                  ? "LIVE"
                  : days === 0
                    ? "Today"
                    : days === 1
                      ? "Tomorrow"
                      : `+${days}d`;
                return (
                  <a
                    key={`${event.year}-${event.slug}`}
                    href={isLive ? `/events/${event.year}/${event.slug}/#live-tracker` : `/events/${event.year}/${event.slug}/`}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm border transition-colors no-underline ${
                      isLive
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/15"
                        : "bg-bg-card border-border text-text hover:border-accent/40 hover:text-accent"
                    }`}
                  >
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLive ? "" : "text-text-muted"}`}>
                      {chipLabel}
                    </span>
                    <span className="font-bold">{event.city}</span>
                    <span className="text-xs text-text-muted hidden sm:inline">
                      {formatEventDate(event.startDate, event.endDate)}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
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
