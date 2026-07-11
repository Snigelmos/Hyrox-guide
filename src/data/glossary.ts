/**
 * Hyrox terminology glossary.
 *
 * Each entry powers a /glossary/[slug]/ page targeting "what does X mean in
 * hyrox" and "hyrox X meaning" queries.
 */

export interface GlossaryTerm {
  slug: string;
  term: string;
  /**
   * Optional SEO title override (without the " | Hyrox Vault" suffix). Use for
   * high-impression terms where the generic "X — Hyrox Term Explained" pattern
   * under-performs on click-through. Falls back to the generated title.
   */
  metaTitle?: string;
  /**
   * Optional meta description override. Keep under ~155 characters and lead
   * with the exact query phrase. Falls back to shortDefinition.
   */
  metaDescription?: string;
  shortDefinition: string;
  longDefinition: string;
  context: string;
  examples?: string[];
  related: string[]; // slugs of related terms
  faqs: { question: string; answer: string }[];
  /**
   * Optional deep-dive section turning the entry into a 300-500 word
   * mini-article. Each paragraph below the longDefinition / context.
   * Use these to cite specifics, link to relevant calculator/training
   * pages, and explain edge cases.
   */
  deepDive?: { heading: string; body: string }[];
  /**
   * Internal links surfaced as a "Learn more" block at the bottom of
   * the entry. Use when the term has a corresponding training,
   * calculator, or playbook page that goes deeper than the glossary
   * entry can.
   */
  learnMoreLinks?: { href: string; label: string; description?: string }[];
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    slug: "roxzone",
    term: "Roxzone",
    shortDefinition: "The transition area between the running loop and the stations in a Hyrox race. Time spent in the roxzone counts toward your finish time.",
    longDefinition: "The Roxzone is the central area of every Hyrox race venue where the 8 functional stations are set up. After each 1 km run, athletes enter the Roxzone, locate their assigned station number, complete the work, and then return to the running loop. Total time spent in the Roxzone (including walking between station and loop entry/exit) counts toward your race clock.",
    context: "Race format. Cumulative Roxzone time across the 16 transitions (8 entries + 8 exits) typically totals 4-8 minutes for fast athletes and 8-12 minutes for first-timers. Efficient transitions are one of the easiest places to save 2-3 minutes on race day.",
    examples: [
      "After completing run 1, you enter the Roxzone, walk to your numbered ski erg, and start the 1,000 m ski.",
      "Tip: jog (don't sprint) into the Roxzone to lower your heart rate before the next station.",
    ],
    related: ["wave-start", "no-rep", "dnf"],
    faqs: [
      { question: "Does Roxzone time count in Hyrox?", answer: "Yes — every second from the start of run 1 to the moment you cross the finish line counts, including all time in the Roxzone. Efficient transitions can save 2-3 minutes." },
      { question: "How much Roxzone time is typical?", answer: "Fast athletes (sub-70 men) typically have 4-6 minutes of cumulative Roxzone time. Average athletes have 6-10 minutes. First-timers often lose 10-12 minutes here." },
    ],
    deepDive: [
      {
        heading: "Why Roxzone time eats more race than people think",
        body:
          "There are 16 Roxzone touches per Hyrox race — 8 entries from the loop into the station and 8 exits back out. If each touch costs you 30 seconds (a not-unreasonable figure for a first-timer who walks slowly while looking for their station number), you lose 8 minutes. That's the difference between a sub-90 finish and a 1:38 for an athlete with the actual race fitness for sub-90.",
      },
      {
        heading: "How elite athletes manage Roxzone",
        body:
          "Top-10 finishers treat Roxzone as a deliberate jog, not a recovery walk. They keep heart rate at the lower end of Z4 by jogging slowly rather than dropping to Z2 walking. This avoids the cardiovascular shock of restarting work after a full deload between stations.",
      },
      {
        heading: "The 30-60-90 second rule",
        body:
          "A practical pacing target: under 30 seconds per Roxzone touch for elite, under 60 for competitive, under 90 for first-timers. The walking time itself isn't the limit — it's the indecision (looking for your station, fumbling with chalk, adjusting clothing) that adds the lost minutes.",
      },
    ],
    learnMoreLinks: [
      { href: "/blog/what-is-the-hyrox-roxzone/", label: "Hyrox Roxzone explained in detail", description: "Full breakdown with diagrams of the venue layout." },
      { href: "/calculator/", label: "Race time predictor", description: "Includes a default Roxzone allotment in every prediction." },
      { href: "/blog/best-hyrox-pacing-strategy/", label: "Hyrox pacing strategy", description: "How to manage heart rate through transitions." },
    ],
  },
  {
    slug: "doubles-handover",
    term: "Doubles Handover",
    shortDefinition: "In Hyrox Doubles, the moment when one athlete tags their partner to take over reps mid-station.",
    longDefinition: "In Hyrox Doubles, both athletes complete all 8 km of running together but split the work at each station. Athletes alternate reps, sets, or distances based on their pacing strategy. The 'handover' is the moment one athlete stops working and the other takes over. There's no minimum work split — pairs can swap every rep, every 25 reps, or alternate larger chunks (e.g. 50 m of sled push each).",
    context: "Race format (Doubles). The handover strategy is one of the biggest variables in Doubles racing — the right split depends on each athlete's relative strengths.",
    examples: [
      "On the 100 wall balls, Pair A might split 50-50; Pair B might alternate every 10 reps to keep both athletes fresh.",
      "On the sled push, both athletes typically split into 2 sled lengths each (4 × 12.5 m total = 25 m per athlete).",
    ],
    related: ["doubles", "wave-start", "no-rep"],
    faqs: [
      { question: "How do Hyrox Doubles handovers work?", answer: "Athletes alternate work however they like — no minimum split. The most common strategy is to alternate every 10-25 reps on high-rep stations (wall balls, lunges) and split distance stations (sled, ski erg, row) into 2 chunks each." },
      { question: "Can both athletes work simultaneously in Hyrox Doubles?", answer: "No. Only one athlete works at a time during station reps. Both athletes run all 8 km together, but station work alternates." },
    ],
  },
  {
    slug: "wave-start",
    term: "Wave Start",
    metaTitle: "Hyrox Wave Start & Wave Times Explained",
    metaDescription:
      "Hyrox releases athletes in staggered waves of 100-200 every 10-20 minutes. How wave start times work, whether they affect your result, and how to pick your wave.",
    shortDefinition: "The staggered start format used in Hyrox where athletes are released in groups (waves) every few minutes rather than all at once.",
    longDefinition: "Hyrox uses a wave start system to manage congestion in the Roxzone and on the running loop. Athletes are assigned to a specific wave (typically 100-200 athletes per wave) and released every 10-20 minutes. Each wave has its own start time, but all waves race the same course and clock. Waves are typically separated by division (Open Singles, Pro Singles, Doubles, Relay) and sometimes by skill (faster waves released first to avoid congestion).",
    context: "Race format / logistics. Your wave time matters for travel and warm-up planning but not for ranking — your finish time starts when your wave starts.",
    examples: [
      "Wave 1 starts at 09:00, Wave 2 at 09:15, Wave 3 at 09:30...",
      "Pro athletes typically race in earlier waves; Open athletes in later waves.",
    ],
    related: ["roxzone", "open-vs-pro", "doubles"],
    faqs: [
      { question: "How does Hyrox wave start work?", answer: "Athletes are assigned to a numbered wave that starts at a specific time. Each wave has 100-200 athletes. Waves typically start every 10-20 minutes throughout race day." },
      { question: "Can I choose my Hyrox wave?", answer: "Sometimes — registration usually offers preferred wave times. Race-day swaps are possible at the help desk if there's space. Pro athletes typically race in earlier waves; Doubles and Relay race later." },
    ],
  },
  {
    slug: "dnf",
    term: "DNF",
    shortDefinition: "Did Not Finish — when an athlete starts a Hyrox race but doesn't cross the finish line. Reasons range from injury to time-cap to disqualification.",
    longDefinition: "DNF stands for 'Did Not Finish.' In Hyrox, this is recorded when an athlete starts a race but fails to complete it within the cutoff time, withdraws due to injury, or is disqualified. The DNF appears on your race record but doesn't affect your previous PRs. There's no penalty — you can re-register for the next race.",
    context: "Race outcome / results. DNF rates in Hyrox are low (under 2%) compared to ultra-endurance events, but they do happen — most often from over-pacing in the first half or unexpected injury (e.g. wall ball thumb).",
    examples: [
      "An athlete drops out at the 6 km mark due to leg cramps — recorded as DNF.",
      "An athlete fails to complete the 100 wall balls before the time cap — DNF.",
    ],
    related: ["roxzone", "no-rep", "time-cap"],
    faqs: [
      { question: "What does DNF mean in Hyrox?", answer: "DNF means Did Not Finish — you started the race but didn't cross the finish line. Common reasons: injury, time-cap exceeded, withdrawal, or disqualification." },
      { question: "Is there a time cap in Hyrox?", answer: "Yes — typical time caps are 2-3 hours depending on the event and division. If you don't finish before the cap, your race is recorded as DNF and you exit the venue." },
    ],
  },
  {
    slug: "no-rep",
    term: "No-Rep",
    shortDefinition: "When a judge rules a station rep doesn't meet the standard — the rep doesn't count and must be redone.",
    longDefinition: "In Hyrox, every rep on every station has a standard (full squat depth on wall balls, two feet behind line on burpee broad jumps, full lunge with knee touching the ground on sandbag lunges, etc.). If a judge rules your rep doesn't meet the standard, you receive a 'no-rep' — the rep doesn't count and you must do another. There's no penalty beyond the lost time. Judges are positioned at every station and rep counters track standards strictly at major events.",
    context: "Race format / judging. Most no-reps come from incomplete wall balls (target not hit), shallow squats (wall balls), and broad jump line violations. Practice the standard until it's automatic.",
    examples: [
      "Wall ball: ball doesn't hit the 10 ft target → no-rep, redo.",
      "Burpee broad jump: feet land before the line → no-rep, redo.",
      "Sandbag lunges: knee doesn't touch the ground → no-rep, redo.",
    ],
    related: ["roxzone", "wave-start", "dnf"],
    faqs: [
      { question: "What is a no-rep in Hyrox?", answer: "A no-rep is a rep ruled invalid by the judge. The rep doesn't count toward your total and you must do another correctly. There's no other penalty." },
      { question: "What's the most common no-rep in Hyrox?", answer: "Wall balls — failing to hit the target (10 ft for men, 9 ft for women) or failing to reach parallel squat depth. Burpee broad jumps and sandbag lunges are also frequent no-rep stations." },
    ],
    deepDive: [
      {
        heading: "Why no-reps cost more than the rep itself",
        body:
          "A wall-ball no-rep at rep 73 doesn't just cost the 1.5 seconds of the redo. It costs the morale hit, the broken rhythm, and almost always 2-3 more reps that follow because you're now over-correcting depth or over-reaching the target. A single no-rep can compound into 8-12 seconds of lost time.",
      },
      {
        heading: "Train the standard, not the rep count",
        body:
          "Most first-timers can hit 100 wall balls in a vacuum. They cannot hit 100 valid wall balls under race fatigue. Build training sets where every rep is judged to standard — film yourself or have a partner judge. Better to fail at 70 valid reps than to count 90 sketchy ones in training.",
      },
      {
        heading: "Stations with the highest no-rep rate",
        body:
          "Wall balls top the list (about 8-12% of attempted reps no-rep at major events). Burpee broad jumps come second, with line violations the most common cause. Sandbag lunges are third, with knee-touch failures concentrated in reps 60+ when fatigue closes the hip-flexion window.",
      },
    ],
    learnMoreLinks: [
      { href: "/training/stations/wall-balls/", label: "Wall balls technique playbook", description: "Drill the standard so race-day reps don't get no-repped." },
      { href: "/blog/hyrox-wall-balls-technique/", label: "Wall ball technique deep-dive", description: "Squat depth and target accuracy under fatigue." },
      { href: "/stations/", label: "All 8 station standards", description: "What each judge is looking for at every station." },
    ],
  },
  {
    slug: "compression-sleeve",
    term: "Compression Sleeve",
    shortDefinition: "A tight elastic sleeve worn on arms or legs during Hyrox. Allowed in Open division; banned in Pro division as a grip aid.",
    longDefinition: "Compression sleeves are tight elastic garments worn on the arms (forearm sleeves) or legs (calf sleeves) for muscular support, blood flow, and minor friction protection during Hyrox stations. In the Open division, compression sleeves are fully allowed. In the Pro division, forearm sleeves are typically restricted because they can act as grip aids on the sled pull rope. Always check the latest athlete handbook before wearing them in a Pro race.",
    context: "Gear / rules. Most amateur athletes wear calf sleeves for circulation; some wear forearm sleeves for skin protection on the sled pull rope (which can leave forearm rope burn).",
    examples: [
      "Calf sleeves: legal in both Open and Pro.",
      "Forearm sleeves: legal in Open; check Pro rules per event.",
    ],
    related: ["grip-aids", "open-vs-pro", "race-day-kit"],
    faqs: [
      { question: "Are compression sleeves allowed in Hyrox?", answer: "Calf sleeves are allowed in both Open and Pro. Forearm sleeves are allowed in Open and typically restricted in Pro because they can act as grip aids on the sled pull. Always check the event athlete handbook." },
      { question: "Should I wear compression sleeves in Hyrox?", answer: "Optional. Calf sleeves help some athletes with circulation and minor support. Forearm sleeves can prevent rope burn on the sled pull. Try both in training before deciding for race day." },
    ],
  },
  {
    slug: "grip-aids",
    term: "Grip Aids",
    shortDefinition: "Tools or substances that improve grip on Hyrox station equipment. Chalk and gymnastic grips are typically allowed; tape, gloves, and lifting straps have specific rules.",
    longDefinition: "Grip aids in Hyrox include chalk, gymnastic grips, gloves, tape, and lifting straps. Each has different rules: chalk is universally allowed, gymnastic grips and gloves are allowed in most events but checked per division, hand tape is allowed for blister/cut protection but not as a grip aid, and lifting straps are typically banned because they remove grip work (especially on the farmers carry). Specific rules are published in the event athlete handbook.",
    context: "Gear / rules. The most common legal grip aids are: chalk on the hands before the sled pull and farmers carry, hand tape for known blister spots, and gymnastic grips for the rower handle.",
    examples: [
      "Chalk: legal everywhere — apply before sled pull and farmers carry.",
      "Gymnastic grips: legal in most Open events; check per Pro event.",
      "Lifting straps: banned in most Hyrox events — count as removing grip work.",
    ],
    related: ["compression-sleeve", "open-vs-pro", "race-day-kit"],
    faqs: [
      { question: "Are grip aids allowed in Hyrox?", answer: "Some yes, some no. Chalk and gymnastic grips are typically allowed; lifting straps are banned. Check our gear-legality blog posts for full details on each type." },
      { question: "Should I use chalk in Hyrox?", answer: "Yes — chalk is universally allowed and significantly helps grip on the sled pull rope and farmers carry handles. Apply at the start of the race or before each grip-heavy station." },
    ],
  },
  {
    slug: "open-vs-pro",
    term: "Open vs Pro",
    shortDefinition: "The two main Hyrox divisions. Open is open-entry with standard weights; Pro is qualification-only with heavier weights and faster expected times.",
    longDefinition: "Hyrox offers two main competitive divisions. Open is the entry-level division with no qualifying time required, using standard weights (sled push 152 kg, sled pull 103 kg, sandbag 20 kg, wall ball 6 kg for men). Pro requires hitting a published qualifying time at an Open event and uses heavier weights (sled push 202 kg, sled pull 153 kg, sandbag 30 kg, wall ball 9 kg for men). Pro athletes also race for Elite 15 and World Championship qualifying spots.",
    context: "Division structure. See our /qualifiers/ guides for full Pro qualifying times and how to upgrade.",
    examples: [
      "Open Men 25-34 Pro qualifying time (2026): 1:03:00",
      "Pro sled push: 202 kg (vs Open: 152 kg).",
    ],
    related: ["wave-start", "doubles", "elite-15"],
    faqs: [
      { question: "What's the difference between Hyrox Open and Pro?", answer: "Pro uses heavier weights on the sled push (+50 kg), sled pull (+50 kg), sandbag (+10 kg), and wall ball (+3 kg). Pro also requires hitting a qualifying time. Most athletes who race the same year in both report Pro is 5-10 minutes slower." },
      { question: "Should I race Open or Pro?", answer: "Open if it's your first race or you haven't yet hit Pro qualifying time. Pro if you've already raced Open faster than your age group's Pro threshold and want a heavier test." },
    ],
    deepDive: [
      {
        heading: "When to make the Open-to-Pro jump",
        body:
          "The signal is consistency, not a single fast race. If you've raced Open multiple times under your age group's Pro qualifying time, with similar splits each time and no station that blew up, you're ready. If you only hit it once on a perfect day, race Open another season — Pro punishes inconsistent racers harder than Open does.",
      },
      {
        heading: "What changes most in Pro",
        body:
          "The sled push delta (+50 kg for men) is the single biggest change. The sandbag lunge weight increase (+10 kg) is the second. Wall ball weight only matters if your shoulder strength was already at a ceiling in Open. Most Pro upgraders lose 80% of their added time on those three stations.",
      },
      {
        heading: "Training-week change going Pro",
        body:
          "Plan an extra 8-12 weeks of strength block before your first Pro race. The aerobic base built for Open is enough; the strength base usually isn't. Add one weekly heavy sled session (race-weight Pro sled, 4-6 sets of 50 m), one heavier-than-race sandbag session, and one wall ball volume session at Pro weight.",
      },
    ],
    learnMoreLinks: [
      { href: "/compare/hyrox-open-vs-pro/", label: "Hyrox Open vs Pro full comparison", description: "Side-by-side weights, qualifying times, and recommended training adjustments." },
      { href: "/qualifiers/", label: "Hyrox qualifying times", description: "Full age-group table for the current season." },
      { href: "/training/advanced/", label: "Advanced Hyrox training plan", description: "12-week block tuned for Pro-weight sled and sandbag." },
    ],
  },
  {
    slug: "elite-15",
    term: "Elite 15",
    metaTitle: "Hyrox Elite 15 Explained: Who Qualifies & How",
    metaDescription:
      "Hyrox Elite 15 is the top 15 Pro athletes per division who race the World Championship finals. How season-ranking points decide it and what times qualify.",
    shortDefinition: "The top 15 athletes per Pro division across the season-ranking points board, who race the championship-format finals at the Hyrox World Championship.",
    longDefinition: "Elite 15 is the championship-division finals at the Hyrox World Championship. The top 15 athletes per Pro division (Pro Men, Pro Women, Pro Doubles Men, Pro Doubles Women) qualify based on season-ranking points and race head-to-head at the World Championship in a heat-based finals format. Major events award the highest point totals; consistent high placements across the season can earn you an Elite 15 spot.",
    context: "Division / qualifying. Elite 15 is reserved for full-time professional or near-professional Hyrox athletes — typical times are sub-55 (Pro Men) or sub-65 (Pro Women).",
    related: ["open-vs-pro", "doubles", "wave-start"],
    faqs: [
      { question: "What is Hyrox Elite 15?", answer: "Elite 15 is the top tier of Pro Hyrox racing — the 15 fastest Pro athletes per division across season-ranking points who race the championship finals at the World Championship." },
      { question: "How do you qualify for Elite 15?", answer: "Top 15 in Pro division season-ranking points. Race multiple events (especially Majors) to accumulate points. See our /qualifiers/elite-15/ guide for full details." },
    ],
  },
  {
    slug: "doubles",
    term: "Doubles",
    shortDefinition: "Hyrox race format where two athletes split station work but both run all 8 km together.",
    longDefinition: "Hyrox Doubles is a 2-athlete team race. Both athletes run all 8 km together (cannot separate during runs) but split station work however they choose. Open Doubles uses Open division weights; Pro Doubles uses Pro weights. Doubles is the most popular format for first-time Hyrox racers because the workload is more manageable and it's a great team-building event.",
    context: "Race format. Mixed Doubles (1 man + 1 woman), Men's Doubles, Women's Doubles all available at most events.",
    related: ["doubles-handover", "open-vs-pro", "wave-start"],
    faqs: [
      { question: "How does Hyrox Doubles work?", answer: "Two athletes run all 8 km together (cannot separate) and split station work however they choose. The total race time is shared — typically 60-75 minutes for Open Doubles." },
      { question: "Is Doubles harder than Singles?", answer: "Doubles is faster (60-75 min vs 75-95 min) and station work is shared. But intensity per minute can be higher because rest is shorter. Most first-timers find Doubles more accessible." },
    ],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.slug === slug);
}
