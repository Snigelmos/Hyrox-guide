/**
 * Author profile data.
 *
 * Three named authors (first names only — the team has chosen to remain
 * anonymous on surnames). Each entry renders a /author/[slug]/ page via
 * src/pages/author/[slug].astro and is referenced from blog post `author`
 * frontmatter so the Article JSON-LD resolves to a Person.
 *
 * Image paths point to /public/team/. Drop the real portrait files in there
 * with the matching filenames to replace the placeholders.
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
    jobTitle: "Editorial lead, race strategy",
    tagline: "Pacing, splits, and how to actually execute on race day.",
    bio: "Editorial lead. Races Open division and writes the race-strategy and pacing guides. Builds and maintains the race-time calculator.",
    longBio:
      "John runs editorial and owns the race-strategy beat. Most of the pacing tables, sub-X blueprints, and the race-time calculator live with him. He has raced Hyrox across the European circuit (Berlin, Stockholm, Copenhagen, Amsterdam) in the Open division and is the editor who reads every guide before it goes live to check that the splits and station targets match what the field actually runs. His rule: if a number is on the site, it has to come from results data, official rules, or his own race timing — never from a guess.",
    image: "/team/john.jpg",
    credentials: [
      "Hyrox Open division finisher across multiple European events",
      "Builds and maintains the race-time calculator engine using aggregated 2026 results data",
      "Final editor on every race-strategy and calculator-related guide",
    ],
    topics: [
      "Race-day pacing and splits",
      "Sub-X goal-time blueprints",
      "Station-by-station strategy",
      "First-race execution",
    ],
  },
  {
    slug: "niklas",
    name: "Niklas",
    jobTitle: "Strength & conditioning coach",
    tagline: "Programming Hyrox-specific training that actually transfers.",
    bio: "S&C coach. Writes the multi-week training plans, station-strength work, and the no-gym programming. Coaches age-group athletes preparing for their first Hyrox in person.",
    longBio:
      "Niklas writes the training side of the site. The 8-, 10-, and 12-week plans, the station-strength progressions, the no-gym series, and the masters/heavy/small-frame programming are all his. He holds a CSCS-equivalent strength and conditioning certification and coaches age-group athletes preparing for their first race in person, which is where the bias toward simple, repeatable sessions over Instagram-bait workouts comes from. If a plan exists on the site, he has run it himself first.",
    image: "/team/niklas.jpg",
    credentials: [
      "CSCS-equivalent strength and conditioning certification",
      "In-person coaching of age-group Hyrox athletes",
      "Authors and tests every multi-week training plan on the site",
    ],
    topics: [
      "8–12 week training programmes",
      "Concurrent strength and endurance programming",
      "No-gym and at-home Hyrox training",
      "Masters and population-specific plans",
    ],
  },
  {
    slug: "jesper",
    name: "Jesper",
    jobTitle: "Nutrition & gear editor",
    tagline: "Reads the supplement literature so you don't have to.",
    bio: "Nutrition and gear editor. Reviews the supplement and pacing literature (ISSN, ACSM, IOC) and writes the fuelling, hydration, recovery, and gear guides.",
    longBio:
      "Jesper handles nutrition and gear. He reads the ISSN position stands, ACSM guidelines, and IOC consensus statements as they update and translates them into something a working athlete can actually use on race week. He also writes the gear coverage — shoes, race bag, compression sleeves, heart-rate monitors, watch setups — and tests products against a fixed checklist before any of them get a recommendation. If something on the site says \"editor's pick\", that is him.",
    image: "/team/jesper.jpg",
    credentials: [
      "Tracks ISSN, ACSM, and IOC consensus statements on supplements and pacing",
      "Tests gear (shoes, watches, HRMs, race bags) against a documented evaluation checklist",
      "Writes the fuelling, hydration, carb-loading, and recovery guides",
    ],
    topics: [
      "Race-day fuelling, gels, and electrolytes",
      "Carb loading and daily nutrition for hybrid athletes",
      "Recovery and post-race nutrition",
      "Shoes, watches, HRMs, and race-day gear",
    ],
  },
];

export function findAuthorByName(name?: string): Author | undefined {
  if (!name) return undefined;
  return AUTHORS.find((a) => a.name.toLowerCase() === name.toLowerCase());
}
