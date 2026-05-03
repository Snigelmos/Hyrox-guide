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
  {
    slug: "hyrox-vs-f45",
    hyroxLabel: "Hyrox",
    otherLabel: "F45",
    title: "Hyrox vs F45 — From the Studio Floor to the Race",
    metaDescription:
      "Hyrox vs F45: how F45 training transfers to a Hyrox race, where it falls short, and the supplemental work an F45 member needs to add for a competitive finish.",
    intro:
      "F45 is a 45-minute group functional training class. Hyrox is an 8 km running race punctuated with eight functional stations. The cardio overlap is real but partial — F45 builds the engine for short, mixed-modal efforts, while Hyrox demands sustained running on top of that.",
    bottomLine:
      "Pick Hyrox if you want a measurable race with a finish line. Stay with F45 (or use it as supplemental conditioning) if your goal is general fitness with social accountability.",
    rows: [
      { attribute: "Format", hyrox: "Solo race, 8 km running + 8 stations", other: "45-minute group class, varied workouts" },
      { attribute: "Running volume", hyrox: "8 km on race day, 30-50 km/week training", other: "Minimal sustained running" },
      { attribute: "Class length", hyrox: "75-95 min race-day effort", other: "45 min" },
      { attribute: "Strength carryover", hyrox: "Direct — sled push, lunges, wall balls", other: "Partial — hypertrophy + mixed-modal" },
      { attribute: "Cost", hyrox: "Race fee €85-€150 + gym access", other: "€150-€250/month studio fee" },
      { attribute: "Trainability for first race", hyrox: "8-16 weeks structured", other: "F45 alone won't get you there" },
      { attribute: "Skill ceiling", hyrox: "Pacing + sled technique", other: "Low — every class is led" },
      { attribute: "Community", hyrox: "Race-day buzz, Discord groups", other: "Daily studio community" },
    ],
    bestFor: {
      hyrox: ["Athletes who want a race goal", "Anyone bored of group classes", "Runners adding strength", "Measurable PR chasers"],
      other: ["Group-fitness preference", "Time-constrained 45-min slots", "General body composition goals", "Athletes returning to fitness"],
    },
    faqs: [
      { question: "Can F45 prepare you for a Hyrox?", answer: "Partially. F45 builds the strength-endurance base for stations like wall balls, burpees, and lunges, but it does not build the running fitness needed for 8 km of compromised running. Add 2-3 dedicated runs per week for at least 8 weeks before your race." },
      { question: "Which F45 classes transfer best to Hyrox?", answer: "Romans (cardio-focused) and Athletica (strength + cardio) carry the most over. Pure strength days like Hollywood help with sled push capacity. Skip pure mobility days during your Hyrox prep block." },
      { question: "How long after starting F45 can I race a Hyrox?", answer: "Most F45 members need 12-16 weeks of additional running and at least one weekly Hyrox-style station session before they're ready for a competitive Open finish. Without those additions, expect to walk most of the running." },
    ],
    internalLinks: [
      { href: "/blog/f45-to-hyrox-transition/", label: "F45 to Hyrox transition" },
      { href: "/training/beginner/", label: "Hyrox beginner training plan" },
      { href: "/calculator/", label: "Hyrox time predictor" },
    ],
  },
  {
    slug: "hyrox-vs-orangetheory",
    hyroxLabel: "Hyrox",
    otherLabel: "Orangetheory Fitness",
    title: "Hyrox vs Orangetheory — Does OTF Translate to a Race?",
    metaDescription:
      "Hyrox vs Orangetheory Fitness: which heart-rate zones overlap, where OTF members win and lose at a Hyrox race, and what to add to a typical OTF week.",
    intro:
      "Orangetheory Fitness (OTF) is a heart-rate-based 60-minute group class blending treadmill running, rowing, and floor strength work. The format already mirrors a fragment of Hyrox, which is why OTF members often migrate easily into the race.",
    bottomLine:
      "Orangetheory members are better prepared than most newcomers. The gap to a competitive Hyrox is sustained running and station-specific strength, not cardiovascular base.",
    rows: [
      { attribute: "Format", hyrox: "Solo race, fixed protocol", other: "60-min coach-led HR class" },
      { attribute: "Treadmill volume", hyrox: "8 km on race day", other: "1.5-3 km per class" },
      { attribute: "Rowing volume", hyrox: "1,000 m race-pace once", other: "200-1,000 m, multiple intervals" },
      { attribute: "Strength stations", hyrox: "Sled push 152 kg, 100 wall balls", other: "Dumbbell hypertrophy work" },
      { attribute: "HR zone use", hyrox: "Mostly threshold + tempo", other: "All five zones, splash pursuit" },
      { attribute: "Cost", hyrox: "€85-€150 race fee + gym", other: "€150-€220/month" },
      { attribute: "Carryover to race", hyrox: "—", other: "60-70% of fitness transfers" },
      { attribute: "Gap to fix", hyrox: "—", other: "Heavy sled, sandbag lunges, sustained sub-threshold running" },
    ],
    bestFor: {
      hyrox: ["Race-driven athletes", "Anyone wanting a measurable yearly PR", "Strength-trained athletes"],
      other: ["Coach-led structure", "Athletes who like HR-based feedback", "Group-fitness consistency", "Beginner conditioning"],
    },
    faqs: [
      { question: "Can an Orangetheory member do well in a Hyrox?", answer: "Yes, with two additions: one weekly long Z2 run of 60-90 minutes and one weekly station-specific session (sled, lunges, wall balls). OTF gives you the cardio base; Hyrox needs the long-running endurance and the sled load that OTF doesn't push." },
      { question: "Which OTF metrics correlate with Hyrox finish time?", answer: "Splat points across a 60-minute class is a rough proxy for race-day intensity tolerance. A consistent 16-22 splat performance suggests you can hold race-day intensity for 75-90 minutes. Treadmill all-out 1-mile pace also correlates strongly with Hyrox running splits." },
      { question: "How many OTF classes should I keep during Hyrox prep?", answer: "Cap OTF at 2-3 classes per week during a 12-week Hyrox build, replacing the rest with sustained running, strength work, and one full Hyrox-style station rehearsal. OTF's variety is the enemy of race-specific adaptation." },
    ],
    internalLinks: [
      { href: "/blog/orangetheory-member-doing-hyrox/", label: "Orangetheory member doing Hyrox" },
      { href: "/blog/hyrox-heart-rate-zones/", label: "Hyrox heart-rate zones" },
      { href: "/training/beginner/", label: "Hyrox beginner plan" },
    ],
  },
  {
    slug: "hyrox-vs-half-marathon",
    hyroxLabel: "Hyrox",
    otherLabel: "Half Marathon",
    title: "Hyrox vs Half Marathon — Which 90-Minute Race Suits You?",
    metaDescription:
      "Hyrox vs half marathon: similar finish times but very different training. Volume, pace, strength demands, and how to choose your A-race.",
    intro:
      "A half marathon and a Hyrox Open finish at roughly the same time for many athletes, around 90 minutes. The training looks nothing alike. A half is a single-discipline aerobic test; Hyrox is repeated intensity bursts with strength stations between runs.",
    bottomLine:
      "Pick Hyrox if you want a hybrid race that fits a 6-8 hour training week. Pick a half marathon if you love sustained running and want to chase a single-pace number.",
    rows: [
      { attribute: "Distance", hyrox: "8 km running + 8 stations", other: "21.1 km running" },
      { attribute: "Typical Open finish", hyrox: "75-95 min", other: "1h 30 min - 2h 15 min" },
      { attribute: "Running volume needed", hyrox: "30-50 km/week", other: "50-80 km/week" },
      { attribute: "Strength training needed", hyrox: "2 sessions/week minimum", other: "Optional" },
      { attribute: "Long run length", hyrox: "12-18 km", other: "16-25 km" },
      { attribute: "Training timeline (first race)", hyrox: "8-16 weeks", other: "12-16 weeks" },
      { attribute: "Race-day weather", hyrox: "Indoor — none", other: "Outdoor — variable" },
      { attribute: "Pacing complexity", hyrox: "High — 8 transitions", other: "Low — single pace target" },
    ],
    bestFor: {
      hyrox: ["Hybrid athletes", "Lifters adding cardio", "Anyone bored of single-pace running", "Indoor preference"],
      other: ["Pure runners", "Athletes chasing a sub-2 hour or sub-90 number", "Outdoor lovers", "Marathon-stepping-stone athletes"],
    },
    faqs: [
      { question: "Can a half marathon runner walk into a Hyrox?", answer: "Yes for the running portion — your 1 km splits will be comfortable. The sled push (152 kg), 100 wall balls, and sandbag lunges will expose you if you've not lifted. Add 8-12 weeks of strength work before racing." },
      { question: "Is Hyrox harder than a half marathon?", answer: "Most athletes who do both report Hyrox feels harder per minute due to the strength spikes. The half marathon feels harder by total perceived suffering because it's longer and at a steadier near-threshold effort." },
      { question: "Which gives a better cardio adaptation?", answer: "Half marathon training builds higher VO2 max ceilings because of the higher weekly running volume. Hyrox training builds broader fitness — VO2 max, strength endurance, and movement variety. Pick based on your A-race goal, not the adaptation." },
    ],
    internalLinks: [
      { href: "/compare/hyrox-vs-marathon/", label: "Hyrox vs marathon" },
      { href: "/blog/marathon-runner-doing-hyrox/", label: "Marathon runner doing Hyrox" },
      { href: "/blog/hyrox-running-strategy/", label: "Hyrox running strategy" },
    ],
  },
  {
    slug: "hyrox-vs-strongman",
    hyroxLabel: "Hyrox",
    otherLabel: "Strongman",
    title: "Hyrox vs Strongman — Engine Race Meets Maximal Strength",
    metaDescription:
      "Hyrox vs Strongman: how the heaviest functional sport compares to the world's biggest fitness race. Loads, training time, and crossover potential.",
    intro:
      "Strongman is a maximal-strength sport — atlas stones, log press, deadlift medleys, yoke walks. Hyrox is a sustained 75-95-minute race blending running with submaximal functional efforts. The two share equipment family but live at opposite ends of the strength-endurance continuum.",
    bottomLine:
      "Pick Hyrox for endurance with strength flavour. Pick Strongman if you want to chase pure load numbers and short, brutal events.",
    rows: [
      { attribute: "Effort length", hyrox: "75-95 min sustained", other: "30-90 sec per event, 4-6 events" },
      { attribute: "Heaviest single load", hyrox: "152 kg sled push", other: "180-360 kg events" },
      { attribute: "Running volume", hyrox: "8 km race day, 30-50 km/week", other: "Minimal" },
      { attribute: "Bodyweight class system", hyrox: "Open + Pro, age groups", other: "Strict weight classes" },
      { attribute: "Equipment cost", hyrox: "€150 (shoes + grip)", other: "€500-€2000 (suit, sleeves, deadlift kit)" },
      { attribute: "Average training session", hyrox: "60-90 min", other: "90-150 min" },
      { attribute: "Bodyweight target", hyrox: "Lean, 75-90 kg typical", other: "Higher, 95-140 kg typical for U105+" },
      { attribute: "Recovery between events", hyrox: "Full race in one block", other: "10-30 min between events" },
    ],
    bestFor: {
      hyrox: ["Hybrid athletes", "Lean strength-cardio mix", "Athletes who like running"],
      other: ["Pure strength athletes", "Athletes 95 kg+", "Anyone chasing a 1RM number"],
    },
    faqs: [
      { question: "Can a strongman compete in Hyrox?", answer: "Yes, but most strongmen lose 10-15 kg of bodyweight and add 10-12 weeks of running volume before they're competitive. Pure strongmen often clock 90-110 min for their first Hyrox simply because the running gasses them faster than the strength work." },
      { question: "Does strongman training help your Hyrox?", answer: "Heavy yoke and farmers carries directly transfer to the Hyrox sled push and farmers carry. Atlas stones build the posterior chain that supports lunges. Skip max event work in the 8 weeks before a Hyrox race — it bleeds running adaptation." },
      { question: "Are there hybrid athletes doing both?", answer: "A few. Most pick a primary sport per season because the bodyweight and recovery demands diverge sharply. The closest crossover sport is Strongwoman/Strongman 'Beast' classes that include time-cap medleys; those skills carry over best to Hyrox." },
    ],
    internalLinks: [
      { href: "/compare/hyrox-vs-marathon/", label: "Hyrox vs marathon" },
      { href: "/blog/powerlifter-hyrox-training/", label: "Powerlifter doing Hyrox" },
      { href: "/blog/hyrox-for-heavy-athletes/", label: "Hyrox for heavy athletes" },
    ],
  },
  {
    slug: "hyrox-vs-tactical-fitness-test",
    hyroxLabel: "Hyrox",
    otherLabel: "Tactical Fitness Test (CPAT, ACFT, etc.)",
    title: "Hyrox vs Tactical Fitness Tests — Which Trains the Other?",
    metaDescription:
      "Hyrox vs CPAT, ACFT, and other tactical fitness tests: where the formats overlap, where they diverge, and how to use Hyrox training to prep for the job.",
    intro:
      "Firefighter (CPAT), military (ACFT, RFT), and police selection tests share Hyrox's DNA: weighted carries, sleds, ladders, and sustained running. Hyrox is sometimes used as off-season prep for tactical athletes precisely because the demands rhyme.",
    bottomLine:
      "Hyrox is excellent off-season prep for any tactical fitness test. The reverse is also true — tactical training builds 70-80% of Hyrox-ready fitness without the running base.",
    rows: [
      { attribute: "Total event length", hyrox: "75-95 min", other: "10-25 min (test) or 60-90 min (selection)" },
      { attribute: "Weighted carry standard", hyrox: "Farmers 2 × 24 kg, 200 m", other: "Equipment dummy 75 kg, 30 m (CPAT)" },
      { attribute: "Sled / sled-substitute", hyrox: "152 kg push, 50 m", other: "70 kg pull/drag, 30 m (CPAT)" },
      { attribute: "Running standard", hyrox: "8 km race-day", other: "2 mile run sub-15 min (ACFT)" },
      { attribute: "Strength standard", hyrox: "Sled push, sandbag lunges", other: "Deadlift 3RM (ACFT)" },
      { attribute: "Format", hyrox: "Race", other: "Pass/fail or scored test" },
      { attribute: "Real-world transfer", hyrox: "Indirect", other: "Direct job task simulation" },
      { attribute: "Carryover from Hyrox", hyrox: "—", other: "High — most tasks share movement family" },
    ],
    bestFor: {
      hyrox: ["Civilians wanting a race goal", "Tactical athletes off-season", "Hybrid programming"],
      other: ["Job applicants in scoring window", "Active-duty re-test cycles", "Selection candidates"],
    },
    faqs: [
      { question: "Will Hyrox training pass a CPAT or ACFT?", answer: "If you're hitting an Open Hyrox sub-80 min, you almost certainly pass CPAT and the cardio half of ACFT. The deadlift max in ACFT is the only piece Hyrox training doesn't directly build — add 6-8 weeks of strength block before the test." },
      { question: "Are firefighter and military athletes good at Hyrox?", answer: "Yes, especially in mid-pack and competitive Open. Tactical athletes have built-in farmers carry and sled prep. The gap is usually wall ball mechanics and sustained running pace, not strength." },
      { question: "Can I train for both at once?", answer: "Yes. Use Hyrox training as the off-season block (12-20 weeks out from the test) then sharpen with task-specific drills 4-6 weeks out. Don't try to peak both in the same month." },
    ],
    internalLinks: [
      { href: "/training/intermediate/", label: "Intermediate Hyrox plan" },
      { href: "/blog/hyrox-for-heavy-athletes/", label: "Hyrox for heavy athletes" },
      { href: "/blog/hyrox-cyclist-transition/", label: "Hyrox for cyclists" },
    ],
  },
  {
    slug: "hyrox-vs-ultramarathon",
    hyroxLabel: "Hyrox",
    otherLabel: "Ultramarathon",
    title: "Hyrox vs Ultramarathon — Sprint Hybrid or All-Day Endurance?",
    metaDescription:
      "Hyrox vs ultramarathon: training time, finish time, fuelling, and how the two endurance worlds compare for hybrid athletes choosing a season goal.",
    intro:
      "An ultramarathon is anything beyond 42.2 km — typically 50 km, 50 mi, 100 km, or 100 mi. Hyrox is a 75-95 minute hybrid race. Calling them both endurance sports buries how different the training, fuelling, and race-day mindset really are.",
    bottomLine:
      "Pick Hyrox if you want measurable, repeatable, intense racing that fits a normal life. Pick an ultra if you want to spend a Saturday running through mountains and have the time to train for it.",
    rows: [
      { attribute: "Race time range", hyrox: "75-95 min", other: "5-30+ hours" },
      { attribute: "Distance", hyrox: "8 km running + stations", other: "50-160+ km running" },
      { attribute: "Training time per week", hyrox: "6-8 hours", other: "10-20 hours" },
      { attribute: "Long run length", hyrox: "12-18 km", other: "30-60 km" },
      { attribute: "Race-day fuelling", hyrox: "60-90 g carbs/hr, 2-3 gels", other: "Solid food + 60-90 g carbs/hr for hours" },
      { attribute: "Surface", hyrox: "Indoor flat", other: "Trail, road, mountain" },
      { attribute: "Strength training needed", hyrox: "2 sessions/week", other: "Minimal, hill-only" },
      { attribute: "Recovery time post-race", hyrox: "3-7 days", other: "2-6 weeks" },
    ],
    bestFor: {
      hyrox: ["Time-constrained athletes", "Hybrid fitness goals", "Indoor preference", "Strength-leaning runners"],
      other: ["Long-distance specialists", "Trail and mountain lovers", "Athletes wanting deep solitude in training", "Anyone with 10+ training hours/week"],
    },
    faqs: [
      { question: "Can ultra runners do Hyrox?", answer: "Yes, but expect a 5-10 minute penalty on first race compared to peer marathoners. Ultramarathon training under-builds the high-intensity ceiling needed for sled push and wall balls. Add 8-12 weeks of strength + threshold work before racing Hyrox." },
      { question: "Which is harder: a 50 km ultra or a Hyrox?", answer: "They are different kinds of hard. A 50 km ultra is sustained moderate effort for 5-7 hours; Hyrox is 75-95 minutes of repeated near-threshold work. Most athletes who have done both say the ultra is harder by total volume; Hyrox is harder per minute." },
      { question: "Can I train for both in the same year?", answer: "Yes, with careful season planning. The aerobic base from ultra training transfers well to Hyrox; the high-intensity work from Hyrox keeps your top-end pace sharp. Sequence them at least 8 weeks apart and don't try to peak both in the same month." },
    ],
    internalLinks: [
      { href: "/compare/hyrox-vs-marathon/", label: "Hyrox vs marathon" },
      { href: "/blog/marathon-runner-doing-hyrox/", label: "Marathon runner doing Hyrox" },
      { href: "/blog/hyrox-zone-2-training/", label: "Zone 2 training for Hyrox" },
    ],
  },
];
