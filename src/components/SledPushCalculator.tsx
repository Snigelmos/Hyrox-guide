import { useMemo, useState } from "react";

/**
 * Sled push physics calculator.
 *
 * Computes a rough estimate of the average watts and joules required to
 * push a Hyrox sled across the 50 m station. Treats the push as a pure
 * friction problem with a steady velocity (no acceleration phase). Real
 * sled pushes have brief stop-start moments that increase peak watts but
 * not average; the average estimate is what's useful for pacing.
 *
 * Friction coefficient is a configurable input because Hyrox sled lanes
 * vary noticeably:
 *   - Indoor turf (typical Hyrox): 0.55-0.70
 *   - Sled track / artificial turf: 0.40-0.55
 *   - Slick rubber: 0.30-0.45
 *
 * Bodyweight is unused in the watts calculation but kept in the UI so we
 * can also surface the watts-per-kg figure that lifters know.
 */
const G = 9.81;

const PRESETS = [
  { label: "Open Men", sledKg: 152, frictionMu: 0.6, distanceM: 50, defaultTime: 90 },
  { label: "Open Women", sledKg: 102, frictionMu: 0.6, distanceM: 50, defaultTime: 95 },
  { label: "Pro Men", sledKg: 202, frictionMu: 0.6, distanceM: 50, defaultTime: 130 },
  { label: "Pro Women", sledKg: 152, frictionMu: 0.6, distanceM: 50, defaultTime: 130 },
];

export default function SledPushCalculator() {
  const [sledKg, setSledKg] = useState(152);
  const [frictionMu, setFrictionMu] = useState(0.6);
  const [distanceM, setDistanceM] = useState(50);
  const [timeS, setTimeS] = useState(90);
  const [bodyweightKg, setBodyweightKg] = useState(80);

  const result = useMemo(() => {
    const force = sledKg * G * frictionMu;
    const work = force * distanceM;
    const power = timeS > 0 ? work / timeS : 0;
    const wattsPerKg = bodyweightKg > 0 ? power / bodyweightKg : 0;
    const speedKmh = timeS > 0 ? (distanceM / timeS) * 3.6 : 0;
    return {
      force,
      work,
      power,
      wattsPerKg,
      speedKmh,
    };
  }, [sledKg, frictionMu, distanceM, timeS, bodyweightKg]);

  const surfaceLabel =
    frictionMu < 0.4
      ? "Slick rubber / smooth concrete"
      : frictionMu < 0.55
        ? "Sled track / artificial turf"
        : frictionMu < 0.7
          ? "Typical Hyrox indoor turf"
          : "Tacky / heavily textured turf";

  return (
    <div className="bg-[#131316] border border-[#27272a] rounded-2xl p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className="text-left bg-[#09090b] border border-[#27272a] hover:border-[#38bdf8]/40 rounded-lg px-3 py-2 transition-colors"
                onClick={() => {
                  setSledKg(p.sledKg);
                  setFrictionMu(p.frictionMu);
                  setDistanceM(p.distanceM);
                  setTimeS(p.defaultTime);
                }}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                  Preset
                </div>
                <div className="text-sm font-semibold text-[#f4f4f5]">{p.label}</div>
                <div className="text-xs text-[#a1a1aa]">{p.sledKg} kg · {p.distanceM} m</div>
              </button>
            ))}
          </div>

          <Field
            label="Sled weight (kg)"
            value={sledKg}
            min={50}
            max={300}
            step={1}
            onChange={setSledKg}
          />
          <Field
            label="Distance (m)"
            value={distanceM}
            min={10}
            max={100}
            step={1}
            onChange={setDistanceM}
          />
          <Field
            label="Push time (s)"
            value={timeS}
            min={20}
            max={300}
            step={1}
            onChange={setTimeS}
          />
          <Field
            label="Bodyweight (kg)"
            value={bodyweightKg}
            min={45}
            max={150}
            step={1}
            onChange={setBodyweightKg}
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-[#f4f4f5]">
                Friction coefficient (μ)
              </label>
              <span className="font-mono text-sm text-[#38bdf8]">{frictionMu.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={0.85}
              step={0.05}
              value={frictionMu}
              onChange={(e) => setFrictionMu(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[#a1a1aa] mt-1">{surfaceLabel}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Stat label="Required force" value={`${Math.round(result.force)} N`} hint={`= ${Math.round(result.force / G)} kg-equivalent at the rope`} />
          <Stat label="Total work" value={`${Math.round(result.work)} J`} hint={`Energy to move ${sledKg} kg sled across ${distanceM} m`} />
          <Stat
            label="Average power"
            value={`${Math.round(result.power)} W`}
            primary
            hint={`Sustained ${Math.round(result.power)} watts for ${timeS} s`}
          />
          <Stat
            label="Watts per kg bodyweight"
            value={`${result.wattsPerKg.toFixed(2)} W/kg`}
            hint="Comparable to cycling W/kg at threshold"
          />
          <Stat
            label="Average sled speed"
            value={`${result.speedKmh.toFixed(2)} km/h`}
            hint={`= ${(distanceM / timeS).toFixed(2)} m/s`}
          />
          <div className="bg-[#09090b] border border-[#38bdf8]/30 rounded-xl p-4 mt-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#38bdf8] mb-1">
              How to use this
            </div>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              The watts figure is your pacing target. Most Open Men can sustain 350-450 W on the sled push for 60-90 seconds; trained athletes hit 500+ W. If your number is above your max sustainable wattage, the sled will stop before 50 m and you'll burn extra time on a restart.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="text-sm font-bold text-[#f4f4f5] block mb-2">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-[#09090b] border border-[#27272a] focus:border-[#38bdf8] rounded-lg px-3 py-2 text-[#f4f4f5] font-mono text-base outline-none"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  primary,
}: {
  label: string;
  value: string;
  hint?: string;
  primary?: boolean;
}) {
  return (
    <div
      className={
        "rounded-xl border px-4 py-3 " +
        (primary
          ? "bg-[#38bdf8]/10 border-[#38bdf8]/40"
          : "bg-[#09090b] border-[#27272a]")
      }
    >
      <div className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-1">
        {label}
      </div>
      <div
        className={
          "font-mono text-2xl font-black " + (primary ? "text-[#38bdf8]" : "text-[#f4f4f5]")
        }
      >
        {value}
      </div>
      {hint && <div className="text-xs text-[#a1a1aa] mt-1">{hint}</div>}
    </div>
  );
}
