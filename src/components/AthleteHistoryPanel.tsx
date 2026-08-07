import { useEffect, useState } from "react";

interface HistoryRace {
  raceSlug: string;
  raceYear: number;
  raceCity: string;
  date: string | null;
  division: string;
  rank: number | null;
  time: string | null;
}

interface HistoryResponse {
  found: boolean;
  reason?: string;
  detail?: string;
  athlete?: {
    slug: string;
    name: string;
    nation: string | null;
    raceCount: number;
    profileUrl: string | null;
    races: HistoryRace[];
  };
}

interface Props {
  /** Name as the timing portal stores it, e.g. "Stroschneider, Tanja". */
  storedName: string;
  nation?: string | null;
  /** Race the athlete is in right now, excluded from the history list. */
  currentRaceSlug?: string;
  currentRaceYear?: number;
}

function formatDate(ymd: string | null): string {
  if (!ymd) return "";
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function toSeconds(time: string | null): number | null {
  if (!time) return null;
  const p = time.split(":").map(Number);
  if (p.some((n) => !Number.isFinite(n))) return null;
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  if (p.length === 2) return p[0] * 60 + p[1];
  return null;
}

export default function AthleteHistoryPanel({
  storedName,
  nation,
  currentRaceSlug,
  currentRaceYear,
}: Props) {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "none"; detail?: string }
    | { kind: "found"; data: NonNullable<HistoryResponse["athlete"]> }
  >({ kind: "loading" });

  useEffect(() => {
    if (!storedName) return;
    let cancelled = false;
    setState({ kind: "loading" });
    const params = new URLSearchParams({ name: storedName });
    if (nation) params.set("nation", nation);
    fetch(`/api/live/history?${params.toString()}`)
      .then((r) => r.json() as Promise<HistoryResponse>)
      .then((body) => {
        if (cancelled) return;
        if (body.found && body.athlete) {
          setState({ kind: "found", data: body.athlete });
        } else {
          setState({ kind: "none", detail: body.detail });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "none" });
      });
    return () => {
      cancelled = true;
    };
  }, [storedName, nation]);

  if (state.kind === "loading") {
    return (
      <section className="mt-8 bg-bg-card border border-border rounded-2xl p-5">
        <h3 className="text-lg font-black text-text-heading mb-2">Past races</h3>
        <p className="text-sm text-text-muted">Looking up race history…</p>
      </section>
    );
  }

  if (state.kind === "none") {
    return (
      <section className="mt-8 bg-bg-card border border-border rounded-2xl p-5">
        <h3 className="text-lg font-black text-text-heading mb-2">Past races</h3>
        <p className="text-sm text-text-muted">
          No past races on record for this athlete.{" "}
          {state.detail ??
            "We only hold histories for the Hyrox Pro and Elite 15 singles divisions."}{" "}
          This doesn't mean they haven't raced before — an Open-division or doubles
          history simply isn't something we can attribute to one person reliably.
        </p>
      </section>
    );
  }

  const races = state.data.races.filter(
    (r) => !(r.raceSlug === currentRaceSlug && r.raceYear === currentRaceYear),
  );

  if (races.length === 0) {
    return (
      <section className="mt-8 bg-bg-card border border-border rounded-2xl p-5">
        <h3 className="text-lg font-black text-text-heading mb-2">Past races</h3>
        <p className="text-sm text-text-muted">
          This is the first Hyrox Pro race we have on record for{" "}
          {state.data.name}.
        </p>
      </section>
    );
  }

  const best = races.reduce<number | null>((acc, r) => {
    const s = toSeconds(r.time);
    if (s === null) return acc;
    return acc === null || s < acc ? s : acc;
  }, null);

  return (
    <section className="mt-8 bg-bg-card border border-border rounded-2xl p-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <h3 className="text-lg font-black text-text-heading">
          Past races
          <span className="ml-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            {races.length} on record
          </span>
        </h3>
        {state.data.profileUrl && (
          <a
            href={state.data.profileUrl}
            className="text-xs font-bold uppercase tracking-wider text-accent hover:underline no-underline"
          >
            Full profile →
          </a>
        )}
      </div>

      <ul className="divide-y divide-border/60">
        {races.map((r) => {
          const isBest = best !== null && toSeconds(r.time) === best;
          return (
            <li
              key={`${r.raceYear}-${r.raceSlug}-${r.time ?? "x"}`}
              className="flex items-center justify-between gap-3 py-2"
            >
              <div className="min-w-0">
                <a
                  href={`/events/${r.raceYear}/${r.raceSlug}/`}
                  className="font-bold text-text-heading hover:text-accent transition-colors no-underline text-sm truncate block"
                >
                  {r.raceCity} {r.raceYear}
                </a>
                <div className="text-xs text-text-muted">
                  {[formatDate(r.date), r.division, r.rank ? `#${r.rank}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`font-bold tabular-nums text-sm ${isBest ? "text-emerald-400" : "text-text-heading"}`}
                >
                  {r.time ?? "DNF"}
                </span>
                {isBest && (
                  <span className="ml-1.5 text-[10px] font-bold uppercase text-emerald-400">
                    Best
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
