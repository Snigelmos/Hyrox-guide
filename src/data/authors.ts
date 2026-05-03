/**
 * Author profile data.
 *
 * Three editorial team members, each owning a distinct beat:
 *   Adam Smith     — strength, station efficiency, gym-based programming.
 *                    CrossFit background, transitioning into running.
 *   James Andersen — running. Sub-3 marathoner crossing into Hyrox;
 *                    pacing, Zone 2, VO2max, watches and HRMs.
 *   Max Jespersen  — all-rounder + nutrition. Stable splits across
 *                    every station; supplements, fuelling, race format
 *                    and buying guides.
 *
 * Each entry renders a /author/[slug]/ page via
 * src/pages/author/[slug].astro and is referenced from blog post
 * `author` frontmatter so the Article JSON-LD resolves to a Person.
 */

export interface Author {
  /** URL slug — kept short and stable so /author/<slug>/ URLs don't churn. */
  slug: string;
  /** Full name used for formal display (page titles, JSON-LD, breadcrumbs, alt text). */
  name: string;
  /** First name for conversational body copy ("Articles by Adam"). */
  firstName: string;
  jobTitle: string;
  /** Short headline used as a tagline on cards. */
  tagline: string;
  /** 1–2 sentence summary used on the listing page. */
  bio: string;
  /** Longer prose used on the individual author page. */
  longBio: string;
  /** Path under /public — e.g. "/team/john.jpg". */
  image: string;
  credentials: string[];
  topics: string[];
  /**
   * Social profile URLs that resolve to a real, owned profile of this person.
   * Used in the Person JSON-LD `sameAs` array on the author profile page —
   * this is one of the strongest E-E-A-T signals Google uses to reconcile
   * authorship.
   *
   * IMPORTANT: every URL here must:
   *   - resolve to a 200 (no 404, no soft-redirect)
   *   - be a profile genuinely owned and operated by this author
   *
   * A broken or wrong-person URL is worse than no URL at all because Google
   * fails the entity reconciliation check and may downgrade trust.
   *
   * Recommended additions in priority order:
   *   1. LinkedIn  (highest trust signal, most reliable to claim)
   *   2. Strava    (relevant to a Hyrox athlete; supports Person schema)
   *   3. Instagram (only if the profile is genuinely active)
   *   4. X / Twitter (only if active)
   */
  sameAs?: string[];
}

export const AUTHORS: Author[] = [
  {
    slug: "john",
    name: "Adam Smith",
    firstName: "Adam",
    jobTitle: "Strength & station editor",
    tagline: "Eight years of barbells before he started running.",
    bio: "CrossFit before Hyrox. Comfortable on the sleds, the wall and the lunges; the run is what he is rebuilding now. Writes the strength and station-technique side.",
    longBio:
      "Eight years of CrossFit programming — barbell sessions, sled pieces and gymnastics circuits — before he raced his first Hyrox. The first time he went to the line he flew through every station inside the elite bracket and then bled time on the running. That race is why his programming looks the way it does today: heavy lifts and station work are still the easy half of the week, the rest of it is base-building mileage, Zone 2 and the kind of long, boring runs no CrossFitter wanted to do. He writes the strength and station-technique side — sleds, wall balls, lunges, burpees, farmers carry, no-gym programming — because that is the half he can write from a decade of practice.",
    image: "/team/john.jpg",
    credentials: [
      "Eight years of competitive CrossFit programming before transitioning to Hyrox",
      "Hyrox station splits inside the elite bracket; running is the limiter",
      "Final editor on every strength, station-technique, and gym-based programming guide",
    ],
    topics: [
      "Sled push and sled pull technique",
      "Wall balls, sandbag lunges, farmers carry, burpee broad jumps",
      "No-gym, hotel-room and home-equipment Hyrox training",
      "Strength-to-Hyrox transitions (CrossFit, F45, powerlifting, rugby)",
      "Concurrent training and deloads",
    ],
  },
  {
    slug: "niklas",
    name: "James Andersen",
    firstName: "James",
    jobTitle: "Running editor",
    tagline: "Came to Hyrox from the road.",
    bio: "Sub-3 marathoner with finishes at Berlin, New York, Stockholm, Madrid, Barcelona and Valencia. Crossed into Hyrox 18 months ago and has been bolting on real strength work ever since.",
    longBio:
      "Ten years of structured run training across 5K to marathon distances, with finishes at Berlin, New York, Stockholm, Madrid, Barcelona and Valencia and a sub-3 marathon on the road CV. Track background underneath that, which is why he still races as a strong sprinter when the season runs short. He came to Hyrox 18 months ago because the running-heavy format suited him on paper, then got punished on the sled push and the wall balls in his first race. The work since has been adding real strength sessions without losing the engine he spent a decade building. The 5K input on the calculator is the one he is most opinionated about — that number is what most readers misuse when they predict a Hyrox time.",
    image: "/team/niklas.jpg",
    credentials: [
      "Sub-3 marathoner with finishes at Berlin, New York, Stockholm, Madrid, Barcelona and Valencia",
      "Ten years of structured run training across 5K to marathon distances",
      "Final editor on every running, pacing, Zone 2, VO2max and run-fitness guide",
    ],
    topics: [
      "Race-pace running for Hyrox",
      "Zone 2 and VO2max programming",
      "Heart-rate zones for hybrid athletes",
      "Running-watch setup (Garmin, Coros, Polar, Apple Watch)",
      "Marathon, triathlete and cyclist transitions to Hyrox",
    ],
  },
  {
    slug: "jesper",
    name: "Max Jespersen",
    firstName: "Max",
    jobTitle: "Nutrition & racing editor",
    tagline: "No glaring weakness, no glaring strength.",
    bio: "Stable splits across every Hyrox station. Sports-nutrition background. Tests every gel, shoe and electrolyte against a fixed checklist before recommending it.",
    longBio:
      "Stable splits across every Hyrox station — no glaring weakness, no glaring strength, just steady execution end to end. He pays attention to the small things on race week: when he eats, what he wears, which gel he takes after which station, what the line for bag drop looks like 75 minutes before the wave. His background is in sports nutrition — he reads the ISSN, ACSM and IOC consensus statements as they update — which is why every fuelling, hydration, carb-loading and recovery guide on the site goes through him. He also writes most of the racing side: sub-X assessments, race-week protocol, doubles, the population-specific guides, and the buying guides for shoes, bags, sleeves and watches.",
    image: "/team/jesper.jpg",
    credentials: [
      "Stable Open Men Hyrox splits across all eight stations, no station weakness",
      "Tracks ISSN, ACSM and IOC position statements on supplements, fuelling and pacing",
      "Final editor on nutrition, fuelling, race-format, gear-buying and population-specific guides",
    ],
    topics: [
      "Race-day fuelling: gels, electrolytes, caffeine timing",
      "Carb loading, daily nutrition and post-race recovery",
      "Race-week protocol, pacing strategy and warm-up",
      "Sub-X goal-time assessments and blueprints",
      "Doubles, masters and population-specific guides",
      "Race-day gear: shoes, bag, compression sleeves, watches",
    ],
  },
];

export function findAuthorByName(name?: string): Author | undefined {
  if (!name) return undefined;
  return AUTHORS.find((a) => a.name.toLowerCase() === name.toLowerCase());
}
