import { useEffect, useMemo, useState } from "react";
import {
  calculate,
  decodeShareParams,
  formatTime,
  formatTimeHM,
  type CalculationInputs,
} from "../lib/hyroxEngine";

/**
 * Race-day pacing band. Generates a printable strip the athlete can fold
 * around their wrist with a target time per station + cumulative split.
 *
 * Reads URL params using the existing share encoding so a user can:
 *   1. Run the calculator
 *   2. Copy the share link
 *   3. Open /calculator/pacing-band/?<same params>
 *   4. Print on plain paper
 *
 * The strip prints at roughly wristband size on standard A4/Letter when
 * the page CSS is set to a fixed width and the print media query hides
 * everything else.
 */
export default function PacingBand() {
  const [inputs, setInputs] = useState<CalculationInputs | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setInputs(decodeShareParams(window.location.search));
  }, []);

  const result = useMemo(() => (inputs ? calculate(inputs) : null), [inputs]);

  if (!inputs || !result) {
    return (
      <div className="bg-[#131316] border border-[#27272a] rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#f4f4f5] mb-3">
          No prediction in this link
        </h2>
        <p className="text-sm text-[#a1a1aa] mb-6 max-w-md mx-auto leading-relaxed">
          The pacing band needs a calculator share link. Run the calculator, copy the share link from the result card, and open this page with the same params.
        </p>
        <a
          href="/calculator/"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#38bdf8] hover:text-[#0ea5e9] transition-colors no-underline bg-[#38bdf8]/10 border border-[#38bdf8]/30 px-4 py-2 rounded-lg"
        >
          Open the calculator →
        </a>
      </div>
    );
  }

  // Build cumulative splits across the 8 runs and 8 stations.
  // The engine does not give us per-run times directly, but we know
  // result.totalRunning and we can split it 1/8 across runs.
  const perRun = result.totalRunning / 8;
  const perTransition = result.transitions / 8;

  type Row = { label: string; cum: number; chunk: number; type: "run" | "station" };
  const rows: Row[] = [];
  let cum = 0;
  for (let i = 0; i < 8; i++) {
    cum += perRun;
    rows.push({ label: `Run ${i + 1}`, cum, chunk: perRun, type: "run" });
    if (i < result.stations.length) {
      const station = result.stations[i];
      cum += station.time + perTransition;
      rows.push({
        label: station.name,
        cum,
        chunk: station.time,
        type: "station",
      });
    }
  }

  const division =
    inputs.division === "pro"
      ? inputs.gender === "men"
        ? "Pro Men"
        : "Pro Women"
      : inputs.gender === "men"
        ? "Open Men"
        : "Open Women";

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-[#09090b] font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Print pacing band
        </button>
        <a
          href="/calculator/"
          className="text-sm font-semibold text-[#38bdf8] hover:underline self-center"
        >
          ← Back to calculator
        </a>
      </div>

      <div
        id="pacing-band"
        className="bg-white text-black border border-[#27272a] rounded-2xl p-6 max-w-md mx-auto print:max-w-none print:mx-0 print:border-0 print:p-2 print:rounded-none"
      >
        <div className="text-center border-b-2 border-black pb-2 mb-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-black/70">
            Hyrox pacing band — {division}
          </div>
          <div className="text-2xl font-black font-mono">
            Target {formatTimeHM(result.total)}
          </div>
        </div>
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-black">
              <th className="text-left py-1 px-1 text-[10px] font-bold uppercase tracking-wider">
                Stage
              </th>
              <th className="text-right py-1 px-1 text-[10px] font-bold uppercase tracking-wider">
                Chunk
              </th>
              <th className="text-right py-1 px-1 text-[10px] font-bold uppercase tracking-wider">
                Cum
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.label}
                className={r.type === "station" ? "bg-black/[0.04]" : ""}
              >
                <td className="py-1 px-1 text-xs">{r.label}</td>
                <td className="py-1 px-1 text-xs text-right">{formatTime(r.chunk)}</td>
                <td className="py-1 px-1 text-xs text-right font-bold">{formatTimeHM(r.cum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-[9px] text-center mt-3 pt-2 border-t border-black/20 text-black/60">
          hyroxvault.com — Cut along here, fold around wrist
        </div>
      </div>

      <p className="mt-6 text-xs text-text-muted/70 text-center print:hidden max-w-md mx-auto">
        Print on plain paper. Cut along the outer edge. Wrap around your wrist with the white side facing you and tape or staple. Run-times include the average per-run figure; faster runs will buy you cushion for slower stations.
      </p>

      <style>{`
        @media print {
          @page { margin: 1cm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
