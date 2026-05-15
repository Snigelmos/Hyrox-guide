import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  secondsToTimeString,
  timeStringToSeconds,
  type LiveAthleteSnapshot,
  type LiveSplit,
} from "../lib/hyrox-live";
import { analyzeRace, entryKindLabel, type RaceAnalysis } from "../lib/race-analysis";

const POLL_INTERVAL_MS = 30_000;

interface Props {
  idp: string;
  event: string;
  /**
   * Fallback name shown in the header until the API responds. When the user
   * arrives via a share link we know the name from the URL but not the bib /
   * country / division until the first fetch lands.
   */
  athleteHint?: string;
  raceLabel?: string;
  /** Pre-built share URL. When provided, a Copy share link button appears. */
  shareUrl?: string;
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

// Approximate PRO-division segment durations in seconds. Used purely to
// give the race timeline strip realistic proportional widths before/while
// splits land. The visual is relative-only, so the exact numbers don't
// need to match every division.
const EXPECTED_RUN_SEC = 225; // ~3:45 / km PRO baseline
const EXPECTED_STATION_SEC = [240, 135, 210, 165, 255, 100, 180, 210];

export default function LiveAthleteDashboard({
  idp,
  event,
  athleteHint,
  raceLabel,
  shareUrl,
  onClose,
}: Props) {
  const [snapshot, setSnapshot] = useState<LiveAthleteSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [tick, setTick] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const fallbackUrl = `https://results.hyrox.com/season-9/?content=detail&pid=search&idp=${encodeURIComponent(idp)}&event=${encodeURIComponent(event)}&lang=EN_CAP`;
  const lastFetchRef = useRef<number>(0);
  const wasFinishedRef = useRef<boolean>(false);

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
      if (data.isFinished) {
        setIsPolling(false);
        if (!wasFinishedRef.current) {
          wasFinishedRef.current = true;
          setJustFinished(true);
          window.setTimeout(() => setJustFinished(false), 6000);
        }
      }
    } catch {
      setError("Couldn't reach the live tracker. Trying again shortly.");
    }
  }, [idp, event]);

  useEffect(() => {
    setSnapshot(null);
    setError(null);
    setIsPolling(true);
    wasFinishedRef.current = false;
    setJustFinished(false);
    void fetchSnapshot();
  }, [fetchSnapshot]);

  useEffect(() => {
    if (!isPolling) return;
    const id = window.setInterval(() => {
      void fetchSnapshot();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [isPolling, fetchSnapshot]);

  // Drive the live status row so its elapsed counter ticks every second.
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Update document.title so iMessage / WhatsApp / Slack share previews show
  // a meaningful label rather than the generic page title.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const previous = document.title;
    const name = snapshot?.athlete.name || athleteHint || "athlete";
    const race = snapshot?.athlete.race || raceLabel || "Hyrox";
    document.title = `Tracking ${name} · ${race} — HyroxVault`;
    return () => {
      document.title = previous;
    };
  }, [snapshot?.athlete.name, snapshot?.athlete.race, athleteHint, raceLabel]);

  const stationsByIndex = useMemo(() => {
    const m = new Map<number, LiveSplit>();
    for (const s of snapshot?.splits ?? []) {
      if (s.kind === "station") m.set(s.index, s);
    }
    return m;
  }, [snapshot]);

  const runsByIndex = useMemo(() => {
    const m = new Map<number, LiveSplit>();
    for (const s of snapshot?.splits ?? []) {
      if (s.kind === "run") m.set(s.index, s);
    }
    return m;
  }, [snapshot]);

  const stationsDone = stationsByIndex.size;
  const runsDone = runsByIndex.size;
  const lastRunIndex = runsDone;

  const elapsedSec = useMemo(() => {
    let total = 0;
    for (const r of runsByIndex.values()) total += timeStringToSeconds(r.time);
    for (const s of stationsByIndex.values()) total += timeStringToSeconds(s.time);
    return total;
  }, [runsByIndex, stationsByIndex]);

  const projection = useMemo(() => projectFinish(snapshot), [snapshot]);
  const raceAnalysis = useMemo(
    () => (snapshot ? analyzeRace(snapshot) : null),
    [snapshot],
  );
  const positionLabel = useMemo(() => describePosition(snapshot), [snapshot]);
  const status = useMemo(
    () =>
      describeLiveStatus(snapshot, runsDone, stationsDone, elapsedSec, projection),
    [snapshot, runsDone, stationsDone, elapsedSec, projection],
  );

  const lastUpdateLabel = lastFetchRef.current
    ? formatRelativeSeconds(
        Math.floor((Date.now() - lastFetchRef.current) / 1000),
      )
    : "—";
  // Reference `tick` so React re-renders the elapsed/relative labels.
  void tick;

  const isPreRace =
    snapshot != null && !snapshot.isFinished && snapshot.splits.length === 0;

  async function handleCopyShare() {
    if (!shareUrl) return;
    let copied = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      }
    } catch {
      /* fallthrough */
    }
    if (!copied) {
      try {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        copied = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        /* nothing */
      }
    }
    setShareCopied(copied);
    if (copied) {
      window.setTimeout(() => setShareCopied(false), 2000);
    }
  }

  const entryLabel = raceAnalysis ? entryKindLabel(raceAnalysis.entryKind) : "Entry";
  const headerName = snapshot?.athlete.name || athleteHint || "Loading…";
  const headerRace = snapshot?.athlete.race || raceLabel || "Hyrox";

  return (
    <div
      className={`bg-bg-card border border-border rounded-2xl overflow-hidden transition-shadow ${
        justFinished
          ? "shadow-[0_0_0_2px_rgba(251,191,36,0.55),0_0_60px_-10px_rgba(251,191,36,0.55)] motion-safe:animate-[finishPulse_1.6s_ease-out_2]"
          : ""
      }`}
    >
      <style>{finishPulseKeyframes}</style>

      <div
        className={`relative px-4 sm:px-5 md:px-6 py-4 md:py-5 border-b border-border bg-gradient-to-br ${
          snapshot?.isFinished
            ? "from-amber-500/10 via-bg-card to-bg-card"
            : "from-emerald-500/5 via-bg-card to-bg-card"
        }`}
      >
        {justFinished && <ConfettiBurst />}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  snapshot?.isFinished
                    ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    snapshot?.isFinished
                      ? "bg-amber-400"
                      : "bg-emerald-400 animate-pulse"
                  }`}
                />
                {snapshot?.isFinished ? "Finished" : isPreRace ? "Pre-race" : "Live"}
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
              {snapshot?.athlete.division && (
                <span className="hidden sm:inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {snapshot.athlete.division}
                </span>
              )}
              {raceAnalysis?.isTeamEntry && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                  {entryLabel}
                </span>
              )}
            </div>
            <h3
              className={`text-xl sm:text-2xl md:text-3xl font-black text-text-heading leading-tight break-words ${
                justFinished ? "motion-safe:animate-[finishGrow_1.6s_ease-out]" : ""
              }`}
            >
              {headerName}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-text-muted">
              {headerRace}
              {snapshot?.athlete.division && (
                <span className="sm:hidden">
                  {" · "}
                  <span className="font-bold text-text">{snapshot.athlete.division}</span>
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {shareUrl && (
              <button
                type="button"
                onClick={handleCopyShare}
                className={`inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full px-2.5 sm:px-3 py-1.5 transition-colors ${
                  shareCopied
                    ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                    : "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20"
                }`}
                title="Copy a tracker link to share with friends and family"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {shareCopied ? "Copied!" : "Share link"}
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text border border-border hover:border-accent/40 rounded-full px-3 py-1.5"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        {snapshot && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat
              label="Elapsed"
              value={
                snapshot.totalTime ?? (elapsedSec > 0 ? secondsToTimeString(elapsedSec) : "—")
              }
              hint={snapshot.isFinished ? "Final time" : "Splits so far"}
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

      <div className="px-4 sm:px-5 md:px-6 py-4 md:py-5 space-y-5">
        {/* Live status row */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
          <span
            className={`inline-flex items-center gap-2 font-medium ${
              snapshot?.isFinished ? "text-amber-300" : "text-text"
            }`}
          >
            {!snapshot?.isFinished && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            )}
            <span>{status}</span>
          </span>
          <span className="text-text-muted">
            {snapshot?.isFinished
              ? "Polling stopped"
              : `Refresh every 30s · last fetch ${lastUpdateLabel}`}
          </span>
        </div>

        {/* Pre-race banner */}
        {isPreRace && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl px-4 py-3 text-sm leading-relaxed">
            <strong className="block text-amber-300 mb-0.5">Race hasn't started yet.</strong>
            Bookmark this page (or share the link) — splits will appear here
            automatically the moment the start gun fires. The dashboard polls
            every 30 seconds.
          </div>
        )}

        {/* Race timeline strip */}
        {snapshot && !isPreRace && (
          <RaceTimeline
            stations={stationsByIndex}
            runs={runsByIndex}
            isFinished={Boolean(snapshot.isFinished)}
          />
        )}

        {/* Run splits */}
        <section>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Run splits
            </h4>
            <span className="text-[11px] text-text-muted">
              8 km running · pace per km
            </span>
          </div>
          <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((idx) => {
              const run = runsByIndex.get(idx);
              const stationDone = stationsByIndex.has(idx);
              const isCurrent =
                !snapshot?.isFinished &&
                !run &&
                stationsByIndex.has(idx - 1) === (idx > 1) &&
                idx === stationsDone + 1;
              const isComplete = !!run;
              return (
                <li
                  key={`run-${idx}`}
                  className={`relative rounded-xl border p-3 transition-colors ${
                    isComplete
                      ? "bg-bg border-accent/25"
                      : isCurrent
                        ? "bg-emerald-500/5 border-emerald-500/40"
                        : "bg-bg border-border"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                        isComplete
                          ? "bg-accent/15 border border-accent/30 text-accent"
                          : isCurrent
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-400"
                            : "bg-bg-card border border-border text-text-muted"
                      }`}
                    >
                      {idx}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Run {idx}
                    </span>
                    {isCurrent && (
                      <span className="ml-auto inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse mr-1" />
                        Now
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-base sm:text-lg md:text-xl font-black font-mono text-text-heading leading-none">
                    {run?.time ?? (isCurrent ? "·" : "—")}
                  </div>
                  <div className="mt-1 text-[10px] text-text-muted">
                    {run ? `${formatPaceFromSeconds(timeStringToSeconds(run.time))}/km` : isCurrent ? "On the floor" : stationDone ? "Done" : "Awaiting"}
                  </div>
                </li>
              );
            })}
          </ol>
          <RunPaceSparkline runs={runsByIndex} />
        </section>

        {/* Station splits */}
        <section>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Station splits
            </h4>
            <span className="text-[11px] text-text-muted">
              8 functional stations · transitions included
            </span>
          </div>
          <ol className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
              return (
                <li
                  key={stationName}
                  className={`relative rounded-xl border p-3 sm:p-3.5 transition-colors ${
                    isComplete
                      ? "bg-gradient-to-br from-accent/15 via-bg to-bg border-accent/30"
                      : isCurrent
                        ? "bg-emerald-500/5 border-emerald-500/40"
                        : "bg-bg border-border"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[10px] sm:text-[11px] font-black ${
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
                      <span className="ml-auto inline-flex items-center text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse mr-1" />
                        Now
                      </span>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-black font-mono text-text-heading leading-none">
                    {station?.time ?? (isCurrent ? "·" : "—")}
                  </div>
                  <div className="mt-1.5 text-[10px] text-text-muted">
                    {isComplete ? "Cleared" : isCurrent ? "Run in progress" : "Awaiting"}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {raceAnalysis && (
          <RaceAnalysisPanel analysis={raceAnalysis} />
        )}

        {error && (
          <div className="text-sm bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-border flex items-center gap-3 flex-wrap">
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-wider text-text-muted hover:text-accent transition-colors no-underline"
          >
            Open on Hyrox.com ↗
          </a>
          <span className="hidden sm:inline text-xs text-text-muted/60">
            · Splits sourced from results.hyrox.com (Mika timing)
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden ml-auto text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text border border-border rounded-full px-3 py-1.5"
            >
              Stop watching
            </button>
          )}
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
    <div className="bg-bg border border-border rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5">
      <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="text-sm sm:text-base md:text-lg font-black font-mono text-text-heading leading-tight truncate">
        {value}
      </div>
      {hint && (
        <div className="text-[10px] text-text-muted mt-0.5 leading-tight truncate">
          {hint}
        </div>
      )}
    </div>
  );
}

function RaceAnalysisPanel({ analysis }: { analysis: RaceAnalysis }) {
  const maxGap = Math.max(1, ...analysis.opportunities.map((o) => Math.max(0, o.gapSec)));
  return (
    <section className="bg-bg border border-border rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
            Biggest gaps & improvement opportunities
          </h4>
          <p className="mt-1 text-xs text-text-muted leading-relaxed">
            Based on finished splits, benchmarked against the closest {analysis.level} peer profile.
          </p>
        </div>
        <div className="text-right text-xs text-text-muted">
          <div>Runs {secondsToTimeString(analysis.totalRunSec)}</div>
          <div>Stations {secondsToTimeString(analysis.totalStationSec)}</div>
        </div>
      </div>

      {analysis.benchmarkNote && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 leading-relaxed">
          {analysis.benchmarkNote}
        </div>
      )}

      {analysis.runFadeSec != null && analysis.runFadeSec > 10 && (
        <div className="mb-4 rounded-xl border border-border bg-bg-card px-3 py-2 text-xs text-text-muted leading-relaxed">
          <span className="font-bold text-text-heading">Run fade:</span>{" "}
          final-half run pace averaged {secondsToTimeString(analysis.runFadeSec)} slower per km than the opening half.
        </div>
      )}

      {analysis.opportunities.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-300">
          No major leaks found against the selected benchmark. Protect the strengths and focus on race simulations.
        </div>
      ) : (
        <div className="space-y-3">
          {analysis.opportunities.map((item, idx) => {
            const width = `${Math.max(8, Math.round((Math.max(0, item.gapSec) / maxGap) * 100))}%`;
            return (
              <article key={item.slug} className="rounded-xl border border-border bg-bg-card p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                      {idx === 0 ? "Biggest leak" : `Opportunity #${idx + 1}`}
                    </div>
                    <div className="font-black text-text-heading">{item.label}</div>
                    <div className="text-[10px] text-text-muted">
                      result {item.actualLabel} · benchmark {item.benchmarkLabel}
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-rose-300">
                    {item.gapLabel}
                  </div>
                </div>
                <div className="h-2 rounded-full bg-bg border border-border overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-rose-400/80" style={{ width }} />
                </div>
                {item.topFixHint && (
                  <p className="text-xs text-text-muted leading-relaxed mb-2">
                    <span className="font-bold text-accent">Top fix:</span> {item.topFixHint}
                  </p>
                )}
                {item.playbookUrl && (
                  <a
                    href={item.playbookUrl}
                    className="inline-flex text-xs font-bold text-accent hover:underline no-underline"
                  >
                    Open station playbook →
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/**
 * 16 alternating run/station segments. Width is proportional to expected
 * duration (so e.g. SkiErg looks wider than Farmer's Carry). Completed
 * segments fill with the accent gradient; the current segment pulses.
 */
function RaceTimeline({
  stations,
  runs,
  isFinished,
}: {
  stations: Map<number, LiveSplit>;
  runs: Map<number, LiveSplit>;
  isFinished: boolean;
}) {
  const stationsDone = stations.size;
  const runsDone = runs.size;

  const segments: { kind: "run" | "station"; index: number; weight: number; time: string | null; place: number | null }[] = [];
  for (let i = 1; i <= 8; i++) {
    segments.push({
      kind: "run",
      index: i,
      weight: EXPECTED_RUN_SEC,
      time: runs.get(i)?.time ?? null,
      place: null,
    });
    segments.push({
      kind: "station",
      index: i,
      weight: EXPECTED_STATION_SEC[i - 1],
      time: stations.get(i)?.time ?? null,
      place: stations.get(i)?.place ?? null,
    });
  }
  const total = segments.reduce((a, s) => a + s.weight, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-muted">
        <span>Race timeline</span>
        <span>{Math.min(stationsDone, 8)} / 8 stations</span>
      </div>
      <div
        className="flex w-full h-3 rounded-full overflow-hidden bg-bg border border-border"
        role="progressbar"
        aria-label="Race progress"
        aria-valuenow={stationsDone}
        aria-valuemin={0}
        aria-valuemax={8}
      >
        {segments.map((seg, i) => {
          const widthPct = (seg.weight / total) * 100;
          const isComplete = seg.time != null;
          // Highlight as "current" the first incomplete segment if not finished.
          const isCurrent = !isFinished && !isComplete && segments.slice(0, i).every((s) => s.time != null);
          const tooltip = `${seg.kind === "run" ? `Run ${seg.index}` : STATION_NAMES[seg.index - 1]}${seg.time ? ` · ${seg.time}` : isCurrent ? " · in progress" : " · upcoming"}${seg.place ? ` · P${seg.place}` : ""}`;
          return (
            <div
              key={`${seg.kind}-${seg.index}`}
              title={tooltip}
              aria-label={tooltip}
              className={`h-full transition-colors ${
                isComplete
                  ? seg.kind === "station"
                    ? "bg-accent"
                    : "bg-accent/55"
                  : isCurrent
                    ? "bg-emerald-400 motion-safe:animate-pulse"
                    : seg.kind === "station"
                      ? "bg-bg-card"
                      : "bg-bg-card/60"
              }`}
              style={{ width: `${widthPct}%` }}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[10px] text-text-muted">
        <span>Run 1</span>
        <span className="hidden sm:inline">SkiErg → Sled → Burpee → Row → Carry → Lunges → Wall Balls</span>
        <span>Finish</span>
      </div>
    </div>
  );
}

function RunPaceSparkline({ runs }: { runs: Map<number, LiveSplit> }) {
  const points = useMemo(() => {
    const arr: { idx: number; pace: number }[] = [];
    for (let i = 1; i <= 8; i++) {
      const r = runs.get(i);
      if (!r) continue;
      const sec = timeStringToSeconds(r.time);
      if (sec > 0) arr.push({ idx: i, pace: sec });
    }
    return arr;
  }, [runs]);

  if (points.length < 2) return null;

  const W = 320;
  const H = 56;
  const PAD_X = 12;
  const PAD_Y = 8;
  const minPace = Math.min(...points.map((p) => p.pace));
  const maxPace = Math.max(...points.map((p) => p.pace));
  const range = Math.max(8, maxPace - minPace);

  const xFor = (idx: number) =>
    PAD_X + ((idx - 1) / 7) * (W - PAD_X * 2);
  const yFor = (pace: number) =>
    PAD_Y + ((pace - minPace) / range) * (H - PAD_Y * 2);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${xFor(p.idx).toFixed(1)} ${yFor(p.pace).toFixed(1)}`)
    .join(" ");

  const last = points[points.length - 1];

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
        <span>Run pace 1 → 8</span>
        <span>
          fastest {formatPaceFromSeconds(minPace)} · slowest {formatPaceFromSeconds(maxPace)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-14 bg-bg border border-border rounded-lg"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Faint grid line at midpoint */}
        <line
          x1={PAD_X}
          y1={H / 2}
          x2={W - PAD_X}
          y2={H / 2}
          className="stroke-border"
          strokeWidth={0.5}
          strokeDasharray="2 3"
        />
        {/* Filled area under the line */}
        <path
          d={`${path} L${xFor(last.idx).toFixed(1)} ${H - PAD_Y} L${xFor(points[0].idx).toFixed(1)} ${H - PAD_Y} Z`}
          className="fill-accent/15"
        />
        {/* The pace line */}
        <path
          d={path}
          className="stroke-accent"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <circle
            key={p.idx}
            cx={xFor(p.idx)}
            cy={yFor(p.pace)}
            r={p.idx === last.idx ? 3 : 2}
            className={
              p.idx === last.idx ? "fill-accent" : "fill-accent/70"
            }
          />
        ))}
        {/* Glowing halo on last point */}
        <circle
          cx={xFor(last.idx)}
          cy={yFor(last.pace)}
          r={6}
          className="fill-accent/30 motion-safe:animate-ping"
        />
      </svg>
    </div>
  );
}

function ConfettiBurst() {
  // CSS-only confetti. 18 small absolutely positioned squares fly outward
  // from the header center. Respects prefers-reduced-motion via the inline
  // motion-safe variant on the keyframe animation.
  const pieces = Array.from({ length: 18 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      <style>{confettiKeyframes}</style>
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const distance = 60 + (i % 3) * 30;
        const dx = Math.cos((angle * Math.PI) / 180) * distance;
        const dy = Math.sin((angle * Math.PI) / 180) * distance;
        const colors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];
        const color = colors[i % colors.length];
        const delay = (i % 6) * 60;
        return (
          <span
            key={i}
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 w-1.5 h-2 rounded-sm"
            style={{
              backgroundColor: color,
              animation: `confettiFly 1400ms ease-out ${delay}ms forwards`,
              ["--dx" as never]: `${dx.toFixed(0)}px`,
              ["--dy" as never]: `${dy.toFixed(0)}px`,
            }}
          />
        );
      })}
    </div>
  );
}

const confettiKeyframes = `
@keyframes confettiFly {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(0.7);
    opacity: 1;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(540deg) scale(1);
    opacity: 0;
  }
}
`;

const finishPulseKeyframes = `
@keyframes finishPulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(251,191,36,0.0), 0 0 60px -10px rgba(251,191,36,0.0); }
  40% { box-shadow: 0 0 0 2px rgba(251,191,36,0.85), 0 0 80px -10px rgba(251,191,36,0.7); }
}
@keyframes finishGrow {
  0% { transform: scale(1); }
  30% { transform: scale(1.06); }
  100% { transform: scale(1); }
}
`;

function describePosition(snapshot: LiveAthleteSnapshot | null): string {
  if (!snapshot) return "—";
  if (snapshot.isFinished) return "Done";
  const stations = snapshot.splits.filter((s) => s.kind === "station").length;
  const runs = snapshot.splits.filter((s) => s.kind === "run").length;
  if (stations === 0 && runs === 0) return "Pre-race";
  if (runs > stations) return `On run ${runs}, station ${runs} next`;
  return `Cleared station ${stations}`;
}

function describeLiveStatus(
  snapshot: LiveAthleteSnapshot | null,
  runsDone: number,
  stationsDone: number,
  elapsedSec: number,
  projection: { label: string; hint: string },
): string {
  if (!snapshot) return "Loading splits…";
  if (snapshot.isFinished) {
    return `Finished in ${snapshot.totalTime ?? secondsToTimeString(elapsedSec)}.`;
  }
  if (runsDone === 0 && stationsDone === 0) {
    return "Pre-race · waiting for the start gun.";
  }
  const elapsedLabel = secondsToTimeString(elapsedSec);
  if (runsDone > stationsDone) {
    const nextStation = STATION_NAMES[runsDone - 1] ?? `Station ${runsDone}`;
    return `On Run ${runsDone} → ${nextStation} next · elapsed ${elapsedLabel}${projection.label !== "—" ? ` · projected ${projection.label}` : ""}`;
  }
  const nextRun = stationsDone + 1;
  return `Cleared Station ${stationsDone} → Run ${nextRun} next · elapsed ${elapsedLabel}${projection.label !== "—" ? ` · projected ${projection.label}` : ""}`;
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

function formatPaceFromSeconds(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatRelativeSeconds(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "just now";
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  return `${m}m ago`;
}
