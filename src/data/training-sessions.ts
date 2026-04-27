/**
 * Reusable Hyrox training session library.
 *
 * Each session is a self-contained workout that plans compose into weekly
 * schedules. Sessions are referenced by id from training-plans.ts so that
 * descriptions stay consistent across plans and updates only need to happen
 * in one place.
 */

export type SessionCategory =
  | "rest"
  | "recovery"
  | "easy-run"
  | "long-run"
  | "threshold"
  | "race-pace"
  | "compromised"
  | "strength"
  | "stations"
  | "simulation"
  | "monostructural"
  | "doubles"
  | "taper";

export interface TrainingSession {
  id: string;
  name: string;
  category: SessionCategory;
  duration: string;
  shortDescription: string;
  detail: string;
}

const sessions: TrainingSession[] = [
  // --- Rest & recovery -----------------------------------------------------
  {
    id: "rest",
    name: "Rest",
    category: "rest",
    duration: "0 min",
    shortDescription: "Full rest day.",
    detail: "Complete rest. Sleep, hydration, light stretching only. Recovery is when adaptation happens — do not skip rest days during a hard build phase.",
  },
  {
    id: "recovery-walk",
    name: "Active recovery walk",
    category: "recovery",
    duration: "30-45 min",
    shortDescription: "Easy walk at conversational pace.",
    detail: "30-45 minutes walking at a conversational pace. Heart rate stays under 60% max. Use it to flush legs after hard sessions and accumulate easy aerobic time.",
  },
  {
    id: "mobility-30",
    name: "Mobility & core",
    category: "recovery",
    duration: "30 min",
    shortDescription: "Hip, ankle, T-spine mobility plus a short core circuit.",
    detail: "10 min hip openers (90/90, couch stretch, deep squat hold), 10 min ankle and T-spine work, 10 min core (dead bugs, side plank, hollow holds). Important for sled push depth and lunge stride length.",
  },
  {
    id: "swim-bike-easy",
    name: "Easy swim or bike",
    category: "recovery",
    duration: "30-40 min",
    shortDescription: "Low-impact aerobic flush.",
    detail: "30-40 minutes swimming or easy cycling at conversational effort. Useful when running volume is creating impact stress or you want extra aerobic time without leg pounding.",
  },

  // --- Easy aerobic running ------------------------------------------------
  {
    id: "easy-z2-30",
    name: "Easy Z2 run 30 min",
    category: "easy-run",
    duration: "30 min",
    shortDescription: "Conversational pace zone 2.",
    detail: "30 minutes at zone 2 — you should be able to hold a full conversation. Roughly 60-70% max heart rate, or about 90 seconds per kilometre slower than your goal Hyrox running pace.",
  },
  {
    id: "easy-z2-45",
    name: "Easy Z2 run 45 min",
    category: "easy-run",
    duration: "45 min",
    shortDescription: "Conversational pace zone 2.",
    detail: "45 minutes at zone 2. The bedrock of Hyrox aerobic capacity. Stay disciplined — too many athletes drift this into zone 3 and accumulate junk fatigue.",
  },
  {
    id: "easy-z2-60",
    name: "Easy Z2 run 60 min",
    category: "easy-run",
    duration: "60 min",
    shortDescription: "Steady aerobic hour.",
    detail: "60 minutes at zone 2. Builds the durable mitochondrial base you need for the second half of a Hyrox where the running really hurts.",
  },

  // --- Long runs -----------------------------------------------------------
  {
    id: "long-z2-75",
    name: "Long run 75 min",
    category: "long-run",
    duration: "75 min",
    shortDescription: "Long aerobic effort.",
    detail: "75 minutes continuous, mostly zone 2 with the last 10 minutes drifting into low zone 3 if you feel good. Builds aerobic durability and fat oxidation.",
  },
  {
    id: "long-z2-90",
    name: "Long run 90 min",
    category: "long-run",
    duration: "90 min",
    shortDescription: "Aerobic durability builder.",
    detail: "90 minutes continuous. Optional finish: last 15 minutes at marathon pace. Critical for handling Hyrox's 8 km of running spread across stations.",
  },
  {
    id: "long-z2-120",
    name: "Long run 120 min",
    category: "long-run",
    duration: "120 min",
    shortDescription: "2-hour aerobic capacity day.",
    detail: "2 hours easy. Don't do this every week — once every 10-14 days. Builds a deep aerobic well that makes 8 km feel short.",
  },

  // --- Threshold -----------------------------------------------------------
  {
    id: "tempo-3x10",
    name: "Threshold 3×10 min",
    category: "threshold",
    duration: "55 min",
    shortDescription: "3×10 min at threshold with 2 min jog rest.",
    detail: "15 min easy warm-up, then 3×10 minutes at threshold pace (comfortably hard, ~10 km race pace) with 2 min easy jog between. 10 min cool-down. Lifts your lactate threshold so race-pace running feels easier.",
  },
  {
    id: "tempo-5x1k",
    name: "Threshold 5×1 km",
    category: "threshold",
    duration: "50 min",
    shortDescription: "5×1 km at threshold with 90 s rest.",
    detail: "15 min warm-up, 5×1 km at threshold pace (~10 km race pace) with 90 seconds easy jog rest. 10 min cool-down. Pure lactate-threshold work.",
  },
  {
    id: "tempo-6x800",
    name: "VO₂ 6×800 m",
    category: "threshold",
    duration: "45 min",
    shortDescription: "6×800 m at 5K pace with 2 min rest.",
    detail: "15 min warm-up, 6×800 m at 5 km pace with 2 minutes walking rest. 10 min cool-down. Develops VO₂ max — the ceiling above your Hyrox running pace.",
  },

  // --- Race-pace running ---------------------------------------------------
  {
    id: "1k-repeats-6x",
    name: "Hyrox 1 km repeats × 6",
    category: "race-pace",
    duration: "55 min",
    shortDescription: "6×1 km at goal Hyrox running pace with 60 s rest.",
    detail: "15 min warm-up, 6×1 km at your goal Hyrox running pace (treadmill or track) with exactly 60 seconds rest — same as Hyrox's compressed transition windows. Cool-down 10 min.",
  },
  {
    id: "1k-repeats-8x",
    name: "Hyrox 1 km repeats × 8",
    category: "race-pace",
    duration: "75 min",
    shortDescription: "8×1 km at goal pace simulating full race running volume.",
    detail: "15 min warm-up, 8×1 km at goal Hyrox running pace with 60 s rest between. Total volume mirrors race-day running. Most race-specific aerobic session in Hyrox prep.",
  },
  {
    id: "400m-repeats",
    name: "Speed 12×400 m",
    category: "race-pace",
    duration: "45 min",
    shortDescription: "12×400 m at 5K pace with 60 s rest.",
    detail: "12×400 m at 5 km race pace with 60 seconds rest. Builds top-end running speed without the volume of full 1 km repeats — useful in build phase.",
  },

  // --- Compromised running -------------------------------------------------
  {
    id: "compromised-mini",
    name: "Compromised running circuit",
    category: "compromised",
    duration: "45-55 min",
    shortDescription: "3 rounds: 1 km run + 50 wall balls + 200 m sandbag lunges.",
    detail: "After warm-up, 3 rounds: 1 km run at goal pace, 50 wall balls (6 kg M / 4 kg W), 200 m sandbag lunges (10 kg). Teaches your legs how to run on a fatigued posterior chain.",
  },
  {
    id: "compromised-stations",
    name: "Run-station alternations",
    category: "compromised",
    duration: "60 min",
    shortDescription: "5 rounds of 1 km run + one station, alternating.",
    detail: "After warm-up, 5 rounds: 1 km run + one rotating station (ski erg 500 m, 50 wall balls, 50 m sled push, 1,000 m row, 80 m burpee broad jumps). Builds the run-to-station transition skill.",
  },

  // --- Strength ------------------------------------------------------------
  {
    id: "strength-lower",
    name: "Lower-body strength",
    category: "strength",
    duration: "60 min",
    shortDescription: "Heavy squat / hinge / single-leg.",
    detail: "Back squat 4×5 @ 80%, Romanian deadlift 4×6, walking lunges 3×16 with dumbbells, single-leg calf raises 3×12. Builds the unit-strength that makes sled push and lunges feel light.",
  },
  {
    id: "strength-upper",
    name: "Upper-body & pull strength",
    category: "strength",
    duration: "55 min",
    shortDescription: "Pull-focused upper body for sled pull and ski erg.",
    detail: "Strict pull-ups 4×AMRAP, bent-over row 4×8, push press 4×5, lat pull-down 3×10, biceps curl 2×12, face pulls 3×15. Strengthens posterior chain for sled pull, row, and ski.",
  },
  {
    id: "strength-full",
    name: "Full-body compound day",
    category: "strength",
    duration: "60 min",
    shortDescription: "Squat, deadlift, press in one session.",
    detail: "Front squat 4×6, deadlift 4×4, push press 4×5, weighted pull-ups 4×6. Pure unit-strength session — useful when you only have 2 strength slots a week.",
  },
  {
    id: "strength-station",
    name: "Station-specific strength",
    category: "strength",
    duration: "55 min",
    shortDescription: "Heavy carries, sled drag, lunge volume under load.",
    detail: "Trap-bar carries 4×30 m, heavy sled drag 4×25 m at 1.5× race weight, walking lunges with sandbag 3×60 m, weighted plank 3×60 s. Targets the exact muscle groups that fail in the back half of Hyrox.",
  },

  // --- Stations / specific work --------------------------------------------
  {
    id: "skierg-intervals",
    name: "SkiErg intervals",
    category: "stations",
    duration: "35 min",
    shortDescription: "5×500 m SkiErg at race pace + 30 s rest.",
    detail: "10 min easy warm-up (rower or bike), then 5×500 m on the SkiErg at goal race pace with 30 seconds rest between intervals. Focus on a strong hip drive and steady damper setting (5–6). Cool-down 5 min easy. Builds the upper-body endurance that lets you exit station 1 with running legs.",
  },
  {
    id: "row-2k-test",
    name: "2 km row test",
    category: "stations",
    duration: "20 min",
    shortDescription: "2 km on the rower for time — single benchmark effort.",
    detail: "10 min progressive warm-up, then 2 km on the Concept2 RowErg as a single hard effort. Track the time monthly. Sub-7:30 men / sub-8:15 women correlates with sub-90 Hyrox row splits at race pace. Cool-down 5 min easy.",
  },
  {
    id: "ski-2k-test",
    name: "2 km SkiErg test",
    category: "stations",
    duration: "20 min",
    shortDescription: "2 km on the SkiErg for time — single benchmark effort.",
    detail: "10 min progressive warm-up, then 2 km on the Concept2 SkiErg as a single hard effort. Track the time monthly. Sub-8:30 men / sub-9:30 women is a strong sub-90 Hyrox indicator. Cool-down 5 min easy.",
  },
  {
    id: "carry-grip-circuit",
    name: "Carry & grip circuit",
    category: "stations",
    duration: "35 min",
    shortDescription: "Heavy farmer carries + dead hangs to bulletproof grip.",
    detail: "After warm-up, 4 rounds of: 50 m heavy farmer carry (race weight + 4 kg per hand) → 30 s dead hang → 60 s rest. Finish with 2×40 m suitcase carry per side. Targets the grip endurance that fails on station 6 of a real race.",
  },
  {
    id: "sled-volume",
    name: "Sled volume",
    category: "stations",
    duration: "45 min",
    shortDescription: "4×25 m push + 4×25 m pull at race weight.",
    detail: "After warm-up: 4×25 m sled push at race weight (152 kg M / 102 kg W) with 90 s rest, 4×25 m sled pull at race weight (103 kg M / 78 kg W) with 90 s rest. Builds technique under fatigue.",
  },
  {
    id: "sled-heavy",
    name: "Heavy sled day",
    category: "stations",
    duration: "40 min",
    shortDescription: "3×25 m push + pull at race weight + 20 kg.",
    detail: "After warm-up, 3×25 m sled push at race weight + 20 kg with 2 min rest, 3×25 m sled pull at race weight + 20 kg. Overloads the system so race weight feels manageable.",
  },
  {
    id: "wall-ball-test",
    name: "100 wall ball test",
    category: "stations",
    duration: "20-30 min",
    shortDescription: "100 wall balls for time, broken into manageable sets.",
    detail: "After warm-up: 100 wall balls (6 kg M / 4 kg W to 10 ft / 9 ft target) for time. Aim for sets of 25-30 then break as needed. Track total time weekly.",
  },
  {
    id: "lunge-volume",
    name: "Sandbag lunge volume",
    category: "stations",
    duration: "25 min",
    shortDescription: "2×100 m sandbag lunges with 3 min rest.",
    detail: "After warm-up: 2×100 m sandbag lunges (20 kg M / 10 kg W) with 3 min rest between. Track total time and reps fallen out. Targets the specific quad-fatigue of station 7.",
  },
  {
    id: "burpee-volume",
    name: "Burpee broad jump volume",
    category: "stations",
    duration: "25 min",
    shortDescription: "80 burpee broad jumps at race pace.",
    detail: "After warm-up, 80 burpee broad jumps for time. Practice the chest-to-floor + 1 m broad jump rhythm at sustainable pace. Avg target 6-8 minutes.",
  },
  {
    id: "station-circuit",
    name: "Light station circuit",
    category: "stations",
    duration: "50 min",
    shortDescription: "3 rounds light technique work across all 8 stations.",
    detail: "3 rounds of: 30 s ski, 25 m sled push (light), 25 m sled pull (light), 10 burpee broad jumps, 30 s row, 50 m farmer's carry, 20 m lunges, 25 wall balls. Technique day, not for time.",
  },

  // --- Simulation ----------------------------------------------------------
  {
    id: "mini-hyrox",
    name: "Mini Hyrox (half race)",
    category: "simulation",
    duration: "45-55 min",
    shortDescription: "4×1 km + 4 stations at race pace.",
    detail: "4×1 km run + 4 rotating stations (ski 500 m, 25 m sled push, 25 m sled pull, 40 m burpee broad jumps) at race pace. Half the volume of a full sim — usable mid-week without crushing recovery.",
  },
  {
    id: "three-quarter-hyrox",
    name: "Three-quarter Hyrox",
    category: "simulation",
    duration: "60-75 min",
    shortDescription: "6×1 km + 6 stations at race pace.",
    detail: "6×1 km run + 6 stations (ski, sled push, sled pull, burpees, row, farmers) at race pace. Bridge between mini and full sim. Useful 4-6 weeks before race.",
  },
  {
    id: "full-hyrox-sim",
    name: "Full Hyrox simulation",
    category: "simulation",
    duration: "60-100 min",
    shortDescription: "Complete Hyrox: 8×1 km + all 8 stations at race effort.",
    detail: "Full Hyrox simulation at race effort. 8×1 km running, all 8 stations in order, race weights. The most accurate predictor of race-day finish. Schedule 4-6 weeks out, not sooner.",
  },

  // --- Aerobic monostructural (low-impact / doubles) -----------------------
  {
    id: "ski-row-bike",
    name: "Ski/row/bike intervals",
    category: "monostructural",
    duration: "45 min",
    shortDescription: "Low-impact intervals on ski erg, rower, bike.",
    detail: "5×5 min alternating ski erg, rower, assault bike at threshold pace with 90 s rest. Builds aerobic capacity without the running impact — useful for high-mileage weeks or returning from injury.",
  },
  {
    id: "doubles-handover",
    name: "Doubles handover practice",
    category: "doubles",
    duration: "55 min",
    shortDescription: "Partner handover drills across all 8 stations.",
    detail: "With partner, run through each station practicing handovers. Goal: reduce dead time between partner switches to <2 seconds. Practice splits so you both finish stations within 3-5 reps of each other.",
  },

  // --- Taper ---------------------------------------------------------------
  {
    id: "shakeout-20",
    name: "Easy shakeout 20 min",
    category: "taper",
    duration: "20 min",
    shortDescription: "Very easy run with 4×20 s strides.",
    detail: "20 minutes very easy running, finish with 4×20 s strides at goal Hyrox pace. Keeps legs primed without depleting glycogen.",
  },
  {
    id: "pre-race-activation",
    name: "Pre-race activation",
    category: "taper",
    duration: "30 min",
    shortDescription: "Light activation 1-2 days before race.",
    detail: "10 min easy bike or row, dynamic mobility, then 3 rounds of: 200 m run + 5 wall balls + 10 m sled push + 5 burpee broad jumps. Wakes up race-day movement patterns without fatigue.",
  },
  {
    id: "race-day",
    name: "RACE DAY",
    category: "taper",
    duration: "Race",
    shortDescription: "The race itself. Trust the plan.",
    detail: "Race day. Eat your normal breakfast 3 hours out, arrive at the venue 90 minutes before your wave, complete the activation drill, and execute your pacing strategy. Nothing new on race day.",
  },
];

const sessionMap = new Map<string, TrainingSession>(sessions.map((s) => [s.id, s]));

export const TRAINING_SESSIONS = sessions;

export function getSession(id: string): TrainingSession {
  const session = sessionMap.get(id);
  if (!session) {
    throw new Error(`Unknown training session id: ${id}`);
  }
  return session;
}
