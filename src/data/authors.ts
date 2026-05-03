/**
 * Author profile data.
 *
 * Three named authors (first names only — the team has chosen to remain
 * anonymous on surnames). Each entry renders a /author/[slug]/ page via
 * src/pages/author/[slug].astro and is referenced from blog post `author`
 * frontmatter so the Article JSON-LD resolves to a Person.
 *
 * Beat split:
 *   John   — strength, station efficiency, gym-based programming.
 *            CrossFit background, transitioning into running.
 *   Niklas — running. Sub-3 marathoner crossing into Hyrox; owns
 *            pacing, Zone 2, VO2max, watches and HRMs.
 *   Jesper — all-rounder + nutrition. Stable splits across every
 *            station; owns supplements, fuelling, race format and
 *            buying guides.
 */

export interface Author {
  slug: string;
  name: string;
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
  /** Social profile URLs that resolve to a real, owned profile of this person. */
  sameAs?: string[];
}

export const AUTHORS: Author[] = [
  {
    slug: "john",
    name: "John",
    jobTitle: "Strength & station editor",
    tagline: "Built strong, learning to run.",
    bio: "CrossFit background. Eight years of barbell, sled and gymnastics work before Hyrox. Owns the strength and station-technique beats; spends most of his current training time fixing the running side.",
    longBio:
      "John came up through traditional CrossFit — eight years of barbell sessions, sled pieces and gymnastics circuits before Hyrox existed in his life. The first time he raced one he flew through every station inside the elite bracket and then bled time on the running. That race is why his programming looks the way it does today: heavy lifts and station work are still the easy half of his week, the rest of it is base-building mileage, Zone 2 sessions and the kind of long, boring runs no CrossFitter ever wanted to do. He owns the strength and station beats on the site — sled push, sled pull, wall balls, sandbag lunges, burpee broad jumps, farmers carry, technique, no-gym programming — because that is where he can write from real experience. On the running side he writes as someone still rebuilding it, not as the resident expert; that is Niklas's beat.",
    image: "/team/john.jpg",
    credentials: [
      "Eight years of competitive CrossFit programming before transitioning to Hyrox",
      "Hyrox station splits comfortably inside the elite bracket; running is the limiter",
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
    name: "Niklas",
    jobTitle: "Running editor",
    tagline: "Running first, lifting second.",
    bio: "Sub-3 marathoner. Berlin, New York, Stockholm, Madrid, Barcelona, Valencia. Came to Hyrox 18 months ago and has been adding strength work ever since. Owns everything running on the site.",
    longBio:
      "Niklas is a runner first. Ten years of structured run training across 5K to marathon distances, with finisher medals from Berlin, New York, Stockholm, Madrid, Barcelona and Valencia, and a sub-3 marathon time on the road CV. Track background underneath that — he still races as a strong sprinter when the season runs short. He came to Hyrox 18 months ago because the running-heavy format suited him on paper, then promptly got punished on the sled push and the wall balls in his first race. Since then he has been bolting on real strength work without losing the engine he spent a decade building. Owns the running side of the site: pacing, Zone 2, VO2max, heart-rate zones, watches and HRMs (Garmin, Coros, Polar, Apple Watch), and every guide written for runners crossing into Hyrox. The 5K input on the calculator is his territory — that number is what most people are misusing when they predict a Hyrox time.",
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
    name: "Jesper",
    jobTitle: "All-rounder & nutrition editor",
    tagline: "Solid everywhere, stronger on detail.",
    bio: "The all-rounder. Stable splits across every Hyrox station, no glaring weakness, a nutrition background, and the patience to test every gel, shoe and electrolyte against a fixed checklist.",
    longBio:
      "Jesper is the all-rounder of the team. The kind of athlete whose splits look almost identical at every station — no glaring weakness, no glaring strength, just stable execution end to end. He has raced more Hyrox events than the other two combined and is the one who actually pays attention to the small things on race week: when he eats, what he wears, which gel he takes after which station, what the line for bag drop looks like 75 minutes before the wave. His background is in sports nutrition — he reads the ISSN, ACSM and IOC consensus statements as they update — which is why every fuelling, hydration, carb-loading and recovery guide on the site goes through him. Beyond nutrition he owns the racing beat: sub-X assessments, race-week protocol, doubles strategy, the population-specific guides (over-40, masters, heavy, small-framed), the buying guides for shoes, bags, sleeves and watches, and the pacing playbook the rest of us use on race day.",
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
