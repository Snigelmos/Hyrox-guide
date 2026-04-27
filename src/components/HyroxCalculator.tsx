import { useState } from "react";

type Gender = "men" | "women";
type Division = "open" | "pro";

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

// Thresholds derived from 2026 aggregated race data.
// Open: median finish ~1:31 men, ~1:42 women.
// Pro: median finish ~1:18 men, ~1:27 women.
function getLevel(
  totalSeconds: number,
  gender: Gender,
  division: Division,
): { label: string; color: string } {
  const mins = totalSeconds / 60;
  if (division === "pro") {
    if (gender === "men") {
      if (mins < 65) return { label: "Elite", color: "#10b981" };
      if (mins < 80) return { label: "Competitive", color: "#38bdf8" };
      if (mins < 100) return { label: "Average", color: "#f59e0b" };
      return { label: "Beginner", color: "#f87171" };
    }
    if (mins < 75) return { label: "Elite", color: "#10b981" };
    if (mins < 90) return { label: "Competitive", color: "#38bdf8" };
    if (mins < 110) return { label: "Average", color: "#f59e0b" };
    return { label: "Beginner", color: "#f87171" };
  }
  // Open
  if (gender === "men") {
    if (mins < 70) return { label: "Elite", color: "#10b981" };
    if (mins < 90) return { label: "Competitive", color: "#38bdf8" };
    if (mins < 110) return { label: "Average", color: "#f59e0b" };
    return { label: "Beginner", color: "#f87171" };
  }
  if (mins < 80) return { label: "Elite", color: "#10b981" };
  if (mins < 100) return { label: "Competitive", color: "#38bdf8" };
  if (mins < 120) return { label: "Average", color: "#f59e0b" };
  return { label: "Beginner", color: "#f87171" };
}

// Base station times in seconds, derived from 2026 aggregated race averages
// (hyroxinsider.com / hyroxy.com), Open division.
const BASE_OPEN: Record<Gender, number[]> = {
  men:   [260, 160, 170, 300, 285, 140, 270, 360],
  women: [305, 155, 170, 330, 305, 145, 300, 420],
};

const STATION_NAMES = [
  "SkiErg",
  "Sled Push",
  "Sled Pull",
  "Burpee Broad Jumps",
  "Rowing",
  "Farmers Carry",
  "Sandbag Lunges",
  "Wall Balls",
];

// Per-station multipliers when switching to Pro division.
// Reflects heavier loads (Sled Push +50 kg, Sled Pull +50/25 kg,
// Carry +8 kg, Lunges +10 kg, Wall Balls +3/2 kg) offset by fitter athlete.
const PRO_MULTIPLIERS: number[] = [
  0.92, // SkiErg  — same equipment, better athlete
  1.28, // Sled Push — large load increase dominates
  1.20, // Sled Pull — significant load increase
  0.85, // Burpees — bodyweight, fitter athlete wins
  0.92, // Row — same equipment, better athlete
  1.05, // Farmers Carry — heavier kettlebells
  1.08, // Sandbag Lunges — heavier bag
  1.05, // Wall Balls — heavier ball
];

function calculate(
  gender: Gender,
  division: Division,
  fiveKmMinutes: number,
  fiveKmSeconds: number,
  benchKg: number,
  deadliftKg: number,
) {
  const fiveKmTotal = fiveKmMinutes * 60 + fiveKmSeconds;
  const pacePerKm = fiveKmTotal / 5;

  // Normalise strength against division-appropriate averages.
  // Pro athletes are self-selected stronger, so we shift the benchmark up.
  const benchAvg  = gender === "men" ? (division === "pro" ? 100 : 80)  : (division === "pro" ? 65 : 50);
  const dlAvg     = gender === "men" ? (division === "pro" ? 150 : 120) : (division === "pro" ? 90 : 70);

  const benchNorm    = benchKg / benchAvg;
  const deadliftNorm = deadliftKg / dlAvg;

  // Strength factor: 0.75 (very strong) → 1.30 (weak relative to division)
  const upperFactor    = Math.max(0.75, Math.min(1.30, 1.5 - benchNorm * 0.5));
  const lowerFactor    = Math.max(0.75, Math.min(1.30, 1.5 - deadliftNorm * 0.5));
  const combinedFactor = (upperFactor + lowerFactor) / 2;

  // Running fatigue: strong athletes hold pace better under station fatigue.
  // Real data shows race pace ≈ 10–22% slower than fresh 5 K pace.
  // Pro athletes get a slight advantage (better compromised running).
  const proRunBonus = division === "pro" ? 0.03 : 0;
  const fatigueFactor =
    combinedFactor < 0.90
      ? 1.05 - proRunBonus
      : combinedFactor < 1.05
      ? 1.13 - proRunBonus
      : 1.22 - proRunBonus;

  const runTimePerKm = pacePerKm * fatigueFactor;
  const totalRunning = runTimePerKm * 8;

  // Which upper/lower factor drives each station
  const stationFactors = [
    upperFactor,    // SkiErg
    lowerFactor,    // Sled Push
    upperFactor,    // Sled Pull
    lowerFactor,    // Burpees
    combinedFactor, // Row
    upperFactor,    // Farmers Carry
    lowerFactor,    // Sandbag Lunges
    upperFactor,    // Wall Balls
  ];

  const bases = BASE_OPEN[gender];
  const stations: StationResult[] = STATION_NAMES.map((name, i) => {
    const base = bases[i] * (division === "pro" ? PRO_MULTIPLIERS[i] : 1.0);
    return { name, time: base * stationFactors[i] };
  });

  const totalStations = stations.reduce((sum, s) => sum + s.time, 0);

  // RoxZone transitions: real data shows 5–12 min total for Open (strong–developing).
  // Pro athletes are more efficient.
  const roxBase = division === "pro" ? 300 : 420;
  const transitions = combinedFactor < 0.90 ? roxBase * 0.75 : combinedFactor < 1.05 ? roxBase : roxBase * 1.35;
  const total = totalRunning + totalStations + transitions;

  return { totalRunning, totalStations, transitions, total, stations, runTimePerKm };
}

export default function HyroxCalculator() {
  const [gender, setGender]     = useState<Gender>("men");
  const [division, setDivision] = useState<Division>("open");
  const [fiveKmMin, setFiveKmMin]   = useState("25");
  const [fiveKmSec, setFiveKmSec]   = useState("0");
  const [benchKg, setBenchKg]       = useState("80");
  const [deadliftKg, setDeadliftKg] = useState("120");

  const parsedMin      = Math.max(0, parseInt(fiveKmMin, 10) || 0);
  const parsedSec      = Math.max(0, Math.min(59, parseInt(fiveKmSec, 10) || 0));
  const parsedBench    = Math.max(1, parseInt(benchKg, 10) || 1);
  const parsedDeadlift = Math.max(1, parseInt(deadliftKg, 10) || 1);

  const result = calculate(gender, division, parsedMin, parsedSec, parsedBench, parsedDeadlift);
  const level  = getLevel(result.total, gender, division);

  const divisionLabel = `${division === "pro" ? "Pro" : "Open"} ${gender === "men" ? "Men" : "Women"}`;

  const s = {
    card:       "bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6",
    label:      "block text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2",
    input:      "w-full bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#38bdf8] min-h-[44px]",
    btnActive:  "bg-[#38bdf8] text-[#09090b] font-bold",
    btnInactive:"bg-[#131316] border border-[#27272a] text-[#a1a1aa] hover:border-[#38bdf8]/40 hover:text-[#e4e4e7]",
    btn:        "px-4 py-2.5 rounded-lg text-sm transition-all min-h-[44px] cursor-pointer w-full",
  };

  return (
    <div className="max-w-4xl mx-auto">
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

          {/* Per-station breakdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#52525b] px-1 mb-1">
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
                  Improving your 5 km by 2 min saves ~4 min across the 8 running laps
                </li>
              )}
              {division === "pro" && parsedBench < 100 && (
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                  Pro carries & wall balls demand strong upper body — target 100 kg+ bench
                </li>
              )}
              {division === "pro" && parsedDeadlift < 150 && (
                <li className="flex items-start gap-2">
                  <span className="text-[#f59e0b] flex-shrink-0">▶</span>
                  Pro sled (202 kg) punishes weak legs — build toward a 150 kg+ deadlift
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
