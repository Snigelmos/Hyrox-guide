export interface RaceStatusEvent {
  slug: string;
  city: string;
  country: string;
  year: number;
  startDate: string;
  endDate?: string;
  venue: string;
  populationDescriptor?: string;
  hasReport?: boolean;
}

export function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function formatEventDate(startDate: string, endDate?: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: "long", day: "numeric" };
  const start = parseYmd(startDate);
  const end = endDate ? parseYmd(endDate) : start;
  const startLabel = start.toLocaleDateString("en-US", opts);
  if (!endDate || endDate === startDate) return startLabel;
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()}-${end.getDate()}`;
  }
  return `${startLabel}-${endLabel(end)}`;
}

function endLabel(end: Date): string {
  return end.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function getActiveEventsOnDate(
  date: Date,
  events: RaceStatusEvent[],
): RaceStatusEvent[] {
  const ymd = toYmd(date);
  return events
    .filter((e) => e.startDate <= ymd && ymd <= (e.endDate ?? e.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getUpcomingEventsOnDate(
  date: Date,
  days: number,
  events: RaceStatusEvent[],
): RaceStatusEvent[] {
  const todayYmd = toYmd(date);
  const horizon = new Date(date.getTime());
  horizon.setDate(horizon.getDate() + days);
  const horizonYmd = toYmd(horizon);
  return events
    .filter((e) => e.startDate > todayYmd && e.startDate <= horizonYmd)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function getThisWeekEventsOnDate(
  date: Date,
  events: RaceStatusEvent[],
): RaceStatusEvent[] {
  return getUpcomingEventsOnDate(date, 7, events);
}

export function getRecentlyFinishedEventsOnDate(
  date: Date,
  days: number,
  events: RaceStatusEvent[],
): RaceStatusEvent[] {
  const todayYmd = toYmd(date);
  const cutoff = new Date(date.getTime());
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffYmd = toYmd(cutoff);
  return events
    .filter((e) => {
      const end = e.endDate ?? e.startDate;
      return end < todayYmd && end >= cutoffYmd;
    })
    .sort((a, b) =>
      (a.endDate ?? a.startDate) > (b.endDate ?? b.startDate) ? -1 : 1,
    );
}

export function daysUntilEvent(event: RaceStatusEvent, date: Date): number {
  const start = parseYmd(event.startDate);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((start.getTime() - today.getTime()) / 86_400_000);
}

export function daysSinceEvent(event: RaceStatusEvent, date: Date): number {
  const end = parseYmd(event.endDate ?? event.startDate);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((today.getTime() - end.getTime()) / 86_400_000);
}

export function liveEventDayLabel(event: RaceStatusEvent, date: Date): string {
  const start = parseYmd(event.startDate);
  const end = parseYmd(event.endDate ?? event.startDate);
  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (totalDays <= 1) return weekdayShort(start);
  const cur = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = Math.max(
    1,
    Math.min(totalDays, Math.round((cur.getTime() - start.getTime()) / 86_400_000) + 1),
  );
  return `Day ${dayIndex} of ${totalDays} (${weekdayShort(cur)})`;
}

function weekdayShort(date: Date): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
}
