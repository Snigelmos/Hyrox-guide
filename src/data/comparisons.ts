/**
 * Hyrox comparison pages dataset.
 *
 * Used by /compare/[slug] pages to generate side-by-side comparisons against
 * other fitness events. Each entry is a head-to-head with structured rows so
 * the page renders consistently while being unique per query.
 */

export interface ComparisonRow {
  attribute: string;
  hyrox: string;
  other: string;
}

export interface Comparison {
  slug: string;
  hyroxLabel: string;
  otherLabel: string;
  title: string;
  metaDescription: string;
  intro: string;
  bottomLine: string;
  rows: ComparisonRow[];
  bestFor: { hyrox: string[]; other: string[] };
  faqs: { question: string; answer: string }[];
  internalLinks: { href: string; label: string }[];
}

export const COMPARISONS: Comparison[] = [
  {
    slug: "hyrox-vs-marathon",
    hyroxLabel: "Hyrox",
    otherLabel: "Marathon",
    title: "Hyrox vs Marathon — Which Race Is Right for You?",
    metaDescription:
      "Hyrox vs marathon: training time, race format, finish times, gear cost, and which sport rewards strength vs endurance. Decide which to commit to.",
    intro:
      "Hyrox and the marathon are both endurance events, but they reward almost opposite training. A marathoner may finish bottom-third in a Hyrox if they neglect strength work; a strong functional athlete will struggle in a marathon without building a 30km long run.",
    bottomLine:
      "Pick Hyrox if you want a race that mixes strength and running with predictable indoor conditions. Pick a marathon if you love long-distance running and want a single-discipline goal.",
    rows: [
      { attribute: "Distance", hyrox: "8 km of running + 8 functional stations", other: "42.195 km of running" },
      { attribute: "Typical finish time (Open)", hyrox: "60-90 min", other: "3h 30 min - 5h 30 min" },
      { attribute: "Indoor / outdoor", hyrox: "Indoor expo halls", other: "Outdoor road" },
      { attribute: "Strength required", hyrox: "High — sled push 152 kg, 100 wall balls", other: "Low" },
      { attribute: "Running volume needed", hyrox: "30-50 km/week", other: "60-100 km/week" },
      { attribute: "Training timeline (first race)", hyrox: "8-12 weeks", other: "16-20 weeks" },
      { attribute: "Risk of overuse injury", hyrox: "Moderate (varied movements)", other: "High (repetitive impact)" },
      { attribute: "Gear cost", hyrox: "Shoes + grip + chalk = €150", other: "Shoes + watch = €200" },
    ],
    bestFor: {
      hyrox: ["Athletes who lift", "Ex-CrossFitters", "Anyone bored of pure running", "Time-strapped — shorter training plan"],
      other: ["Pure runners", "Athletes who want one specific number to chase", "Outdoor lovers"],
    },
    faqs: [
      { question: "Is Hyrox harder than a marathon?", answer: "They are different kinds of hard. A marathon is sustained suffering at moderate intensity; Hyrox is repeated intensity spikes with strength work in between. Most people who have done both say Hyrox feels harder per minute, while the marathon feels harder overall." },
      { question: "Can a marathon runner do Hyrox without strength training?", answer: "You will finish, but you will be slow. The 152 kg sled push and 100 wall balls expose anyone without ~12 weeks of structured strength prep. Add 2 strength sessions per week for 8 weeks before your first Hyrox." },
      { question: "Which is better for fat loss?", answer: "Both work. Hyrox burns more calories per minute due to the strength component, but a marathon training cycle has higher total weekly volume. Diet matters more than the choice between them." },
    ],
    internalLinks: [
      { href: "/training/running/", label: "Running programming for Hyrox" },
      { href: "/training/beginner/", label: "Beginner Hyrox training plan" },
      { href: "/blog/first-hyrox-race-guide/", label: "First Hyrox race guide" },
    ],
  },
  {
    slug: "hyrox-vs-spartan-race",
    hyroxLabel: "Hyrox",
    otherLabel: "Spartan Race",
    title: "Hyrox vs Spartan Race — Which Should You Train For?",
    metaDescription:
      "Hyrox vs Spartan: terrain, obstacles, weights, and which event suits your training background. Side-by-side breakdown plus a recommendation.",
    intro:
      "Spartan Race is outdoor obstacle course racing. Hyrox is indoor, standardised functional fitness racing. Both need strength and running, but the skill ceiling and unpredictability are completely different.",
    bottomLine:
      "Pick Hyrox if you want repeatable times you can chase year-over-year. Pick Spartan if you want adventure, variable terrain, and obstacles like spear throws and rope climbs.",
    rows: [
      { attribute: "Format", hyrox: "Standardised, indoor, identical worldwide", other: "Variable terrain and obstacles per venue" },
      { attribute: "Distance", hyrox: "~8 km running", other: "5 km (Sprint), 10 km (Super), 21 km (Beast), 50 km (Ultra)" },
      { attribute: "Obstacles", hyrox: "8 fixed strength stations", other: "20-30 obstacles, varies per race" },
      { attribute: "Penalty for failure", hyrox: "No reps until rep is good", other: "30 burpees per failed obstacle" },
      { attribute: "Average finish time", hyrox: "60-90 min (Open)", other: "1-3h depending on distance" },
      { attribute: "Skill specificity", hyrox: "Low — replicable in any gym", other: "High — rope climb, spear, rig" },
      { attribute: "Weather risk", hyrox: "None — indoor", other: "Mud, cold, heat all common" },
    ],
    bestFor: {
      hyrox: ["Athletes who want a measurable PR", "Indoor preference", "Replicable training plan"],
      other: ["Adventure-seekers", "Trail runners", "Obstacle skill enthusiasts"],
    },
    faqs: [
      { question: "Is Hyrox or Spartan harder?", answer: "Spartan Beast (21 km + obstacles) is generally harder than Hyrox Open. Hyrox Pro is harder than Spartan Sprint. Compare events of similar duration for a fair check." },
      { question: "Can I train for both at the same time?", answer: "Yes, the running base and grip work overlap. Add Spartan-specific obstacle practice (rope climb, monkey bars) as separate sessions." },
    ],
    internalLinks: [
      { href: "/training/stations/", label: "Station-specific Hyrox training" },
      { href: "/blog/hyrox-vs-crossfit/", label: "Hyrox vs CrossFit comparison" },
    ],
  },
  {
    slug: "hyrox-vs-deka",
    hyroxLabel: "Hyrox",
    otherLabel: "DEKA",
    title: "Hyrox vs DEKA — How They Compare and Which to Choose",
    metaDescription:
      "Hyrox vs DEKA: format, scoring, time targets, and the key differences between Hyrox and Spartan's DEKA fitness race series.",
    intro:
      "DEKA is Spartan's response to Hyrox — an indoor functional fitness race with standardised stations. Both events look similar at a glance but have meaningful differences in format, weights, and culture.",
    bottomLine:
      "Hyrox has the larger global community and more events. DEKA has more flexible formats (FIT, STRONG, MILE) and lower barrier to entry for first-timers.",
    rows: [
      { attribute: "Number of stations", hyrox: "8 fixed stations", other: "10 zones (DEKA)" },
      { attribute: "Total running", hyrox: "8 km (8 x 1km)", other: "1 mile total in DEKA MILE / 0 in DEKA STRONG" },
      { attribute: "Formats available", hyrox: "Open, Pro, Doubles, Relay", other: "FIT, STRONG, MILE — single, doubles, team" },
      { attribute: "Global event count", hyrox: "100+ per year", other: "Fewer, US-centric" },
      { attribute: "Sled work", hyrox: "Sled push + sled pull", other: "Tank push (DEKA STRONG / FIT)" },
      { attribute: "Best for first-timers", hyrox: "Open division", other: "DEKA STRONG (no running)" },
    ],
    bestFor: {
      hyrox: ["Larger community and rankings", "More events to choose from", "Athletes who like running"],
      other: ["No-running options", "US-based athletes", "More format variety"],
    },
    faqs: [
      { question: "Are Hyrox times comparable to DEKA times?", answer: "No, the stations and distances differ enough that direct comparison is misleading. Use each event's own leaderboard for context." },
      { question: "Should I do DEKA or Hyrox first?", answer: "If running is a strength, Hyrox. If you prefer a strength-only test, DEKA STRONG. Both will tell you what your weak link is so you know what to train next." },
    ],
    internalLinks: [
      { href: "/racing-guide/what-is-hyrox/", label: "What is Hyrox?" },
      { href: "/competitions/", label: "Find a Hyrox event" },
    ],
  },
  {
    slug: "hyrox-singles-vs-doubles",
    hyroxLabel: "Hyrox Singles",
    otherLabel: "Hyrox Doubles",
    title: "Hyrox Singles vs Doubles — Which Should You Choose?",
    metaDescription:
      "Singles vs doubles in Hyrox: pacing, splits, training requirements, and who each format suits best. Make the right call for your first race.",
    intro:
      "Singles and doubles are not just \"with or without a partner\" — they're different races with different optimal strategies. Choose wrong and you'll under-train or burn out your partner.",
    bottomLine:
      "First-timer with low running base? Doubles. Solid 5k under 25 minutes and want to test yourself? Singles Open. Already raced and want intensity? Singles Pro or Doubles Open with a strong partner.",
    rows: [
      { attribute: "Total work per athlete", hyrox: "100% of stations + 100% of running", other: "Roughly 50% of station work, all running" },
      { attribute: "Average finish time", hyrox: "75-90 min (Open)", other: "60-75 min (Open Doubles)" },
      { attribute: "Recovery between stations", hyrox: "0 — keep moving", other: "Built in — partner works while you breathe" },
      { attribute: "Strategy complexity", hyrox: "Low — pace yourself", other: "High — rep splits, hand-off timing" },
      { attribute: "Training time required", hyrox: "8-16 weeks first race", other: "6-10 weeks first race" },
      { attribute: "Best for first-timers", hyrox: "Yes if 5k <25 min", other: "Yes for everyone else" },
    ],
    bestFor: {
      hyrox: ["Solo competitors", "Athletes with strong running base", "Time-flexible training"],
      other: ["First-timers nervous about full distance", "Athletes who want a partner pact", "Anyone with weak grip endurance"],
    },
    faqs: [
      { question: "Is Hyrox Doubles easier than Singles?", answer: "Doubles is faster and station work is shared, but you still run all 8 km. The intensity per minute can actually be higher in doubles because rest is shorter." },
      { question: "How do you split reps in doubles?", answer: "Most pairs alternate every 10-25 reps depending on the station. Sled push and pull are usually split into 2 chunks each. Rowing and SkiErg are split into 500m pieces." },
    ],
    internalLinks: [
      { href: "/blog/first-hyrox-race-guide/", label: "First Hyrox race guide" },
      { href: "/blog/best-hyrox-pacing-strategy/", label: "Pacing strategy" },
      { href: "/calculator/", label: "Hyrox time calculator" },
    ],
  },
  {
    slug: "hyrox-vs-triathlon",
    hyroxLabel: "Hyrox",
    otherLabel: "Triathlon (Olympic)",
    title: "Hyrox vs Triathlon — Which Race Should You Train For?",
    metaDescription:
      "Hyrox vs Olympic triathlon: training time, race format, finish times, gear cost, and which event suits your athletic background and lifestyle.",
    intro:
      "Hyrox and the Olympic triathlon (1.5 km swim, 40 km bike, 10 km run) both reward endurance, but they recruit completely different muscle groups and require very different training infrastructure. Hyrox needs a gym; triathlon needs open water plus a road bike plus running.",
    bottomLine:
      "Pick Hyrox if you have gym access and limited weekly training hours. Pick triathlon if you swim, cycle, and run already and want a multi-discipline test. Hyrox training fits 6-8 hours per week; triathlon needs 10-15.",
    rows: [
      { attribute: "Disciplines", hyrox: "Running + 8 functional stations", other: "Swim + bike + run" },
      { attribute: "Total race distance", hyrox: "8 km running + station work", other: "51.5 km (swim 1.5, bike 40, run 10)" },
      { attribute: "Typical finish time (Open)", hyrox: "75-95 min", other: "2h 30 min - 3h 30 min" },
      { attribute: "Indoor / outdoor", hyrox: "Indoor expo halls", other: "Outdoor (open water + road)" },
      { attribute: "Equipment cost", hyrox: "Shoes + grip + chalk = €150", other: "Bike + wetsuit + tri-suit + helmet = €2,500-5,000" },
      { attribute: "Training time per week", hyrox: "6-8 hours", other: "10-15 hours" },
      { attribute: "Strength training included", hyrox: "Yes — race demands it", other: "Optional, often neglected" },
      { attribute: "Risk of overuse injury", hyrox: "Moderate (varied movements)", other: "High (long-duration repetitive loads)" },
      { attribute: "Skill ceiling", hyrox: "Low — gym movements", other: "High — swim technique especially" },
    ],
    bestFor: {
      hyrox: ["Gym-trained athletes", "Time-strapped (6-8h/week)", "Athletes who hate cold open water", "Strength + endurance hybrid trainers"],
      other: ["Athletes with cycling or swimming background", "Outdoor lovers", "Athletes with 10-15h/week to train", "Anyone wanting a multi-discipline goal"],
    },
    faqs: [
      { question: "Is Hyrox harder than a triathlon?", answer: "Different harder. An Olympic triathlon is 2.5-3.5 hours of sustained moderate intensity. Hyrox is 75-95 minutes of repeated near-threshold intervals with strength work between. Most hybrid athletes report Hyrox feels harder per minute; triathlon feels harder cumulatively." },
      { question: "Can a triathlete do Hyrox without strength training?", answer: "You'll finish, but slowly. The 152 kg sled push and 100 wall balls expose any athlete who hasn't trained strength endurance. Add 2 strength sessions per week for 8 weeks before your first Hyrox." },
      { question: "Which has better community?", answer: "Both have strong communities. Triathlon clubs are more established (decades old); Hyrox communities are newer but growing fast. Hyrox has more events globally per year." },
    ],
    internalLinks: [
      { href: "/blog/triathlete-doing-hyrox/", label: "Triathlete doing Hyrox" },
      { href: "/training/running/", label: "Hyrox running programming" },
    ],
  },
  {
    slug: "hyrox-vs-ironman-70-3",
    hyroxLabel: "Hyrox",
    otherLabel: "Ironman 70.3",
    title: "Hyrox vs Ironman 70.3 — Which Endurance Race Is for You?",
    metaDescription:
      "Hyrox vs Ironman 70.3 (half-distance triathlon): training time, finish times, gear cost, and which fits your schedule and athletic background.",
    intro:
      "The Ironman 70.3 (1.9 km swim, 90 km bike, 21.1 km run) is the half-distance triathlon — a 4-7 hour race demanding deep aerobic capacity. Hyrox is 75-95 minutes of repeated intervals with strength work. Different beasts entirely.",
    bottomLine:
      "Pick Hyrox if you want a measurable hybrid test that fits a normal training schedule. Pick the 70.3 if you have 12-15 hours per week to train and want the prestige of crossing an Ironman finish line.",
    rows: [
      { attribute: "Total race time", hyrox: "75-95 min (Open)", other: "4h 30 min - 7h" },
      { attribute: "Disciplines", hyrox: "Run + 8 functional stations", other: "Swim + bike + run" },
      { attribute: "Distance", hyrox: "8 km running + stations", other: "1.9 km swim + 90 km bike + 21.1 km run" },
      { attribute: "Training time per week", hyrox: "6-8 hours", other: "12-18 hours" },
      { attribute: "Equipment cost", hyrox: "€150", other: "€3,000-8,000+ (bike, wetsuit, race kit)" },
      { attribute: "Training timeline (first race)", hyrox: "8-16 weeks", other: "20-32 weeks" },
      { attribute: "Strength component", hyrox: "Critical", other: "Optional" },
      { attribute: "Race-day weather risk", hyrox: "None — indoor", other: "High — rain, cold, choppy water" },
    ],
    bestFor: {
      hyrox: ["Strength-trained athletes", "Time-constrained schedules", "Indoor preference", "Athletes who don't swim well"],
      other: ["Long-distance endurance lovers", "Athletes with strong cycling base", "Strong swimmers", "Athletes pursuing eventual full Ironman"],
    },
    faqs: [
      { question: "Is Hyrox harder than an Ironman 70.3?", answer: "70.3 is much longer (4-7 hours vs 75-95 min), so the cumulative fatigue is heavier. Hyrox is more intense per minute. Athletes who have done both typically say 70.3 is harder overall but Hyrox is more 'painful' per minute due to no rest." },
      { question: "Which has more events worldwide?", answer: "Hyrox is now larger by event count — 100+ events per year globally. Ironman runs ~80 70.3 events per year worldwide. Both are growing, but Hyrox is growing faster." },
      { question: "Can I do both in the same year?", answer: "Yes, with careful periodisation. The aerobic base from 70.3 training transfers well to Hyrox; you'd add 8-12 weeks of strength + station work between events. Many hybrid athletes target both annually." },
    ],
    internalLinks: [
      { href: "/blog/triathlete-doing-hyrox/", label: "Triathlete doing Hyrox" },
      { href: "/compare/hyrox-vs-marathon/", label: "Hyrox vs marathon" },
      { href: "/compare/hyrox-vs-triathlon/", label: "Hyrox vs Olympic triathlon" },
    ],
  },
  {
    slug: "hyrox-vs-ocr",
    hyroxLabel: "Hyrox",
    otherLabel: "OCR (Obstacle Course Racing)",
    title: "Hyrox vs OCR — How Hyrox Compares to Obstacle Racing",
    metaDescription:
      "Hyrox vs OCR (obstacle course racing): format, technical skills, weather, and which is the better choice for your athletic background and goals.",
    intro:
      "OCR (obstacle course racing) is a broad category — Spartan, Tough Mudder, OCR World Championships, Toughest, DEKA. Hyrox is the standardised indoor functional fitness race. Both involve running and obstacles, but the consistency and skill ceiling differ massively.",
    bottomLine:
      "Pick Hyrox for a measurable, repeatable race you can chase year-over-year. Pick OCR for adventure, technical obstacle skills (rope climb, monkey bars, spear throws), and outdoor unpredictability.",
    rows: [
      { attribute: "Format consistency", hyrox: "Identical worldwide", other: "Variable — every venue different" },
      { attribute: "Indoor / outdoor", hyrox: "Indoor", other: "Outdoor — mud, cold, heat" },
      { attribute: "Technical skill required", hyrox: "Low (gym movements)", other: "High (rope climb, monkey bars, spear)" },
      { attribute: "Distance", hyrox: "8 km running + stations", other: "5-50 km depending on event" },
      { attribute: "Obstacle penalty", hyrox: "No-rep until clean", other: "Burpees, lap loops, or DQ depending on event" },
      { attribute: "Average finish time", hyrox: "75-95 min (Open)", other: "1-6 hours depending on distance" },
      { attribute: "Training time per week", hyrox: "6-8 hours", other: "8-12 hours (need obstacle skill practice)" },
      { attribute: "Year-over-year PR comparison", hyrox: "Direct — same course", other: "Indirect — courses differ" },
    ],
    bestFor: {
      hyrox: ["Athletes who want measurable PRs", "Indoor preference", "Repeatable training plan", "Strength-trained athletes"],
      other: ["Adventure seekers", "Trail runners", "Athletes with grip and technical skill", "Anyone who loves outdoor unpredictability"],
    },
    faqs: [
      { question: "Is Hyrox an OCR?", answer: "Hyrox is sometimes categorised as OCR, but most racers and the brand itself draw a clear distinction. OCR implies technical obstacles and outdoor settings; Hyrox is indoor, standardised, and uses gym-based functional movements rather than skill obstacles." },
      { question: "Can OCR athletes do well in Hyrox?", answer: "Yes — OCR athletes typically have excellent grip, running, and bodyweight strength, which transfer well. The main gap is sled push (152 kg) and farmers carry, where load matters more than skill. Add 6-8 weeks of strength prep." },
      { question: "Which is more popular?", answer: "Hyrox is now growing faster than OCR globally. OCR peaked around 2014-2018 (Spartan, Tough Mudder boom); Hyrox started in 2017 and is now the fastest-growing fitness race format." },
    ],
    internalLinks: [
      { href: "/compare/hyrox-vs-spartan-race/", label: "Hyrox vs Spartan Race" },
      { href: "/compare/hyrox-vs-deka/", label: "Hyrox vs DEKA" },
    ],
  },
  {
    slug: "hyrox-open-vs-pro",
    hyroxLabel: "Hyrox Open",
    otherLabel: "Hyrox Pro",
    title: "Hyrox Open vs Pro — Which Division Should You Race?",
    metaDescription:
      "Hyrox Open vs Pro: weight differences, qualifying times, and how to know when you're ready to step up to the Pro division.",
    intro:
      "Open and Pro are the same race format — same 8 km, same 8 stations — but Pro uses heavier weights on three stations: sled push (192 kg vs 152 kg for men), sled pull (153 kg vs 103 kg), sandbag lunges (30 kg vs 20 kg), and a higher wall-ball target. Pro is also a qualifying-only division.",
    bottomLine:
      "Race Open until you can comfortably hit the Pro qualifying time for your age group at race pace. Pro is harder by 5-10 minutes for most athletes who upgrade.",
    rows: [
      { attribute: "Sled push (men)", hyrox: "152 kg", other: "192 kg" },
      { attribute: "Sled push (women)", hyrox: "102 kg", other: "152 kg" },
      { attribute: "Sled pull (men)", hyrox: "103 kg", other: "153 kg" },
      { attribute: "Sled pull (women)", hyrox: "78 kg", other: "103 kg" },
      { attribute: "Sandbag lunges (men)", hyrox: "20 kg, 100m", other: "30 kg, 100m" },
      { attribute: "Sandbag lunges (women)", hyrox: "10 kg, 100m", other: "20 kg, 100m" },
      { attribute: "Wall ball weight", hyrox: "6 kg / 4 kg", other: "9 kg / 6 kg" },
      { attribute: "Wall ball target height", hyrox: "10 ft / 9 ft", other: "10 ft / 9 ft" },
      { attribute: "Qualifying required", hyrox: "No — open entry", other: "Yes — must hit qualifying time" },
      { attribute: "Typical finish time gap (same athlete)", hyrox: "Baseline", other: "+5 to +10 min slower" },
    ],
    bestFor: {
      hyrox: ["First-time Hyrox racers", "Athletes building strength endurance", "Anyone under sub-65 (men) / sub-78 (women)"],
      other: ["Athletes who've raced Open and hit the qualifying time", "Strength-leaning athletes who want a heavier test", "Anyone targeting Elite 15 or World Championships"],
    },
    faqs: [
      { question: "Should I race Hyrox Open or Pro?", answer: "Open if it's your first race or you haven't yet hit Pro qualifying time. Pro if you've already raced Open faster than your age group's Pro threshold and want a heavier test. Don't enter Pro just because you can — under-prepared Pro racers often DNF or finish dramatically slower than they would have in Open." },
      { question: "What's the Hyrox Pro qualifying time?", answer: "Open Men 25-34: 1:03:00. Open Women 25-34: 1:16:00. Times scale per age group — see our /qualifiers/pro-qualifying-times/ page for the full 2026 table." },
      { question: "How much harder is Pro than Open?", answer: "Most athletes who race the same year in both divisions report Pro is 5-10 minutes slower. Sled push is the biggest difference (192 kg vs 152 kg for men). Wall balls and sandbag lunges also bleed time. Plan an extra 8-12 weeks of strength work before stepping up." },
    ],
    internalLinks: [
      { href: "/qualifiers/pro-qualifying-times/", label: "Hyrox Pro qualifying times" },
      { href: "/qualifiers/", label: "Hyrox qualifying guide" },
    ],
  },
  {
    slug: "hyrox-singles-vs-relay",
    hyroxLabel: "Hyrox Singles",
    otherLabel: "Hyrox Relay",
    title: "Hyrox Singles vs Relay — Which Format Suits You?",
    metaDescription:
      "Hyrox Singles vs Relay: how the formats differ, training requirements, and how a 4-person relay team splits the race.",
    intro:
      "Singles is one athlete completing all 8 km of running and all 8 stations. Relay is a 4-person team where each athlete runs 2 km and completes 2 stations. The total race time is similar; the individual workload is roughly 25%.",
    bottomLine:
      "Pick Singles if you want the personal challenge of full Hyrox. Pick Relay if you're building a team event, training first-timers gently, or want to race with friends without the full prep commitment.",
    rows: [
      { attribute: "Athletes per team", hyrox: "1", other: "4" },
      { attribute: "Running per athlete", hyrox: "8 km", other: "2 km" },
      { attribute: "Stations per athlete", hyrox: "All 8", other: "2 (fixed by team order)" },
      { attribute: "Total race time", hyrox: "75-95 min (Open)", other: "60-80 min (Open Relay)" },
      { attribute: "Individual work intensity", hyrox: "Sustained 75-95 min", other: "Higher — 4 short, intense efforts with long recovery" },
      { attribute: "Pacing strategy", hyrox: "Steady, manage fatigue", other: "Sprint your leg, recover while teammates work" },
      { attribute: "Training timeline (first race)", hyrox: "8-16 weeks", other: "4-8 weeks" },
      { attribute: "Best for", hyrox: "Personal goal", other: "Team building, intro to Hyrox, mixed-fitness groups" },
      { attribute: "Cost per athlete", hyrox: "Full entry fee", other: "Roughly 1/4 of total team entry" },
    ],
    bestFor: {
      hyrox: ["Solo competitors", "Athletes with strong running base", "Anyone targeting personal PR", "Long-term Hyrox commitment"],
      other: ["First-time Hyrox racers in a group", "Mixed-fitness teams", "Corporate or social race entry", "Recovery from injury (lower workload)"],
    },
    faqs: [
      { question: "Is Hyrox Relay easier than Singles?", answer: "Yes for the individual — you run 2 km vs 8 km and complete 2 stations vs 8. But the work intensity per leg is higher because you sprint knowing you'll rest. Relay is best for first-timers and team events." },
      { question: "How is the Hyrox Relay split between 4 athletes?", answer: "Athlete 1 runs 1 km then does Station 1 (Ski Erg). Athlete 2 runs 1 km then does Station 2 (Sled Push). And so on. Each athlete does 2 legs total — running + station, twice." },
      { question: "Can a relay team have mixed-gender athletes?", answer: "Yes. Mixed Relay (2 men + 2 women) is a popular division at most events. There are also all-men, all-women, and corporate relay categories." },
    ],
    internalLinks: [
      { href: "/compare/hyrox-singles-vs-doubles/", label: "Hyrox Singles vs Doubles" },
      { href: "/blog/first-hyrox-race-guide/", label: "First Hyrox race guide" },
    ],
  },
];
