/**
 * Hyrox station standards dataset.
 *
 * Used by /stations/[slug]/standards pages. Weight standards reflect the
 * current Hyrox ruleset for Open and Pro divisions; adjust as the official
 * rules evolve.
 */

export interface StationStandard {
  division: string;
  spec: string;
}

export interface StationDefinition {
  slug: string;
  name: string;
  position: number;
  distance?: string;
  reps?: string;
  /**
   * Optional SEO title override (without the " | Hyrox Vault" suffix). Use for
   * stations where the generic "Weight by Division" pattern under-performs on
   * click-through. Falls back to the generated title.
   */
  metaTitle?: string;
  /**
   * Optional meta description override (~155 chars, lead with the key numbers
   * searchers want). Falls back to the generated description.
   */
  metaDescription?: string;
  standards: StationStandard[];
  commonNoReps: string[];
  techniquePostHref?: string;
  overviewText: string;
  howToSteps: { name: string; text: string }[];
}

export const STATIONS: StationDefinition[] = [
  {
    slug: "skierg",
    name: "SkiErg",
    position: 1,
    distance: "1,000m",
    standards: [
      { division: "Open / Doubles", spec: "1,000m on Concept2 SkiErg" },
      { division: "Pro", spec: "1,000m on Concept2 SkiErg" },
    ],
    commonNoReps: [
      "Stopping the monitor before 1,000m",
      "Not resetting monitor between waves",
    ],
    techniquePostHref: "/blog/hyrox-skierg-technique-pacing/",
    overviewText:
      "The SkiErg opens every Hyrox race. The goal is not to win it — the goal is to exit with legs that can run a sub-6-minute first kilometre.",
    howToSteps: [
      { name: "Start the monitor at 0", text: "Pull both handles once to wake the monitor and confirm it reads 1,000m remaining." },
      { name: "Drive from the hips", text: "Power comes from a hip hinge, not arms. Let body weight fall onto the straps." },
      { name: "Pick a sustainable pace", text: "Target a 500m split you could hold for 6 minutes. Do not attack the first 200m." },
      { name: "Step off deliberately", text: "When the monitor hits 1000, take one breath, release straps, walk — do not sprint into the run." },
    ],
  },
  {
    slug: "sled-push",
    name: "Sled Push",
    position: 2,
    distance: "50m",
    standards: [
      { division: "Open Men", spec: "152kg sled (incl. weights)" },
      { division: "Open Women", spec: "102kg sled" },
      { division: "Pro Men", spec: "202kg sled" },
      { division: "Pro Women", spec: "152kg sled" },
      { division: "Doubles Mixed", spec: "Open weights, one partner pushing at a time" },
    ],
    commonNoReps: [
      "Sled not crossing the finish line before dismount",
      "Lifting the sled at turns",
    ],
    techniquePostHref: "/blog/hyrox-sled-push-technique/",
    overviewText:
      "The station that stops more first-timers than any other. Heavy, long, and placed early enough that you cannot afford to blow up.",
    howToSteps: [
      { name: "Drop the hips and lean", text: "Body becomes a rigid line at ~45°. Shoulders ahead of hands." },
      { name: "Short, fast steps", text: "Drive through the balls of the feet. Contact time stays short." },
      { name: "Protect momentum", text: "If the sled slows, reset stance — don't stop. Every full stop costs 10+ seconds." },
      { name: "Segment the 50m", text: "Break the push into 3 mental efforts: 20m, 20m, 10m finish." },
    ],
  },
  {
    slug: "sled-pull",
    name: "Sled Pull",
    position: 3,
    distance: "50m",
    standards: [
      { division: "Open Men", spec: "103kg sled" },
      { division: "Open Women", spec: "78kg sled" },
      { division: "Pro Men", spec: "153kg sled" },
      { division: "Pro Women", spec: "103kg sled" },
    ],
    commonNoReps: [
      "Crossing the athlete's line before sled is fully in zone",
      "Running with the rope instead of pulling hand-over-hand",
    ],
    techniquePostHref: "/blog/hyrox-sled-pull-technique/",
    overviewText:
      "The race's grip-killer. Done wrong, it destroys forearms for the rest of the race.",
    howToSteps: [
      { name: "Wide athletic stance", text: "Feet wider than shoulder-width, knees bent, hips back." },
      { name: "Straight arms to start", text: "Rope taut, arms straight — never start from bent elbows." },
      { name: "Hand-over-hand rhythm", text: "Reach long, pull short. Each hand travels ~30cm per cycle." },
      { name: "Reset stance every 2m", text: "As the sled moves toward you, step back to restore athletic position." },
    ],
  },
  {
    slug: "burpee-broad-jumps",
    name: "Burpee Broad Jumps",
    position: 4,
    distance: "80m",
    standards: [
      { division: "Open / Doubles", spec: "80m of burpee broad jumps — chest to floor, jump must cross line" },
      { division: "Pro", spec: "80m of burpee broad jumps" },
    ],
    commonNoReps: [
      "Toes not crossing the line before standing",
      "Chest not touching floor",
      "Jumping backwards to cheat distance",
    ],
    techniquePostHref: "/blog/hyrox-burpee-broad-jumps-strategy/",
    overviewText:
      "The race-maker. Steady metronome pace beats hero sprints every time.",
    howToSteps: [
      { name: "Step back, don't jump back", text: "One foot at a time into the plank. Jumping both feet wastes energy." },
      { name: "Controlled chest descent", text: "Use eccentric strength instead of dropping — spares shoulders." },
      { name: "Jump 1m maximum", text: "Only needs to cross the line. Ego jumps ruin rep 40+." },
      { name: "Metronome breathing", text: "One burpee every 3-4 seconds. Never break." },
    ],
  },
  {
    slug: "rowing",
    name: "Rowing",
    position: 5,
    distance: "1,000m",
    standards: [
      { division: "Open / Doubles", spec: "1,000m on Concept2 RowErg" },
      { division: "Pro", spec: "1,000m on Concept2 RowErg" },
    ],
    commonNoReps: [
      "Stopping the monitor early",
      "Unstrapping feet with meters remaining",
    ],
    techniquePostHref: "/blog/hyrox-rowing-technique/",
    overviewText:
      "Coming off burpees, the row is an active recovery opportunity if paced right.",
    howToSteps: [
      { name: "Strap at the ball of foot", text: "Not at the arch. A sloppy strap shortens the drive every stroke." },
      { name: "Legs, back, arms", text: "Drive sequence on the way out; reverse on the recovery." },
      { name: "Slow the recovery", text: "Aim for 1:2 drive-to-recovery ratio to bring heart rate down." },
      { name: "Hold a 24-28 stroke rate", text: "Lower rate, stronger drive moves the boat with less cost." },
    ],
  },
  {
    slug: "farmers-carry",
    name: "Farmers Carry",
    position: 6,
    distance: "200m",
    standards: [
      { division: "Open Men", spec: "2 x 24kg kettlebells" },
      { division: "Open Women", spec: "2 x 16kg kettlebells" },
      { division: "Pro Men", spec: "2 x 32kg kettlebells" },
      { division: "Pro Women", spec: "2 x 24kg kettlebells" },
    ],
    commonNoReps: [
      "Putting bells down inside the lane",
      "Running across the line",
    ],
    techniquePostHref: "/blog/hyrox-farmers-carry-sandbag-lunges/",
    overviewText:
      "Grip management under race-load cardiovascular stress.",
    howToSteps: [
      { name: "Walk, don't jog", text: "At race-weight, jogging costs more energy than it saves time for 95% of athletes." },
      { name: "Thumbs facing forward", text: "Hook grip variant with firm but relaxed fingers — avoid crushing the handle." },
      { name: "Breathe every 3 steps", text: "Controlled breathing keeps grip calm. Panic breathing wrecks forearms." },
      { name: "One mid-set reset max", text: "If you must set the bells down, pick them straight back up — don't rest." },
    ],
  },
  {
    slug: "sandbag-lunges",
    name: "Sandbag Lunges",
    position: 7,
    distance: "100m",
    standards: [
      { division: "Open Men", spec: "20kg sandbag across the back" },
      { division: "Open Women", spec: "10kg sandbag" },
      { division: "Pro Men", spec: "30kg sandbag" },
      { division: "Pro Women", spec: "20kg sandbag" },
    ],
    commonNoReps: [
      "Trailing (back) knee not touching the ground — 15-second penalty per infringement",
      "Not standing tall at the top of each lunge — 15-second penalty per infringement",
      "Sandbag coming off the shoulders before the rep is complete",
      "Feet passing each other (must be true walking lunges)",
    ],
    techniquePostHref: "/blog/hyrox-farmers-carry-sandbag-lunges/",
    overviewText:
      "100m of walking lunges with a loaded sandbag across the shoulders.",
    howToSteps: [
      { name: "Sandbag high on traps", text: "High position reduces forward lean and protects the lower back." },
      { name: "Short strides", text: "Keep strides just past hip-width. Long strides burn quads by rep 20." },
      { name: "Drive through the front heel", text: "Power stays in the glutes when heel pressure leads each rep." },
      { name: "Mental count of 10-step clusters", text: "100m is ~70 lunges. Break it into 7 clusters of 10." },
    ],
  },
  {
    slug: "wall-balls",
    name: "Wall Balls",
    position: 8,
    reps: "100 reps (all divisions)",
    metaTitle: "Hyrox Wall Balls: 100 Reps, Weights & Target Height",
    metaDescription:
      "Hyrox wall balls: 100 reps for every division. Open Men throw a 6kg ball to a 3m target, women 4kg to 2.7m (Pro 9kg). Standards, common no-reps, and how to break them up.",
    standards: [
      { division: "Open Men", spec: "6kg ball, 3m target" },
      { division: "Open Women", spec: "4kg ball, 2.7m target" },
      { division: "Pro Men", spec: "9kg ball, 3m target" },
      { division: "Pro Women", spec: "6kg ball, 2.7m target" },
    ],
    commonNoReps: [
      "Hips not breaking parallel in the squat",
      "Ball not hitting or above the target line",
    ],
    techniquePostHref: "/blog/hyrox-wall-balls-technique/",
    overviewText:
      "The final boss — grip shot, legs shot, and target accuracy becomes the limiter.",
    howToSteps: [
      { name: "Break into sets early", text: "Plan sets of 15-20 from rep 1. Don't try a big unbroken start — you'll miss reps." },
      { name: "Squat to a consistent depth", text: "Break parallel clearly every rep. A no-rep costs more than 2 seconds of extra depth." },
      { name: "Drive the ball with the legs", text: "Power is hip extension — arms only guide the ball." },
      { name: "Breathe at the top", text: "Inhale as the ball leaves your hands, exhale on the squat catch." },
    ],
  },
];
