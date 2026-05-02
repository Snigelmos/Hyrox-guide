/**
 * Pre-computed Hyrox goal-time landing page data.
 *
 * Each config represents a target finish time, with recommended station splits,
 * required running pace, and athlete-profile guidance. Used by /calculator/[slug]/
 * pages.
 *
 * Splits derived from 2025-26 race data, normalised to evenly distribute time
 * across stations and runs. Real splits will vary by athlete strengths.
 */

export interface SplitTarget {
  name: string;
  time: string; // mm:ss
  notes?: string;
}

export interface GoalTimeConfig {
  slug: string;
  goalSeconds: number;
  goalLabel: string; // "1:00:00"
  goalShort: string; // "Sub-60"
  audience: "open-men" | "pro-men" | "open-women" | "pro-women";
  audienceLabel: string;  description: string;
  athleteProfile: string;
  runningPace: string; // /km pace required
  totalRunSeconds: number;
  totalStationSeconds: number;
  totalRoxzoneSeconds: number;
  splits: SplitTarget[];
  trainingFocus: string[];
  realismCheck: string;
}

const stationsOpen = (
  ski: string, sledPush: string, sledPull: string, burpee: string,
  row: string, farmers: string, lunges: string, wallBalls: string
): SplitTarget[] => [
  { name: "Ski Erg (1,000 m)", time: ski },
  { name: "Sled Push (4 × 12.5 m, 152 kg)", time: sledPush },
  { name: "Sled Pull (4 × 12.5 m, 103 kg)", time: sledPull },
  { name: "Burpee Broad Jumps (80 m)", time: burpee },
  { name: "Rowing (1,000 m)", time: row },
  { name: "Farmers Carry (200 m, 2 × 24 kg)", time: farmers },
  { name: "Sandbag Lunges (100 m, 20 kg)", time: lunges },
  { name: "Wall Balls (100 reps, 6 kg)", time: wallBalls },
];

const stationsOpenWomen = (
  ski: string, sledPush: string, sledPull: string, burpee: string,
  row: string, farmers: string, lunges: string, wallBalls: string
): SplitTarget[] => [
  { name: "Ski Erg (1,000 m)", time: ski },
  { name: "Sled Push (4 × 12.5 m, 102 kg)", time: sledPush },
  { name: "Sled Pull (4 × 12.5 m, 78 kg)", time: sledPull },
  { name: "Burpee Broad Jumps (80 m)", time: burpee },
  { name: "Rowing (1,000 m)", time: row },
  { name: "Farmers Carry (200 m, 2 × 16 kg)", time: farmers },
  { name: "Sandbag Lunges (100 m, 10 kg)", time: lunges },
  { name: "Wall Balls (100 reps, 4 kg)", time: wallBalls },
];

export const GOAL_TIME_CONFIGS: GoalTimeConfig[] = [
  {
    slug: "sub-60-hyrox",
    goalSeconds: 3600,
    goalLabel: "1:00:00",
    goalShort: "Sub-60",
    audience: "open-men",
    audienceLabel: "Open Men",
    description: "Sub-60 Hyrox is elite territory — typically the top 1-2% of Open Men. Hitting it requires sub-3:50/km running, 4-minute sled push, and 6-minute wall balls.",
    athleteProfile: "Trained athletes with sub-18 5K running, 1.5× bodyweight back squat, 100+ unbroken wall balls, and 12+ months of structured Hyrox training.",
    runningPace: "3:45\u20113:50/km",
    totalRunSeconds: 1850,
    totalStationSeconds: 1450,
    totalRoxzoneSeconds: 300,
    splits: stationsOpen("3:30", "3:45", "3:30", "5:00", "3:40", "2:25", "4:30", "5:50"),
    trainingFocus: [
      "Running base: 50-70 km/week, 1 long Z2 (90 min), 1 threshold (5×1k at race pace), 2-3 easy",
      "Sled volume: 2 sessions per week at race weight (152 kg), 4×25 m intervals",
      "Wall ball: 100 reps unbroken practice weekly + 1 secondary 100-rep session",
      "Strength maintenance: 1 heavy compound session weekly",
      "Race simulations: 1 every 4 weeks in build phase",
    ],
    realismCheck: "Sub-60 puts you within podium contention at most regional events and qualifying for the World Championship. Athletes consistently in the top 10 globally typically run 56-58 minutes.",
  },
  {
    slug: "sub-65-hyrox",
    goalSeconds: 3900,
    goalLabel: "1:05:00",
    goalShort: "Sub-65",
    audience: "open-men",
    audienceLabel: "Open Men",
    description: "Sub-65 Hyrox is competitive Pro qualifying territory — the published 2026 Pro qualifying time for Open Men aged 25-34 is 1:03:00. Sub-65 puts you within reach.",
    athleteProfile: "Strong amateur athlete with sub-19 5K running, 60+ unbroken wall balls, and 9-12 months of structured Hyrox training.",
    runningPace: "4:00/km",
    totalRunSeconds: 1980,
    totalStationSeconds: 1620,
    totalRoxzoneSeconds: 300,
    splits: stationsOpen("3:45", "4:00", "3:45", "5:30", "3:55", "2:40", "5:00", "6:30"),
    trainingFocus: [
      "Running base: 40-60 km/week, 1 long, 1 threshold, 2-3 easy",
      "Sled work: 1-2 sessions per week at race weight",
      "Wall ball: 100 reps weekly, broken into 25-25-25-25 with 6 sec breaks",
      "Compound strength: 1-2 sessions weekly",
      "Race simulation 4-6 weeks before goal race",
    ],
    realismCheck: "Sub-65 puts you in the top 5-10% of Open Men. Pro qualifying time for 25-34 is 1:03:00 — you're within reach. Top of age group at most regional events.",
  },
  {
    slug: "sub-70-hyrox",
    goalSeconds: 4200,
    goalLabel: "1:10:00",
    goalShort: "Sub-70",
    audience: "open-men",
    audienceLabel: "Open Men",
    description: "Sub-70 Hyrox is the top 10-15% of Open Men. Achievable for any committed athlete with 6-9 months of focused training and a sub-20 5K.",
    athleteProfile: "Experienced athlete with sub-20 5K, regular gym access, and 6-9 months of Hyrox-focused training.",
    runningPace: "4:15/km",
    totalRunSeconds: 2120,
    totalStationSeconds: 1780,
    totalRoxzoneSeconds: 300,
    splits: stationsOpen("4:00", "4:15", "4:00", "6:00", "4:10", "2:55", "5:30", "7:10"),
    trainingFocus: [
      "Running: 35-50 km/week, 1 long Z2, 1 threshold, 2-3 easy",
      "Sled work: 1 session per week at race weight",
      "Wall ball: 100 reps weekly",
      "Strength: 1-2 sessions weekly",
      "1 mini-Hyrox simulation 6 weeks before race",
    ],
    realismCheck: "Sub-70 is the goal-time sweet spot — competitive at regional events, top quartile in major events, and a stepping stone to Pro qualifying.",
  },
  {
    slug: "sub-75-hyrox",
    goalSeconds: 4500,
    goalLabel: "1:15:00",
    goalShort: "Sub-75",
    audience: "open-men",
    audienceLabel: "Open Men",
    description: "Sub-75 Hyrox is the top 20% of Open Men — a well-trained amateur with a strong base in both running and strength. The classic Hyrox club benchmark.",
    athleteProfile: "Regular gym-goer with sub-22 5K, comfortable doing 100 wall balls broken, and 4-6 months of structured Hyrox training.",
    runningPace: "4:30/km",
    totalRunSeconds: 2270,
    totalStationSeconds: 1930,
    totalRoxzoneSeconds: 300,
    splits: stationsOpen("4:15", "4:30", "4:15", "6:30", "4:25", "3:10", "6:00", "7:50"),
    trainingFocus: [
      "Running: 30-45 km/week, 1 long, 1 threshold, 1-2 easy",
      "Sled work: 1 session per week",
      "Wall ball volume: 100 reps weekly, broken practice",
      "Compound strength: 2 sessions weekly",
      "Mini-sim 6-8 weeks before race",
    ],
    realismCheck: "Sub-75 is the entry-level competitive Hyrox time. Top 25-30 in regional events, top 100 in majors, age-group competitive in 35+ brackets.",
  },
  {
    slug: "sub-80-hyrox",
    goalSeconds: 4800,
    goalLabel: "1:20:00",
    goalShort: "Sub-80",
    audience: "open-men",
    audienceLabel: "Open Men",
    description: "Sub-80 Hyrox is the top 30% of Open Men — typical for serious amateur athletes after their first proper training cycle. A great 'good time' goal.",
    athleteProfile: "Regular gym member, comfortable running 5 km in 22-23 minutes, completed first Hyrox in 1:25-1:35.",
    runningPace: "4:45/km",
    totalRunSeconds: 2410,
    totalStationSeconds: 2090,
    totalRoxzoneSeconds: 300,
    splits: stationsOpen("4:30", "4:45", "4:30", "7:00", "4:40", "3:25", "6:30", "8:30"),
    trainingFocus: [
      "Running: 25-40 km/week, 1 long, 1 threshold, 1 easy",
      "Sled work: 1 session per week",
      "Wall ball: 100 reps weekly broken into sets",
      "Strength: 1-2 sessions weekly",
      "Race-pace mini-sim 4-6 weeks before race",
    ],
    realismCheck: "Sub-80 is achievable for most committed amateur athletes within 6-12 months of Hyrox-specific training. Age-group competitive in 40+ brackets.",
  },
  {
    slug: "sub-90-hyrox",
    goalSeconds: 5400,
    goalLabel: "1:30:00",
    goalShort: "Sub-90",
    audience: "open-men",
    audienceLabel: "Open Men",
    description: "Sub-90 Hyrox is the median Open Men finish time — the canonical 'good first Hyrox' goal for fit recreational athletes.",
    athleteProfile: "First-time or second-time Hyrox racer with regular gym training, 5K under 25 minutes, 8-12 weeks of Hyrox-specific prep.",
    runningPace: "5:15/km",
    totalRunSeconds: 2700,
    totalStationSeconds: 2400,
    totalRoxzoneSeconds: 300,
    splits: stationsOpen("5:00", "5:30", "5:00", "8:00", "5:15", "3:50", "7:30", "9:30"),
    trainingFocus: [
      "Running: 20-35 km/week, 1 long, 1 threshold, 1 easy",
      "Sled familiarity: 1 session per week",
      "Wall ball: 50-100 reps weekly to build endurance",
      "Strength: 2 sessions weekly",
      "Mini-sim 4-6 weeks before race",
    ],
    realismCheck: "Sub-90 is the median Open Men time globally and the goal most first-timers chase. Hitting it on race #1 with 12 weeks of prep is realistic for most fit athletes.",
  },
  {
    slug: "sub-100-hyrox",
    goalSeconds: 6000,
    goalLabel: "1:40:00",
    goalShort: "Sub-100",
    audience: "open-men",
    audienceLabel: "Open Men",
    description: "Sub-100 Hyrox is the typical first-time finish for casual gym members. A realistic, achievable target for absolute first-timers.",
    athleteProfile: "Active gym member with 5K under 28 minutes, comfortable doing 50 wall balls broken, 8-12 weeks of focused prep.",
    runningPace: "5:45/km",
    totalRunSeconds: 3000,
    totalStationSeconds: 2700,
    totalRoxzoneSeconds: 300,
    splits: stationsOpen("5:30", "6:30", "5:45", "9:30", "5:45", "4:20", "8:30", "10:50"),
    trainingFocus: [
      "Running: 15-30 km/week, 1 long, 2 easy",
      "Sled familiarity: 1 session per week",
      "Wall ball: build to 100 reps broken",
      "Strength: 2 sessions weekly",
      "Realistic 8-12 week prep block",
    ],
    realismCheck: "Sub-100 is the most common first-time goal. Pacing matters more than raw fitness — go out at 5:45/km, walk slowly through stations, and don't blow up.",
  },
  {
    slug: "sub-80-hyrox-women",
    goalSeconds: 4800,
    goalLabel: "1:20:00",
    goalShort: "Sub-80",
    audience: "open-women",
    audienceLabel: "Open Women",
    description: "Sub-80 Hyrox is elite territory for Open Women — the top 5-10% of finishers. Pro qualifying time for Open Women 25-34 is 1:16:00, putting sub-80 within reach.",
    athleteProfile: "Strong amateur with sub-21 5K, 100+ unbroken wall balls, 12+ months of structured Hyrox training.",
    runningPace: "4:30/km",
    totalRunSeconds: 2270,
    totalStationSeconds: 2230,
    totalRoxzoneSeconds: 300,
    splits: stationsOpenWomen("4:15", "5:00", "4:00", "6:30", "4:25", "3:10", "6:00", "7:50"),
    trainingFocus: [
      "Running: 40-60 km/week, 1 long, 1 threshold, 2-3 easy",
      "Sled work: 2 sessions per week at race weight (102 kg)",
      "Wall ball: 100 reps weekly + 1 secondary 100-rep session",
      "Strength: 1-2 sessions weekly heavy compound",
      "Race simulation 4-6 weeks before goal race",
    ],
    realismCheck: "Sub-80 puts you within Pro qualifying range and competitive at most regional events. Top 5-10 in age groups at major events.",
  },
  {
    slug: "sub-90-hyrox-women",
    goalSeconds: 5400,
    goalLabel: "1:30:00",
    goalShort: "Sub-90",
    audience: "open-women",
    audienceLabel: "Open Women",
    description: "Sub-90 Hyrox is the top 20-25% of Open Women — a strong amateur target. Achievable with 6-9 months of focused training.",
    athleteProfile: "Regular gym-goer with sub-23 5K, comfortable doing 100 wall balls broken, 6-9 months of Hyrox-specific training.",
    runningPace: "5:00/km",
    totalRunSeconds: 2520,
    totalStationSeconds: 2580,
    totalRoxzoneSeconds: 300,
    splits: stationsOpenWomen("4:45", "5:30", "4:30", "7:30", "4:50", "3:30", "6:45", "8:45"),
    trainingFocus: [
      "Running: 30-45 km/week, 1 long, 1 threshold",
      "Sled work: 1-2 sessions per week",
      "Wall ball: 100 reps weekly broken",
      "Strength: 2 sessions weekly compound lifts",
      "Mini-sim 6-8 weeks before race",
    ],
    realismCheck: "Sub-90 is the entry to competitive Open Women territory. Top 25-30 at regional events, age-group competitive in 35+ brackets.",
  },
  {
    slug: "sub-100-hyrox-women",
    goalSeconds: 6000,
    goalLabel: "1:40:00",
    goalShort: "Sub-100",
    audience: "open-women",
    audienceLabel: "Open Women",
    description: "Sub-100 Hyrox is the median Open Women finish — the canonical 'good first Hyrox' goal for active recreational women.",
    athleteProfile: "First-time or second-time racer with regular gym training, 5K under 26 minutes, 8-12 weeks of Hyrox-specific prep.",
    runningPace: "5:30/km",
    totalRunSeconds: 2820,
    totalStationSeconds: 2880,
    totalRoxzoneSeconds: 300,
    splits: stationsOpenWomen("5:15", "6:30", "5:00", "8:30", "5:30", "3:55", "7:30", "10:00"),
    trainingFocus: [
      "Running: 20-35 km/week",
      "Sled familiarity: 1 session per week",
      "Wall ball: 50-100 reps weekly building",
      "Strength: 2 sessions weekly",
      "Mini-sim 4-6 weeks before race",
    ],
    realismCheck: "Sub-100 is achievable for most active Open Women on a focused 12-week prep. The most common first-race goal.",
  },
];

export type AudienceKey = GoalTimeConfig["audience"];

// Pro station helper — Pro loads differ per gender
const stationsProMen = (
  ski: string, sledPush: string, sledPull: string, burpee: string,
  row: string, farmers: string, lunges: string, wallBalls: string
): SplitTarget[] => [
  { name: "Ski Erg (1,000 m)", time: ski },
  { name: "Sled Push (4 × 12.5 m, 202 kg)", time: sledPush },
  { name: "Sled Pull (4 × 12.5 m, 153 kg)", time: sledPull },
  { name: "Burpee Broad Jumps (80 m)", time: burpee },
  { name: "Rowing (1,000 m)", time: row },
  { name: "Farmers Carry (200 m, 2 × 32 kg)", time: farmers },
  { name: "Sandbag Lunges (100 m, 30 kg)", time: lunges },
  { name: "Wall Balls (100 reps, 9 kg)", time: wallBalls },
];

const stationsProWomen = (
  ski: string, sledPush: string, sledPull: string, burpee: string,
  row: string, farmers: string, lunges: string, wallBalls: string
): SplitTarget[] => [
  { name: "Ski Erg (1,000 m)", time: ski },
  { name: "Sled Push (4 × 12.5 m, 152 kg)", time: sledPush },
  { name: "Sled Pull (4 × 12.5 m, 103 kg)", time: sledPull },
  { name: "Burpee Broad Jumps (80 m)", time: burpee },
  { name: "Rowing (1,000 m)", time: row },
  { name: "Farmers Carry (200 m, 2 × 24 kg)", time: farmers },
  { name: "Sandbag Lunges (100 m, 20 kg)", time: lunges },
  { name: "Wall Balls (100 reps, 6 kg)", time: wallBalls },
];

export const PRO_GOAL_TIME_CONFIGS: GoalTimeConfig[] = [
  // ── Pro Men ──────────────────────────────────────────────────────────────
  {
    slug: "sub-65-pro-men",
    goalSeconds: 3900,
    goalLabel: "1:05:00",
    goalShort: "Sub-65",
    audience: "pro-men",
    audienceLabel: "Pro Men",
    description: "Sub-65 Pro Men is elite — top 10-15% of the Pro Men field. Requires 4:00/km running and near-perfect station execution at Pro weights.",
    athleteProfile: "Experienced Pro competitor with sub-18 5K, 2× bodyweight deadlift, 100+ unbroken wall balls at 9 kg, and 12+ months of Pro-specific training.",
    runningPace: "4:00/km",
    totalRunSeconds: 1980,
    totalStationSeconds: 1620,
    totalRoxzoneSeconds: 300,
    splits: stationsProMen("3:50", "5:30", "4:45", "5:30", "4:00", "2:55", "5:30", "7:10"),
    trainingFocus: [
      "Running: 55-70 km/week, 1 long Z2, 1 VO₂ session, 2 threshold",
      "Heavy sled: 2 sessions per week at Pro weight (202 kg push)",
      "Wall ball: 100 × 9 kg weekly unbroken target",
      "Full Pro simulation 4-6 weeks before race",
    ],
    realismCheck: "Sub-65 Pro puts you in the top 10-15% of Pro Men globally. World Championship qualification typically requires sub-62 depending on region and season.",
  },
  {
    slug: "sub-75-pro-men",
    goalSeconds: 4500,
    goalLabel: "1:15:00",
    goalShort: "Sub-75",
    audience: "pro-men",
    audienceLabel: "Pro Men",
    description: "Sub-75 Pro Men is a strong competitive Pro finish — top 35-40% of the Pro field. Achievable with 9-12 months of focused Pro training.",
    athleteProfile: "Well-rounded athlete with sub-20 5K, 1.75× bodyweight deadlift, comfortable with Pro weights across all stations.",
    runningPace: "4:30/km",
    totalRunSeconds: 2270,
    totalStationSeconds: 1930,
    totalRoxzoneSeconds: 300,
    splits: stationsProMen("4:15", "6:30", "5:30", "6:30", "4:25", "3:25", "6:30", "8:30"),
    trainingFocus: [
      "Running: 40-55 km/week, threshold and long Z2",
      "Pro sled volume: 1-2 sessions per week",
      "Wall ball: 100 × 9 kg weekly broken sets",
      "Compound strength: 2 sessions weekly",
    ],
    realismCheck: "Sub-75 Pro is mid-pack in the Pro Men field — a solid result that shows you belong in the division. Most athletes need 9-12 months in Pro to hit this consistently.",
  },
  {
    slug: "sub-85-pro-men",
    goalSeconds: 5100,
    goalLabel: "1:25:00",
    goalShort: "Sub-85",
    audience: "pro-men",
    audienceLabel: "Pro Men",
    description: "Sub-85 Pro Men is a solid first Pro race finish — completing the course at Pro weights is an achievement in itself. Most athletes finishing their first Pro race land here.",
    athleteProfile: "First or second Pro race. Strong Open background with sub-22 5K, comfortable with all Pro station weights, 4-6 months of Pro-specific prep.",
    runningPace: "5:00/km",
    totalRunSeconds: 2520,
    totalStationSeconds: 2280,
    totalRoxzoneSeconds: 300,
    splits: stationsProMen("4:45", "7:30", "6:15", "7:30", "5:00", "3:55", "7:30", "9:50"),
    trainingFocus: [
      "Running: 30-45 km/week",
      "Pro sled familiarity: 1 session per week at Pro weights",
      "Wall ball: build to 100 × 9 kg broken",
      "Strength: 2 sessions weekly",
    ],
    realismCheck: "Sub-85 is a respectable first Pro result. The jump from Open to Pro is mainly felt on sled push (+50 kg), sandbag lunges (+10 kg), and wall balls (+3 kg) — plan for those specifically.",
  },
  // ── Pro Women ────────────────────────────────────────────────────────────
  {
    slug: "sub-75-pro-women",
    goalSeconds: 4500,
    goalLabel: "1:15:00",
    goalShort: "Sub-75",
    audience: "pro-women",
    audienceLabel: "Pro Women",
    description: "Sub-75 Pro Women is elite — top 10-15% of the Pro Women field. Requires 4:40/km running and strong execution at Pro station weights.",
    athleteProfile: "Experienced Pro competitor with sub-21 5K, 1.4× bodyweight deadlift, 100+ wall balls at 6 kg unbroken, 12+ months Pro-specific training.",
    runningPace: "4:40/km",
    totalRunSeconds: 2340,
    totalStationSeconds: 1860,
    totalRoxzoneSeconds: 300,
    splits: stationsProWomen("4:20", "5:30", "4:30", "6:30", "4:35", "3:10", "6:00", "8:10"),
    trainingFocus: [
      "Running: 45-60 km/week, threshold and VO₂ work",
      "Pro sled volume: 2 sessions per week",
      "Wall ball: 100 × 6 kg unbroken target weekly",
      "Full Pro simulation 4-6 weeks before race",
    ],
    realismCheck: "Sub-75 Pro Women puts you in the top 10-15% of the Pro field and within World Championship qualification range in most regions.",
  },
  {
    slug: "sub-85-pro-women",
    goalSeconds: 5100,
    goalLabel: "1:25:00",
    goalShort: "Sub-85",
    audience: "pro-women",
    audienceLabel: "Pro Women",
    description: "Sub-85 Pro Women is mid-pack Pro — top 40% of the Pro Women field. A strong competitive result for athletes 9-12 months into Pro training.",
    athleteProfile: "Established athlete with sub-23 5K, comfortable at Pro station weights, 6-9 months of Pro-specific prep.",
    runningPace: "5:05/km",
    totalRunSeconds: 2560,
    totalStationSeconds: 2240,
    totalRoxzoneSeconds: 300,
    splits: stationsProWomen("4:50", "6:30", "5:15", "7:30", "5:00", "3:40", "7:00", "9:15"),
    trainingFocus: [
      "Running: 35-50 km/week",
      "Pro sled: 1-2 sessions per week",
      "Wall ball: 100 × 6 kg weekly broken sets",
      "Compound strength: 2 sessions weekly",
    ],
    realismCheck: "Sub-85 Pro Women is a solid competitive result. Mid-pack at regional events, age-group competitive in 35+ Pro brackets.",
  },
  {
    slug: "sub-95-pro-women",
    goalSeconds: 5700,
    goalLabel: "1:35:00",
    goalShort: "Sub-95",
    audience: "pro-women",
    audienceLabel: "Pro Women",
    description: "Sub-95 Pro Women is a strong first Pro race finish. Completing a Pro race is a genuine athletic achievement — most first-timers in Pro land in the 1:35-1:45 range.",
    athleteProfile: "First or second Pro race. Strong Open Women background with sub-25 5K, familiar with all Pro station weights.",
    runningPace: "5:30/km",
    totalRunSeconds: 2820,
    totalStationSeconds: 2580,
    totalRoxzoneSeconds: 300,
    splits: stationsProWomen("5:15", "7:30", "6:00", "8:30", "5:30", "4:10", "8:00", "10:45"),
    trainingFocus: [
      "Running: 25-40 km/week",
      "Pro sled familiarity: 1 session per week",
      "Wall ball: build to 100 × 6 kg broken",
      "Strength: 2 sessions weekly",
    ],
    realismCheck: "Sub-95 is a very good first Pro finish. The Pro jump hits hardest on sled push (152 kg vs 102 kg), lunges (20 vs 10 kg), and wall balls (6 vs 4 kg) — train those specifically.",
  },
];

// Combined export used by the calculator page and goal-time guides.
export const ALL_GOAL_TIME_CONFIGS: GoalTimeConfig[] = [
  ...GOAL_TIME_CONFIGS,
  ...PRO_GOAL_TIME_CONFIGS,
];

export function getGoalConfig(slug: string): GoalTimeConfig | undefined {
  return GOAL_TIME_CONFIGS.find((g) => g.slug === slug);
}
