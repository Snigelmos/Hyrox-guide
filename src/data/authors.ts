/**
 * Editorial team data.
 *
 * HyroxVault is run by an anonymous editorial team of three real Hyrox
 * racers. We deliberately do not put names or faces on the site — recommendations
 * stand on the research, the data, and our own race experience, not on personal
 * brand. Bylines across the site point to a single `editorial-team` profile.
 *
 * Historically the site was bylined to three named personas. Anything still
 * stamped with one of those names is silently mapped onto the team profile so
 * existing posts keep linking to a real, current page.
 */

export interface Author {
  /** URL slug — used at /author/<slug>/. */
  slug: string;
  /** Display name used in bylines, page titles, and Article schema. */
  name: string;
  /** Conversational reference used in some body copy ("Articles by the team"). */
  firstName: string;
  jobTitle: string;
  /** Short headline used as a tagline on the team page. */
  tagline: string;
  /** 1–2 sentence summary used on listing/cards. */
  bio: string;
  /** Longer prose used on the individual team page. */
  longBio: string;
  /** Path under /public — neutral team mark, not a portrait. */
  image: string;
  credentials: string[];
  topics: string[];
  /**
   * Social profile URLs. Intentionally empty for the anonymous team — we do
   * not link the editorial profile to any individual's social presence.
   */
  sameAs?: string[];
}

export const EDITORIAL_TEAM_NAME = "HyroxVault Editorial Team";

export const AUTHORS: Author[] = [
  {
    slug: "editorial-team",
    name: EDITORIAL_TEAM_NAME,
    firstName: "the team",
    jobTitle: "Editorial team",
    tagline: "Three Hyrox racers behind every guide on the site.",
    bio: "An anonymous editorial team of three Hyrox racers covering strength, running and nutrition between us. We don't put names or faces on the site — recommendations stand on published research, race data and our own training, not on personal brand.",
    longBio:
      "HyroxVault is written by three people who race Hyrox on the European circuit. One of us comes from a strength and station-technique background, one from distance running and pacing, one from sports-nutrition and racing. We've chosen to publish anonymously: the goal is for every recommendation to stand on the evidence behind it, not on whose byline is on top of the page. Numbers come from the official Hyrox rules and results data, peer-reviewed research from the ISSN/ACSM/IOC, or our own logged training and racing. When something cannot be tied to one of those, we either remove it or hedge the claim. Read our full editorial standards on the methodology page.",
    image: "/team/editorial-team.svg",
    credentials: [
      "Three Hyrox racers covering strength, running, and nutrition between us",
      "Recommendations anchored to published research (ISSN, ACSM, IOC) and the official Hyrox rules and results data",
      "Affiliate disclosure on every monetised page; full editorial standards on /methodology/",
    ],
    topics: [
      "Hyrox training, racing, pacing, and station technique",
      "Race-day fuelling, hydration, and recovery",
      "Hyrox-specific gear and supplement reviews",
    ],
  },
];

const LEGACY_PERSONA_NAMES = new Set([
  "adam smith",
  "james andersen",
  "max jespersen",
  "hyrox guide editorial team",
  "hyroxguide editorial team",
]);

/**
 * Resolve any historical author byline to the current editorial-team profile.
 *
 * Matches the canonical `HyroxVault Editorial Team` name plus the three retired
 * persona names so we don't have to hunt every old MDX file in lockstep with
 * the data change.
 */
export function findAuthorByName(name?: string): Author | undefined {
  if (!name) return undefined;
  const normalised = name.toLowerCase();
  if (normalised === EDITORIAL_TEAM_NAME.toLowerCase()) return AUTHORS[0];
  if (LEGACY_PERSONA_NAMES.has(normalised)) return AUTHORS[0];
  return undefined;
}
