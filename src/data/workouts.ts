/**
 * Named Hyrox simulation and benchmark workouts.
 *
 * Each entry powers a /workouts/[slug]/ page — these are searchable named tests
 * (e.g. "hyrox simulation workout", "1k row + 50 wall balls").
 */

export interface WorkoutBlock {
  label: string;
  detail: string;
}

export interface Workout {
  slug: string;
  name: string;
  shortDescription: string;
  whatItTests: string;
  whoItIsFor: string;
  durationMin: number;
  durationLabel: string;
  blocks: WorkoutBlock[];
  scoring: string;
  benchmarkResults: { tier: string; menTime: string; womenTime: string }[];
  programNotes: string[];
  faqs: { question: string; answer: string }[];
  related: string[]; // slugs
}

export const WORKOUTS: Workout[] = [
  {
    slug: "hyrox-simulation-workout",
    name: "Full Hyrox Simulation",
    shortDescription: "The complete Hyrox race format performed in training as a benchmark and race-pace dress rehearsal.",
    whatItTests: "Race-day pacing, station-running transitions, full-distance fatigue management, and accurate finish-time prediction.",
    whoItIsFor: "Athletes 4-6 weeks out from a goal Hyrox race who need a final fitness check and race-pace calibration.",
    durationMin: 90,
    durationLabel: "60-100 minutes",
    blocks: [
      { label: "Run 1", detail: "1 km running" },
      { label: "Station 1", detail: "1,000 m Ski Erg" },
      { label: "Run 2", detail: "1 km running" },
      { label: "Station 2", detail: "Sled Push 4 × 12.5 m at race weight (152 kg / 102 kg)" },
      { label: "Run 3", detail: "1 km running" },
      { label: "Station 3", detail: "Sled Pull 4 × 12.5 m at race weight (103 kg / 78 kg)" },
      { label: "Run 4", detail: "1 km running" },
      { label: "Station 4", detail: "Burpee Broad Jumps 80 m" },
      { label: "Run 5", detail: "1 km running" },
      { label: "Station 5", detail: "1,000 m Rowing" },
      { label: "Run 6", detail: "1 km running" },
      { label: "Station 6", detail: "Farmers Carry 200 m at race weight (2 × 24 kg / 2 × 16 kg)" },
      { label: "Run 7", detail: "1 km running" },
      { label: "Station 7", detail: "Sandbag Lunges 100 m at race weight (20 kg / 10 kg)" },
      { label: "Run 8", detail: "1 km running" },
      { label: "Station 8", detail: "100 Wall Balls (6 kg / 4 kg, 10 ft / 9 ft target)" },
    ],
    scoring: "Total elapsed time from start of run 1 to completion of station 8.",
    benchmarkResults: [
      { tier: "Elite", menTime: "Sub-65", womenTime: "Sub-78" },
      { tier: "Competitive", menTime: "65-80", womenTime: "78-95" },
      { tier: "Good", menTime: "80-95", womenTime: "95-110" },
      { tier: "Beginner", menTime: "95+", womenTime: "110+" },
    ],
    programNotes: [
      "Do this 4-6 weeks before your goal race, not closer — recovery from a full sim takes 5-7 days for most athletes.",
      "Use the simulation to validate your pacing strategy. Don't sprint run 1.",
      "Time each station independently to identify bottlenecks.",
      "Most athletes finish a sim 3-8 minutes slower than race day (no adrenaline, no crowd).",
    ],
    faqs: [
      { question: "How often should I do a full Hyrox simulation?", answer: "Once per training cycle — typically 4-6 weeks before the goal race. Doing it more often risks accumulated fatigue and is generally diminishing returns vs targeted training." },
      { question: "Can I do a Hyrox sim alone?", answer: "Yes — most gyms with the equipment allow it. You'll need access to a sled, ski erg, rower, sandbag, wall ball target, and at least 200 m of running space (or treadmill substitute)." },
      { question: "What's a good first-sim time?", answer: "Sub-100 (men) or sub-110 (women) is a strong first attempt for someone with 8-12 weeks of Hyrox-specific prep." },
    ],
    related: ["mini-hyrox-simulation", "hyrox-1k-repeats", "compromised-running-test"],
  },
  {
    slug: "mini-hyrox-simulation",
    name: "Mini Hyrox (4 + 4)",
    shortDescription: "Half-distance Hyrox simulation — 4 km running plus 4 stations. The standard mid-cycle benchmark workout.",
    whatItTests: "Mid-cycle race fitness, transition efficiency, and pacing without the full fatigue cost of a complete sim.",
    whoItIsFor: "Athletes 6-10 weeks from race day, or anyone wanting a regular Hyrox-format benchmark without 90 minutes of recovery cost.",
    durationMin: 45,
    durationLabel: "35-55 minutes",
    blocks: [
      { label: "Run 1", detail: "1 km running" },
      { label: "Station 1", detail: "500 m Ski Erg" },
      { label: "Run 2", detail: "1 km running" },
      { label: "Station 2", detail: "Sled Push 2 × 12.5 m at race weight" },
      { label: "Run 3", detail: "1 km running" },
      { label: "Station 3", detail: "500 m Rowing" },
      { label: "Run 4", detail: "1 km running" },
      { label: "Station 4", detail: "50 Wall Balls" },
    ],
    scoring: "Total elapsed time. Compare across cycles to track fitness gains.",
    benchmarkResults: [
      { tier: "Elite", menTime: "Sub-32", womenTime: "Sub-38" },
      { tier: "Competitive", menTime: "32-40", womenTime: "38-48" },
      { tier: "Good", menTime: "40-48", womenTime: "48-55" },
      { tier: "Beginner", menTime: "48+", womenTime: "55+" },
    ],
    programNotes: [
      "Use this every 2-3 weeks during a Hyrox prep block.",
      "Recovery cost is 2-3 days vs 5-7 for full sim.",
      "Track time per station and per run — identify limiters.",
    ],
    faqs: [
      { question: "Is mini Hyrox a good benchmark workout?", answer: "Yes — mini Hyrox is the gold-standard mid-cycle benchmark. It tests every Hyrox skill in a compressed format with manageable recovery cost. Use it every 2-3 weeks to track fitness." },
      { question: "How does mini Hyrox compare to full Hyrox?", answer: "Mini Hyrox time is roughly half your full Hyrox time, plus 2-4 minutes (the second half is harder due to fatigue). A 40-minute mini Hyrox typically maps to an 84-90 minute full Hyrox." },
    ],
    related: ["hyrox-simulation-workout", "compromised-running-test"],
  },
  {
    slug: "hyrox-1k-repeats",
    name: "Hyrox 1k Repeats",
    shortDescription: "8 × 1 km running with short rest — the gold-standard Hyrox running workout.",
    whatItTests: "Sustained running fitness at race pace plus repeatability under fatigue. Builds the specific 8-km capacity Hyrox demands.",
    whoItIsFor: "Any Hyrox athlete in the 6-12 week prep block. The single most important running workout for Hyrox.",
    durationMin: 60,
    durationLabel: "50-70 minutes including rest",
    blocks: [
      { label: "Warm-up", detail: "10 min easy jog + 4 × 100 m strides" },
      { label: "Repeat 1-8", detail: "1 km at goal Hyrox running pace, 90-120 seconds rest between" },
      { label: "Cool-down", detail: "10 min easy jog + mobility" },
    ],
    scoring: "Average pace across all 8 reps. Compare rep 1 to rep 8 — drop-off should be under 10 seconds per km.",
    benchmarkResults: [
      { tier: "Sub-60 Hyrox pace", menTime: "3:45-3:50/km", womenTime: "n/a" },
      { tier: "Sub-75 pace", menTime: "4:30/km", womenTime: "n/a" },
      { tier: "Sub-80 women pace", menTime: "n/a", womenTime: "4:30/km" },
      { tier: "Sub-90 pace", menTime: "5:15/km", womenTime: "n/a" },
      { tier: "Sub-90 women pace", menTime: "n/a", womenTime: "5:00/km" },
    ],
    programNotes: [
      "Run this 1× per week during prep block.",
      "Build to 8 reps over 4-6 weeks — start with 4-5 if you've never done it.",
      "Pace should match your Hyrox goal time, not your fastest 1k.",
      "Rest is short on purpose — Hyrox runs are interspersed with stations, not full recovery.",
    ],
    faqs: [
      { question: "What pace should I run 1k repeats for Hyrox?", answer: "Match your Hyrox goal pace, not your 5K pace. Sub-90 men: 5:15/km. Sub-75 men: 4:30/km. Sub-90 women: 5:00/km. Going faster sacrifices the specificity." },
      { question: "How many 1k repeats should I do?", answer: "Build to 8 reps to match Hyrox's 8 × 1 km structure. Start with 4-5 reps if you're new and add 1-2 per week." },
    ],
    related: ["hyrox-simulation-workout", "compromised-running-test", "200m-walking-lunges"],
  },
  {
    slug: "compromised-running-test",
    name: "Compromised Running Test (1k Run + Station + 1k Run)",
    shortDescription: "1 km run, then 100 wall balls (or chosen station), then immediately another 1 km run. Tests recovery from station fatigue.",
    whatItTests: "Ability to run fast after station fatigue — the key skill that separates Hyrox finishers by 5-15 minutes.",
    whoItIsFor: "Mid-prep athletes — typically used 4-8 weeks from race day to identify whether station fatigue is killing run pace.",
    durationMin: 25,
    durationLabel: "15-30 minutes",
    blocks: [
      { label: "Run 1", detail: "1 km at goal Hyrox pace" },
      { label: "Station", detail: "100 wall balls (or 4 × 12.5 m sled push at race weight)" },
      { label: "Run 2", detail: "1 km — try to match Run 1 pace" },
    ],
    scoring: "Time difference between Run 1 and Run 2. Under 10 seconds slower = strong; 30+ seconds slower = station fatigue is bottlenecking your race.",
    benchmarkResults: [
      { tier: "Strong (Run 2 ≤ Run 1 + 10 sec)", menTime: "Race-ready", womenTime: "Race-ready" },
      { tier: "Adequate (Run 2 + 10-30 sec)", menTime: "Build station endurance", womenTime: "Build station endurance" },
      { tier: "Weak (Run 2 + 30+ sec)", menTime: "Significant gap", womenTime: "Significant gap" },
    ],
    programNotes: [
      "Use weekly in mid-prep to track run-station-run capacity.",
      "If Run 2 is much slower, focus on aerobic recovery (Z2 volume) and station-specific fitness.",
      "Cycle through stations — wall balls, sled push, sandbag lunges all test different fatigue modes.",
    ],
    faqs: [
      { question: "What is a compromised running test for Hyrox?", answer: "A short workout that tests how fast you can run after station fatigue. Run 1k at race pace, do a hard station (100 wall balls or sled push), then run 1k again. The pace drop tells you whether station fatigue is your limiter." },
      { question: "How often should I do compromised running?", answer: "Once per week during mid-prep. Track the Run 1 vs Run 2 gap over time — closing that gap is one of the highest-value fitness gains for Hyrox." },
    ],
    related: ["hyrox-1k-repeats", "hyrox-simulation-workout", "100-wall-ball-test"],
  },
  {
    slug: "100-wall-ball-test",
    name: "100 Wall Ball Test",
    shortDescription: "Unbroken 100 wall ball reps for time at race weight (6 kg / 4 kg) and race target (10 ft / 9 ft).",
    whatItTests: "Wall ball-specific endurance — the most-feared Hyrox station for first-timers.",
    whoItIsFor: "Any Hyrox athlete preparing for race day. The wall ball is often where races are won or lost in the final 10 minutes.",
    durationMin: 8,
    durationLabel: "5-12 minutes",
    blocks: [
      { label: "Warm-up", detail: "10 air squats + 10 wall ball technique reps" },
      { label: "Test", detail: "100 wall balls for time at race weight (6 kg men / 4 kg women) and race target (10 ft men / 9 ft women)" },
    ],
    scoring: "Total time from rep 1 to rep 100. Tracks both unbroken capacity and broken-set pacing.",
    benchmarkResults: [
      { tier: "Elite", menTime: "Sub-5:00", womenTime: "Sub-5:30" },
      { tier: "Competitive", menTime: "5:00-7:00", womenTime: "5:30-7:30" },
      { tier: "Good", menTime: "7:00-9:00", womenTime: "7:30-9:30" },
      { tier: "Beginner", menTime: "9:00+", womenTime: "9:30+" },
    ],
    programNotes: [
      "Practice 1× per week during prep.",
      "Strategy: 25-25-25-25 with 6-second pauses is the most common race-day split.",
      "Tall athletes (6'2+) typically take 60-90 seconds longer than average — accept it, train it.",
      "Don't squat-only — the throw and the squat-back-up rhythm both fatigue.",
    ],
    faqs: [
      { question: "What's a good 100 wall ball time?", answer: "Sub-7 minutes (men) or sub-7:30 (women) is competitive. Sub-5 is elite. Sub-10 is solid for first-timers." },
      { question: "How do I improve my wall ball time?", answer: "Practice 100-rep sets weekly, broken into 25-25-25-25 with 6-second breaks. Build to unbroken 50-rep capacity over 4-6 weeks. Don't sacrifice form for speed." },
    ],
    related: ["hyrox-simulation-workout", "compromised-running-test"],
  },
  {
    slug: "2k-row-50-wall-balls",
    name: "2k Row + 50 Wall Balls",
    shortDescription: "A 2,000 m row immediately followed by 50 wall balls — a classic functional fitness benchmark adapted for Hyrox.",
    whatItTests: "Aerobic capacity (rowing) plus full-body station tolerance under fatigue (wall balls). Bridges Hyrox station 5 (rowing) to station 8 (wall balls).",
    whoItIsFor: "Hyrox athletes wanting a quick aerobic + station benchmark workout. Useful for tracking compound fitness across a prep cycle.",
    durationMin: 15,
    durationLabel: "10-20 minutes",
    blocks: [
      { label: "Warm-up", detail: "5 min easy row + 10 wall ball technique reps" },
      { label: "Block", detail: "2,000 m row, then immediately 50 wall balls (6 kg / 4 kg)" },
    ],
    scoring: "Total elapsed time including the transition.",
    benchmarkResults: [
      { tier: "Elite", menTime: "Sub-10:00", womenTime: "Sub-11:30" },
      { tier: "Competitive", menTime: "10:00-12:00", womenTime: "11:30-13:30" },
      { tier: "Good", menTime: "12:00-14:00", womenTime: "13:30-15:30" },
      { tier: "Beginner", menTime: "14:00+", womenTime: "15:30+" },
    ],
    programNotes: [
      "Use this every 2-3 weeks during prep block.",
      "Track row split and wall ball split independently to identify the limiter.",
      "If the wall ball is much slower than usual, your aerobic base needs work.",
    ],
    faqs: [
      { question: "What's a good 2k row + 50 wall balls time for Hyrox?", answer: "Sub-12 minutes (men) or sub-13:30 (women) is competitive. Sub-10 is elite. The row should be sub-7:30 (men) or sub-8:30 (women) to leave fitness for the wall balls." },
      { question: "How does this workout translate to Hyrox?", answer: "It tests the rowing-to-wall-ball fatigue chain — Hyrox station 5 is the 1k row and station 8 is 100 wall balls. While not adjacent in the race, both are aerobic-strength endurance tests." },
    ],
    related: ["hyrox-simulation-workout", "100-wall-ball-test"],
  },
  {
    slug: "200m-walking-lunges",
    name: "200 m Walking Lunges with Sandbag",
    shortDescription: "Continuous 200 m of walking lunges with a sandbag — 2× the Hyrox sandbag lunges distance to build fatigue tolerance.",
    whatItTests: "Quad and glute endurance under sustained sandbag load — the limiting factor for many sub-90 racers.",
    whoItIsFor: "Hyrox athletes 4-12 weeks from race day. The sandbag lunge is one of the highest-bleed stations on race day.",
    durationMin: 12,
    durationLabel: "8-18 minutes",
    blocks: [
      { label: "Warm-up", detail: "10 air squats + 20 bodyweight lunges" },
      { label: "Test", detail: "200 m walking lunges with sandbag at race weight (20 kg men / 10 kg women) — no setting it down" },
    ],
    scoring: "Total time. The challenge is to complete it without setting the sandbag down — a single drop reveals where your station endurance ends.",
    benchmarkResults: [
      { tier: "Elite", menTime: "Sub-8:00", womenTime: "Sub-9:00" },
      { tier: "Competitive", menTime: "8:00-11:00", womenTime: "9:00-12:00" },
      { tier: "Good", menTime: "11:00-14:00", womenTime: "12:00-15:00" },
      { tier: "Beginner", menTime: "14:00+", womenTime: "15:00+" },
    ],
    programNotes: [
      "Practice 1× per week during prep.",
      "Build to 200 m unbroken over 4-6 weeks if you can't manage it the first time.",
      "Race-day sandbag lunge is 100 m — completing 200 m in training builds the buffer.",
    ],
    faqs: [
      { question: "How do I train for Hyrox sandbag lunges?", answer: "Walking lunges with a sandbag at race weight, weekly. Build to 200 m unbroken over 4-6 weeks. Practice the 'small steps, knee touches gently, push through heel' rhythm." },
      { question: "Is 100 m of walking lunges hard?", answer: "Yes — sandbag lunges are one of the most-feared Hyrox stations. The 100 m race distance feels like 200 m at the end of a 70-minute race. Train the volume in advance." },
    ],
    related: ["hyrox-simulation-workout", "compromised-running-test"],
  },
];

export function getWorkout(slug: string): Workout | undefined {
  return WORKOUTS.find((w) => w.slug === slug);
}
