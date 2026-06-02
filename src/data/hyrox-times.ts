/**
 * Hyrox time standards dataset.
 *
 * Used to generate /times/[category]/[ageGroup] pages programmatically.
 * Numbers are based on publicly-reported Hyrox median/average finish times
 * aggregated across 2024-2025 seasons. These are estimates for informational
 * use, not official Hyrox data.
 *
 * Station order: SkiErg 1000m, Sled Push 50m, Sled Pull 50m, Burpee Broad
 * Jumps 80m, Row 1000m, Farmers Carry 200m, Sandbag Lunges 100m, Wall Balls
 * 100 reps. Runs: 8 x 1km between stations.
 */

import { ALL_GOAL_TIME_CONFIGS } from "./calculator-goals";

export type HyroxCategory =
  | "open-men"
  | "open-women"
  | "pro-men"
  | "pro-women"
  | "doubles-men"
  | "doubles-women"
  | "doubles-mixed";

export type AgeGroup =
  | "u30"
  | "30-34"
  | "35-39"
  | "40-44"
  | "45-49"
  | "50-54"
  | "55-59"
  | "60-plus";

export interface CategoryMeta {
  id: HyroxCategory;
  label: string;
  slug: HyroxCategory;
  description: string;
  divisionFactor: number; // multiplier on base open-men times
}

export interface AgeGroupMeta {
  id: AgeGroup;
  label: string;
  slug: AgeGroup;
  ageFactor: number;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "open-men",
    label: "Open Men",
    slug: "open-men",
    description: "Standard weights, solo division for men.",
    divisionFactor: 1.0,
  },
  {
    id: "open-women",
    label: "Open Women",
    slug: "open-women",
    description: "Standard weights, solo division for women.",
    divisionFactor: 1.18,
  },
  {
    id: "pro-men",
    label: "Pro Men",
    slug: "pro-men",
    description: "Heavier sleds, heavier sandbag — competitive solo men.",
    divisionFactor: 0.88,
  },
  {
    id: "pro-women",
    label: "Pro Women",
    slug: "pro-women",
    description: "Heavier weights, competitive solo women.",
    divisionFactor: 1.04,
  },
  {
    id: "doubles-men",
    label: "Doubles Men",
    slug: "doubles-men",
    description: "Two-person team, splitting work between partners.",
    divisionFactor: 0.82,
  },
  {
    id: "doubles-women",
    label: "Doubles Women",
    slug: "doubles-women",
    description: "Two-person women's team.",
    divisionFactor: 0.97,
  },
  {
    id: "doubles-mixed",
    label: "Doubles Mixed",
    slug: "doubles-mixed",
    description: "Two-person team with one man and one woman.",
    divisionFactor: 0.9,
  },
];

export const AGE_GROUPS: AgeGroupMeta[] = [
  { id: "u30", label: "Under 30", slug: "u30", ageFactor: 0.98 },
  { id: "30-34", label: "30–34", slug: "30-34", ageFactor: 1.0 },
  { id: "35-39", label: "35–39", slug: "35-39", ageFactor: 1.03 },
  { id: "40-44", label: "40–44", slug: "40-44", ageFactor: 1.07 },
  { id: "45-49", label: "45–49", slug: "45-49", ageFactor: 1.11 },
  { id: "50-54", label: "50–54", slug: "50-54", ageFactor: 1.16 },
  { id: "55-59", label: "55–59", slug: "55-59", ageFactor: 1.22 },
  { id: "60-plus", label: "60+", slug: "60-plus", ageFactor: 1.32 },
];

// Base station times in seconds for Open Men, 30-34 age group.
// Derived from publicly reported medians.
export interface StationTime {
  station: string;
  slug: string;
  seconds: number;
  link: string;
  standardsLink: string;
}

export const BASE_STATION_TIMES: StationTime[] = [
  { station: "SkiErg 1,000m", slug: "skierg", seconds: 265, link: "/blog/hyrox-skierg-technique-pacing/", standardsLink: "/stations/skierg/standards/" },
  { station: "Sled Push 50m", slug: "sled-push", seconds: 180, link: "/blog/hyrox-sled-push-technique/", standardsLink: "/stations/sled-push/standards/" },
  { station: "Sled Pull 50m", slug: "sled-pull", seconds: 200, link: "/blog/hyrox-sled-pull-technique/", standardsLink: "/stations/sled-pull/standards/" },
  { station: "Burpee Broad Jumps 80m", slug: "burpee-broad-jumps", seconds: 330, link: "/blog/hyrox-burpee-broad-jumps-strategy/", standardsLink: "/stations/burpee-broad-jumps/standards/" },
  { station: "Row 1,000m", slug: "row", seconds: 245, link: "/blog/hyrox-rowing-technique/", standardsLink: "/stations/rowing/standards/" },
  { station: "Farmers Carry 200m", slug: "farmers-carry", seconds: 125, link: "/blog/hyrox-farmers-carry-sandbag-lunges/", standardsLink: "/stations/farmers-carry/standards/" },
  { station: "Sandbag Lunges 100m", slug: "sandbag-lunges", seconds: 250, link: "/blog/hyrox-farmers-carry-sandbag-lunges/", standardsLink: "/stations/sandbag-lunges/standards/" },
  { station: "Wall Balls (100 reps)", slug: "wall-balls", seconds: 320, link: "/blog/hyrox-wall-balls-technique/", standardsLink: "/stations/wall-balls/standards/" },
];

// Base total run time for 8km at median Open Men pace, in seconds.
export const BASE_RUN_SECONDS_PER_KM = 290; // ~4:50 /km — eight reps

// Transition time between stations (roxzone), seconds total across race.
export const TRANSITION_SECONDS = 120;

export interface ExpectedFinish {
  totalSeconds: number;
  runSeconds: number;
  stationSeconds: number;
  transitionSeconds: number;
  stations: (StationTime & { adjusted: number })[];
  runPerKm: number;
}

export function computeExpectedFinish(
  category: HyroxCategory,
  ageGroup: AgeGroup
): ExpectedFinish {
  const cat = CATEGORIES.find((c) => c.id === category)!;
  const age = AGE_GROUPS.find((a) => a.id === ageGroup)!;
  const factor = cat.divisionFactor * age.ageFactor;

  const stations = BASE_STATION_TIMES.map((s) => ({
    ...s,
    adjusted: Math.round(s.seconds * factor),
  }));
  const stationSeconds = stations.reduce((acc, s) => acc + s.adjusted, 0);

  const runPerKm = Math.round(BASE_RUN_SECONDS_PER_KM * factor);
  const runSeconds = runPerKm * 8;

  const transitionSeconds = Math.round(TRANSITION_SECONDS * factor);

  return {
    totalSeconds: stationSeconds + runSeconds + transitionSeconds,
    runSeconds,
    stationSeconds,
    transitionSeconds,
    stations,
    runPerKm,
  };
}

export function formatHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatMinSec(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function allTimeCombinations(): { category: HyroxCategory; ageGroup: AgeGroup }[] {
  const out: { category: HyroxCategory; ageGroup: AgeGroup }[] = [];
  for (const c of CATEGORIES) {
    for (const a of AGE_GROUPS) {
      out.push({ category: c.id, ageGroup: a.id });
    }
  }
  return out;
}

/**
 * Per-category unique guidance.
 *
 * Each /times/[category]/[ageGroup]/ page renders these blocks alongside the
 * computed splits. Without this block, all 56 pages share an identical body
 * and Google flags them as "Discovered/Crawled - currently not indexed".
 * Each guidance block must be specific enough that two different categories
 * never produce overlapping prose.
 */
export interface CategoryGuidance {
  /** What this division is and who races it. ~80-110 words. */
  divisionContext: string;
  /** Training reality and the typical limiter for this division. ~80-110 words. */
  trainingReality: string;
  /** Race-day strategy specific to the division (weights, pacing, station priorities). ~70-90 words. */
  raceStrategy: string;
  /** Two FAQs unique to the division. */
  faqs: { question: string; answer: string }[];
}

export const CATEGORY_GUIDANCE: Record<HyroxCategory, CategoryGuidance> = {
  "open-men": {
    divisionContext:
      "Open Men is the largest division at every Hyrox event and the entry point for most male athletes. Standard weights apply across the board: 152 kg sled push, 103 kg sled pull, 24 kg farmers, 20 kg sandbag lunges, 6 kg wall balls, 100 reps. The published 2026 Pro qualifying time for Open Men 25-34 is 1:03:00, which sits roughly at the top 5% of the Open field. Most transition athletes (CrossFitters, road runners, triathletes, rugby players) start in Open Men because the sled and sandbag weights are manageable for a first race.",
    trainingReality:
      "The single biggest predictor of an Open Men finish time is 5 km road running pace. Athletes who can hold 4:30/km for 5 km consistently finish under 1:15 in Open Men with even modest station preparation. The sled push at 152 kg is rarely the limiter for trained men because 75-90 kg bodyweight typically generates enough horizontal force. The two stations that derail Open Men finishes most often are burpee broad jumps (cardio + tendon load) and wall balls (grip and shoulder fatigue at rep 60+). A 6-week build of 30 weekly running km plus two station-specific sessions typically lifts an Open Men time by 5-8 minutes.",
    raceStrategy:
      "Hold 5-10 seconds slower than your TT 5 km pace on every run, especially Run 1 and Run 5 (post-burpee). Banking time on the SkiErg costs you on the sled push. The single highest-leverage gain in Open Men is a clean wall ball strategy: most go unbroken-or-bust and lose 60-90 seconds vs a planned 5×20 set break.",
    faqs: [
      {
        question: "What is the Hyrox Pro qualifying time for Open Men?",
        answer:
          "For the 2026 season, the published Pro qualifying time for Open Men 25-34 is 1:03:00. The qualifying time is age-graded for masters bands (typically 1:06 for 35-39, 1:10 for 40-44). Confirm the current season's exact thresholds at hyrox.com before entering Pro.",
      },
      {
        question: "Should I race Open Men or Pro Men?",
        answer:
          "If your training Open Men finish projects above 1:05, race Open. Pro Men carries a 50 kg sled-push penalty and a heavier sandbag, both of which compound late-race fatigue. Most athletes graduate to Pro after at least one sub-1:05 Open finish.",
      },
    ],
  },
  "open-women": {
    divisionContext:
      "Open Women is the standard women's division and the largest women's field at every event. Race weights are 102 kg sled push, 78 kg sled pull, 16 kg farmers carry, 10 kg sandbag lunges, and 4 kg wall balls. Open Women fields often include masters athletes who have chosen Open over Pro to keep sled push manageable. A sub-90 finish puts you in the top 30-40% of Open Women at a typical European stop. Sub-75 is World Championship qualifying territory.",
    trainingReality:
      "The 102 kg sled push is the make-or-break station for most Open Women, particularly those under 65 kg bodyweight. Running pace and grip endurance are the next two biggest levers. Pure runners (sub-22 5 km) with no sled-specific training routinely lose 4-7 minutes at the sled push because horizontal-force production is bodyweight-limited. Two sled push sessions per week at race weight, working in 4×25 m intervals, typically buys back 90-120 seconds within 8 weeks. Wall balls at 4 kg rarely become a finish-line limiter, but the 100 reps still cost most racers 30+ seconds vs their training pace.",
    raceStrategy:
      "Lead with conservative sled push pacing: short steps, low hips, do not stop. Each full stop on the sled costs 8-12 seconds. The lunges-into-wall-balls block is where podium-tier women win the race; practice that exact sequence in training so the legs are familiar with the transition.",
    faqs: [
      {
        question: "Is the Open Women sled push really impossible?",
        answer:
          "No, but it is the single most-trained station for a reason. Athletes under 60 kg need sled-specific work twice per week. Athletes over 70 kg with a strong squat usually clear the push without significant trouble. Bodyweight under 55 kg is where the sled becomes structurally hard regardless of strength.",
      },
      {
        question: "Should I race Open Women or Pro Women?",
        answer:
          "If your training Open Women finish projects above 1:25, stay in Open. Pro Women's 152 kg sled is a meaningful jump and most first-time Pro Women report 6-10 minutes of additional finish time vs Open. Race Open until you finish under 1:25 cleanly.",
      },
    ],
  },
  "pro-men": {
    divisionContext:
      "Pro Men is the heavier-weight men's division, typically requiring an Open Men sub-1:05 qualifying finish (or proven elite background) to enter. Pro adds 50 kg to the sled push (202 kg vs 152 kg), 30 kg to the sled pull (153 kg vs 103 kg), 10 kg to the sandbag (30 kg vs 20 kg), and 3 kg to each wall ball (9 kg vs 6 kg). The field is significantly smaller than Open and tilts heavily toward CrossFit and strongman backgrounds. Sub-75 in Pro Men is roughly a top-50 global result on most weekends.",
    trainingReality:
      "Pro Men is 70% strength endurance, 30% running. Athletes who graduate from Open Men because their running was strong but not overwhelming often struggle in Pro because the sled work and 30 kg sandbag fatigue stack against running form on Run 7 and Run 8. The 9 kg wall ball is where most Pro Men fade: shoulder fatigue at rep 50+ doubles rep time vs Open. Train the 9 kg ball at race volume (2× weekly sets of 50-50-50 unbroken with 30 second rest) and the sandbag-lunges-to-wall-balls transition until the legs are robotic.",
    raceStrategy:
      "Pro Men should pace the SkiErg deliberately under threshold so the sled push has full leg drive. The 202 kg sled punishes any quad fatigue. Plan wall balls in three sets (40-30-30) rather than chasing unbroken; the time saved on rep efficiency outweighs the rest.",
    faqs: [
      {
        question: "What is the Pro Men sled push weight in Hyrox?",
        answer:
          "Pro Men race a 202 kg sled push (50 kg heavier than Open). The sled distance is identical at 4 × 12.5 m, but the heavier load doubles the muscular demand and roughly halves the realistic race-day push speed for most athletes.",
      },
      {
        question: "Do I need to qualify to race Pro Men?",
        answer:
          "Most events open Pro registration to athletes who have a verified Open Men sub-1:05 finish on file (or the season's published qualifying time). A small number of regional events allow open Pro entry. Check the specific event registration page for the current season's rules.",
      },
    ],
  },
  "pro-women": {
    divisionContext:
      "Pro Women is the heavier women's division and the smallest field at most events. Pro Women's weights are 152 kg sled push (50 kg heavier than Open), 103 kg sled pull (25 kg heavier), 24 kg farmers carry (8 kg heavier), 20 kg sandbag (10 kg heavier), and 6 kg wall balls (2 kg heavier). The qualifying threshold is typically a sub-1:15 Open Women finish. The field is small enough that a sub-85 Pro Women finish often places top-30 globally.",
    trainingReality:
      "Pro Women race the same sled push weight as Open Men, which is the structural reality of the division. Athletes under 65 kg bodyweight find this station extremely difficult unless squat strength is well above bodyweight. The 6 kg wall ball is the second-biggest limiter: shoulder fatigue at rep 60+ becomes meaningful and doubles rep times vs Open. Pro Women athletes typically come from a strength background (CrossFit, weightlifting) rather than pure running, because the 152 kg sled rewards pure horizontal force production over aerobic capacity.",
    raceStrategy:
      "Plan wall balls as 50-30-20 with 20-second rests rather than going unbroken. The 6 kg ball is heavy enough that unbroken sets above rep 60 typically fail mid-set, costing more than planned rests. Sled push pacing should be aggressive on the first 25 m, then settle to short-step rhythm.",
    faqs: [
      {
        question: "What is the Pro Women sled push weight?",
        answer:
          "Pro Women race a 152 kg sled push, which is identical to the Open Men sled. The sled distance is 4 × 12.5 m. Most Pro Women report this as the single hardest station in the race.",
      },
      {
        question: "Is Pro Women smaller than Open Women?",
        answer:
          "Yes, by roughly 10-20× at most events. Pro Women fields typically run 30-100 athletes per stop versus 500-2,000 in Open Women. This means a top-10 Pro Women finish is achievable for athletes who would be top-50 in Open.",
      },
    ],
  },
  "doubles-men": {
    divisionContext:
      "Doubles Men is a two-person men's team, with both partners completing the run portion together and splitting station work between them. The standard rule at most events: each station must be completed by the team, but partners may split the reps however they choose (one partner can do all of one station while the other does all of another, or they can alternate within a station). Race weights are Open Men standard. The Doubles Men field is roughly half the size of Open Men but has grown 30% year over year since 2024.",
    trainingReality:
      "Doubles Men finish times are roughly 18-22% faster than the slower partner's solo Open Men time. The biggest training mistake doubles teams make is failing to rehearse handovers: a smooth handover saves 3-5 seconds per station, which compounds to 30-60 seconds across the race. Strong partner pairings combine one above-threshold runner (who handles most of the running pacing) with one strength specialist (who absorbs more sandbag and sled work). Equal-strength pairings typically split work 50/50 on every station.",
    raceStrategy:
      "Decide the work split before race day for every station. Sled push usually goes to the heavier partner (more horizontal force). Wall balls and burpees usually rotate at fixed rep targets to keep heart rate from spiking on either partner. Avoid mid-station strategy decisions; they cost 10-20 seconds of dead time per station.",
    faqs: [
      {
        question: "Can Doubles Men split work however they want?",
        answer:
          "At most events, yes. The standard rule is that the team must complete the prescribed reps; how the partners split those reps is up to them. Some events impose minimum-contribution rules per station (e.g. each partner must do at least one rep). Confirm with the event-specific rules.",
      },
      {
        question: "Are Doubles Men weights the same as Open Men?",
        answer:
          "Yes. Doubles Men races at standard Open Men weights: 152 kg sled push, 103 kg sled pull, 20 kg sandbag, 6 kg wall balls. The format change is the work-split, not the weights.",
      },
    ],
  },
  "doubles-women": {
    divisionContext:
      "Doubles Women is a two-person women's team racing at Open Women weights. The format is identical to Doubles Men: both partners run together and split station work between them. Doubles Women fields are smaller than Doubles Mixed at most events (roughly 30-40% the size) but have grown rapidly since 2024 as more women's gyms have adopted Hyrox-affiliated training.",
    trainingReality:
      "Doubles Women finish times are roughly 18-22% faster than the slower partner's solo Open Women time. Sled push handover strategy is more nuanced than in Doubles Men because the 102 kg sled is closer to most women's bodyweight strength limit. Many Doubles Women teams find that having one partner do the entire sled push solo while the other partner rests often outperforms a 50/50 split because of the start-stop friction cost. This is the single biggest strategy lever in Doubles Women.",
    raceStrategy:
      "Test sled push splits in training. Solo-vs-split can swing 30-60 seconds either way depending on partner strength gap. Keep the running tempo conservative through Run 4; the post-burpee runs are where most Doubles Women teams crack and lose minutes. Wall balls split 50-50 in fixed sets is reliable; rep-by-rep alternation rarely beats it.",
    faqs: [
      {
        question: "Is Doubles Women smaller than Doubles Mixed?",
        answer:
          "Yes, at most events. Doubles Mixed is consistently the largest doubles category because it allows teams to qualify based on either partner's solo time and removes the need for two athletes of the same gender to commit to the same race weekend.",
      },
      {
        question: "What weights does Doubles Women use?",
        answer:
          "Doubles Women races at Open Women weights: 102 kg sled push, 78 kg sled pull, 16 kg farmers carry, 10 kg sandbag lunges, 4 kg wall balls. Both partners use the same weights for any reps they complete.",
      },
    ],
  },
  "doubles-mixed": {
    divisionContext:
      "Doubles Mixed is a two-person team with one man and one woman. It is the single largest doubles category at every Hyrox event, often outdrawing Doubles Men and Doubles Women combined. Race format: both partners run together and split station work. Each station has a prescribed rep total, and most events require at least some contribution from each partner; specific minimum-contribution rules vary by station and by event.",
    trainingReality:
      "Doubles Mixed pacing is dictated by the slower partner on each station. The most common training mistake is the male partner pushing too hard on early stations and forcing the team to wait through his recovery on Run 5. Smart teams pace Run 1-3 to the female partner's threshold so the team can hold form together through the second half. Wall balls and lunges often split unevenly because the female partner's lighter ball/sandbag adds a strategic option that is unavailable in same-gender doubles.",
    raceStrategy:
      "The standard rule is that each station's reps must be split with the women's prescribed weight for any reps the woman performs and the men's prescribed weight for any reps the man performs. This means wall balls might run 60 reps at 6 kg + 40 reps at 4 kg. Plan these splits before race day. Confirm event-specific rules at registration.",
    faqs: [
      {
        question: "What weights does Doubles Mixed use at each station?",
        answer:
          "Each partner uses their gender's standard weight for any reps they complete. The man uses 152 kg sled push, 6 kg wall balls, 24 kg farmers carry; the woman uses 102 kg sled push, 4 kg wall balls, 16 kg farmers carry. Sleds are typically swapped in and out at the partner change.",
      },
      {
        question: "Why is Doubles Mixed the largest doubles category?",
        answer:
          "It opens entry to couples and to mixed-gender training partners, which is the most common social configuration at most gyms. It also allows teams to compete without needing two athletes of the same gender at the same fitness level, which is harder to coordinate.",
      },
    ],
  },
};

/**
 * Per-age-group unique guidance.
 *
 * Combined with CATEGORY_GUIDANCE on the [ageGroup] page so each of the 56
 * (category, age) URLs gets a meaningfully unique body. Without this, the
 * pages collapse into Google's "near-duplicate" classifier.
 */
export interface AgeGuidance {
  /** What is physiologically true at this age band. ~80-110 words. */
  physiology: string;
  /** How training shifts at this age. ~80-110 words. */
  trainingAdjustment: string;
  /** One FAQ unique to the age band. */
  faq: { question: string; answer: string };
}

export const AGE_GUIDANCE: Record<AgeGroup, AgeGuidance> = {
  u30: {
    physiology:
      "Under 30 is peak power-to-weight territory. VO2max is at lifetime peak, HRmax sits in the 195-205 range, recovery between sessions takes 24-36 hours, and tendon stiffness is low enough that burpee broad jumps are rarely a structural limiter. The biggest constraint at this age band is usually training maturity and consistency, not physiology. Most podium finishers across all divisions, in both men's and women's fields, are 25-29 years old at the time of their fastest race.",
    trainingAdjustment:
      "Under-30 athletes can absorb 6-day training weeks without the recovery penalty seen in 35+ athletes. The most common mistake is underestimating the value of station-specific volume and overinvesting in high-intensity intervals. A typical sub-65 men's build at this age band runs 50-60 km of weekly running, two station-specific sessions, and one strength maintenance session. Sleep is the rate-limiter, not workload.",
    faq: {
      question: "How fast should an under-30 athlete expect to finish Hyrox?",
      answer:
        "Realistic targets for a trained under-30 athlete: Open Men under 1:08, Open Women under 1:18, Pro Men under 1:00, Pro Women under 1:13. First-time finishers with 8 weeks of prep typically come in 8-12 minutes slower than these targets.",
    },
  },
  "30-34": {
    physiology:
      "30-34 is the peak Hyrox racing age band and the World Championship qualifying age for most divisions. Aerobic capacity is essentially at peak (1-2% decline since the mid-20s, not yet meaningful), HRmax has dropped 2-4 bpm from peak but remains race-ready, and recovery still moves at 36-48 hours per hard session. The fastest median times in any Hyrox category are typically held by 30-34-year-olds because training maturity and physiology are both working in concert.",
    trainingAdjustment:
      "Training at 30-34 looks structurally identical to under-30 but recovery between max-intensity sessions stretches by 12 hours. A typical structured plan for this age band uses 4-5 training days per week with one race-simulation session every 14 days, and 2-3 days of full recovery between threshold-hard work. Strength maintenance becomes more important than at 25; one weekly heavy compound session prevents the 35+ power decline.",
    faq: {
      question: "Is 30-34 the fastest age group in Hyrox?",
      answer:
        "By aggregated median finish times, yes. Under-30 athletes occasionally produce faster individual results, but the largest cohort of sub-1:00 Open Men and sub-1:15 Open Women finishes statistically lands in the 30-34 band. This is also the standard World Championship qualifying age band.",
    },
  },
  "35-39": {
    physiology:
      "Aerobic decline becomes measurable at 35-39: VO2max typically falls 1-2% per year, HRmax drops 4-6 bpm from peak, and the threshold-to-VO2max gap narrows. Tendon adaptation slows, which makes burpee broad jumps and the post-sled-push runs slightly harder to recover from. Recovery between hard sessions stretches to 48 hours. Many athletes peak at this age in their first season of structured training because training maturity offsets the modest physiological decline.",
    trainingAdjustment:
      "Replace one weekly high-intensity interval session with a threshold session. Weekly volume can stay at 30-35-year levels (40-60 km running) but rest between hard days needs to be enforced. Add a second weekly mobility/tendon session focused on calves, hamstrings, and shoulders to protect against the burpee broad jump and farmers carry transitions.",
    faq: {
      question: "Are Hyrox times much slower at 35-39 than 30-34?",
      answer:
        "Roughly 3-5% slower for trained athletes. For Open Men this means a sub-1:05 finish at 30-34 typically becomes a sub-1:07 finish at 38-39 with the same training volume. The decline is non-linear: most of the slowdown happens between 38 and 42.",
    },
  },
  "40-44": {
    physiology:
      "Masters age band. HRmax has typically dropped to 175-180 (vs 190+ in 20s), VO2max sits 5-8% below peak, and recovery between max-intensity sessions stretches to 60-72 hours. Tendon stiffness becomes a meaningful constraint on the burpee broad jump and on the post-burpee Run 5. Power output declines 3-5% per decade after 40 unless strength training is preserved. Most 40-44 athletes need to choose: race for absolute time, or race for masters-podium time. Both are valid.",
    trainingAdjustment:
      "Cut overall volume by 10-15% from peak years. Replace one running session per week with a low-impact rower or assault bike interval session. Strength training becomes non-negotiable: at least one weekly heavy compound session (squat, deadlift, or clean variant) preserves the power output that the sled push and sandbag lunges depend on. Many 40-44 athletes also reduce wall ball reps in training to protect shoulders.",
    faq: {
      question: "Can a 40-44 athlete still hit a sub-65 Open Men finish?",
      answer:
        "Yes, but realistically only with 12+ months of structured training and clean injury history. Most sub-65 finishers in the 40-44 band have prior elite or near-elite athletic backgrounds. For first-time masters athletes, sub-1:15 is a more realistic top-tier target.",
    },
  },
  "45-49": {
    physiology:
      "Tendon stiffness at 45-49 is meaningful enough to change race execution. The post-burpee broad jump run (Run 5) typically slows by 15-25 seconds per km vs younger age bands due to plantar fascia and Achilles fatigue. Sandbag lunges into wall balls is the second hardest transition because hip flexor and quadriceps recovery is slower. HRmax sits around 170-175, and the threshold-to-max gap is narrow. Many athletes shift from Pro to Open at this age band because the 152 kg sled push (Pro Women) or 202 kg sled push (Pro Men) takes too long to recover from.",
    trainingAdjustment:
      "Replace another running session with non-impact cardio. Add a weekly tendon-conditioning session (slow eccentric calf work, heel drops, single-leg squats) to protect against burpee broad jump and farmers carry tendon load. Strength sessions stay heavy but volume drops: 3-4 work sets per movement instead of 5-6. Sandbag lunge practice at race weight twice per week becomes essential.",
    faq: {
      question: "Should I switch from Pro to Open at age 45?",
      answer:
        "If your Pro finish is more than 8 minutes slower than your Open finish, switch to Open. The 50 kg sled-push penalty in Pro compounds late-race fatigue at 45-49 in a way that rarely shows up at 30-34. Most masters athletes find Open more sustainable.",
    },
  },
  "50-54": {
    physiology:
      "Sandbag lunges become the limiting station for many 50-54 athletes due to knee compression and hip flexor fatigue. Sled push rest-recovery slows because cardiovascular re-equilibration takes longer. HRmax has typically dropped to 165-170. Bone density and tendon stiffness both impose constraints on training volume that did not exist at 40. Most successful 50-54 racers have at least 5+ years of consistent endurance background; the age band is unforgiving for first-time athletes attempting peak times.",
    trainingAdjustment:
      "Cut weekly running volume by another 10-15% from 45-49 levels. Add a third non-impact cardio session and reduce running to 3 days per week. Strength training shifts toward hip and knee resilience: split squats, step-ups, and Romanian deadlifts replace front squats and back squats as primary movements. Wall ball volume in training caps at 200 reps per week to protect shoulders.",
    faq: {
      question: "What is the Hyrox sandbag lunge weight at age 50?",
      answer:
        "Sandbag lunge weight is set by division, not age: Open Men 20 kg, Open Women 10 kg, Pro Men 30 kg, Pro Women 15 kg. There is no age-graded weight reduction. Many 50+ athletes choose Open over Pro specifically to keep the sandbag manageable.",
    },
  },
  "55-59": {
    physiology:
      "55-59 is the age band where mobility work becomes the rate-limiter on race performance. HRmax sits around 160-165, VO2max is typically 12-15% below peak, and recovery between hard sessions takes 72+ hours. Wall balls become harder due to shoulder mobility loss; many athletes break the 100 reps into 10 sets of 10 to protect form. The post-station runs (Run 5 and Run 7 specifically) are where most 55-59 athletes lose 2-3 minutes vs their training pace.",
    trainingAdjustment:
      "Daily mobility (10-15 minutes) becomes essential. Running volume drops to 2-3 days per week with the rest substituted by rowing, biking, or swimming. Strength training shifts entirely to functional patterns: goblet squats, kettlebell swings, single-arm presses. Wall ball training caps at 50 reps per set in training. Many successful 55-59 athletes report that staying race-ready requires more recovery work than training work.",
    faq: {
      question: "Are wall balls really harder at 55-59 in Hyrox?",
      answer:
        "Yes, primarily because of shoulder mobility decline rather than strength. Most 55-59 athletes break the 100 reps into 5-10 smaller sets to keep form clean. The total time penalty vs an unbroken set is typically 30-60 seconds, which is far less than the form-failure penalty of an attempted unbroken set at this age.",
    },
  },
  "60-plus": {
    physiology:
      "60+ Hyrox racing prioritises completion, time-quality, and clean execution over absolute time. HRmax typically sits 150-160, recovery between max-intensity sessions can take 5-7 days, and the cumulative joint load of the 8 km of running plus the 8 stations is the dominant fatigue driver. Many 60+ athletes still finish under 1:30 in Open with consistent training, and the masters-plus podium is one of the most rewarding categories in the sport. Training discipline at this age band is the strongest single predictor of race-day execution.",
    trainingAdjustment:
      "Volume drops to 2 running sessions per week (one easy, one tempo), 2 strength sessions, and 2 mobility/recovery sessions. Race-specific training in the final 4 weeks adds one station-circuit session per week. Wall ball training stays in 25-rep sets to protect shoulders. Sled push practice happens only in the final 6 weeks before a target race to manage cumulative tendon load.",
    faq: {
      question: "Can I race Hyrox at 60+?",
      answer:
        "Yes, and the 60+ field is one of the fastest-growing age bands. Most 60+ athletes race Open division and target sub-1:35 to sub-1:50. The cut-off time of 2:30 is rarely a concern at this age band with structured preparation. Pro is rarely raced at 60+ due to the sled push weight.",
    },
  },
};

/**
 * Returns the calculator goal closest to the computed average finish for
 * a (category, age) combination, by looking up actual entries in
 * ALL_GOAL_TIME_CONFIGS rather than guessing a slug pattern.
 *
 * Returns null if no matching audience exists in the calculator data
 * (e.g. doubles-mixed has no per-time pages, only the main calculator).
 *
 * The slug-naming convention in calculator-goals.ts is audience-specific:
 *   open-men     → "sub-XX-hyrox"
 *   open-women   → "sub-XX-hyrox-women"
 *   pro-men      → "sub-XX-pro-men"
 *   pro-women    → "sub-XX-pro-women"
 *   doubles-men  → "sub-XX-hyrox-doubles-men"
 *   doubles-women→ "sub-XX-hyrox-doubles-women"
 *   doubles-mixed→ (no entries)
 *
 * Picks the smallest goal whose time is >= the computed average so the goal
 * page reads as an "achievable next target". If the average exceeds every
 * available goal, returns the largest goal (still useful, even if the user
 * is currently above that target finish time).
 */
export interface ClosestGoal {
  slug: string;
  goalLabel: string; // e.g. "1:25:00"
  goalShort: string; // e.g. "Sub-85"
  audienceLabel: string; // e.g. "Pro Women"
}

export function findClosestGoal(
  category: HyroxCategory,
  ageGroup: AgeGroup,
): ClosestGoal | null {
  const audienceMap: Record<HyroxCategory, string | null> = {
    "open-men": "open-men",
    "open-women": "open-women",
    "pro-men": "pro-men",
    "pro-women": "pro-women",
    "doubles-men": "doubles-men",
    "doubles-women": "doubles-women",
    "doubles-mixed": null,
  };
  const aud = audienceMap[category];
  if (!aud) return null;

  const candidates = ALL_GOAL_TIME_CONFIGS
    .filter((g) => g.audience === aud)
    .sort((a, b) => a.goalSeconds - b.goalSeconds);
  if (candidates.length === 0) return null;

  const finish = computeExpectedFinish(category, ageGroup);
  const target = finish.totalSeconds;

  // Pick the smallest goal with goalSeconds >= target (the "achievable" next milestone).
  const pick = candidates.find((g) => g.goalSeconds >= target) ?? candidates[candidates.length - 1];

  return {
    slug: pick.slug,
    goalLabel: pick.goalLabel,
    goalShort: pick.goalShort,
    audienceLabel: pick.audienceLabel,
  };
}
