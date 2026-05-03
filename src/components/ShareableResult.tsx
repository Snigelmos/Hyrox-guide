import { useEffect, useMemo, useState } from "react";
import {
  calculate,
  decodeShareParams,
  formatTime,
  formatTimeHM,
  getLevel,
  type CalculationInputs,
} from "../lib/hyroxEngine";

/**
 * Renders a screenshot-friendly result card from URL query params.
 * Mounted client-side on /calculator/share/ via a thin Astro wrapper.
 *
 * URL contract (see encodeShareParams in lib/hyroxEngine.ts):
 *   /calculator/share/?g=men&d=open&rm=25&rs=0&b=80&dl=120&bw=80
 */
export default function ShareableResult() {
  const [inputs, setInputs] = useState<CalculationInputs | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setInputs(decodeShareParams(window.location.search));
  }, []);

  if (inputs === null) {
    return (
      <div className="bg-[#131316] border border-[#27272a] rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-3">
          No prediction in this link
        </h2>
        <p className="text-sm text-[#a1a1aa] mb-6 leading-relaxed max-w-md mx-auto">
          The share link is missing or invalid. Run the calculator and use
          the share buttons to generate a working URL.
        </p>
        <a
          href="/calculator/"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#38bdf8] hover:text-[#0ea5e9] transition-colors no-underline bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-4 py-2 rounded-lg"
        >Open the calculator →</a>
      </div>
    );
  }

  return <ResultCard inputs={inputs} />;
}

function ResultCard({ inputs }: { inputs: CalculationInputs }) {
  const result = useMemo(() => calculate(inputs), [inputs]);
  const level = useMemo(
    () => getLevel(result.total, inputs.gender, inputs.division),
    [result.total, inputs.gender, inputs.division],
  );

  const divisionLabel = `${inputs.division === "pro" ? "Pro" : "Open"} ${
    inputs.gender === "men" ? "Men" : "Women"
  }`;

  return (
    <div
      id="share-poster"
      className="bg-[#131316] border border-[#27272a] rounded-2xl p-8 md:p-12 max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-2">
          Predicted Hyrox Finish Time
        </div>
        <div
          className="text-6xl md:text-7xl font-black font-mono leading-none"
          style={{ color: level.color }}
        >
          {formatTimeHM(result.total)}
        </div>
        <div className="mt-3 text-sm text-[#52525b]">{divisionLabel}</div>
        <div
          className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
          style={{ backgroundColor: level.color + "18", color: level.color }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: level.color }}
          />
          {level.label} Level
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 text-center">
        {[
          { label: "Running", val: result.totalRunning },
          { label: "Stations", val: result.totalStations },
          { label: "Transitions", val: result.transitions },
        ].map(({ label, val }) => (
          <div key={label} className="bg-[#09090b] rounded-xl p-3">
            <div className="text-base font-bold text-[#f4f4f5] font-mono">
              {formatTime(val)}
            </div>
            <div className="text-xs text-[#a1a1aa]">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 mb-8">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#52525b] px-1 mb-1">
          <span>Station</span>
          <span>Est. Time</span>
        </div>
        <div className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2">
          <span className="text-[#e4e4e7]">8 × 1 km Run</span>
          <span className="font-mono font-semibold text-[#38bdf8]">
            {formatTime(result.totalRunning)}
          </span>
        </div>
        {result.stations.map((st) => (
          <div
            key={st.name}
            className="flex items-center justify-between text-sm bg-[#09090b] rounded-lg px-4 py-2"
          >
            <span className="text-[#e4e4e7]">{st.name}</span>
            <span className="font-mono font-semibold text-[#38bdf8]">
              {formatTime(st.time)}
            </span>
          </div>
        ))}
      </div>

      <div className="text-xs text-[#52525b] text-center mb-6">
        Inputs: {inputs.fiveKmMinutes}:{String(inputs.fiveKmSeconds).padStart(2, "0")} 5K
        {" · "}{inputs.benchKg} kg bench{" · "}{inputs.deadliftKg} kg deadlift
        {" · "}{inputs.bodyweightKg} kg bodyweight
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <a
          href="/calculator/"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#38bdf8] hover:text-[#0ea5e9] transition-colors no-underline bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-4 py-2 rounded-lg"
        >
          Run my own prediction →
        </a>
        <a
          href={`/calculator/pacing-band/${typeof window !== "undefined" ? window.location.search : ""}`}
          className="inline-flex items-center gap-1 text-sm font-bold text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors no-underline bg-[#27272a] border border-[#27272a] hover:border-[#52525b] px-4 py-2 rounded-lg"
        >
          Print pacing band →
        </a>
      </div>

      <div className="mt-6 text-center text-[10px] text-[#52525b] tracking-wider uppercase">
        hyroxvault.com / Race-time predictor
      </div>
    </div>
  );
}
