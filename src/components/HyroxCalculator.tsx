import { useState } from "react";

type Gender = "men" | "women";
type Experience = "none" | "some" | "regular";
type Strength = "beginner" | "intermediate" | "advanced";

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
    if (mins < 78) return { label: "Competitive", color: "#38bdf8" };
    if (mins < 95) return { label: "Average", color: "#f59e0b" };
    return { label: "Beginner", color: "#f87171" };
  }
  if (mins < 75) return { label: "Elite", color: "#10b981" };
  if (mins < 88) return { label: "Competitive", color: "#38bdf8" };
  if (mins < 106) return { label: "Average", color: "#f59e0b" };
  return { label: "Beginner", color: "#f87171" };
}

function calculate(
  gender: Gender,
  fiveKmMinutes: number,
  fiveKmSeconds: number,
  skiErg: Experience,
  rowing: Experience,
  strength: Strength
) {
  const fiveKmTotal = fiveKmMinutes * 60 + fiveKmSeconds;
  const pacePerKm = fiveKmTotal / 5;

  const fatigueFactor = strength === "advanced" ? 1.12 : strength === "intermediate" ? 1.18 : 1.25;
  const runTimePerKm = pacePerKm * fatigueFactor;
  const totalRunning = runTimePerKm * 8;

  const expMultiplier = { none: 1.3, some: 1.0, regular: 0.85 };
  const strMultiplier = { beginner: 1.35, intermediate: 1.0, advanced: 0.78 };
  const genderBase = gender === "men" ? 1.0 : 1.12;

  const baseStations = [
    { name: "SkiErg", base: 240 },
    { name: "Sled Push", base: 120 },
    { name: "Sled Pull", base: 120 },
    { name: "Burpee Broad Jumps", base: 240 },
    { name: "Rowing", base: 225 },
    { name: "Farmers Carry", base: 150 },
    { name: "Sandbag Lunges", base: 240 },
    { name: "Wall Balls", base: 240 },
  ];

  const stations: StationResult[] = baseStations.map((s) => {
    let time = s.base * genderBase * strMultiplier[strength];
    if (s.name === "SkiErg") time *= expMultiplier[skiErg];
    if (s.name === "Rowing") time *= expMultiplier[rowing];
    const clamped = Math.max(time, s.base * 0.55);
    return { name: s.name, time: clamped };
  });

  const totalStations = stations.reduce((sum, s) => sum + s.time, 0);
  const transitions = strength === "advanced" ? 180 : strength === "intermediate" ? 360 : 600;
  const total = totalRunning + totalStations + transitions;

  return { totalRunning, totalStations, transitions, total, stations, runTimePerKm };
}

export default function HyroxCalculator() {
  const [gender, setGender] = useState<Gender>("men");
  const [fiveKmMin, setFiveKmMin] = useState(25);
  const [fiveKmSec, setFiveKmSec] = useState(0);
  const [skiErg, setSkiErg] = useState<Experience>("some");
  const [rowing, setRowing] = useState<Experience>("some");
  const [strength, setStrength] = useState<Strength>("intermediate");
  const [showResults, setShowResults] = useState(false);

  const result = calculate(gender, fiveKmMin, fiveKmSec, skiErg, rowing, strength);
  const level = getLevel(result.total, gender);

  const inputClass =
    "w-full bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-3 text-sm text-[#e4e4e7] focus:outline-none focus:border-[#38bdf8] min-h-[44px]";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2";

  const btnActive = "bg-[#38bdf8] text-[#09090b] font-bold";
  const btnInactive = "bg-[#131316] border border-[#27272a] text-[#a1a1aa] hover:border-[#38bdf8]/30";
  const btnBase = "px-4 py-2.5 rounded-lg text-sm transition-all min-h-[44px] cursor-pointer";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8 space-y-6">
          <h3 className="text-lg font-bold text-[#f4f4f5]">Your Fitness Profile</h3>

          <div>
            <label className={labelClass}>Gender</label>
            <div className="grid grid-cols-2 gap-2">
              <button className={`${btnBase} ${gender === "men" ? btnActive : btnInactive}`} onClick={() => setGender("men")}>Men</button>
              <button className={`${btnBase} ${gender === "women" ? btnActive : btnInactive}`} onClick={() => setGender("women")}>Women</button>
            </div>
          </div>

          <div>
            <label className={labelClass}>5km Run Time</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="number" min={15} max={45} value={fiveKmMin} onChange={(e) => { setFiveKmMin(Number(e.target.value)); setShowResults(true); }} className={inputClass} />
                <span className="text-xs text-[#a1a1aa] mt-1 block">Minutes</span>
              </div>
              <div>
                <input type="number" min={0} max={59} value={fiveKmSec} onChange={(e) => { setFiveKmSec(Number(e.target.value)); setShowResults(true); }} className={inputClass} />
                <span className="text-xs text-[#a1a1aa] mt-1 block">Seconds</span>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>SkiErg Experience</label>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "some", "regular"] as Experience[]).map((v) => (
                <button key={v} className={`${btnBase} text-xs ${skiErg === v ? btnActive : btnInactive}`} onClick={() => { setSkiErg(v); setShowResults(true); }}>
                  {v === "none" ? "Never used" : v === "some" ? "A few times" : "Regular"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Rowing Experience</label>
            <div className="grid grid-cols-3 gap-2">
              {(["none", "some", "regular"] as Experience[]).map((v) => (
                <button key={v} className={`${btnBase} text-xs ${rowing === v ? btnActive : btnInactive}`} onClick={() => { setRowing(v); setShowResults(true); }}>
                  {v === "none" ? "Never used" : v === "some" ? "A few times" : "Regular"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Gym Strength Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(["beginner", "intermediate", "advanced"] as Strength[]).map((v) => (
                <button key={v} className={`${btnBase} text-xs ${strength === v ? btnActive : btnInactive}`} onClick={() => { setStrength(v); setShowResults(true); }}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8">
          <h3 className="text-lg font-bold text-[#f4f4f5] mb-6">Predicted Race Time</h3>

          <div className="text-center mb-8">
            <div className="text-5xl md:text-6xl font-black font-mono" style={{ color: level.color }}>
              {formatTimeHM(result.total)}
            </div>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: level.color + "15", color: level.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }}></span>
              {level.label} Level
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8 text-center">
            <div className="bg-[#09090b] rounded-xl p-3">
              <div className="text-lg font-bold text-[#f4f4f5] font-mono">{formatTime(result.totalRunning)}</div>
              <div className="text-xs text-[#a1a1aa]">Running</div>
            </div>
            <div className="bg-[#09090b] rounded-xl p-3">
              <div className="text-lg font-bold text-[#f4f4f5] font-mono">{formatTime(result.totalStations)}</div>
              <div className="text-xs text-[#a1a1aa]">Stations</div>
            </div>
            <div className="bg-[#09090b] rounded-xl p-3">
              <div className="text-lg font-bold text-[#f4f4f5] font-mono">{formatTime(result.transitions)}</div>
              <div className="text-xs text-[#a1a1aa]">Transitions</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#a1a1aa] px-1 mb-1">
              <span>Station</span>
              <span>Est. Time</span>
            </div>
            <div className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2.5">
              <span className="text-[#e4e4e7]">8 x 1km Run</span>
              <span className="font-mono font-semibold text-[#38bdf8]">{formatTime(result.totalRunning)}</span>
            </div>
            {result.stations.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2.5">
                <span className="text-[#e4e4e7]">{s.name}</span>
                <span className="font-mono font-semibold text-[#38bdf8]">{formatTime(s.time)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2.5">
              <span className="text-[#e4e4e7]">Transitions</span>
              <span className="font-mono font-semibold text-[#38bdf8]">{formatTime(result.transitions)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">Biggest improvement areas</h4>
            <ul className="space-y-1.5 text-sm text-[#e4e4e7]">
              {strength === "beginner" && <li className="flex items-start gap-2"><span className="text-[#f59e0b]">&#x25B6;</span> Build gym strength — sled, lunge, and wall ball times will drop significantly</li>}
              {(skiErg === "none" || rowing === "none") && <li className="flex items-start gap-2"><span className="text-[#f59e0b]">&#x25B6;</span> Practice on the machines you haven't used — technique saves minutes</li>}
              {fiveKmMin >= 28 && <li className="flex items-start gap-2"><span className="text-[#f59e0b]">&#x25B6;</span> Improving your 5km time by 2 min would save ~4 minutes on race day</li>}
              {fiveKmMin < 28 && strength !== "beginner" && <li className="flex items-start gap-2"><span className="text-[#10b981]">&#x25B6;</span> You have a solid base — focus on race simulations and pacing strategy</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
