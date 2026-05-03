import { useMemo, useState } from "react";
import { getBenchmarkValue } from "../data/station-benchmarks";
import { getPlaybook } from "../data/station-playbooks";
import { ALL_GOAL_TIME_CONFIGS, type GoalTimeConfig } from "../data/calculator-goals";
import { TRAINING_PLANS } from "../data/training-plans";
import {
  calculate,
  getLevel,
  divisionGenderToken,
  formatTime,
  formatTimeHM,
  encodeShareParams,
  STATION_NAMES,
  STATION_SLUGS,
  type Gender,
  type Division,
} from "../lib/hyroxEngine";

function formatGap(seconds: number): string {
  const sign = seconds >= 0 ? "+" : "−";
  const abs = Math.abs(seconds);
  if (abs < 60) return `${sign}${Math.round(abs)}s`;
  const m = Math.floor(abs / 60);
  const s = Math.round(abs % 60);
  return `${sign}${m}:${s.toString().padStart(2, "0")}`;
}

/** Parse "5:30" / "5:30.5" / "330" (raw seconds) → seconds, or null. */
function parseTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2) return null;
    const m = parseInt(parts[0], 10);
    const s = parseFloat(parts[1]);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    return m * 60 + s;
  }
  const n = parseFloat(trimmed);
  if (isNaN(n) || n < 0) return null;
  return n;
}

interface DiagnosisGap {
  slug: string;
  name: string;
  actualSec: number;
  benchmarkSec: number;
  gapSec: number;
  unitLabel: string;
}

/** Find the goal config closest to a predicted finish time for the given audience. */
function findNearestGoalConfig(
  totalSeconds: number,
  gender: Gender,
  division: Division,
): GoalTimeConfig | undefined {
  const audience = division === "pro"
    ? (gender === "men" ? "pro-men" : "pro-women")
    : (gender === "men" ? "open-men" : "open-women");
  const candidates = ALL_GOAL_TIME_CONFIGS.filter((c) => c.audience === audience);
  if (candidates.length === 0) return undefined;
  // Return the config whose goalSeconds is the smallest step above the predicted time
  // (i.e. the goal you're chasing). Fall back to the fastest if already under everything.
  const above = candidates
    .filter((c) => c.goalSeconds >= totalSeconds)
    .sort((a, b) => a.goalSeconds - b.goalSeconds);
  return above[0] ?? candidates.sort((a, b) => a.goalSeconds - b.goalSeconds)[0];
}

export default function HyroxCalculator() {
  const [gender, setGender]         = useState<Gender>("men");
  const [division, setDivision]     = useState<Division>("open");
  const [fiveKmMin, setFiveKmMin]   = useState("25");
  const [fiveKmSec, setFiveKmSec]   = useState("0");
  const [benchKg, setBenchKg]       = useState("80");
  const [deadliftKg, setDeadliftKg] = useState("120");
  const [bodyweightKg, setBodyweightKg] = useState("80");

  const [trainerOpen, setTrainerOpen] = useState(false);
  const [stationInputs, setStationInputs] = useState<Record<string, string>>(
    Object.fromEntries(STATION_SLUGS.map((sl) => [sl, ""])),
  );

  const parsedMin      = Math.max(0, parseInt(fiveKmMin, 10) || 0);
  const parsedSec      = Math.max(0, Math.min(59, parseInt(fiveKmSec, 10) || 0));
  const parsedBench    = Math.max(1, parseInt(benchKg, 10) || 1);
  const parsedDeadlift = Math.max(1, parseInt(deadliftKg, 10) || 1);
  const parsedBw       = Math.max(35, parseInt(bodyweightKg, 10) || 80);

  const result = useMemo(
    () => calculate({
      gender,
      division,
      fiveKmMinutes: parsedMin,
      fiveKmSeconds: parsedSec,
      benchKg: parsedBench,
      deadliftKg: parsedDeadlift,
      bodyweightKg: parsedBw,
    }),
    [gender, division, parsedMin, parsedSec, parsedBench, parsedDeadlift, parsedBw],
  );
  const level         = getLevel(result.total, gender, division);
  const divisionLabel = `${division === "pro" ? "Pro" : "Open"} ${gender === "men" ? "Men" : "Women"}`;
  const divGen        = divisionGenderToken(gender, division);

  const parsedStationTimes = useMemo(() => {
    const out: Record<string, number | null> = {};
    for (const slug of STATION_SLUGS) {
      out[slug] = parseTimeInput(stationInputs[slug] ?? "");
    }
    return out;
  }, [stationInputs]);

  const filledStationCount = STATION_SLUGS.filter((sl) => parsedStationTimes[sl] != null).length;

  const diagnosis = useMemo<DiagnosisGap[]>(() => {
    if (filledStationCount === 0) return [];
    const gaps: DiagnosisGap[] = [];

    STATION_SLUGS.forEach((slug, i) => {
      const actual = parsedStationTimes[slug];
      if (actual == null) return;
      const bench = getBenchmarkValue(slug, divGen, level.token);
      if (bench == null) return;
      gaps.push({
        slug,
        name: STATION_NAMES[i],
        actualSec: actual,
        benchmarkSec: bench,
        gapSec: actual - bench,
        unitLabel: "",
      });
    });

    const runBench = getBenchmarkValue("running", divGen, level.token);
    if (runBench != null) {
      gaps.push({
        slug: "running",
        name: "Running",
        actualSec: result.runTimePerKm,
        benchmarkSec: runBench,
        gapSec: result.runTimePerKm - runBench,
        unitLabel: "/km",
      });
    }
    return gaps;
  }, [parsedStationTimes, divGen, level.token, result.runTimePerKm, filledStationCount]);

  const weakest = useMemo(
    () => diagnosis.filter((g) => g.gapSec > 0).sort((a, b) => b.gapSec - a.gapSec).slice(0, 3),
    [diagnosis],
  );

  const strongest = useMemo(
    () => diagnosis.filter((g) => g.gapSec <= 0).sort((a, b) => a.gapSec - b.gapSec).slice(0, 2),
    [diagnosis],
  );

  const nearestGoal = useMemo(
    () => findNearestGoalConfig(result.total, gender, division),
    [result.total, gender, division],
  );

  const matchingPlan = useMemo(
    () => nearestGoal
      ? TRAINING_PLANS.find((p) => p.relatedCalculatorSlug === nearestGoal.slug)
      : undefined,
    [nearestGoal],
  );

  const shareUrl = useMemo(() => {
    const params = encodeShareParams({
      gender,
      division,
      fiveKmMinutes: parsedMin,
      fiveKmSeconds: parsedSec,
      benchKg: parsedBench,
      deadliftKg: parsedDeadlift,
      bodyweightKg: parsedBw,
    });
    if (typeof window === "undefined") return `/calculator/share/?${params}`;
    return `${window.location.origin}/calculator/share/?${params}`;
  }, [gender, division, parsedMin, parsedSec, parsedBench, parsedDeadlift, parsedBw]);

  const shareText = useMemo(
    () =>
      `Predicted Hyrox finish time: ${formatTimeHM(result.total)} (${divisionLabel}). What's your prediction?`,
    [result.total, divisionLabel],
  );

  const [copied, setCopied] = useState(false);
  function copyShareLink() {
    if (typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  }

  const s = {
    card:        "bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6",
    label:       "block text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2",
    input:       "w-full bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#38bdf8] min-h-[44px]",
    btnActive:   "bg-[#38bdf8] text-[#09090b] font-bold",
    btnInactive: "bg-[#131316] border border-[#27272a] text-[#a1a1aa] hover:border-[#38bdf8]/40 hover:text-[#e4e4e7]",
    btn:         "px-4 py-2.5 rounded-lg text-sm transition-all min-h-[44px] cursor-pointer w-full",
  };

  function setStationInput(slug: string, val: string) {
    setStationInputs((prev) => ({ ...prev, [slug]: val }));
  }
  function clearStationInputs() {
    setStationInputs(Object.fromEntries(STATION_SLUGS.map((sl) => [sl, ""])));
  }

  return (
    <div className="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── INPUTS ── */}
        <div className={s.card}>
          <h3 className="text-lg font-bold text-[#f4f4f5]">Your Stats</h3>

          {/* Gender */}
          <div>
            <label className={s.label}>Gender</label>
            <div className="grid grid-cols-2 gap-2">
              {(["men", "women"] as Gender[]).map(v => (
                <button
                  key={v}
                  type="button"
                  className={`${s.btn} ${gender === v ? s.btnActive : s.btnInactive}`}
                  onClick={() => setGender(v)}
                >
                  {v === "men" ? "Men" : "Women"}
                </button>
              ))}
            </div>
          </div>

          {/* Division */}
          <div>
            <label className={s.label}>Division</label>
            <div className="grid grid-cols-2 gap-2">
              {(["open", "pro"] as Division[]).map(v => (
                <button
                  key={v}
                  type="button"
                  className={`${s.btn} ${division === v ? s.btnActive : s.btnInactive}`}
                  onClick={() => setDivision(v)}
                >
                  {v === "open" ? "Open" : "Pro"}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#52525b] mt-2">
              {division === "open"
                ? "Open — standard weights (sled 152 kg, sandbag 20 kg, wall balls 6 kg)"
                : "Pro — heavier loads (sled 202 kg, sandbag 30 kg, wall balls 9 kg)"}
            </p>
          </div>

          {/* 5km run time */}
          <div>
            <label className={s.label}>5 km Run Time</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number" min={15} max={55}
                  value={fiveKmMin}
                  onChange={e => setFiveKmMin(e.target.value)}
                  className={s.input}
                />
                <span className="text-xs text-[#a1a1aa] mt-1 block">Minutes</span>
              </div>
              <div>
                <input
                  type="number" min={0} max={59}
                  value={fiveKmSec}
                  onChange={e => setFiveKmSec(e.target.value)}
                  className={s.input}
                />
                <span className="text-xs text-[#a1a1aa] mt-1 block">Seconds</span>
              </div>
            </div>
          </div>

          {/* Bodyweight */}
          <div>
            <label className={s.label}>
              Bodyweight (kg)
              <span className="ml-2 normal-case font-normal text-[#52525b]">— scales strength, running cost & sled advantage</span>
            </label>
            <input
              type="number" min={35} max={180}
              value={bodyweightKg}
              onChange={e => setBodyweightKg(e.target.value)}
              className={s.input}
            />
            <div className="flex justify-between text-xs text-[#52525b] mt-1">
              <span>{gender === "men" ? "Light ~70 kg" : "Light ~55 kg"}</span>
              <span>{gender === "men" ? "Average ~80 kg" : "Average ~65 kg"}</span>
              <span>{gender === "men" ? "Heavy ~95 kg+" : "Heavy ~75 kg+"}</span>
            </div>
          </div>

          {/* Bench press */}
          <div>
            <label className={s.label}>
              Max Bench Press (kg)
              <span className="ml-2 normal-case font-normal text-[#52525b]">— affects SkiErg, carries, wall balls</span>
            </label>
            <input
              type="number" min={20} max={250}
              value={benchKg}
              onChange={e => setBenchKg(e.target.value)}
              className={s.input}
            />
          </div>

          {/* Deadlift */}
          <div>
            <label className={s.label}>
              Max Deadlift (kg)
              <span className="ml-2 normal-case font-normal text-[#52525b]">— affects sled, lunges, burpees</span>
            </label>
            <input
              type="number" min={20} max={350}
              value={deadliftKg}
              onChange={e => setDeadliftKg(e.target.value)}
              className={s.input}
            />
          </div>

          {/* ── Trainer panel — optional station times ── */}
          <div className="border-t border-[#27272a] pt-5">
            <button
              type="button"
              onClick={() => setTrainerOpen(o => !o)}
              aria-expanded={trainerOpen}
              className={`w-full flex items-center justify-between gap-3 text-left rounded-xl border px-4 py-3 transition-all cursor-pointer min-h-[64px] ${
                trainerOpen
                  ? "bg-[#0c1a25] border-[#38bdf8]/40"
                  : "bg-[#0a1620] border-[#38bdf8]/30 hover:border-[#38bdf8]/60 hover:bg-[#0c1a25]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#38bdf8]/15 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] text-lg font-bold"
                  aria-hidden="true"
                >
                  +
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#f4f4f5]">
                    {trainerOpen ? "Hide station times" : "Add your real station times"}
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#38bdf8]/15 text-[#38bdf8] align-middle">
                      Optional
                    </span>
                  </div>
                  <div className="text-xs text-[#a1a1aa] mt-0.5">
                    Tap to expand — diagnose your weakest stations against peer benchmarks.
                  </div>
                </div>
              </div>
              <span
                className={`text-[#38bdf8] text-xl transition-transform flex-shrink-0 ${trainerOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >▾</span>
            </button>

            {trainerOpen && (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Enter mm:ss for any stations you have real times for. The more you fill, the more confident the diagnosis. Leave blank to skip.
                </p>
                {STATION_SLUGS.map((slug, i) => (
                  <div key={slug} className="grid grid-cols-[1fr_120px] gap-3 items-center">
                    <label className="text-sm text-[#e4e4e7]" htmlFor={`station-${slug}`}>
                      {STATION_NAMES[i]}
                    </label>
                    <input
                      id={`station-${slug}`}
                      type="text"
                      placeholder="mm:ss"
                      inputMode="numeric"
                      value={stationInputs[slug]}
                      onChange={e => setStationInput(slug, e.target.value)}
                      className={s.input}
                      style={{ padding: "8px 12px", minHeight: "40px" }}
                    />
                  </div>
                ))}
                {filledStationCount > 0 && (
                  <button
                    type="button"
                    onClick={clearStationInputs}
                    className="text-xs text-[#a1a1aa] hover:text-[#38bdf8] transition-colors mt-2"
                  >Clear all</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className="bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-[#f4f4f5] mb-6">Predicted Race Time</h3>

          <div className="text-center mb-8">
            <div className="text-5xl md:text-6xl font-black font-mono" style={{ color: level.color }}>
              {formatTimeHM(result.total)}
            </div>
            <div className="mt-1 text-xs text-[#52525b] font-medium">{divisionLabel}</div>
            <div
              className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: level.color + "18", color: level.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }} />
              {level.label} Level
            </div>
          </div>

          {/* Split summary */}
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            {[
              { label: "Running", val: result.totalRunning },
              { label: "Stations", val: result.totalStations },
              { label: "Transitions", val: result.transitions },
            ].map(({ label, val }) => (
              <div key={label} className="bg-[#09090b] rounded-xl p-3">
                <div className="text-base font-bold text-[#f4f4f5] font-mono">{formatTime(val)}</div>
                <div className="text-xs text-[#a1a1aa]">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Matched goal guide ── */}
          {nearestGoal && (
            <div className="mb-6 bg-[#0c1a25] border border-[#38bdf8]/30 rounded-xl p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] mb-1">Your next target</div>
              <div className="text-sm font-black text-[#f4f4f5] mb-1">
                {nearestGoal.goalShort} Hyrox
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">
                {nearestGoal.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`/calculator/${nearestGoal.slug}/`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#38bdf8] hover:text-[#0ea5e9] transition-colors no-underline bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-3 py-1.5 rounded-lg"
                >
                  See {nearestGoal.goalShort} splits →
                </a>
                {matchingPlan && (
                  <a
                    href={`/training-plans/${matchingPlan.slug}/`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors no-underline border border-[#27272a] px-3 py-1.5 rounded-lg"
                  >
                    {matchingPlan.durationWeeks}-week training plan →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── Share row ── */}
          <div className="mb-6 bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#a1a1aa]">Share your prediction</div>
                <div className="text-xs text-[#52525b]">A clean result page opens at /calculator/share/</div>
              </div>
              <button
                type="button"
                onClick={copyShareLink}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#38bdf8] hover:text-[#0ea5e9] transition-colors bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-3 py-1.5 rounded-lg"
              >
                {copied ? "Link copied" : "Copy link"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://twitter.com/intent/tweet?${new URLSearchParams({ text: shareText, url: shareUrl }).toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors no-underline border border-[#27272a] px-3 py-1.5 rounded-lg"
              >Share on X</a>
              <a
                href={`https://reddit.com/submit?${new URLSearchParams({ url: shareUrl, title: shareText }).toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors no-underline border border-[#27272a] px-3 py-1.5 rounded-lg"
              >Share on Reddit</a>
              <a
                href={`https://api.whatsapp.com/send?${new URLSearchParams({ text: `${shareText} ${shareUrl}` }).toString()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors no-underline border border-[#27272a] px-3 py-1.5 rounded-lg"
              >Send on WhatsApp</a>
            </div>
          </div>

          {/* Per-station breakdown */}
          <div className="space-y-1.5">            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#52525b] px-1 mb-1">
              <span>Station</span><span>Est. Time</span>
            </div>
            <div className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2">
              <span className="text-[#e4e4e7]">8 × 1 km Run</span>
              <span className="font-mono font-semibold text-[#38bdf8]">{formatTime(result.totalRunning)}</span>
            </div>
            {result.stations.map(st => (
              <div key={st.name} className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2">
                <span className="text-[#e4e4e7]">{st.name}</span>
                <span className="font-mono font-semibold text-[#38bdf8]">{formatTime(st.time)}</span>
              </div>
            ))}
          </div>

          {/* ── Diagnosis: shown only when ≥1 station time entered ── */}
          {filledStationCount > 0 && (
            <div className="mt-6 border-t border-[#27272a] pt-6">
              <div className="flex items-baseline justify-between mb-1">
                <h4 className="text-base font-black text-[#f4f4f5]">Trainer diagnosis</h4>
                <span className="text-xs text-[#52525b]">vs {level.label} {divisionLabel}</span>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed mb-4">
                Compared to peer benchmarks for athletes finishing at your level, here's where the biggest time savings are.
              </p>

              {weakest.length === 0 ? (
                <div className="bg-[#09090b] border border-[#10b981]/30 rounded-xl p-4">
                  <div className="text-sm text-[#10b981] font-bold mb-1">No weak stations found.</div>
                  <div className="text-xs text-[#a1a1aa]">
                    Every station you entered is at or ahead of your peer benchmark. Focus on race simulations and pacing.
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {weakest.map((g, idx) => {
                    const playbook = getPlaybook(g.slug);
                    const recommendedPlanSlug = playbook?.recommendedPlanSlugs[0];
                    return (
                      <div key={g.slug} className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#f87171] mb-0.5">
                              {idx === 0 ? "Biggest leak" : `Weak link #${idx + 1}`}
                            </div>
                            <div className="text-sm font-black text-[#f4f4f5]">{g.name}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-mono font-bold text-[#f87171]">
                              {formatGap(g.gapSec)}{g.unitLabel}
                            </div>
                            <div className="text-[10px] text-[#52525b]">
                              you {formatTime(g.actualSec)}{g.unitLabel} · target {formatTime(g.benchmarkSec)}{g.unitLabel}
                            </div>
                          </div>
                        </div>
                        {playbook && (
                          <div className="text-xs text-[#a1a1aa] leading-relaxed mb-3">
                            <span className="text-[#38bdf8] font-bold">Top fix: </span>{playbook.topFixHint}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={`/training/stations/${g.slug}/`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#38bdf8] hover:text-[#0ea5e9] transition-colors no-underline bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-3 py-1.5 rounded-lg"
                          >Open playbook →</a>
                          {recommendedPlanSlug && (
                            <a
                              href={`/training-plans/${recommendedPlanSlug}/`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors no-underline border border-[#27272a] px-3 py-1.5 rounded-lg"
                            >Get the plan</a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {strongest.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#27272a]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#10b981] mb-2">Strengths to protect</div>
                  <div className="text-xs text-[#a1a1aa] leading-relaxed">
                    You're ahead of peers on{" "}
                    {strongest.map((str, i) => (
                      <span key={str.slug}>
                        <span className="text-[#10b981] font-bold">{str.name}</span>
                        {i < strongest.length - 1 ? " and " : ""}
                      </span>
                    ))}. Don't neglect these — maintenance volume is enough.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generic improvement tips (only when no diagnosis yet) */}
          {filledStationCount === 0 && (
            <div className="mt-5 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Key improvement areas</h4>
              <ul className="space-y-1.5 text-sm text-[#e4e4e7]">
                {parsedBench / parsedBw < 0.6 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                    Improve upper body strength — bigger bench-to-bodyweight ratio = faster SkiErg and carries
                  </li>
                )}
                {parsedDeadlift / parsedBw < 1.0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                    Build lower body strength — sled and lunge times will drop significantly
                  </li>
                )}
                {parsedMin >= 28 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                    Improving your 5 km by 2 min saves ~4 min across the 8 running laps
                  </li>
                )}
                {division === "pro" && parsedBench / parsedBw < 1.0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                    Pro carries & wall balls demand strong upper body — target a 1.0×bw bench
                  </li>
                )}
                {division === "pro" && parsedDeadlift / parsedBw < 1.5 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                    Pro sled punishes weak legs — build toward a 1.75×bw deadlift
                  </li>
                )}
                {parsedBench / parsedBw >= 1.0 && parsedDeadlift / parsedBw >= 1.5 && parsedMin < 26 && (
                  <li className="flex items-start gap-2">
                    <span className="text-[#10b981] flex-shrink-0">▶</span>
                    Solid base — open the trainer panel above and enter station times to find your weak link
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
