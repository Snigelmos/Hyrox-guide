import { useState } from "react";

type Gender = "men" | "women";

interface StationResult {
  name: string;
  time: number;
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.round(totalSeconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTimeHM(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.round((totalSeconds % 3600) / 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

function getLevel(totalSeconds: number, gender: Gender): { label: string; color: string } {
  const mins = totalSeconds / 60;
  if (gender === "men") {
    if (mins < 65) return { label: "Elite", color: "#10b981" };
    if (mins < 85) return { label: "Competitive", color: "#38bdf8" };
    if (mins < 100) return { label: "Average", color: "#f59e0b" };
    return { label: "Beginner", color: "#f87171" };
  }
  if (mins < 75) return { label: "Elite", color: "#10b981" };
  if (mins < 95) return { label: "Competitive", color: "#38bdf8" };
  if (mins < 110) return { label: "Average", color: "#f59e0b" };
  return { label: "Beginner", color: "#f87171" };
}

function calculate(
  gender: Gender,
  fiveKmMinutes: number,
  fiveKmSeconds: number,
  benchKg: number,
  deadliftKg: number,
) {
  const fiveKmTotal = fiveKmMinutes * 60 + fiveKmSeconds;
  const pacePerKm = fiveKmTotal / 5;

  // Upper-body bench strength affects SkiErg, wall balls, farmers carry
  // Lower-body deadlift strength affects sled, lunges, burpees
  // Normalise: male open bench 80kg avg, deadlift 120kg avg; women 50/70
  const benchNorm = gender === "men" ? benchKg / 80 : benchKg / 50;
  const deadliftNorm = gender === "men" ? deadliftKg / 120 : deadliftKg / 70;

  // Strength factor 0.75 (very strong) → 1.30 (weak)
  const upperFactor = Math.max(0.75, Math.min(1.30, 1.5 - benchNorm * 0.5));
  const lowerFactor = Math.max(0.75, Math.min(1.30, 1.5 - deadliftNorm * 0.5));
  const combinedFactor = (upperFactor + lowerFactor) / 2;

  // Fatigue on run pace: stronger athletes fatigue less
  const fatigueFactor = combinedFactor < 0.90 ? 1.10 : combinedFactor < 1.05 ? 1.18 : 1.26;
  const runTimePerKm = pacePerKm * fatigueFactor;
  const totalRunning = runTimePerKm * 8;

  const genderBase = gender === "men" ? 1.0 : 1.12;

  const stations: StationResult[] = [
    { name: "SkiErg",            time: 240 * genderBase * upperFactor },
    { name: "Sled Push",         time: 120 * genderBase * lowerFactor },
    { name: "Sled Pull",         time: 120 * genderBase * upperFactor },
    { name: "Burpee Broad Jumps",time: 240 * genderBase * lowerFactor },
    { name: "Rowing",            time: 225 * genderBase * combinedFactor },
    { name: "Farmers Carry",     time: 150 * genderBase * upperFactor },
    { name: "Sandbag Lunges",    time: 240 * genderBase * lowerFactor },
    { name: "Wall Balls",        time: 240 * genderBase * upperFactor },
  ].map(s => ({ ...s, time: Math.max(s.time, s.time * 0.55) }));

  const totalStations = stations.reduce((sum, s) => sum + s.time, 0);
  const transitions = combinedFactor < 0.90 ? 180 : combinedFactor < 1.05 ? 360 : 600;
  const total = totalRunning + totalStations + transitions;

  return { totalRunning, totalStations, transitions, total, stations, runTimePerKm };
}

export default function HyroxCalculator() {
  const [gender, setGender] = useState<Gender>("men");
  const [fiveKmMin, setFiveKmMin] = useState("25");
  const [fiveKmSec, setFiveKmSec] = useState("0");
  const [benchKg, setBenchKg] = useState("80");
  const [deadliftKg, setDeadliftKg] = useState("120");

  const parsedMin = Math.max(0, parseInt(fiveKmMin, 10) || 0);
  const parsedSec = Math.max(0, Math.min(59, parseInt(fiveKmSec, 10) || 0));
  const parsedBench = Math.max(1, parseInt(benchKg, 10) || 1);
  const parsedDeadlift = Math.max(1, parseInt(deadliftKg, 10) || 1);

  const result = calculate(gender, parsedMin, parsedSec, parsedBench, parsedDeadlift);
  const level = getLevel(result.total, gender);

  const s = {
    card: "bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6",
    label: "block text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2",
    input: "w-full bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#38bdf8] min-h-[44px]",
    btnActive: "bg-[#38bdf8] text-[#09090b] font-bold",
    btnInactive: "bg-[#131316] border border-[#27272a] text-[#a1a1aa] hover:border-[#38bdf8]/40 hover:text-[#e4e4e7]",
    btn: "px-4 py-2.5 rounded-lg text-sm transition-all min-h-[44px] cursor-pointer w-full",
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── INPUTS ── */}
        <div className={s.card}>
          <h3 className="text-lg font-bold text-[#f4f4f5]">Your Fitness Profile</h3>

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
            <div className="flex justify-between text-xs text-[#52525b] mt-1">
              <span>Beginner ~40 kg</span>
              <span>Average ~80 kg</span>
              <span>Strong ~120 kg+</span>
            </div>
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
            <div className="flex justify-between text-xs text-[#52525b] mt-1">
              <span>Beginner ~60 kg</span>
              <span>Average ~120 kg</span>
              <span>Strong ~180 kg+</span>
            </div>
          </div>
        </div>

        {/* ── RESULTS ── */}
        <div className="bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-[#f4f4f5] mb-6">Predicted Race Time</h3>

          <div className="text-center mb-8">
            <div className="text-5xl md:text-6xl font-black font-mono" style={{ color: level.color }}>
              {formatTimeHM(result.total)}
            </div>
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

          {/* Per-station breakdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#52525b] px-1 mb-1">
              <span>Station</span><span>Est. Time</span>
            </div>
            <div className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2">
              <span className="text-[#e4e4e7]">8 × 1 km Run</span>
              <span className="font-mono font-semibold text-[#38bdf8]">{formatTime(result.totalRunning)}</span>
            </div>
            {result.stations.map(s => (
              <div key={s.name} className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2">
                <span className="text-[#e4e4e7]">{s.name}</span>
                <span className="font-mono font-semibold text-[#38bdf8]">{formatTime(s.time)}</span>
              </div>
            ))}
          </div>

          {/* Improvement tips */}
          <div className="mt-5 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Key improvement areas</h4>
            <ul className="space-y-1.5 text-sm text-[#e4e4e7]">
              {parsedBench < 60 && (
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                  Improve upper body strength — bigger bench = faster SkiErg and carries
                </li>
              )}
              {parsedDeadlift < 80 && (
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                  Build lower body strength — sled and lunge times will drop significantly
                </li>
              )}
              {parsedMin >= 28 && (
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                  Improving your 5 km by 2 min saves ~4 min in race running splits
                </li>
              )}
              {parsedBench >= 80 && parsedDeadlift >= 120 && parsedMin < 28 && (
                <li className="flex items-start gap-2">
                  <span className="text-[#10b981] flex-shrink-0">▶</span>
                  Solid base — focus on race simulations and pacing strategy
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
