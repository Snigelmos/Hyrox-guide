/**
 * Hyrox training plans — programmatic data source for /training-plans/[slug] pages.
 *
 * Each plan composes sessions from training-sessions.ts into a week-by-week
 * schedule. Plans are organised across four query patterns search engines see:
 *
 *   1. Goal-time   — sub-60, sub-75, sub-90, sub-100 (men), sub-80, sub-90 (women)
 *   2. Duration    — 4-week, 8-week, 12-week
 *   3. Constraint  — 3-day-a-week, doubles partner training
 *
 * Schedules are Monday → Sunday. Each cell is a session id from training-sessions.ts.
 */

import type { TrainingSession } from "./training-sessions";
import { getSession } from "./training-sessions";

export type DayId = string;

export interface TrainingWeek {
  weekNumber: number;
  phase: string;
  focus: string;
  notes?: string;
  days: [DayId, DayId, DayId, DayId, DayId, DayId, DayId];
}

export interface TrainingPlan {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: "goal-time" | "duration" | "constraint" | "demographic";
  durationWeeks: number;
  sessionsPerWeek: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "elite";
  audienceLabel: string;
  goalSummary: string;
  athleteProfile: string;
  prerequisites: string[];
  intro: string;
  whyItWorks: string;
  weeks: TrainingWeek[];
  weeklyVolumeNotes: string[];
  commonMistakes: string[];
  faqs: { question: string; answer: string }[];
  relatedCalculatorSlug?: string;
  relatedWorkoutSlugs: string[];
  relatedBlogSlugs?: string[];
  relatedPlanSlugs?: string[];
}

const w = (
  weekNumber: number,
  phase: string,
  focus: string,
  days: TrainingWeek["days"],
  notes?: string
): TrainingWeek => ({ weekNumber, phase, focus, days, notes });

// =====================================================================
// Plan 1 — Sub-100 Hyrox training plan (8 weeks, 4 days/week)
// Audience: First-timers with general fitness aiming to break 1:40:00
// =====================================================================
const subOneHundred: TrainingPlan = {
  slug: "sub-100-hyrox-training-plan",
  title: "Sub-1:40 Hyrox Training Plan",
  metaTitle: "Sub-100 Hyrox Training Plan — 8 Weeks, 4 Days a Week",
  metaDescription:
    "Free 8-week sub-1:40 Hyrox training plan for first-timers with general fitness. 4 sessions per week, week-by-week schedule, race-day taper included.",
  category: "goal-time",
  durationWeeks: 8,
  sessionsPerWeek: "4",
  difficulty: "beginner",
  audienceLabel: "Open Men · First-timer",
  goalSummary:
    "Cross the line under 1 hour 40 minutes — a confident first-time finish that puts you mid-pack in most Open Men waves.",
  athleteProfile:
    "You can run 5 km without stopping, you train in a gym 1-2 times a week, and you're 8 weeks out from your first Hyrox. You don't need to be fast yet — you need to be specific.",
  prerequisites: [
    "Can run 5 km continuously",
    "Comfortable squatting your bodyweight",
    "Access to a gym with a sled, ski erg, rower and wall ball target",
    "8 weeks of clear calendar before race day",
  ],
  intro:
    "Sub-1:40 Hyrox is the realistic first-race target for most Open Men with general fitness. It puts you in the meaty part of the bell curve — finishing ahead of about 30-40% of the field — and it's achievable in 8 weeks of focused, race-specific training.",
  whyItWorks:
    "First-timers fail Hyrox by treating it like a gym workout or a 10 km race — it is neither. This plan keeps your weekly running volume low (you already have base fitness) and spends the saved hours on the only thing that matters: practising the eight stations under fatigue, in race order, at race weights. By race day you will have completed at least one mini-Hyrox and one three-quarter simulation, so the format is no longer a surprise.",
  weeks: [
    w(1, "Foundation", "Learn the movements", ["easy-z2-30", "rest", "station-circuit", "rest", "strength-full", "long-z2-75", "rest"], "Light week. Focus on technique on every station — bad form here will haunt you in week 6."),
    w(2, "Foundation", "Layer in pace", ["easy-z2-30", "mobility-30", "tempo-3x10", "rest", "strength-full", "long-z2-75", "rest"]),
    w(3, "Build", "First taste of intensity", ["easy-z2-45", "mobility-30", "tempo-3x10", "rest", "sled-volume", "long-z2-75", "rest"]),
    w(4, "Build", "Stations under fatigue", ["easy-z2-45", "mobility-30", "tempo-3x10", "rest", "compromised-mini", "long-z2-75", "rest"]),
    w(5, "Build", "Race-pace running", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "rest", "sled-volume", "long-z2-90", "rest"]),
    w(6, "Peak", "First simulation", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "rest", "mini-hyrox", "long-z2-75", "rest"], "Your mini-Hyrox time × 2 ≈ projected finish. Aim for 50-55 minutes."),
    w(7, "Peak", "Three-quarter dress rehearsal", ["easy-z2-30", "rest", "1k-repeats-6x", "rest", "three-quarter-hyrox", "recovery-walk", "rest"]),
    w(8, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"], "Cut volume by 60%. Sleep is the highest-leverage thing you can do this week."),
  ],
  weeklyVolumeNotes: [
    "Total weekly run volume: 15-25 km — deliberately low. You're not training for a 10K.",
    "Strength: 1-2 sessions/week. Enough to build sled-push capacity without burying your runs.",
    "Hyrox-specific: 1 sled or simulation session/week. This is non-negotiable.",
  ],
  commonMistakes: [
    "Running too far. Sub-100 athletes don't lose minutes to running fitness — they lose them on the sled and at wall balls. Run smart, train stations.",
    "Skipping mini-Hyrox in week 6. If you've never done a half-race, the full-distance feel will catch you off guard at minute 40.",
    "Doing zone 2 too hard. Z2 means you can hold a conversation. If you're huffing, you're in zone 3 and accumulating junk fatigue.",
  ],
  faqs: [
    { question: "Is sub-1:40 Hyrox good for a first-timer?", answer: "Yes. Sub-1:40 puts a first-time Open Men finisher in roughly the 60th percentile — comfortably mid-pack. It's the right balance of ambitious and achievable for someone with general fitness who hasn't trained Hyrox-specifically." },
    { question: "Can I do this plan if I've never used a ski erg or sled?", answer: "Yes — that's why weeks 1 and 2 are dedicated to learning the movements. Watch a technique video for each station before week 1 and ask a coach at your gym to check your sled push and pull on day 1." },
    { question: "What if I miss a session?", answer: "Skip it and continue. Don't double up the next day or try to make up missed long runs. Consistency over weeks beats heroics within a week." },
    { question: "Should I pick Open or Pro for my first Hyrox?", answer: "Open. Pro weights and reps are 50-60% harder for first-timers and you'll learn far more from completing an Open race than DNF-ing a Pro." },
  ],
  relatedCalculatorSlug: "sub-100-hyrox",
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "mini-hyrox-simulation", "hyrox-1k-repeats"],
  relatedBlogSlugs: ["first-hyrox-race-guide", "is-sub-90-hyrox-good"],
  relatedPlanSlugs: ["sub-90-hyrox-training-plan", "8-week-hyrox-training-plan"],
};

// =====================================================================
// Plan 2 — Sub-90 Hyrox training plan (12 weeks, 5 days/week)
// Audience: Open Men with one race under their belt aiming to break 1:30:00
// =====================================================================
const subNinety: TrainingPlan = {
  slug: "sub-90-hyrox-training-plan",
  title: "Sub-1:30 Hyrox Training Plan",
  metaTitle: "Sub-90 Hyrox Training Plan — 12 Weeks, 5 Days a Week",
  metaDescription:
    "Free 12-week sub-1:30 Hyrox training plan. 5 sessions per week with running, strength, sled volume, and full race simulation. Built for sub-90 Open Men.",
  category: "goal-time",
  durationWeeks: 12,
  sessionsPerWeek: "5",
  difficulty: "intermediate",
  audienceLabel: "Open Men · 1 race completed",
  goalSummary:
    "Break 1 hour 30 minutes — top 25-30% of Open Men. The first true 'good time' threshold most Hyrox athletes target.",
  athleteProfile:
    "You've finished at least one Hyrox between 1:35 and 1:50 and want to break 1:30. You can run 10 km at 5:30/km, deadlift 1.5× bodyweight, and have access to all Hyrox equipment.",
  prerequisites: [
    "Completed at least one Hyrox or trained for 6+ months",
    "Run 10 km in under 55 minutes",
    "Comfortable with all 8 Hyrox stations",
    "12 weeks of consistent training time available",
  ],
  intro:
    "Sub-90 is the threshold where Hyrox starts feeling like a real sport rather than a survival event. This 12-week plan is structured around the only thing that drops your time at this level: race-pace running with stations layered in. Five sessions a week, four phases, one full simulation in week 11.",
  whyItWorks:
    "Athletes plateau at 1:35-1:45 because they bring 10K running fitness to a Hyrox event. Sub-90 requires 5:00/km running on tired legs — not 4:30/km on fresh ones. The plan's hard sessions (1k repeats, compromised running, mini-Hyrox) train exactly that ability. The strength work targets the sled push and lunges, where most sub-90 attempts fall apart in the back half.",
  weeks: [
    w(1, "Base", "Aerobic foundation", ["easy-z2-30", "rest", "tempo-3x10", "strength-lower", "station-circuit", "long-z2-75", "rest"]),
    w(2, "Base", "Add station volume", ["easy-z2-45", "mobility-30", "tempo-3x10", "strength-station", "sled-volume", "long-z2-75", "rest"]),
    w(3, "Base", "Threshold introduction", ["easy-z2-45", "rest", "tempo-5x1k", "strength-lower", "sled-volume", "long-z2-90", "mobility-30"]),
    w(4, "Base", "Recovery & retest", ["easy-z2-30", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload week. Run a 5K time trial Saturday instead of long run if you want a benchmark."),
    w(5, "Build", "Race-pace running", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-lower", "sled-volume", "long-z2-90", "recovery-walk"]),
    w(6, "Build", "Compromised running", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-station", "compromised-mini", "long-z2-90", "rest"]),
    w(7, "Build", "Volume peak", ["easy-z2-60", "rest", "1k-repeats-8x", "strength-station", "sled-heavy", "long-z2-90", "recovery-walk"]),
    w(8, "Build", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. Run a Hyrox 1k repeats test Saturday — target 4:00-4:15/km average."),
    w(9, "Peak", "First simulation", ["easy-z2-45", "rest", "1k-repeats-8x", "strength-station", "mini-hyrox", "long-z2-90", "recovery-walk"]),
    w(10, "Peak", "Three-quarter sim", ["easy-z2-45", "mobility-30", "1k-repeats-8x", "strength-full", "three-quarter-hyrox", "long-z2-75", "rest"]),
    w(11, "Peak", "Full dress rehearsal", ["easy-z2-30", "rest", "1k-repeats-6x", "strength-station", "full-hyrox-sim", "recovery-walk", "rest"], "Full Hyrox sim Friday. Result is your race-day predictor — within ±3 minutes."),
    w(12, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly running volume: 35-50 km in build weeks. Most of this is easy.",
    "Strength: 2 sessions/week — 1 lower-body, 1 station-specific.",
    "Hyrox-specific work: 1-2 sessions/week (sled, compromised running, simulation).",
  ],
  commonMistakes: [
    "Treating 1k repeats as a 5K time trial. Goal pace = your sub-90 race pace (~4:30-4:50/km), not your 5K PB pace.",
    "Skipping the deload weeks. Weeks 4 and 8 are when the previous block actually sticks. Don't 'feel good' your way through them.",
    "One full sim 4 weeks out, not 1 week out. A full simulation in week 12 will compromise race day; week 11 is the latest it should appear.",
  ],
  faqs: [
    { question: "Can I do this plan in 10 weeks instead of 12?", answer: "Yes — drop weeks 1 and 2 if you're already running 25-30 km/week comfortably. Don't skip the build or peak phases." },
    { question: "What 5K time correlates with sub-90 Hyrox?", answer: "Roughly 21-23 minutes for Open Men. If you're slower than 24 minutes, focus 70% of your training on running fitness for 6 weeks before starting this plan." },
    { question: "Do I need to do 1k repeats on a treadmill?", answer: "No, but treadmill is the most accurate way to hold race pace because Hyrox running is on a treadmill on race day. Do at least half your race-pace sessions on a treadmill." },
    { question: "How heavy should my sled be in training?", answer: "Race weight (152 kg push / 103 kg pull). On heavy sled days, add 20 kg. Anything lighter doesn't build the right neuromuscular pattern." },
  ],
  relatedCalculatorSlug: "sub-90-hyrox",
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "mini-hyrox-simulation", "hyrox-1k-repeats", "compromised-running-test"],
  relatedBlogSlugs: ["is-sub-90-hyrox-good", "best-hyrox-pacing-strategy"],
  relatedPlanSlugs: ["sub-100-hyrox-training-plan", "sub-75-hyrox-training-plan", "12-week-hyrox-training-plan"],
};

// =====================================================================
// Plan 3 — Sub-75 Hyrox training plan (12 weeks, 6 days/week)
// Audience: Strong Open or Pro Men aiming to break 1:15:00
// =====================================================================
const subSeventyFive: TrainingPlan = {
  slug: "sub-75-hyrox-training-plan",
  title: "Sub-70 to Sub-75 Hyrox Training Plan",
  metaTitle: "Sub-70 to Sub-75 Hyrox Training Plan — 12 Weeks, 6 Days a Week",
  metaDescription:
    "Free 12-week sub-70 to sub-75 Hyrox training plan. 6 sessions per week with VO₂ max work, heavy sled volume, full simulation, and race-week taper. Built for top-10% Open Men or Pro Men chasing a sub-1:15 (sub-75) or sub-1:10 (sub-70) finish.",
  category: "goal-time",
  durationWeeks: 12,
  sessionsPerWeek: "6",
  difficulty: "advanced",
  audienceLabel: "Open Men (top 10%) or Pro Men",
  goalSummary:
    "Break 1 hour 15 minutes (sub-75) or push toward a sub-70 finish — top 5-10% of Open Men or a competitive Pro Men time. Requires 4:00-4:10/km running and unbroken station execution.",
  athleteProfile:
    "You've raced Hyrox between 1:18 and 1:30, run a sub-19 5K, and squat 1.75× bodyweight. You're chasing a sub-70 or sub-75 finish, a podium age-group result, or Pro qualification.",
  prerequisites: [
    "At least 2 Hyrox races completed",
    "Sub-19 5K and sub-40 10K",
    "Squat 1.75× bodyweight, deadlift 2× bodyweight",
    "Can train 6 days/week with one easy day",
  ],
  intro:
    "Sub-70 to sub-75 is where Hyrox transitions from 'I trained for this' to 'I'm racing this.' This 12-week plan adds VO₂ max work, heavier sled volume above race weight, and bigger long runs to build the engine that holds 4:00-4:10/km pace through 8 km of stations. Six sessions per week, four phases, one full simulation. Athletes already running a 1:13-1:15 use the upper end of every prescribed pace and target sub-70.",
  whyItWorks:
    "At sub-75, you can't out-strength your way to the time — you need top-end VO₂ max and the ability to sustain it under load. The plan's threshold and 8×1k workouts develop the aerobic ceiling; heavy sled and station-specific strength preserve neuromuscular efficiency at race weights; long runs build the durability that makes the back half (lunges + wall balls) finishable at race pace.",
  weeks: [
    w(1, "Base", "Build aerobic ceiling", ["easy-z2-45", "mobility-30", "tempo-5x1k", "strength-lower", "sled-volume", "long-z2-90", "recovery-walk"]),
    w(2, "Base", "Add station volume", ["easy-z2-45", "mobility-30", "tempo-5x1k", "strength-station", "compromised-mini", "long-z2-90", "recovery-walk"]),
    w(3, "Base", "VO₂ work", ["easy-z2-60", "mobility-30", "tempo-6x800", "strength-lower", "sled-volume", "long-z2-90", "easy-z2-30"]),
    w(4, "Base", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. 5K time trial Saturday — sub-19:30 confirms you're on track."),
    w(5, "Build", "Race-pace volume", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-lower", "sled-heavy", "long-z2-90", "easy-z2-30"]),
    w(6, "Build", "Big aerobic week", ["easy-z2-60", "mobility-30", "1k-repeats-8x", "strength-station", "compromised-mini", "long-z2-90", "easy-z2-30"]),
    w(7, "Build", "Volume peak", ["easy-z2-60", "mobility-30", "1k-repeats-8x", "strength-station", "sled-heavy", "long-z2-90", "easy-z2-45"]),
    w(8, "Build", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. 8×1k repeats Saturday — target 3:50-4:00/km."),
    w(9, "Peak", "First simulation", ["easy-z2-45", "mobility-30", "1k-repeats-8x", "strength-station", "mini-hyrox", "long-z2-90", "easy-z2-45"]),
    w(10, "Peak", "Three-quarter sim", ["easy-z2-60", "mobility-30", "1k-repeats-8x", "strength-station", "three-quarter-hyrox", "long-z2-90", "easy-z2-30"]),
    w(11, "Peak", "Full dress rehearsal", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-full", "full-hyrox-sim", "recovery-walk", "rest"], "Full sim Friday at 95% effort. Within ±3 min of your race-day target."),
    w(12, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly run volume: 50-65 km in build weeks. ~70% easy, 20% moderate, 10% hard.",
    "Strength: 2 sessions/week. Heavy compound + station-specific.",
    "Hyrox-specific: 2 sessions/week (heavy sled, compromised running, or simulation).",
  ],
  commonMistakes: [
    "Running too hard on easy days. At this volume you cannot afford to push every run — most should feel boring.",
    "Skipping VO₂ work because 'Hyrox is endurance.' Sub-75 needs a 60+ ml/kg/min VO₂ max. 6×800 m at 5K pace is what builds it.",
    "Cramming a second full sim in the taper. One full sim in week 11 is sufficient. A second risks fatigue you can't recover from in 7 days.",
  ],
  faqs: [
    { question: "Can this plan get me a sub-70 Hyrox?", answer: "Yes, if you start the block already running 1:13-1:15. Sub-70 needs ~4:00/km running and station splits at the lower end of every range in the plan. If you are coming from 1:20+, target sub-75 first using the same template, then run another 12 weeks at the sub-70 paces." },
    { question: "Is sub-70 or sub-75 Hyrox a good time?", answer: "Sub-75 is top 5-10% of Open Men globally; sub-70 is top 2-3% and competitive at any major race. Both are qualifying-quality for Pro division. For Pro, expect to need closer to 1:05 to qualify for Worlds." },
    { question: "Should I race Pro instead of Open at sub-70 or sub-75?", answer: "If you can break 1:15 in Open you can likely finish Pro in 1:25-1:35. Try a Pro race after your first sub-75 result; if you have already raced sub-70 in Open, Pro qualification is in reach." },
    { question: "How important is body weight at sub-70 or sub-75?", answer: "Very. Athletes who break 1:15 are typically 75-85 kg with low body fat. Excess weight punishes you on lunges, burpees and wall balls. Don't crash diet — slim sustainably 8-12 weeks out." },
    { question: "Can I add a second strength session in the build phase?", answer: "Only if you're recovering well. The plan deliberately limits strength to 2 sessions because aerobic work is the rate-limiter at this level — adding a third strength day usually compromises threshold quality." },
  ],
  relatedCalculatorSlug: "sub-75-hyrox",
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "hyrox-1k-repeats", "compromised-running-test", "100-wall-ball-test"],
  relatedBlogSlugs: ["is-sub-75-hyrox-good", "is-sub-70-hyrox-good"],
  relatedPlanSlugs: ["sub-90-hyrox-training-plan", "sub-60-hyrox-training-plan"],
};

// =====================================================================
// Plan 4 — Sub-60 Hyrox training plan (12 weeks, 7 days/week)
// Audience: Elite athletes aiming for World Championship qualification
// =====================================================================
const subSixty: TrainingPlan = {
  slug: "sub-60-hyrox-training-plan",
  title: "Sub-1:00 Hyrox Training Plan",
  metaTitle: "Sub-60 Hyrox Training Plan — 12 Weeks, Elite Programming",
  metaDescription:
    "Free 12-week sub-60 Hyrox training plan for elite athletes chasing world-championship qualification. 7 days/week with double sessions, heavy simulation work, and pro-level taper.",
  category: "goal-time",
  durationWeeks: 12,
  sessionsPerWeek: "7 (with optional doubles)",
  difficulty: "elite",
  audienceLabel: "Pro Men · Elite",
  goalSummary:
    "Break 1 hour — Hyrox elite territory. Top 50 globally and within reach of Pro World Championship qualification.",
  athleteProfile:
    "You're a former endurance or strength athlete already racing Hyrox between 1:02 and 1:08, running sub-17 5K, and lifting in the 90th percentile for your weight class. You can train 7 days/week with appropriate recovery infrastructure.",
  prerequisites: [
    "Multiple Hyrox races completed in the 1:02-1:10 range",
    "Sub-17 5K, sub-36 10K, sub-1:20 half-marathon",
    "Squat 2× bodyweight, deadlift 2.25× bodyweight",
    "Access to 7-days-a-week training time and recovery (sleep, nutrition, sports massage)",
  ],
  intro:
    "Sub-1:00 Hyrox sits at the elite ceiling — fewer than 1% of competitors hit it. This plan assumes you have all the prerequisites and treats training as your job: 12 weeks, 7 days, threshold + VO₂ + heavy sled + race simulations stacked with surgical recovery.",
  whyItWorks:
    "At sub-60 you must average 3:40/km running, complete each station in under 4:30, and burn through Roxzone in <30 seconds per transition. The plan's overload structure (heavy sled, compromised mini-Hyrox, three-quarter and full sims) trains every system to work near red-line for 60 minutes — and the deloads keep the system building rather than breaking.",
  weeks: [
    w(1, "Base", "Aerobic foundation", ["easy-z2-60", "strength-lower", "tempo-5x1k", "mobility-30", "sled-volume", "long-z2-90", "easy-z2-45"]),
    w(2, "Base", "Layer specific work", ["easy-z2-60", "strength-station", "tempo-5x1k", "mobility-30", "sled-volume", "long-z2-90", "easy-z2-45"]),
    w(3, "Base", "VO₂ block", ["easy-z2-60", "strength-lower", "tempo-6x800", "mobility-30", "sled-heavy", "long-z2-120", "easy-z2-45"]),
    w(4, "Base", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-90", "rest"], "Deload. 5K time trial — confirm sub-17:00."),
    w(5, "Build", "Race-pace volume", ["easy-z2-60", "strength-lower", "1k-repeats-8x", "mobility-30", "sled-heavy", "long-z2-120", "easy-z2-45"]),
    w(6, "Build", "Compromised mini block", ["easy-z2-60", "strength-station", "1k-repeats-8x", "mobility-30", "compromised-mini", "long-z2-120", "easy-z2-60"]),
    w(7, "Build", "Volume peak", ["easy-z2-60", "strength-station", "1k-repeats-8x", "mobility-30", "sled-heavy", "long-z2-120", "easy-z2-60"]),
    w(8, "Build", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-90", "rest"], "Deload. 8×1k repeats — target sub-3:30/km average."),
    w(9, "Peak", "First sim", ["easy-z2-60", "strength-station", "1k-repeats-8x", "mobility-30", "mini-hyrox", "long-z2-120", "easy-z2-45"]),
    w(10, "Peak", "Three-quarter sim", ["easy-z2-60", "strength-full", "1k-repeats-8x", "mobility-30", "three-quarter-hyrox", "long-z2-90", "easy-z2-45"]),
    w(11, "Peak", "Full dress rehearsal", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-station", "full-hyrox-sim", "recovery-walk", "rest"], "Full sim Friday. Target ≤61 minutes — race day will be 1-2% faster with adrenaline and field."),
    w(12, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly run volume: 65-85 km in build weeks. 80% easy, 15% threshold, 5% VO₂.",
    "Strength: 2 quality sessions/week. Don't add more — recovery is the constraint.",
    "Hyrox-specific: 2-3 sessions/week. Sleep ≥8 hours/night and consume 1.6-2.0 g protein/kg.",
  ],
  commonMistakes: [
    "Adding workouts. The plan is already at 7 sessions — overload comes from intensity, not frequency.",
    "Underfueling. At this volume you need 4,000-5,000 kcal/day. Inadequate carbs collapses VO₂ workouts within 3 weeks.",
    "Racing a tune-up Hyrox in week 7 or 8. A real race spike will compromise the build phase. Save the second race for after your goal race.",
  ],
  faqs: [
    { question: "Can I qualify for Hyrox World Championships with sub-60?", answer: "Sub-60 Open is well above the qualification cut-off but Pro qualification requires ranking-list points. Sub-60 in Pro division is genuinely elite and likely above the cut. Check the latest qualifier rules each season." },
    { question: "How does this plan fit around a full-time job?", answer: "Tightly. Most sub-60 athletes train at 6 am, do strength after work, and put long runs on Saturday. If your weekly schedule won't allow this, target sub-75 first and build to sub-60 over 18-24 months." },
    { question: "Should I do altitude training?", answer: "If you can access it — yes, particularly in weeks 5-7. 14-21 days at 2,200-2,500 m followed by 7-10 days at sea level before race day adds 1-2% to most well-trained athletes' performance." },
  ],
  relatedCalculatorSlug: "sub-60-hyrox",
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "hyrox-1k-repeats", "compromised-running-test"],
  relatedBlogSlugs: ["is-sub-60-hyrox-good", "is-sub-70-hyrox-good"],
  relatedPlanSlugs: ["sub-75-hyrox-training-plan"],
};

// =====================================================================
// Plan 5 — Sub-90 Women Hyrox training plan (12 weeks, 5 days/week)
// =====================================================================
const subNinetyWomen: TrainingPlan = {
  slug: "sub-90-women-hyrox-training-plan",
  title: "Sub-1:30 Hyrox Training Plan for Women",
  metaTitle: "Sub-90 Hyrox Training Plan for Women — 12 Weeks, 5 Days a Week",
  metaDescription:
    "Free 12-week sub-1:30 Hyrox training plan for Open Women. 5 sessions per week with race-pace running, women's race-weight sled volume, and full simulation. Built for top-15% Open Women.",
  category: "goal-time",
  durationWeeks: 12,
  sessionsPerWeek: "5",
  difficulty: "advanced",
  audienceLabel: "Open Women",
  goalSummary:
    "Break 1 hour 30 minutes for Open Women — top 15% globally. The competitive 'good time' threshold for Hyrox women.",
  athleteProfile:
    "You're an Open Women athlete who has raced 1:35-1:50 and wants to crack 1:30. You can run 10 km in under 55 minutes and you've completed at least one Hyrox.",
  prerequisites: [
    "At least one Hyrox race completed (Open Women)",
    "Run 10 km in under 55 minutes",
    "Comfortable with all 8 stations at race weights (sled push 102 kg, pull 78 kg)",
    "12 weeks of training time available",
  ],
  intro:
    "Sub-1:30 in Open Women requires the same race-pace running ability as sub-90 men but with a different station bottleneck — the women's sled is proportionally heavier relative to bodyweight, so sled volume is non-negotiable. This plan front-loads sled work in the base phase and layers race-pace running through the build and peak phases.",
  whyItWorks:
    "Sub-90 women lose more time on sled push and farmers carry than men do — the women's race weights are approximately 67-70% of men's, but average women's strength is ~60% of men's. Closing this gap requires structured strength + sled work, which this plan prioritises. Race-pace running at 5:00-5:15/km becomes the second focus once the strength foundation is built.",
  weeks: [
    w(1, "Base", "Aerobic + sled foundation", ["easy-z2-30", "rest", "tempo-3x10", "strength-lower", "sled-volume", "long-z2-75", "rest"]),
    w(2, "Base", "Heavy lower body", ["easy-z2-45", "mobility-30", "tempo-3x10", "strength-station", "sled-volume", "long-z2-75", "rest"]),
    w(3, "Base", "Threshold introduction", ["easy-z2-45", "rest", "tempo-5x1k", "strength-lower", "sled-volume", "long-z2-90", "mobility-30"]),
    w(4, "Base", "Recovery & retest", ["easy-z2-30", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. 100 wall ball test Saturday — sub-7 minutes is sub-90 territory."),
    w(5, "Build", "Race-pace running", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-lower", "sled-volume", "long-z2-90", "recovery-walk"]),
    w(6, "Build", "Compromised running", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-station", "compromised-mini", "long-z2-90", "rest"]),
    w(7, "Build", "Heavy sled + volume", ["easy-z2-60", "rest", "1k-repeats-8x", "strength-station", "sled-heavy", "long-z2-90", "recovery-walk"]),
    w(8, "Build", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. 6×1k Hyrox repeats Saturday — target sub-4:55/km average."),
    w(9, "Peak", "First simulation", ["easy-z2-45", "rest", "1k-repeats-8x", "strength-station", "mini-hyrox", "long-z2-90", "recovery-walk"]),
    w(10, "Peak", "Three-quarter sim", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-full", "three-quarter-hyrox", "long-z2-75", "rest"]),
    w(11, "Peak", "Full dress rehearsal", ["easy-z2-30", "rest", "1k-repeats-6x", "strength-station", "full-hyrox-sim", "recovery-walk", "rest"]),
    w(12, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly run volume: 30-45 km in build weeks. ~75% easy.",
    "Strength: 2 sessions/week — 1 lower-body heavy, 1 station-specific.",
    "Hyrox-specific: 1-2 sessions/week (sled volume, compromised running, simulation).",
  ],
  commonMistakes: [
    "Going too light on sled push training. Train at race weight (102 kg) — anything lighter doesn't transfer.",
    "Skipping the wall ball test. Sub-90 women need to complete 100 wall balls in <7 minutes; if you can't, that's where to focus the next training block.",
    "Treating the sub-90 men's plan as a copy-paste. Women's sub-90 has a different station-running balance — this plan is calibrated for it.",
  ],
  faqs: [
    { question: "What 5K time matches sub-90 Open Women Hyrox?", answer: "Roughly 23-25 minutes. If you're slower than 26 minutes, spend 6 weeks on running fitness before starting this plan." },
    { question: "Can a woman who has never raced Hyrox follow this plan?", answer: "It's possible if you have strong general fitness, but the sub-100 plan is more appropriate. Sub-90 assumes you've already learned the stations and pacing." },
    { question: "What's a realistic sled push pace for sub-90 women?", answer: "Around 1:40-1:50 for the full 4×12.5 m at race weight. Practise breaking the push into clean 12.5 m efforts with short rests rather than slogging the full 50 m unbroken." },
    { question: "Do I need different training when menstruating?", answer: "Most evidence shows no need for cycle-based programming changes for performance, but you may feel best modulating intensity in the late luteal phase if you experience PMS-related fatigue. Track and adjust based on your data, not blanket rules." },
  ],
  relatedCalculatorSlug: "sub-90-hyrox-women",
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "mini-hyrox-simulation", "100-wall-ball-test"],
  relatedBlogSlugs: ["hyrox-for-small-framed-women", "hyrox-for-women-over-40"],
  relatedPlanSlugs: ["sub-80-women-hyrox-training-plan", "12-week-hyrox-training-plan"],
};

// =====================================================================
// Plan 6 — Sub-80 Women Hyrox training plan (12 weeks, 6 days/week)
// =====================================================================
const subEightyWomen: TrainingPlan = {
  slug: "sub-80-women-hyrox-training-plan",
  title: "Sub-1:20 Hyrox Training Plan for Women",
  metaTitle: "Sub-80 Hyrox Training Plan (Women + Men) — 12 Weeks, 6 Days a Week",
  metaDescription:
    "Free 12-week sub-80 Hyrox training plan. Built for Pro Women or top-5% Open Women, with adaptations for Open Men chasing a sub-80 finish. 6 sessions/week with VO₂ work, heavy sled, and full simulation.",
  category: "goal-time",
  durationWeeks: 12,
  sessionsPerWeek: "6",
  difficulty: "advanced",
  audienceLabel: "Pro Women or Open Women (top 5%)",
  goalSummary:
    "Break 1 hour 20 minutes — top 5% Open Women globally or competitive Pro Women. Podium quality at most regional Hyrox events.",
  athleteProfile:
    "You're racing 1:22-1:30 in Open Women or 1:30-1:40 in Pro Women, running sub-22 5K, and squatting 1.4× bodyweight. You're chasing podium positions or Pro qualification.",
  prerequisites: [
    "At least 2 Hyrox races completed",
    "Sub-22 5K and sub-46 10K",
    "Squat 1.4× bodyweight",
    "6 days/week training availability with adequate recovery",
  ],
  intro:
    "Sub-1:20 for women is the threshold where Hyrox becomes a competition rather than a workout. This 12-week plan layers VO₂ max work, heavy sled training, and bigger long runs onto a strength base. Six sessions per week, four phases, one full simulation in week 11. Open Men chasing a literal sub-80 finish can also run this plan: keep all the running paces the same and bump the sled, farmers carry, sandbag, and wall-ball weights to the Open Men's race standard (152 kg sled push, 2×24 kg kettlebells, 20 kg sandbag, 6 kg wall ball).",
  whyItWorks:
    "Sub-80 women combine sub-23 minute 5K running fitness with the strength to push 102 kg sled near-unbroken. The plan's threshold and 8×1k workouts develop the aerobic ceiling; heavy sled and station-specific strength preserve neuromuscular efficiency at race weight; long runs build the durability that holds 4:50/km pace through the back half of the race.",
  weeks: [
    w(1, "Base", "Aerobic + sled foundation", ["easy-z2-45", "mobility-30", "tempo-5x1k", "strength-lower", "sled-volume", "long-z2-90", "recovery-walk"]),
    w(2, "Base", "Add station volume", ["easy-z2-45", "mobility-30", "tempo-5x1k", "strength-station", "compromised-mini", "long-z2-90", "recovery-walk"]),
    w(3, "Base", "VO₂ work", ["easy-z2-60", "mobility-30", "tempo-6x800", "strength-lower", "sled-volume", "long-z2-90", "easy-z2-30"]),
    w(4, "Base", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. 5K time trial Saturday — sub-22:00 confirms you're on track."),
    w(5, "Build", "Race-pace volume", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-lower", "sled-heavy", "long-z2-90", "easy-z2-30"]),
    w(6, "Build", "Compromised + heavy", ["easy-z2-60", "mobility-30", "1k-repeats-8x", "strength-station", "compromised-mini", "long-z2-90", "easy-z2-30"]),
    w(7, "Build", "Volume peak", ["easy-z2-60", "mobility-30", "1k-repeats-8x", "strength-station", "sled-heavy", "long-z2-90", "easy-z2-45"]),
    w(8, "Build", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. 8×1k repeats Saturday — target sub-4:30/km average."),
    w(9, "Peak", "First simulation", ["easy-z2-45", "mobility-30", "1k-repeats-8x", "strength-station", "mini-hyrox", "long-z2-90", "easy-z2-45"]),
    w(10, "Peak", "Three-quarter sim", ["easy-z2-60", "mobility-30", "1k-repeats-8x", "strength-station", "three-quarter-hyrox", "long-z2-90", "easy-z2-30"]),
    w(11, "Peak", "Full dress rehearsal", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-full", "full-hyrox-sim", "recovery-walk", "rest"]),
    w(12, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly run volume: 45-60 km in build weeks.",
    "Strength: 2 sessions/week. Heavy compound + station-specific.",
    "Hyrox-specific: 2 sessions/week (heavy sled, compromised running, simulation).",
  ],
  commonMistakes: [
    "Underestimating the sled gap. At sub-80 women's pace, the sled push must be done in 1:30-1:45 for race weight. If you're at 2:30+, that's the priority.",
    "Skipping VO₂ work. 6×800 m at 5K pace is what builds the ceiling for sub-4:30/km running.",
    "Doing the sub-90 women's plan and 'pushing harder.' The sub-80 build phase has more volume and more VO₂ work — copy the right plan, don't ad-lib.",
  ],
  faqs: [
    { question: "Is sub-80 a good Hyrox time for women?", answer: "Yes — top 5% Open Women globally and competitive Pro Women. It's a podium-quality time at most regional events and a qualifying-quality time for Pro Worlds in many regions." },
    { question: "Can men use this plan to chase a sub-80 Hyrox?", answer: "Yes. Open Men coming from a 1:25-1:30 race can follow the same six-day structure to target sub-80, but lift the sled push to 152 kg, the farmers carry to 2×24 kg, the sandbag to 20 kg, and the wall ball to 6 kg. The running and threshold paces stay the same — sub-80 still requires sub-22 minute 5K fitness regardless of gender." },
    { question: "Should I race Pro instead of Open?", answer: "If you can break 1:20 Open, Pro is realistic — expect 1:30-1:40 in Pro division. Race Pro if your goal is competition; race Open if your goal is the time itself." },
    { question: "How heavy should my sled training weight be?", answer: "Women: race weight (102 kg push, 78 kg pull) for normal sled volume; race weight + 15 kg on heavy sled days. Men using this plan for sub-80: 152 kg push, 103 kg pull at race weight; +15 kg on heavy sled days. Skip lighter weights — they don't build the right pattern." },
  ],
  relatedCalculatorSlug: "sub-80-hyrox-women",
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "hyrox-1k-repeats", "100-wall-ball-test"],
  relatedBlogSlugs: ["hyrox-for-women-over-40", "is-sub-75-hyrox-good"],
  relatedPlanSlugs: ["sub-90-women-hyrox-training-plan"],
};

// =====================================================================
// Plan 7 — 4-week Hyrox training plan (last-minute)
// =====================================================================
const fourWeek: TrainingPlan = {
  slug: "4-week-hyrox-training-plan",
  title: "4-Week Hyrox Training Plan",
  metaTitle: "4-Week Hyrox Training Plan — Last-Minute Race Prep",
  metaDescription:
    "Last-minute 4-week Hyrox training plan for athletes already in shape. 5 sessions per week of race-specific work, simulation, and a smart taper. Cross the line strong.",
  category: "duration",
  durationWeeks: 4,
  sessionsPerWeek: "5",
  difficulty: "intermediate",
  audienceLabel: "Already-fit athlete · Race in 4 weeks",
  goalSummary:
    "Last-minute Hyrox prep when you've signed up for a race 4 weeks out. The goal: cross the line strong and learn the format, not chase a PB.",
  athleteProfile:
    "You have general fitness — gym 2-3×/week, can run 8-10 km — but you haven't trained Hyrox-specifically. Race day is 4 weeks out and panic is creeping in.",
  prerequisites: [
    "Run 10 km comfortably",
    "General gym strength",
    "Access to all Hyrox stations",
    "4 weeks of training time before race day",
  ],
  intro:
    "Four weeks isn't enough to build a Hyrox engine from scratch — it is enough to learn the format, calibrate your pacing, and avoid the rookie mistakes that turn a 1:30 race into a 2:00 disaster. This plan is built for someone with general fitness who has run out of runway.",
  whyItWorks:
    "Four-week prep prioritises specificity over volume. Every week includes one race-pace running session, one sled session, and one simulation. By race week you'll have completed a mini-Hyrox and a three-quarter Hyrox — enough to know your pacing, your weak stations, and your transition routine.",
  weeks: [
    w(1, "Assess", "Learn the format", ["easy-z2-45", "mobility-30", "tempo-5x1k", "sled-volume", "station-circuit", "long-z2-75", "rest"], "Day 5 station circuit doubles as your skills assessment — note any station that surprises you."),
    w(2, "Build", "Add race-pace running", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-station", "mini-hyrox", "long-z2-75", "rest"], "Mini-Hyrox time × 2 = race-day prediction. Within 5 minutes either side."),
    w(3, "Sharpen", "Three-quarter dress rehearsal", ["easy-z2-30", "rest", "1k-repeats-6x", "sled-volume", "three-quarter-hyrox", "recovery-walk", "rest"]),
    w(4, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Total volume is deliberately lower than 12-week plans. The risk in 4 weeks is over-training, not under-training.",
    "If you feel destroyed after the week 2 mini-Hyrox, take an extra rest day in week 3.",
    "Race-week taper drops volume by 60% — non-negotiable.",
  ],
  commonMistakes: [
    "Cramming a full Hyrox sim 7 days before race day. Three-quarter sim in week 3 is the maximum.",
    "Adding sessions because you're nervous. Stick to the plan; nerves don't make extra workouts work.",
    "Going too hard on the long runs. Long is for time on feet, not pace.",
  ],
  faqs: [
    { question: "Can I get sub-90 in 4 weeks of training?", answer: "Probably not unless you already have sub-90-quality fitness. Realistic 4-week target: a confident finish 5-15 minutes off the time you would have run with a full 12-week build." },
    { question: "Is 4 weeks enough to learn the stations?", answer: "Yes — week 1 is dedicated to the station circuit and weeks 2-3 include sled work and simulations. By race day you'll have done each station 3-4 times under fatigue." },
    { question: "What if I'm a complete beginner?", answer: "If you can't run 5 km without stopping, defer the race. Four weeks isn't enough to safely build that base and learn 8 stations." },
    { question: "What's the smartest race-day strategy with only 4 weeks of prep?", answer: "Target sub-4:55/km running pace, break sled push into clean 12.5 m efforts, never go unbroken on wall balls past rep 50. Conservative stations, controlled running." },
  ],
  relatedWorkoutSlugs: ["mini-hyrox-simulation", "hyrox-1k-repeats", "100-wall-ball-test"],
  relatedBlogSlugs: ["first-hyrox-race-guide", "best-hyrox-pacing-strategy", "hyrox-race-week-protocol"],
  relatedPlanSlugs: ["8-week-hyrox-training-plan", "sub-100-hyrox-training-plan"],
};

// =====================================================================
// Plan 8 — 8-week Hyrox training plan
// =====================================================================
const eightWeek: TrainingPlan = {
  slug: "8-week-hyrox-training-plan",
  title: "8-Week Hyrox Training Plan",
  metaTitle: "8-Week Hyrox Training Plan — Build to Race Day",
  metaDescription:
    "Free 8-week Hyrox training plan for athletes with a base of fitness. 5 sessions per week with progressive race-specific work and full simulation. Race-ready in 8 weeks.",
  category: "duration",
  durationWeeks: 8,
  sessionsPerWeek: "5",
  difficulty: "intermediate",
  audienceLabel: "Open division · 8 weeks out",
  goalSummary:
    "Build to a confident, well-paced Hyrox race in 8 weeks. Targets sub-1:35 for Open Men, sub-1:50 for Open Women.",
  athleteProfile:
    "You have a base of running and gym fitness and 8 weeks of clear calendar. You've either raced before or done significant Hyrox-style training and want a tight, complete plan to race day.",
  prerequisites: [
    "Run 8 km without stopping",
    "Some prior Hyrox-style training (sled, ski, wall balls)",
    "Access to all Hyrox stations",
    "5 days/week training availability",
  ],
  intro:
    "Eight weeks is the sweet spot for Hyrox prep — long enough to build race-specific fitness, short enough to keep motivation high. This plan compresses base, build, peak, and taper into 8 sharp weeks with one full simulation in week 7.",
  whyItWorks:
    "Eight-week training works because the recency of every session matters at race day — no part of this plan is more than 7 weeks from race effort. The progressive structure (foundation → build → peak → taper) hits all four phases of a normal 12-week plan in compressed form, prioritising race-specific work over base accumulation.",
  weeks: [
    w(1, "Base", "Aerobic foundation", ["easy-z2-45", "rest", "tempo-3x10", "strength-lower", "sled-volume", "long-z2-75", "mobility-30"]),
    w(2, "Base", "Threshold + station volume", ["easy-z2-45", "mobility-30", "tempo-5x1k", "strength-station", "sled-volume", "long-z2-90", "rest"]),
    w(3, "Build", "Race-pace introduction", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-lower", "compromised-mini", "long-z2-90", "rest"]),
    w(4, "Build", "Volume + heavy sled", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-station", "sled-heavy", "long-z2-90", "rest"]),
    w(5, "Build", "First simulation", ["easy-z2-60", "rest", "1k-repeats-8x", "strength-station", "mini-hyrox", "long-z2-90", "recovery-walk"]),
    w(6, "Peak", "Three-quarter sim", ["easy-z2-45", "mobility-30", "1k-repeats-8x", "strength-station", "three-quarter-hyrox", "long-z2-75", "rest"]),
    w(7, "Peak", "Full dress rehearsal", ["easy-z2-30", "rest", "1k-repeats-6x", "strength-station", "full-hyrox-sim", "recovery-walk", "rest"], "Full sim Friday at 95%. Use the time as your race-day predictor."),
    w(8, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly run volume: 30-45 km in build weeks.",
    "Strength: 2 sessions/week.",
    "Hyrox-specific: 1-2 sessions/week.",
  ],
  commonMistakes: [
    "Trying to copy a 12-week plan into 8 weeks. The phase structure here is intentional — don't add a fifth phase.",
    "Skipping the deload-style structure of week 6. Week 6 is where week 5's simulation pays off.",
    "Doing two full sims (week 7 + race day). One full sim is sufficient — week 7's effort is your test.",
  ],
  faqs: [
    { question: "Is 8 weeks enough to train for Hyrox?", answer: "Yes if you have a base of fitness. From scratch, 12-16 weeks is more appropriate. From general fitness, 8 weeks of focused training will get you to a competent first race or a meaningful PR." },
    { question: "Can I do this plan twice back-to-back for 16 weeks?", answer: "Better to follow the dedicated 12-week or 16-week plan instead. Stacked 8-week blocks have too many peaks and not enough deeper base development." },
    { question: "What pace should the long runs be at?", answer: "Conversational zone 2 — about 90 seconds per kilometre slower than your 5K race pace. If your 5K is 22:00 (~4:24/km), long runs should be ~6:00/km." },
  ],
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "mini-hyrox-simulation", "hyrox-1k-repeats"],
  relatedBlogSlugs: ["first-hyrox-race-guide", "best-hyrox-pacing-strategy"],
  relatedPlanSlugs: ["12-week-hyrox-training-plan", "4-week-hyrox-training-plan", "sub-100-hyrox-training-plan"],
};

// =====================================================================
// Plan 9 — 12-week Hyrox training plan (general)
// =====================================================================
const twelveWeek: TrainingPlan = {
  slug: "12-week-hyrox-training-plan",
  title: "12-Week Hyrox Training Plan",
  metaTitle: "12-Week Hyrox Training Plan — The Complete Build",
  metaDescription:
    "Free 12-week Hyrox training plan covering base, build, peak, and taper. 5 sessions per week, week-by-week schedule, full race simulation. The gold-standard Hyrox program.",
  category: "duration",
  durationWeeks: 12,
  sessionsPerWeek: "5",
  difficulty: "intermediate",
  audienceLabel: "Open division · Any goal",
  goalSummary:
    "The complete 12-week build to a Hyrox race. The longest plan most amateurs benefit from — anything more becomes diminishing returns.",
  athleteProfile:
    "You have at least 6 months of consistent training, a 5K time of 25 minutes or better, and 12 weeks before race day. Goal time is whatever you've decided — this plan develops the fitness; pace it for your target.",
  prerequisites: [
    "6+ months of consistent training",
    "Run 5 km in under 25 minutes",
    "Access to all Hyrox stations",
    "5 days/week training availability",
  ],
  intro:
    "12 weeks is the canonical Hyrox build. Long enough to develop a real aerobic base and full station capacity, short enough to maintain motivation through the build. This plan walks through base → build → peak → taper with deload weeks and one full simulation in week 11.",
  whyItWorks:
    "Twelve weeks is the time research and coaching practice converge on for a hard-effort endurance event: 4 weeks of aerobic base, 4 weeks of intensified build, 3 weeks of race-specific peak, and a 1-week taper. The plan respects this structure, builds in deloads at weeks 4 and 8 to consolidate gains, and finishes with a single full simulation in week 11 — the last week before the taper.",
  weeks: [
    w(1, "Base", "Aerobic foundation", ["easy-z2-30", "rest", "tempo-3x10", "strength-lower", "station-circuit", "long-z2-75", "rest"]),
    w(2, "Base", "Add station volume", ["easy-z2-45", "mobility-30", "tempo-3x10", "strength-station", "sled-volume", "long-z2-75", "rest"]),
    w(3, "Base", "Threshold introduction", ["easy-z2-45", "rest", "tempo-5x1k", "strength-lower", "sled-volume", "long-z2-90", "mobility-30"]),
    w(4, "Base", "Recovery & retest", ["easy-z2-30", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. Run a 5K time trial Saturday for a fitness benchmark."),
    w(5, "Build", "Race-pace running", ["easy-z2-45", "rest", "tempo-5x1k", "strength-lower", "sled-volume", "long-z2-90", "rest"]),
    w(6, "Build", "Compromised running", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-station", "compromised-mini", "long-z2-90", "rest"]),
    w(7, "Build", "Volume peak", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-station", "sled-heavy", "long-z2-90", "recovery-walk"]),
    w(8, "Build", "Recovery & retest", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. 6×1k repeats Saturday — calibrate your race pace."),
    w(9, "Peak", "First simulation", ["easy-z2-45", "rest", "1k-repeats-8x", "strength-station", "mini-hyrox", "long-z2-90", "recovery-walk"]),
    w(10, "Peak", "Three-quarter sim", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-full", "three-quarter-hyrox", "long-z2-75", "rest"]),
    w(11, "Peak", "Full dress rehearsal", ["easy-z2-30", "rest", "1k-repeats-6x", "strength-station", "full-hyrox-sim", "recovery-walk", "rest"]),
    w(12, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly run volume: 30-50 km in build weeks. ~75% easy.",
    "Strength: 2 sessions/week.",
    "Hyrox-specific: 1-2 sessions/week.",
  ],
  commonMistakes: [
    "Skipping deload weeks. Weeks 4 and 8 consolidate the previous block — running through them undermines the next.",
    "Adding random extra sessions. Five quality sessions/week beats seven moderate ones.",
    "Not having a goal pace. Decide your target time before week 1 so race-pace sessions have a number to chase.",
  ],
  faqs: [
    { question: "Is 12 weeks really the best length for Hyrox training?", answer: "It's the most common because it covers a full base-build-peak-taper cycle with deloads. Some athletes benefit from longer (16-20 weeks) if their base is low. Few benefit from much longer than 12 — motivation and adherence drop." },
    { question: "Can I follow this plan with a goal time in mind?", answer: "Yes — adapt 1k repeat paces, sled weights, and long-run paces to your goal. Use the calculator goal-time pages (sub-90, sub-75, etc.) for specific pace targets." },
    { question: "What if I miss a week?", answer: "Pick up where you left off if you missed 1-2 sessions. If you missed a full week, repeat the week you missed rather than skipping ahead." },
  ],
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "mini-hyrox-simulation", "hyrox-1k-repeats"],
  relatedBlogSlugs: ["best-hyrox-pacing-strategy", "first-hyrox-race-guide"],
  relatedPlanSlugs: ["8-week-hyrox-training-plan", "sub-90-hyrox-training-plan", "sub-75-hyrox-training-plan"],
};

// =====================================================================
// Plan 10 — 3-day Hyrox training plan (busy schedule)
// =====================================================================
const threeDay: TrainingPlan = {
  slug: "3-day-hyrox-training-plan",
  title: "3-Day-a-Week Hyrox Training Plan",
  metaTitle: "3-Day-a-Week Hyrox Training Plan — 12 Weeks for Busy Schedules",
  metaDescription:
    "Free 12-week Hyrox training plan with just 3 sessions per week. Built for athletes with limited time who still want to race well. Realistic, race-specific, sustainable.",
  category: "constraint",
  durationWeeks: 12,
  sessionsPerWeek: "3",
  difficulty: "intermediate",
  audienceLabel: "Time-constrained athlete",
  goalSummary:
    "Race a competent Hyrox on 3 sessions/week. Realistic targets: sub-1:40 men, sub-1:50 women. Higher times possible for advanced athletes — see notes.",
  athleteProfile:
    "Full-time job, family commitments, or other constraints mean you can train 3 times a week. You want to race Hyrox without lying to yourself about how much you can train.",
  prerequisites: [
    "Run 5 km comfortably",
    "Some general gym fitness",
    "Access to a gym with Hyrox stations 1-2× per week",
  ],
  intro:
    "Most Hyrox plans assume 5-7 sessions per week, which is fantasy for parents, shift workers, and anyone with a real job. This plan delivers race-ready fitness on three sessions: one running quality day, one strength + station day, one long aerobic day. That's it.",
  whyItWorks:
    "On 3 sessions you cannot afford a junk session — every workout must hit a specific adaptation. The plan picks the highest-leverage stimulus per slot: threshold running (Tuesday), strength + station volume (Thursday), long aerobic work that gradually adds race-specific elements (Saturday). Recovery between sessions is unusually generous, which actually helps quality.",
  weeks: [
    w(1, "Base", "Foundation", ["rest", "tempo-3x10", "rest", "strength-station", "rest", "long-z2-75", "rest"]),
    w(2, "Base", "Add sled work", ["rest", "tempo-3x10", "rest", "sled-volume", "rest", "long-z2-75", "rest"]),
    w(3, "Base", "Threshold extension", ["rest", "tempo-5x1k", "rest", "sled-volume", "rest", "long-z2-90", "rest"]),
    w(4, "Base", "Recovery", ["rest", "tempo-3x10", "rest", "mobility-30", "rest", "long-z2-75", "rest"], "Light week. Don't add sessions."),
    w(5, "Build", "Race-pace introduction", ["rest", "1k-repeats-6x", "rest", "sled-volume", "rest", "long-z2-90", "rest"]),
    w(6, "Build", "Compromised + sled", ["rest", "1k-repeats-6x", "rest", "compromised-mini", "rest", "long-z2-90", "rest"]),
    w(7, "Build", "Heavy sled day", ["rest", "1k-repeats-6x", "rest", "sled-heavy", "rest", "long-z2-90", "rest"]),
    w(8, "Build", "Recovery", ["rest", "tempo-3x10", "rest", "mobility-30", "rest", "long-z2-75", "rest"], "Light week."),
    w(9, "Peak", "First simulation", ["rest", "1k-repeats-8x", "rest", "strength-station", "rest", "mini-hyrox", "rest"]),
    w(10, "Peak", "Three-quarter sim", ["rest", "1k-repeats-6x", "rest", "strength-station", "rest", "three-quarter-hyrox", "rest"]),
    w(11, "Peak", "Full dress rehearsal", ["rest", "1k-repeats-6x", "rest", "strength-station", "rest", "full-hyrox-sim", "rest"]),
    w(12, "Taper", "Race week", ["rest", "tempo-3x10", "rest", "pre-race-activation", "rest", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Weekly run volume: 18-30 km. The Saturday long session does most of the aerobic work.",
    "Strength: 1 session/week (Thursday) combined with sled or station volume.",
    "Add a 4th session (easy 30-min run on Sunday) if you have spare time and feel recovered.",
  ],
  commonMistakes: [
    "Skipping the long Saturday session. It is 50% of your aerobic stimulus — protect it.",
    "Trying to make Tuesday harder to compensate for low frequency. The plan's intensity is calibrated for 3 sessions; harder Tuesdays just under-recover Thursdays.",
    "Missing weeks because life happens, then trying to make them up by doubling. Forward only — never back.",
  ],
  faqs: [
    { question: "Can I really train for Hyrox on 3 sessions a week?", answer: "Yes — for sub-1:40 men or sub-1:50 women, 3 well-chosen sessions are enough. For sub-1:30, you'll need 4-5 sessions. For sub-1:15, you need 6+." },
    { question: "Which 3 days should I pick?", answer: "The default is Tue/Thu/Sat for ~48-hour spacing. Mon/Wed/Sat works too. Avoid back-to-back days unless one is a recovery session." },
    { question: "What if my schedule is unpredictable?", answer: "Pick a session at the start of each week and accept the order may shuffle. The non-negotiables: never skip the long aerobic day, and at least 24 hours between threshold and strength sessions." },
  ],
  relatedWorkoutSlugs: ["mini-hyrox-simulation", "hyrox-1k-repeats"],
  relatedBlogSlugs: ["first-hyrox-race-guide", "best-hyrox-pacing-strategy"],
  relatedPlanSlugs: ["12-week-hyrox-training-plan", "sub-100-hyrox-training-plan"],
};

// =====================================================================
// Plan 11 — Hyrox doubles training plan (12 weeks, 5 days/week, partner)
// =====================================================================
const doubles: TrainingPlan = {
  slug: "hyrox-doubles-training-plan",
  title: "Hyrox Doubles Training Plan",
  metaTitle: "Hyrox Doubles Training Plan — 12 Weeks with a Partner",
  metaDescription:
    "Free 12-week Hyrox doubles training plan. 5 sessions per week with partner-coordinated handover practice, balanced station work, and full race simulation.",
  category: "constraint",
  durationWeeks: 12,
  sessionsPerWeek: "5",
  difficulty: "intermediate",
  audienceLabel: "Doubles team (mixed, men's, or women's)",
  goalSummary:
    "Race Hyrox Doubles competently with a partner. Targets sub-1:15 mixed doubles, sub-1:10 men's, sub-1:25 women's.",
  athleteProfile:
    "You and a partner have decided to race Hyrox Doubles together. Both of you have some Hyrox experience or strong general fitness. You can train at the same gym at least once per week.",
  prerequisites: [
    "Both partners can run 8 km",
    "Both partners comfortable with all 8 stations",
    "At least one weekly session together at the same gym",
    "Honest conversation about strengths and weaknesses",
  ],
  intro:
    "Hyrox Doubles is a different sport from Hyrox singles — fitness matters, but coordination matters as much. This 12-week plan keeps individual aerobic and strength work intact while adding a weekly partner session focused on handovers, station-splitting, and pacing matched to the slower partner's recovery rate.",
  whyItWorks:
    "Doubles teams lose more time to bad handovers and unbalanced station splits than to fitness gaps. The weekly partner session in this plan trains the specific skills that win races: clean handovers (target <2 seconds dead time), even station splitting (no partner does more than 8 reps in a row), and pacing the run to the slower runner's race pace + 5%.",
  weeks: [
    w(1, "Base", "Individual base + partner intro", ["easy-z2-30", "rest", "tempo-3x10", "strength-station", "doubles-handover", "long-z2-75", "rest"]),
    w(2, "Base", "Add station coordination", ["easy-z2-45", "mobility-30", "tempo-3x10", "strength-station", "doubles-handover", "long-z2-75", "rest"]),
    w(3, "Base", "Threshold + partner long run", ["easy-z2-45", "rest", "tempo-5x1k", "strength-lower", "sled-volume", "long-z2-90", "doubles-handover"], "Saturday long run together at slower partner's easy pace."),
    w(4, "Base", "Recovery", ["easy-z2-30", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload. Saturday: doubles practice mini-Hyrox at 70% effort."),
    w(5, "Build", "Race-pace intro", ["easy-z2-45", "rest", "1k-repeats-6x", "strength-station", "doubles-handover", "long-z2-90", "rest"]),
    w(6, "Build", "Compromised running", ["easy-z2-45", "mobility-30", "1k-repeats-6x", "strength-station", "compromised-mini", "long-z2-90", "doubles-handover"]),
    w(7, "Build", "Volume + sled", ["easy-z2-45", "rest", "1k-repeats-6x", "sled-heavy", "doubles-handover", "long-z2-90", "rest"]),
    w(8, "Build", "Recovery", ["easy-z2-45", "rest", "tempo-3x10", "mobility-30", "station-circuit", "long-z2-75", "rest"], "Deload."),
    w(9, "Peak", "Partner mini-Hyrox", ["easy-z2-30", "rest", "1k-repeats-8x", "strength-station", "mini-hyrox", "long-z2-90", "doubles-handover"], "Friday mini-Hyrox done as doubles — split each station."),
    w(10, "Peak", "Three-quarter doubles sim", ["easy-z2-30", "rest", "1k-repeats-6x", "strength-full", "three-quarter-hyrox", "long-z2-75", "doubles-handover"]),
    w(11, "Peak", "Full doubles dress rehearsal", ["easy-z2-30", "rest", "1k-repeats-6x", "strength-station", "full-hyrox-sim", "recovery-walk", "rest"], "Full Doubles simulation Friday — final tune-up."),
    w(12, "Taper", "Race week", ["shakeout-20", "mobility-30", "tempo-3x10", "rest", "pre-race-activation", "rest", "race-day"]),
  ],
  weeklyVolumeNotes: [
    "Individual run volume: 30-45 km/week — same as a singles 12-week plan.",
    "Partner sessions: 1-2/week — handover practice and joint long runs.",
    "Strength: 2 sessions/week, biased to whichever partner is the weaker on stations.",
  ],
  commonMistakes: [
    "Both partners doing identical handover splits at every station. Play to each other's strengths — the rower may take more rowing reps; the lighter partner may take more wall balls.",
    "Training apart all 12 weeks. Without weekly partner sessions, your race day handovers will be slow and your station-splitting will be improvised.",
    "Pacing the run to the faster partner. Doubles run pace = slower partner's race pace + 5% maximum. Faster than that and the slower partner cooks the stations.",
  ],
  faqs: [
    { question: "How do you split stations in Hyrox Doubles?", answer: "Default: 25 reps each on wall balls (50 total since teams complete 100), 25 m each on sled push and pull, 100 m each on sandbag lunges. Adjust based on each partner's strengths — the stronger pusher might take 35 m of the 50 m sled push." },
    { question: "Should one partner be faster than the other?", answer: "Ideally similar — within 10% on a 5K and within 15% on a 100 wall ball test. Wider gaps mean the slower partner cooks the stations because the faster partner sets the run pace." },
    { question: "Mixed, men's, or women's doubles — does the plan change?", answer: "The structure is identical. Race weights differ (mixed and women's use women's weights for ski and sled; check the rulebook for the current event), but the training pattern is the same." },
    { question: "Can we do this plan if we live in different cities?", answer: "Yes. Replace one weekly partner session with a video call to discuss handovers and pacing, and prioritise being at the same gym for the week 9, 10, and 11 simulations. The full Doubles dress rehearsal in week 11 is the only non-negotiable in-person session." },
  ],
  relatedWorkoutSlugs: ["hyrox-simulation-workout", "mini-hyrox-simulation"],
  relatedBlogSlugs: ["hyrox-singles-vs-relay", "hyrox-open-vs-pro"],
  relatedPlanSlugs: ["12-week-hyrox-training-plan", "sub-90-hyrox-training-plan"],
};

// =====================================================================

export const TRAINING_PLANS: TrainingPlan[] = [
  subOneHundred,
  subNinety,
  subSeventyFive,
  subSixty,
  subNinetyWomen,
  subEightyWomen,
  fourWeek,
  eightWeek,
  twelveWeek,
  threeDay,
  doubles,
];

const planMap = new Map<string, TrainingPlan>(TRAINING_PLANS.map((p) => [p.slug, p]));

export function getPlan(slug: string): TrainingPlan | undefined {
  return planMap.get(slug);
}

export function getPlansByCategory(category: TrainingPlan["category"]): TrainingPlan[] {
  return TRAINING_PLANS.filter((p) => p.category === category);
}

/** Resolve a plan's day schedule into full session objects (used by templates). */
export function resolveSessions(plan: TrainingPlan): TrainingSession[][] {
  return plan.weeks.map((week) => week.days.map((id) => getSession(id)));
}
