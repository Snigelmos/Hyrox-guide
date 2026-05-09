import { useCallback, useEffect, useRef, useState } from "react";
import {
  secondsToTimeString,
  timeStringToSeconds,
  type LiveAthleteSnapshot,
  type LiveSplit,
} from "../lib/hyrox-live";

const POLL_INTERVAL_MS = 30_000;

interface Props {
  idp: string;
  event: string;
  /** Optional human label (e.g. "Hyrox Helsinki 2026") shown above the board. */
  raceLabel?: string;
  /** Called when the user wants to stop watching this athlete. */
  onClose?: () => void;
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

export default function LiveAthleteDashboard({
  idp,
  event,
  raceLabel,
  onClose,
}: Props) {
  const [snapshot, setSnapshot] = useState<LiveAthleteSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [tick, setTick] = useState(0);
  const fallbackUrl = `https://results.hyrox.com/season-9/?content=detail&pid=search&idp=${encodeURIComponent(idp)}&event=${encodeURIComponent(event)}&lang=EN_CAP`;
  const lastFetchRef = useRef<number>(0);

  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/live/athlete?idp=${encodeURIComponent(idp)}&event=${encodeURIComponent(event)}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Tracker upstream returned ${res.status}.`);
        return;
      }
      const data = (await res.json()) as LiveAthleteSnapshot;
      setSnapshot(data);
      setError(null);
      lastFetchRef.current = Date.now();
      if (data.isFinished) setIsPolling(false);
    } catch {
      setError("Couldn't reach the live tracker. Trying again shortly.");
    }
  }, [idp, event]);

  useEffect(() => {
    setSnapshot(null);
    setError(null);
    setIsPolling(true);
    void fetchSnapshot();
  }, [fetchSnapshot]);

  useEffect(() => {
    if (!isPolling) return;
    const id = window.setInterval(() => {
      void fetchSnapshot();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPolling, fetchSnapshot]);

  // Drive the "12s ago" label so it stays current between polls.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const stationsByIndex = new Map<number, LiveSplit>();
  const runsByIndex = new Map<number, LiveSplit>();
  for (const s of snapshot?.splits ?? []) {
    if (s.kind === "station") stationsByIndex.set(s.index, s);
    else runsByIndex.set(s.index, s);
  }

  const stationsDone = stationsByIndex.size;
  const lastRunIndex = runsByIndex.size;
  const allRunsTotal = Array.from(runsByIndex.values()).reduce(
    (acc, r) => acc + timeStringToSeconds(r.time),
    0,
  );
  const allStationsTotal = Array.from(stationsByIndex.values()).reduce(
    (acc, st) => acc + timeStringToSeconds(st.time),
    0,
  );
  const elapsedSec = allRunsTotal + allStationsTotal;

  const projection = projectFinish(snapshot);

  const positionLabel = describePosition(snapshot);
  const lastUpdateLabel = lastFetchRef.current
    ? formatRelativeSeconds(Math.floor((Date.now() - lastFetchRef.current) / 1000))
    : "—";
  // Reference `tick` so React keeps re-rendering the relative label.
  void tick;

  return (
    <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 md:px-6 py-4 md:py-5 border-b border-border bg-gradient-to-br from-emerald-500/5 via-bg-card to-bg-card">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${snapshot?.isFinished ? "" : "animate-pulse"}`} />
                {snapshot?.isFinished ? "Finished" : "Live"}
              </span>
              {snapshot?.athlete.bib && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted bg-bg border border-border rounded-full px-2 py-0.5">
                  Bib {snapshot.athlete.bib}
                </span>
              )}
              {snapshot?.athlete.country && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {snapshot.athlete.country}
                </span>
              )}
              {snapshot?.athlete.ageGroup && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  AG {snapshot.athlete.ageGroup}
                </span>
              )}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-text-heading leading-tight truncate">
              {snapshot?.athlete.name ?? "Loading…"}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {snapshot?.athlete.race ?? raceLabel ?? "Hyrox"}
              {snapshot?.athlete.division && (
                <>
                  {" · "}
                  <span className="font-bold text-text">{snapshot.athlete.division}</span>
                </>
              )}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text border border-border hover:border-accent/40 rounded-full px-3 py-1.5"
            >
              Stop watching
            </button>
          )}
        </div>

        {snapshot && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Stat
              label="Elapsed"
              value={
                snapshot.totalTime ?? (elapsedSec > 0 ? secondsToTimeString(elapsedSec) : "—")
              }
              hint={snapshot.isFinished ? "Final time" : "So far"}
            />
            <Stat
              label="Stations"
              value={`${stationsDone} / 8`}
              hint={stationsDone === 8 ? "Complete" : positionLabel}
            />
            <Stat
              label="Rank (M/W)"
              value={snapshot.rankOverall != null ? `#${snapshot.rankOverall}` : "—"}
              hint={snapshot.isFinished ? "Final" : "Provisional"}
            />
            <Stat
              label="Projected"
              value={projection.label}
              hint={projection.hint}
            />
          </div>
        )}
      </div>

      <div className="px-5 md:px-6 py-4 md:py-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Station-by-station
          </h4>
          <div className="text-xs text-text-muted">
            {snapshot?.isFinished ? (
              <>Polling stopped — race complete.</>
            ) : (
              <>Updates every 30s · last fetch {lastUpdateLabel}</>
            )}
          </div>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STATION_NAMES.map((stationName, i) => {
            const stationIndex = i + 1;
            const station = stationsByIndex.get(stationIndex);
            const runIn = runsByIndex.get(stationIndex);
            const isCurrent =
              !station &&
              !!runIn &&
              stationIndex === lastRunIndex &&
              !snapshot?.isFinished;
            const isComplete = !!station;
            const isUpcoming = !station && !runIn;
            return (
              <li
                key={stationName}
                className={`relative rounded-xl border p-3.5 transition-colors ${
                  isComplete
                    ? "bg-gradient-to-br from-accent/15 via-bg to-bg border-accent/30"
                    : isCurrent
                      ? "bg-emerald-500/5 border-emerald-500/40"
                      : "bg-bg border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-black ${
                      isComplete
                        ? "bg-accent/15 border border-accent/30 text-accent"
                        : isCurrent
                          ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                          : "bg-bg-card border border-border text-text-muted"
                    }`}
                  >
                    {stationIndex}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
                    {stationName}
                  </span>
                  {station?.place != null && (
                    <span
                      className={`ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full border ${
                        station.place === 1
                          ? "text-amber-300 bg-amber-500/15 border-amber-500/30"
                          : station.place <= 3
                            ? "text-amber-300/80 bg-amber-500/10 border-amber-500/25"
                            : "text-text-muted bg-bg-card border-border"
                      }`}
                    >
                      P{station.place}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      On floor
                    </span>
                  )}
                </div>
                <div className="text-xl md:text-2xl font-black font-mono text-text-heading leading-none">
                  {station?.time ?? (isCurrent ? "in progress" : "—")}
                </div>
                <div className="mt-2 text-[11px] text-text-muted">
                  {runIn ? (
                    <>
                      Run {stationIndex}{" "}
                      <span className="font-mono text-text">{runIn.time}</span>
                    </>
                  ) : isUpcoming ? (
                    "Awaiting"
                  ) : (
                    "Run on the floor"
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {error && (
          <div className="mt-4 text-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-border flex items-center gap-3 flex-wrap">
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors no-underline"
          >
            Open on Hyrox.com ↗
          </a>
          <span className="text-xs text-text-muted/60">
            · Splits sourced from results.hyrox.com (Mika timing)
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-bg border border-border rounded-xl px-3 py-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="text-base md:text-lg font-black font-mono text-text-heading leading-tight">
        {value}
      </div>
      {hint && (
        <div className="text-[10px] text-text-muted mt-0.5 leading-tight">
          {hint}
        </div>
      )}
    </div>
  );
}

function describePosition(snapshot: LiveAthleteSnapshot | null): string {
  if (!snapshot) return "—";
  if (snapshot.isFinished) return "Done";
  const stations = snapshot.splits.filter((s) => s.kind === "station").length;
  const runs = snapshot.splits.filter((s) => s.kind === "run").length;
  if (stations === 0 && runs === 0) return "Pre-race";
  if (runs > stations) return `On run ${runs}, station ${runs} next`;
  return `Cleared station ${stations}`;
}

interface Projection {
  label: string;
  hint: string;
}

function projectFinish(snapshot: LiveAthleteSnapshot | null): Projection {
  if (!snapshot) return { label: "—", hint: "Loading" };
  if (snapshot.isFinished && snapshot.totalTime) {
    return { label: snapshot.totalTime, hint: "Actual finish" };
  }
  const stationSplits = snapshot.splits.filter((s) => s.kind === "station");
  const runSplits = snapshot.splits.filter((s) => s.kind === "run");
  const stationsDone = stationSplits.length;
  const runsDone = runSplits.length;
  if (runsDone === 0) return { label: "—", hint: "Awaits run 1" };

  const elapsed =
    runSplits.reduce((a, s) => a + timeStringToSeconds(s.time), 0) +
    stationSplits.reduce((a, s) => a + timeStringToSeconds(s.time), 0);

  const avgRunSec =
    runSplits.reduce((a, s) => a + timeStringToSeconds(s.time), 0) / runsDone;
  const avgStationSec = stationsDone
    ? stationSplits.reduce((a, s) => a + timeStringToSeconds(s.time), 0) /
      stationsDone
    : 180;

  const remainingRuns = Math.max(0, 8 - runsDone);
  const remainingStations = Math.max(0, 8 - stationsDone);
  const remaining = remainingRuns * avgRunSec + remainingStations * avgStationSec;
  const projection = elapsed + remaining;
  if (!isFinite(projection) || projection <= 0) {
    return { label: "—", hint: "Insufficient data" };
  }
  return {
    label: secondsToTimeString(projection),
    hint: `${stationsDone}/8 stations done`,
  };
}

function formatRelativeSeconds(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "just now";
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  return `${m}m ago`;
}
