/**
 * Author profile data.
 *
 * Add additional authors here with their own slug, bio, and credentials.
 * Each entry also renders a /author/[slug]/ page via src/pages/author/[slug].astro.
 *
 * Use the exact `name` field as the `author` value in blog post frontmatter so
 * Article JSON-LD resolves to the Person schema on this page.
 *
 * NOTE: We deliberately publish under a single editorial-team identity rather
 * than named individual bylines. The credentials below describe the team in
 * aggregate and should reflect the actual current line-up. Update them
 * whenever a contributor joins, leaves, or completes additional races or
 * certifications, so the JSON-LD stays factually defensible.
 */

import { SITE_SOCIALS } from "./socials";

export interface Author {
  slug: string;
  name: string;
  jobTitle: string;
  bio: string;
  credentials: string[];
  topics: string[];
  sameAs?: string[];
}

export const AUTHORS: Author[] = [
  {
    slug: "hyroxvault-editorial-team",
    name: "HyroxVault Editorial Team",
    jobTitle: "Editorial Team",
    bio: "A small Europe-based editorial team of Hyrox racers, strength and conditioning coaches, and technical editors. We race across the European circuit, coach athletes preparing for their first Hyrox in person, and read the supplement and pacing literature as it updates. Every guide is checked against primary sources and reviewed by at least one editor with lived racing experience before it goes live.",
    credentials: [
      "Hyrox events completed across the European circuit, including Berlin, Stockholm, London, Amsterdam, and Copenhagen",
      "Racing experience across both Open and Pro divisions",
      "CSCS-equivalent strength and conditioning certifications on the team",
      "Active in-person coaching of athletes preparing for their first Hyrox",
      "Routine review of ISSN, ACSM, and IOC consensus statements when updating supplement and pacing guidance",
    ],
    topics: [
      "Hyrox racing",
      "Functional fitness training",
      "Endurance race pacing",
      "Sports nutrition",
    ],
    sameAs: SITE_SOCIALS.length > 0 ? [...SITE_SOCIALS] : undefined,
  },
];

export function findAuthorByName(name?: string): Author | undefined {
  if (!name) return undefined;
  return AUTHORS.find((a) => a.name.toLowerCase() === name.toLowerCase());
}
