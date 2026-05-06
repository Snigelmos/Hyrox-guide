/**
 * Gear comparison dataset for /gear/[slug]/ pages.
 *
 * Brand-vs-brand and equipment-vs-equipment comparisons specifically for
 * Hyrox use cases. Distinct from /compare/ which compares Hyrox vs other
 * sports/events.
 */

export interface GearComparisonRow {
  attribute: string;
  productA: string;
  productB: string;
}

export interface GearComparison {
  slug: string;
  productALabel: string;
  productBLabel: string;
  category: "shoes" | "equipment";
  title: string;
  metaDescription: string;
  intro: string;
  bottomLine: string;
  rows: GearComparisonRow[];
  bestFor: { productA: string[]; productB: string[] };
  faqs: { question: string; answer: string }[];
  internalLinks: { href: string; label: string }[];
}

export const GEAR_COMPARISONS: GearComparison[] = [
  {
    slug: "puma-fast-r-vs-nike-metcon",
    productALabel: "Puma Fast-R Nitro Elite",
    productBLabel: "Nike Metcon 9",
    category: "shoes",
    title: "Puma Fast-R vs Nike Metcon 9 for Hyrox — Which Is Faster?",
    metaDescription:
      "Puma Fast-R Nitro Elite vs Nike Metcon 9 for Hyrox: running speed, sled-push grip, wall ball stability, and which shoe wins on the 8 km + 8 stations format.",
    intro:
      "Puma is the official Hyrox sponsor and the Fast-R Nitro Elite is the brand's running-first race shoe. The Nike Metcon 9 is the long-standing functional fitness shoe most CrossFit and Hyrox racers wear by default. They optimise for opposite ends of the Hyrox course.",
    bottomLine:
      "Pick the Puma Fast-R if you finish in 60-80 minutes and your race is decided on running splits. Pick the Nike Metcon 9 if you're in the 80-100 minute window and stations dominate your time, especially the sled push and wall ball.",
    rows: [
      { attribute: "Running performance", productA: "Excellent — carbon plate, 39 mm Nitro foam stack", productB: "Moderate — flat midsole, designed for stability not speed" },
      { attribute: "Sled push grip", productA: "Good but flexes under heavy load", productB: "Excellent — flat firm sole, ideal for driving force" },
      { attribute: "Sled pull stability", productA: "Less stable — soft foam compresses on lean-back", productB: "Excellent — firm base anchors body weight" },
      { attribute: "Wall ball stability", productA: "Adequate — toe box flexes on squat", productB: "Excellent — flat sole and stiff platform" },
      { attribute: "Sandbag lunge support", productA: "Good — heel cup is firm despite stack", productB: "Excellent — stable lateral support" },
      { attribute: "Burpee broad jump", productA: "Excellent — light and responsive on push-off", productB: "Adequate — heavier per shoe" },
      { attribute: "Weight (men's UK 10)", productA: "~225 g", productB: "~370 g" },
      { attribute: "Stack height", productA: "39 mm heel / 31 mm forefoot", productB: "~12 mm heel / 8 mm forefoot" },
      { attribute: "Drop", productA: "8 mm", productB: "4 mm" },
      { attribute: "Price (RRP)", productA: "€220-260", productB: "€140-160" },
    ],
    bestFor: {
      productA: ["Sub-80 racers where running pace decides the race", "Athletes prioritising 8 km running speed", "Lighter-weight athletes (sled push leverage less critical)", "Anyone with strong sled push from gym training"],
      productB: ["Sub-100 racers where stations dominate", "Heavy athletes who push the sled with body weight", "First-timers who want one shoe for training + race", "Athletes with weak lower-leg stability"],
    },
    faqs: [
      { question: "Are Puma Fast-R the official Hyrox shoe?", answer: "Puma is the official global Hyrox sponsor as of 2025-26 and the Fast-R Nitro Elite (and the Deviate Nitro 3 / Velocity Nitro 3) are positioned as the brand's Hyrox racing options. There's no rule requiring Puma — any shoe that meets the rubber-sole rule is allowed." },
      { question: "Can you do sled push in the Puma Fast-R?", answer: "Yes, but you'll feel the carbon plate flex under 152 kg of sled push. Most racers report it's manageable up to about 90 minutes; longer races may benefit from a firmer shoe." },
      { question: "Are Nike Metcon 9 banned in Hyrox?", answer: "No. Nike Metcons are fully legal under Hyrox shoe rules — they have a rubber sole, no plate exposed, and standard cushioning. The Metcon 9 is one of the most-worn shoes in Hyrox racing." },
      { question: "Which shoe is better for first-time Hyrox racers?", answer: "Nike Metcon 9 is the safer choice for first-timers. It's versatile across stations, doesn't require adaptation, and forgives technique errors on sled push and wall balls. Save the racing-foam shoes for race #2 or #3." },
    ],
    internalLinks: [
      { href: "/blog/hyrox-shoe-rules/", label: "Hyrox shoe rules explained" },
      { href: "/blog/best-hyrox-pacing-strategy/", label: "Hyrox pacing strategy" },
      { href: "/gear/reebok-nano-vs-nike-metcon/", label: "Reebok Nano X4 vs Nike Metcon 9" },
      { href: "/calculator/", label: "Hyrox time calculator" },
    ],
  },
  {
    slug: "nike-metcon-9-vs-nobull-trainer",
    productALabel: "Nike Metcon 9",
    productBLabel: "NoBull Trainer+",
    category: "shoes",
    title: "Nike Metcon 9 vs NoBull Trainer+ for Hyrox — Direct Comparison",
    metaDescription:
      "Nike Metcon 9 vs NoBull Trainer+ for Hyrox: running comfort, sled grip, durability, and which shoe is the better all-day Hyrox trainer-racer.",
    intro:
      "The Nike Metcon 9 and NoBull Trainer+ are both functional fitness shoes worn widely in Hyrox. They're closer in profile than they are different — both prioritise stability over running speed. But the details matter for a race that mixes 8 km of running with 8 stations.",
    bottomLine:
      "Pick the Nike Metcon 9 if you want better running feel and a softer toe box. Pick the NoBull Trainer+ if you prioritise sled push grip and a more rigid platform on lunges and wall balls.",
    rows: [
      { attribute: "Running feel", productA: "Better — slight forefoot flex", productB: "Stiffer — feels firmer underfoot" },
      { attribute: "Sled push grip", productA: "Excellent", productB: "Excellent — slightly firmer base" },
      { attribute: "Wall ball stability", productA: "Excellent", productB: "Excellent" },
      { attribute: "Sandbag lunge", productA: "Very good", productB: "Excellent — stiffer heel cup" },
      { attribute: "Burpee broad jump", productA: "Adequate", productB: "Adequate" },
      { attribute: "Weight (men's UK 10)", productA: "~370 g", productB: "~390 g" },
      { attribute: "Upper material", productA: "Mesh + supportive overlays", productB: "SuperFabric (more durable)" },
      { attribute: "Durability (12 months heavy use)", productA: "Good — outsole wears moderately", productB: "Excellent — known for long lifespan" },
      { attribute: "Price (RRP)", productA: "€140-160", productB: "€140-180" },
    ],
    bestFor: {
      productA: ["Athletes who prioritise running comfort", "Those switching from CrossFit", "Athletes with narrower feet"],
      productB: ["Athletes who prioritise sled and lunge stability", "Heavy athletes wanting a firmer platform", "Long-term durability seekers", "Wider-footed athletes"],
    },
    faqs: [
      { question: "Are NoBull Trainers good for Hyrox?", answer: "Yes — NoBull Trainer+ is one of the most popular Hyrox shoes globally. The flat firm sole is ideal for sled push and wall balls; the SuperFabric upper holds up to repeated rope work and durability over months of training." },
      { question: "Which lasts longer: Nike Metcon 9 or NoBull Trainer+?", answer: "NoBull Trainer+ is generally regarded as the more durable shoe — many users report 12-18 months of heavy use vs 8-12 for Metcon 9. The SuperFabric upper resists wear from sled, sandbag, and rope work." },
      { question: "Can I run 8 km in NoBull Trainers comfortably?", answer: "Yes for most athletes. Some report stiffness at higher mileage (>10 km). For Hyrox specifically, the 8 km running is broken into 1 km segments, so the running feel is less critical than in a continuous run." },
      { question: "Which is better for sled push?", answer: "Both excel. The NoBull Trainer+ has a slight edge thanks to a firmer outsole compound, but the difference is small — both are far better than running shoes for sled work." },
    ],
    internalLinks: [
      { href: "/blog/hyrox-shoe-rules/", label: "Hyrox shoe rules explained" },
      { href: "/gear/puma-fast-r-vs-nike-metcon/", label: "Puma Fast-R vs Nike Metcon 9" },
      { href: "/gear/reebok-nano-vs-nike-metcon/", label: "Reebok Nano X4 vs Nike Metcon 9" },
    ],
  },
  {
    slug: "puma-deviate-nitro-vs-nike-pegasus",
    productALabel: "Puma Deviate Nitro 3",
    productBLabel: "Nike Pegasus 41",
    category: "shoes",
    title: "Puma Deviate Nitro 3 vs Nike Pegasus 41: Hyrox and Daily Running Comparison (Puma Nitro vs Nike Pegasus)",
    metaDescription:
      "Puma Deviate Nitro 3 vs Nike Pegasus 41 for Hyrox and daily running: running speed, station stability, weight, and which is the better all-around running shoe in the Puma Nitro vs Nike Pegasus debate.",
    intro:
      "The Puma Deviate Nitro 3 and Nike Pegasus 41 are both daily-trainer running shoes capable of handling Hyrox. The Puma Nitro vs Nike Pegasus question comes up constantly because both sit at the same price point and target the same runner. Neither has a rigid carbon plate, so they're both legal and comfortable across the 8 km of running plus 8 functional stations.",
    bottomLine:
      "Pick the Puma Deviate Nitro 3 for slightly faster running and better breathability. Pick the Nike Pegasus 41 for more cushioning and a more forgiving fit during stations.",
    rows: [
      { attribute: "Running pace (race day)", productA: "Slightly faster — Nitro foam is responsive", productB: "Slightly slower but more comfortable" },
      { attribute: "Sled push stability", productA: "Adequate — softer foam compresses", productB: "Adequate — softer foam compresses" },
      { attribute: "Sled pull stability", productA: "Adequate", productB: "Adequate" },
      { attribute: "Wall ball stability", productA: "Adequate — heel cup firm", productB: "Adequate — softer overall" },
      { attribute: "Stack height", productA: "38 mm heel / 30 mm forefoot", productB: "37 mm heel / 27 mm forefoot" },
      { attribute: "Drop", productA: "8 mm", productB: "10 mm" },
      { attribute: "Weight (men's UK 10)", productA: "~280 g", productB: "~290 g" },
      { attribute: "Cushioning feel", productA: "Responsive", productB: "Soft and forgiving" },
      { attribute: "Price (RRP)", productA: "€140-170", productB: "€140-160" },
    ],
    bestFor: {
      productA: ["Athletes who prioritise running speed", "Lighter athletes (under 75 kg)", "Athletes with strong sled technique", "Hyrox runners with strong cardio engine"],
      productB: ["Athletes prioritising comfort over speed", "Heavier athletes (over 80 kg)", "Athletes with knee or joint sensitivity", "Hyrox first-timers wanting cushioning"],
    },
    faqs: [
      { question: "Are running shoes legal in Hyrox?", answer: "Yes, road-running shoes are fully legal as long as they have a rubber sole and no exposed carbon plate that could damage the venue floor. Both Puma Deviate Nitro 3 and Nike Pegasus 41 pass." },
      { question: "Can I do sled push in the Pegasus 41?", answer: "Yes, but the soft foam compresses under heavy load and you'll feel less ground feedback. Most athletes report it's manageable for sub-90 racers but harder for sub-75 athletes who push aggressively." },
      { question: "Should I race Hyrox in running shoes or training shoes?", answer: "Depends on your race time. Sub-75 racers often choose running shoes to bank time on the 8 km. Sub-95 racers often choose training shoes for sled and wall ball stability. The break-even is roughly 80-85 minutes." },
    ],
    internalLinks: [
      { href: "/blog/hyrox-shoe-rules/", label: "Hyrox shoe rules explained" },
      { href: "/gear/puma-fast-r-vs-nike-metcon/", label: "Puma Fast-R vs Nike Metcon 9" },
    ],
  },
  {
    slug: "reebok-nano-vs-nike-metcon",
    productALabel: "Reebok Nano X4",
    productBLabel: "Nike Metcon 9",
    category: "shoes",
    title: "Reebok Nano X4 vs Nike Metcon 9: CrossFit and Hyrox Trainer Comparison (2026)",
    metaDescription:
      "Reebok Nano X4 vs Nike Metcon 9 for CrossFit and Hyrox: running, sled push, wall balls, durability, and which is the better hybrid functional fitness trainer in 2026.",
    intro:
      "Reebok Nano X4 and Nike Metcon 9 are the two classic functional fitness shoes. Both were built for CrossFit and both are now adopted heavily by Hyrox racers, so the comparison covers the same shoes whether you're pushing a sled at a Hyrox or grinding through Murph in your CrossFit box. They've evolved closer to each other over the years: the X4 is now more comfortable for running, and the Metcon 9 is firmer underfoot for stations than previous generations.",
    bottomLine:
      "Pick the Reebok Nano X4 if you run more than you lift and want a softer ride. Pick the Nike Metcon 9 if your training is heavier on lifting, sled work, and wall balls and you want a stiffer platform. The same logic applies whether you're optimising for CrossFit metcons or Hyrox intervals.",
    rows: [
      { attribute: "Running comfort", productA: "Better — softer midsole", productB: "Stiffer — feels harder underfoot" },
      { attribute: "Sled push", productA: "Very good", productB: "Excellent" },
      { attribute: "Sled pull", productA: "Very good", productB: "Excellent" },
      { attribute: "Wall ball stability", productA: "Very good", productB: "Excellent" },
      { attribute: "Sandbag lunge", productA: "Very good — flexible toe box helps", productB: "Excellent — stiffer heel cup" },
      { attribute: "Weight (men's UK 10)", productA: "~340 g", productB: "~370 g" },
      { attribute: "Upper material", productA: "Engineered mesh", productB: "Mesh + overlays" },
      { attribute: "Heel-toe drop", productA: "7 mm", productB: "4 mm" },
      { attribute: "Price (RRP)", productA: "€140-160", productB: "€140-160" },
    ],
    bestFor: {
      productA: ["Athletes who run 30+ km per week", "Athletes with sensitive feet", "First-time Hyrox racers", "CrossFitters who do high-volume metcons with running"],
      productB: ["Sled push and station-heavy training", "Athletes prioritising stability", "Heavy athletes (over 90 kg)", "CrossFitters who lift heavy and value a stiff platform"],
    },
    faqs: [
      { question: "Which is better for CrossFit, Reebok Nano X4 or Nike Metcon 9?", answer: "It depends on what your CrossFit programming looks like. The Metcon 9 is the better all-round CrossFit shoe for athletes who lift heavy and do shorter, lift-dominant WODs. The Nano X4 is the better pick if your box does more running, double-unders, and longer engine pieces, where the softer midsole pays off." },
      { question: "Is Reebok Nano X4 good for Hyrox?", answer: "Yes. Nano X4 is one of the most versatile Hyrox training shoes. The 7 mm drop and softer midsole make 8 km of running more comfortable than the Metcon line, and the platform is firm enough for sled and wall balls." },
      { question: "Are Nano X4 and Metcon 9 essentially the same shoe?", answer: "They've converged but they're not identical. The Metcon 9 still has a lower 4 mm drop and a firmer overall ride, which makes it more lift-friendly. The Nano X4 has a higher 7 mm drop and a softer midsole, which makes it more run-friendly. On stations both feel stable, on running the Nano feels noticeably softer." },
      { question: "Which is better for sled push?", answer: "Nike Metcon 9 has a slight edge for sled push due to its firmer outsole and lower drop. The Nano X4 is fully capable for most athletes; the difference only matters at the sub-75 Hyrox or competitive CrossFit level where every second on the platform counts." },
      { question: "Can I race Hyrox in Nano X4?", answer: "Yes. Many Hyrox racers train and race in the Nano X4 for sub-90 finishes. Faster racers (sub-75) sometimes switch to a dedicated running shoe for race day." },
      { question: "Which lasts longer in heavy CrossFit and Hyrox use?", answer: "Both are built for the abuse of functional training. Most users report 9-12 months of heavy daily use before the outsole starts to show wear. The Metcon 9 tends to wear faster on the medial forefoot from rope climbs; the Nano X4 wears faster on the outsole heel." },
    ],
    internalLinks: [
      { href: "/gear/nike-metcon-9-vs-nobull-trainer/", label: "Nike Metcon 9 vs NoBull Trainer+" },
      { href: "/gear/puma-fast-r-vs-nike-metcon/", label: "Puma Fast-R vs Nike Metcon 9" },
      { href: "/gear/puma-deviate-nitro-vs-nike-pegasus/", label: "Puma Deviate Nitro 3 vs Nike Pegasus 41" },
      { href: "/blog/hyrox-shoe-rules/", label: "Hyrox shoe rules" },
      { href: "/blog/best-hyrox-pacing-strategy/", label: "Hyrox pacing strategy" },
    ],
  },
  {
    slug: "kettlebell-vs-dumbbell-hyrox",
    productALabel: "Kettlebell",
    productBLabel: "Dumbbell",
    category: "equipment",
    title: "Kettlebell vs Dumbbell for Hyrox Training — Which Is Better?",
    metaDescription:
      "Kettlebell vs dumbbell for Hyrox training: which builds the stations, which is more time-efficient, and which to invest in if you can only own one.",
    intro:
      "Hyrox uses neither a kettlebell nor a dumbbell as a station — but both are training tools that build the strength endurance, grip, and conditioning that Hyrox demands. The question is which to prioritise in your home gym or weekly programming.",
    bottomLine:
      "Kettlebells win for Hyrox-specific conditioning (swings build the explosive hip drive of sled push and broad jumps). Dumbbells win for raw strength building (lunges, presses, rows). Most serious Hyrox athletes own both.",
    rows: [
      { attribute: "Conditioning value", productA: "Excellent — swing/clean cycles build aerobic-strength endurance", productB: "Moderate — slower-paced movements" },
      { attribute: "Hyrox-specific carryover", productA: "Excellent — swing mimics sled push hip drive", productB: "Good — lunges and presses transfer directly" },
      { attribute: "Grip building", productA: "Excellent — thick handle, swing forces hold", productB: "Good — knurled handles" },
      { attribute: "Time efficiency in workouts", productA: "Excellent — one tool, many movements", productB: "Moderate — usually need pairs" },
      { attribute: "Strength building", productA: "Moderate — weights cap at ~32-48 kg", productB: "Excellent — pairs available to 60+ kg" },
      { attribute: "Cost (single 24 kg)", productA: "€60-90", productB: "€50-70" },
      { attribute: "Versatility (movements)", productA: "Higher — swings, snatches, presses, carries, get-ups", productB: "Higher in upper body — bench, row, press, curl" },
      { attribute: "Skill ceiling", productA: "High — technique matters", productB: "Lower — easier to learn" },
    ],
    bestFor: {
      productA: ["Athletes prioritising conditioning", "Time-strapped athletes (one tool, many movements)", "Athletes with home-gym space constraints", "Anyone training sled push pattern"],
      productB: ["Strength-focused athletes", "Athletes building station-specific power", "Athletes with prior bodybuilding background", "Larger home-gym setups"],
    },
    faqs: [
      { question: "Should I train with kettlebells for Hyrox?", answer: "Yes. Kettlebell swings, snatches, and clean-and-presses build the hip-drive power and aerobic-strength endurance that translate directly to sled push, broad jumps, and the cumulative fatigue of Hyrox stations. A 24 kg kettlebell is the most useful single piece of equipment for Hyrox conditioning." },
      { question: "Can I train Hyrox with only dumbbells?", answer: "Yes — dumbbell pairs cover lunges (sandbag pattern), presses, rows, and carries. You'll just need substitutes for kettlebell swings (Romanian deadlifts can mimic the hip pattern). Best results combine both tools." },
      { question: "What weight kettlebell should I get for Hyrox?", answer: "Men: 24 kg as the daily driver, 32 kg for heavier work. Women: 16 kg as the daily driver, 20-24 kg for heavier work. Buy one bell first; add a heavier one once you're consistently training 3-4× per week." },
      { question: "Are kettlebells used in Hyrox races?", answer: "No — Hyrox stations don't include kettlebells. The race uses a sled, ski erg, sandbag, dumbbells (in some doubles workouts), wall ball, and rower. But kettlebell training builds the conditioning that Hyrox rewards." },
    ],
    internalLinks: [
      { href: "/training/", label: "Hyrox training plans" },
      { href: "/calculator/", label: "Hyrox time calculator" },
    ],
  },
  {
    slug: "air-bike-vs-row-erg-hyrox",
    productALabel: "Air Bike",
    productBLabel: "Row Erg",
    category: "equipment",
    title: "Air Bike vs Row Erg for Hyrox Training — Which Builds Better Cardio?",
    metaDescription:
      "Air bike vs Concept2 rower for Hyrox training: which builds the aerobic engine faster, which is more Hyrox-specific, and which to invest in.",
    intro:
      "Hyrox tests rowing (1,000 m) and SkiErg (1,000 m) directly. Neither station uses an air bike. But the air bike is one of the most-used conditioning tools in serious Hyrox training programs — it builds the redline-recovery capacity that the race rewards.",
    bottomLine:
      "Pick the row erg if you can only afford one — it's a direct Hyrox station carry-over. Add an air bike for off-feet conditioning (recovery from injuries, more variety) once your rower training is dialled in.",
    rows: [
      { attribute: "Hyrox-specific carryover", productA: "Indirect — builds the engine, not the station", productB: "Direct — Hyrox station 5 (1,000 m row)" },
      { attribute: "Conditioning intensity", productA: "Brutal — uncapped resistance scales with effort", productB: "High — but pace-controllable" },
      { attribute: "Lower-body involvement", productA: "Moderate — quads, glutes", productB: "High — quads, glutes, hamstrings drive each stroke" },
      { attribute: "Upper-body involvement", productA: "Moderate — arms in sync with legs", productB: "Moderate — arms finish each stroke" },
      { attribute: "Spinal load", productA: "Low — seated, neutral spine", productB: "Moderate — flexion + extension cycle" },
      { attribute: "Off-feet recovery use", productA: "Excellent", productB: "Excellent" },
      { attribute: "Cost (entry-level)", productA: "€700-1,200 (Assault Bike, Rogue Echo)", productB: "€900-1,200 (Concept2 RowErg)" },
      { attribute: "Skill ceiling", productA: "Low — pedal hard", productB: "High — technique matters" },
      { attribute: "Boredom factor", productA: "High — relentless", productB: "Lower — pace-able" },
    ],
    bestFor: {
      productA: ["Athletes building VO2 max", "Off-feet recovery training", "Brutal conditioning sessions"],
      productB: ["Direct Hyrox station prep", "Athletes building aerobic base", "Anyone targeting sub-3:50 for 1k Hyrox row"],
    },
    faqs: [
      { question: "Is the air bike good for Hyrox training?", answer: "Yes — air bike intervals build the redline-recovery capacity that Hyrox rewards (multiple stations near threshold with running between). 5-8 × 30-second hard efforts on the bike with 60 seconds rest is one of the most effective Hyrox conditioning sessions." },
      { question: "Should I row or bike if I only have time for one cardio session?", answer: "Row. The Hyrox 1k row is a direct station — practice it. Bike sessions complement, but rowing is non-negotiable. If you have time for two, do one row + one bike per week." },
      { question: "Will an air bike replace running for Hyrox?", answer: "No. Hyrox is 8 km of running — you must train running. The bike supplements but doesn't replace running fitness. Use it on recovery days or as a second cardio session, not as a substitute." },
      { question: "What air bike is best for Hyrox training?", answer: "Assault AirBike or Rogue Echo are the two most popular for serious training. The Echo is generally considered slightly more durable; the Assault is more widely available." },
    ],
    internalLinks: [
      { href: "/blog/hyrox-rowing-pacing/", label: "Hyrox rowing pacing strategy" },
      { href: "/training/", label: "Hyrox training plans" },
    ],
  },
];
