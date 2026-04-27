/**
 * Station playbooks — lightweight per-station training guides.
 *
 * Powers two surfaces:
 *   1. /training/stations/[slug] — full playbook page per station.
 *   2. The trainer "diagnosis" inside the calculator — the topFixHint and
 *      recommendedPlanSlugs[0] are surfaced when a user's actual time at
 *      this station is below their peer benchmark.
 *
 * Playbooks are intentionally lightweight — they reuse existing training
 * sessions, training plans, and blog posts rather than introducing new
 * standalone programs.
 */

export interface PlaybookLimiter {
  title: string;
  detail: string;
}

export interface PlaybookDrill {
  title: string;
  detail: string;
}

export interface StationPlaybook {
  /** Matches stations.ts slug for the 8 race stations. "running" for the 9th. */
  slug: string;
  name: string;
  /** Short tagline used on the playbook hero + diagnosis cards. */
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  /** One-liner used in the calculator diagnosis "Top fix" cell. */
  topFixHint: string;
  /** Three biggest reasons athletes are slow at this station. */
  topLimiters: PlaybookLimiter[];
  /** Reusable session ids from training-sessions.ts (3–5 items). */
  keySessionIds: string[];
  /** Short technique/drill cues. */
  drillTips: PlaybookDrill[];
  /** Training plan slugs to recommend (most relevant first). */
  recommendedPlanSlugs: string[];
  /** Blog posts that go deeper on technique/strategy. */
  relatedBlogSlugs?: string[];
}

const skierg: StationPlaybook = {
  slug: "skierg",
  name: "SkiErg",
  tagline:
    "Cardio + posterior chain. The opener that decides whether your first run is fast or survival.",
  metaTitle: "Hyrox SkiErg Training — Cut 30 Seconds Off Station 1",
  metaDescription:
    "How to train Hyrox SkiErg — drills, key sessions, peer benchmarks, and the training plans that fix slow ski splits. Free playbook from Hyrox Guide.",
  topFixHint: "Drive from the hips, not the arms — ski volume builds the engine.",
  topLimiters: [
    {
      title: "Pulling with the arms",
      detail:
        "Most athletes try to power the SkiErg with biceps. Real power comes from a violent hip hinge — let bodyweight fall into the straps and the arms ride the wave.",
    },
    {
      title: "Going out too hot",
      detail:
        "The SkiErg is station 1 of 8. A blistering 1:50/500m split here costs you 60+ seconds on the very first run. Pace for a sub-6-minute average split, not a personal best.",
    },
    {
      title: "Insufficient ski-specific volume",
      detail:
        "SkiErg neuromuscular patterns transfer poorly from rowing. Train ski intervals, not just other erg work — at minimum once every 7–10 days.",
    },
  ],
  keySessionIds: ["skierg-intervals", "ski-2k-test", "tempo-5x1k", "compromised-mini"],
  drillTips: [
    {
      title: "Damper at 5",
      detail:
        "Higher damper feels strong but burns the lats by station 5 (rowing). Keep damper at 4–5 unless you weigh over 90 kg.",
    },
    {
      title: "Strap height matters",
      detail:
        "Set straps so the handles start at forehead height with arms extended overhead — not above the head. Lower start = more hip drive available.",
    },
    {
      title: "First 100 m relaxed",
      detail:
        "Aim to hit goal pace by 200 m, not from stroke 1. The first 200 m wakes up the posterior chain without spiking heart rate.",
    },
  ],
  recommendedPlanSlugs: ["12-week-hyrox-training-plan", "sub-90-hyrox-training-plan"],
  relatedBlogSlugs: ["hyrox-skierg-technique-pacing", "best-hyrox-pacing-strategy"],
};

const sledPush: StationPlaybook = {
  slug: "sled-push",
  name: "Sled Push",
  tagline:
    "The race-stopper. Heavy, long, and placed early enough you cannot afford to blow up.",
  metaTitle: "Hyrox Sled Push Training — Fix the Race-Stopper",
  metaDescription:
    "How to train Hyrox sled push — drills, key sessions, peer benchmarks, and the plans that drop sled-push splits. Free playbook from Hyrox Guide.",
  topFixHint: "Heavy sled volume at race weight is non-negotiable. Lighter doesn't transfer.",
  topLimiters: [
    {
      title: "Standing too upright",
      detail:
        "If your shoulders are over your hands, your legs do all the work and quads cook in 20 m. Body angle should be ~45°, shoulders ahead of hands, hips low.",
    },
    {
      title: "Insufficient unilateral strength",
      detail:
        "The sled push is essentially a 50 m walking lunge under load. If you can't do 16 walking lunges with a 24 kg dumbbell per hand, the sled will eat you.",
    },
    {
      title: "Stopping when it slows",
      detail:
        "A full stop costs 10+ seconds. The fix is technique — drop your hips lower and shorten your steps when momentum dies. Keep moving, even at 5 cm per stride.",
    },
  ],
  keySessionIds: ["sled-volume", "sled-heavy", "strength-lower", "strength-station"],
  drillTips: [
    {
      title: "Race weight or nothing",
      detail:
        "Train at 152 kg M / 102 kg W (Open) or +50 kg for Pro. Lighter sleds teach the wrong neuromuscular pattern.",
    },
    {
      title: "Segment the 50 m",
      detail:
        "Mental cue: 20 m, 20 m, 10 m finish. Three short pushes feel easier than one long slog.",
    },
    {
      title: "Drive through the balls of the feet",
      detail:
        "Heel contact = energy leak. Stay on the balls of the feet with short, fast steps.",
    },
  ],
  recommendedPlanSlugs: [
    "12-week-hyrox-training-plan",
    "sub-90-hyrox-training-plan",
    "sub-90-women-hyrox-training-plan",
  ],
  relatedBlogSlugs: ["hyrox-sled-push-technique"],
};

const sledPull: StationPlaybook = {
  slug: "sled-pull",
  name: "Sled Pull",
  tagline:
    "The race's grip-killer. Done wrong, it destroys forearms for everything that follows.",
  metaTitle: "Hyrox Sled Pull Training — Save Your Grip and Your Time",
  metaDescription:
    "How to train Hyrox sled pull — hand-over-hand drills, key sessions, peer benchmarks, and the plans that drop sled-pull splits. Free playbook from Hyrox Guide.",
  topFixHint:
    "Hand-over-hand rhythm with a wide stance — never start from bent elbows.",
  topLimiters: [
    {
      title: "Pulling with bent arms",
      detail:
        "Starting each pull from a bent elbow position uses biceps and forearms. Always start arms straight, drive the hips back, then let the arms finish the rep.",
    },
    {
      title: "Narrow stance",
      detail:
        "Feet too close together collapses the back. Wide athletic stance — feet wider than shoulder-width, knees bent — keeps the back flat and recruits glutes.",
    },
    {
      title: "Running the rope",
      detail:
        "Walking backwards with the rope instead of pulling hand-over-hand is a no-rep risk and wastes 5–10 seconds. Stand still, pull the sled to you.",
    },
  ],
  keySessionIds: ["sled-volume", "strength-upper", "carry-grip-circuit", "row-2k-test"],
  drillTips: [
    {
      title: "Grip rotation",
      detail:
        "Alternate which hand leads each set in training so neither forearm fatigues faster than the other on race day.",
    },
    {
      title: "Reset stance every 2 m",
      detail:
        "As the sled approaches, step back and re-establish the wide stance. Don't shuffle your feet inwards — bad position kills the next pull.",
    },
    {
      title: "Pre-fatigued pulls",
      detail:
        "Add 4×25 m sled pulls after a heavy lat session once a week. Builds the grip-while-tired durability that race day demands.",
    },
  ],
  recommendedPlanSlugs: ["12-week-hyrox-training-plan", "sub-90-hyrox-training-plan"],
  relatedBlogSlugs: ["hyrox-sled-pull-technique"],
};

const burpees: StationPlaybook = {
  slug: "burpee-broad-jumps",
  name: "Burpee Broad Jumps",
  tagline:
    "The race-maker. Steady metronome pace beats hero sprints every time.",
  metaTitle: "Hyrox Burpee Broad Jumps Training — Build the Metronome",
  metaDescription:
    "How to train Hyrox burpee broad jumps — pacing drills, key sessions, peer benchmarks, and the plans that fix slow burpee splits. Free playbook from Hyrox Guide.",
  topFixHint:
    "One burpee every 3–4 seconds, never breaking. Volume builds the rhythm.",
  topLimiters: [
    {
      title: "Jumping too far",
      detail:
        "Only the jump needs to cross the line. Ego jumps of 1.5–2 m destroy your legs by rep 30. Aim for a clean 1 m jump and a tight rhythm.",
    },
    {
      title: "Two-foot jump backwards",
      detail:
        "Jumping both feet back into the plank is harder on the calves than stepping back one foot at a time. Step-back burpees save 15–20 seconds across the 80 m.",
    },
    {
      title: "Holding the breath",
      detail:
        "Athletes who go silent on burpees redline within 40 reps. Breathe every burpee — inhale on the descent, exhale on the jump up.",
    },
  ],
  keySessionIds: ["burpee-volume", "compromised-mini", "easy-z2-45", "mini-hyrox"],
  drillTips: [
    {
      title: "Practise step-backs",
      detail:
        "Pick a leading foot in training and use the same foot every burpee. Race-day fatigue makes spontaneous footwork sloppy and slow.",
    },
    {
      title: "Eccentric chest descent",
      detail:
        "Lower the chest under control instead of dropping. Saves shoulders for the second half and keeps no-reps off the table.",
    },
    {
      title: "Run the cleanest 80 m",
      detail:
        "Pick a line down the lane on rep 1 and never veer. Drift adds distance and adds reps.",
    },
  ],
  recommendedPlanSlugs: ["sub-100-hyrox-training-plan", "12-week-hyrox-training-plan"],
  relatedBlogSlugs: ["hyrox-burpee-broad-jumps-strategy"],
};

const rowing: StationPlaybook = {
  slug: "rowing",
  name: "Rowing",
  tagline:
    "Active recovery if you pace it right. Heart-rate killer if you don't.",
  metaTitle: "Hyrox Rowing Training — Recover While You Move",
  metaDescription:
    "How to train Hyrox rowing — pacing drills, key sessions, peer benchmarks, and the plans that drop row splits. Free playbook from Hyrox Guide.",
  topFixHint: "1:2 drive-to-recovery ratio. Lower stroke rate, stronger drive.",
  topLimiters: [
    {
      title: "Rushing the slide",
      detail:
        "Returning to the catch as fast as the drive jacks heart rate. Slow the recovery 2× the drive — uses the row as a breathing reset between burpees and farmers carry.",
    },
    {
      title: "Sloppy foot strap",
      detail:
        "Strapping at the arch instead of the ball of the foot shortens the leg drive every stroke and wastes 5–10 seconds across 1,000 m.",
    },
    {
      title: "Wrong stroke order",
      detail:
        "Drive should be legs → back → arms; recovery is arms → back → legs. Reversing the order leaks power and burns lats.",
    },
  ],
  keySessionIds: ["row-2k-test", "ski-row-bike", "tempo-5x1k", "compromised-mini"],
  drillTips: [
    {
      title: "Hold 24–28 strokes/min",
      detail:
        "Lower stroke rate with a stronger pull moves the boat with less metabolic cost. Practise with the rate display on.",
    },
    {
      title: "Damper 4–5",
      detail:
        "Like the SkiErg, lower damper is usually better. Check the flywheel — drag factor 110–125 is the sweet spot for most Hyrox athletes.",
    },
    {
      title: "Quick exit",
      detail:
        "Unstrap the moment the monitor stops. Practise the stand-and-go transition in training so it's automatic on race day.",
    },
  ],
  recommendedPlanSlugs: ["12-week-hyrox-training-plan", "sub-90-hyrox-training-plan"],
  relatedBlogSlugs: ["hyrox-rowing-technique"],
};

const farmersCarry: StationPlaybook = {
  slug: "farmers-carry",
  name: "Farmers Carry",
  tagline:
    "Grip management under race-load cardiovascular stress. Walk fast, breathe calm.",
  metaTitle: "Hyrox Farmers Carry Training — Bulletproof Your Grip",
  metaDescription:
    "How to train Hyrox farmers carry — grip drills, key sessions, peer benchmarks, and the plans that drop carry splits. Free playbook from Hyrox Guide.",
  topFixHint: "Heavy carries weekly + walk, don't jog, on race day.",
  topLimiters: [
    {
      title: "Crushing the handle",
      detail:
        "Squeezing kettlebells like a lifeline accelerates forearm fatigue. Firm grip with relaxed fingers — let the bells hang from a strong hook, not a clenched fist.",
    },
    {
      title: "Jogging instead of walking",
      detail:
        "Jogging at race-weight kettlebells costs more energy than it saves time for 95% of athletes. A fast walk is almost always optimal.",
    },
    {
      title: "Insufficient carry volume",
      detail:
        "Most strength programs ignore loaded carries. Hyrox punishes that omission — 200 m at race weight is harder than every set you've ever done in the gym.",
    },
  ],
  keySessionIds: ["carry-grip-circuit", "strength-station", "strength-upper", "compromised-mini"],
  drillTips: [
    {
      title: "Thumbs facing forward",
      detail:
        "A subtle hook-grip position with thumbs forward reduces forearm activation versus a closed fist.",
    },
    {
      title: "Breathe every 3 steps",
      detail:
        "Controlled breathing keeps grip calm. Panic breathing wrecks forearms within 100 m.",
    },
    {
      title: "One reset maximum",
      detail:
        "If you must put the bells down, pick them straight back up. Two resets cost more than fighting through.",
    },
  ],
  recommendedPlanSlugs: ["12-week-hyrox-training-plan", "sub-90-women-hyrox-training-plan"],
  relatedBlogSlugs: ["hyrox-farmers-carry-sandbag-lunges"],
};

const lunges: StationPlaybook = {
  slug: "sandbag-lunges",
  name: "Sandbag Lunges",
  tagline:
    "Quad-burner with grip and core demands. The station that decides whether wall balls are possible.",
  metaTitle: "Hyrox Sandbag Lunges Training — Save Your Legs for Wall Balls",
  metaDescription:
    "How to train Hyrox sandbag lunges — technique drills, key sessions, peer benchmarks, and the plans that drop lunge splits. Free playbook from Hyrox Guide.",
  topFixHint: "Sandbag high on traps, short strides, drive through the front heel.",
  topLimiters: [
    {
      title: "Sandbag too low",
      detail:
        "A bag sliding down to the lower back forces forward lean and crushes the lower back. Position the bag high on the traps and grip it like a back squat.",
    },
    {
      title: "Strides too long",
      detail:
        "Long strides feel powerful but burn quads inside 20 reps. Keep strides just past hip-width — short and clean.",
    },
    {
      title: "Driving through the toes",
      detail:
        "Front-foot drive must come from the heel. Toe drive shifts load to quads only and skips glutes — twice the local fatigue, half the propulsion.",
    },
  ],
  keySessionIds: ["lunge-volume", "strength-lower", "strength-station", "compromised-mini"],
  drillTips: [
    {
      title: "10-rep clusters",
      detail:
        "100 m is ~70 lunges. Break it mentally into 7 clusters of 10 — counting to 70 is a slog, counting to 10 seven times is doable.",
    },
    {
      title: "Reset only at lane lines",
      detail:
        "If you stop, stop at a lane line — never mid-stride. Restarting from a known landmark saves seconds and avoids no-reps.",
    },
    {
      title: "Train at race weight",
      detail:
        "20 kg M / 10 kg W Open. Lighter bags don't load the spinal erectors enough to transfer.",
    },
  ],
  recommendedPlanSlugs: [
    "12-week-hyrox-training-plan",
    "sub-90-hyrox-training-plan",
    "sub-90-women-hyrox-training-plan",
  ],
  relatedBlogSlugs: ["hyrox-farmers-carry-sandbag-lunges"],
};

const wallBalls: StationPlaybook = {
  slug: "wall-balls",
  name: "Wall Balls",
  tagline:
    "The final boss. Grip is shot, legs are gone, and accuracy becomes the limiter.",
  metaTitle: "Hyrox Wall Balls Training — Conquer the Final Boss",
  metaDescription:
    "How to train Hyrox wall balls — pacing drills, key sessions, peer benchmarks, and the plans that drop wall ball splits. Free playbook from Hyrox Guide.",
  topFixHint:
    "Plan sets of 15–20 from rep 1 — never go for unbroken, no-reps cost more than micro-rests.",
  topLimiters: [
    {
      title: "Inconsistent squat depth",
      detail:
        "A no-rep costs 1 missed throw plus 2 seconds of judge re-set — more than the time saved by skimping depth. Break parallel clearly every rep.",
    },
    {
      title: "Power from the arms",
      detail:
        "Wall balls are a leg movement. Arms guide; hips drive. Athletes who throw with shoulders gas out by rep 30.",
    },
    {
      title: "Going for unbroken",
      detail:
        "Even elites break wall balls into 25/25/25/25 or 30/25/25/20. A planned break at rep 20 is faster than a panic break at rep 35.",
    },
  ],
  keySessionIds: ["wall-ball-test", "strength-lower", "compromised-mini", "lunge-volume"],
  drillTips: [
    {
      title: "Set goals from rep 1",
      detail:
        "Decide your set scheme before you pick up the ball. Sub-8 minutes typically means 30/25/25/20.",
    },
    {
      title: "Breathe at the top",
      detail:
        "Inhale as the ball leaves the hands, exhale on the squat catch. Locking out breathing pattern saves grip.",
    },
    {
      title: "Practise with race ball",
      detail:
        "9 kg M / 6 kg W to a 3 m / 2.7 m target. Cross-fit medicine balls of the wrong weight build the wrong rhythm.",
    },
  ],
  recommendedPlanSlugs: [
    "12-week-hyrox-training-plan",
    "sub-90-hyrox-training-plan",
    "sub-90-women-hyrox-training-plan",
  ],
  relatedBlogSlugs: ["hyrox-wall-balls-technique"],
};

const running: StationPlaybook = {
  slug: "running",
  name: "Running",
  tagline:
    "8 km is half the race. Every 30 s/km of speed = 4 minutes off your finish.",
  metaTitle: "Hyrox Running Training — The Engine That Drops Your Finish Time",
  metaDescription:
    "How to train Hyrox running — compromised running drills, key sessions, peer benchmarks, and the plans that build the engine. Free playbook from Hyrox Guide.",
  topFixHint:
    "Race pace ≠ 5K pace. Train compromised running — running fast on tired legs.",
  topLimiters: [
    {
      title: "Training fresh, racing fatigued",
      detail:
        "Hyrox running happens on a posterior chain that just finished a sled push. Fresh-leg 5K fitness barely transfers — compromised running sessions do.",
    },
    {
      title: "Running too far",
      detail:
        "A 60 km/week marathon plan doesn't build Hyrox speed. 30–45 km/week with quality threshold + 1k repeats works better than 70 km/week of junk.",
    },
    {
      title: "No race-pace work",
      detail:
        "If you've never run 8×1 km at goal pace with 60 s rest, you'll find out on race day what that feels like. Train it weekly from week 5 onwards.",
    },
  ],
  keySessionIds: [
    "1k-repeats-6x",
    "1k-repeats-8x",
    "tempo-5x1k",
    "compromised-mini",
    "long-z2-90",
  ],
  drillTips: [
    {
      title: "Treadmill specificity",
      detail:
        "Race-day running is on a treadmill. Do at least half your race-pace sessions on a treadmill so the stride pattern transfers.",
    },
    {
      title: "60-second rest",
      detail:
        "1k repeats with 60 s rest mirror the Hyrox transition window. Longer rest produces a different (less specific) adaptation.",
    },
    {
      title: "Negative-split practice",
      detail:
        "Run the back half of every race-pace session faster than the front half. Builds the discipline that wins the second half of a Hyrox.",
    },
  ],
  recommendedPlanSlugs: [
    "12-week-hyrox-training-plan",
    "sub-90-hyrox-training-plan",
    "sub-75-hyrox-training-plan",
  ],
  relatedBlogSlugs: ["best-hyrox-pacing-strategy"],
};

export const STATION_PLAYBOOKS: StationPlaybook[] = [
  skierg,
  sledPush,
  sledPull,
  burpees,
  rowing,
  farmersCarry,
  lunges,
  wallBalls,
  running,
];

const playbookMap = new Map<string, StationPlaybook>(
  STATION_PLAYBOOKS.map((p) => [p.slug, p]),
);

export function getPlaybook(slug: string): StationPlaybook | undefined {
  return playbookMap.get(slug);
}
