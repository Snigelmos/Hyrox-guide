/**
 * Author profile data.
 *
 * Add additional authors here with their own slug, bio, and credentials.
 * Each entry also renders a /author/[slug]/ page via src/pages/author/[slug].astro.
 *
 * Use the exact `name` field as the `author` value in blog post frontmatter so
 * Article JSON-LD resolves to the Person schema on this page.
 */

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
    bio: "A small group of Hyrox racers, certified coaches, and technical editors who write, test, and fact-check every piece published on HyroxVault.",
    credentials: [
      "Multiple completed Hyrox races across Open and Pro divisions",
      "Certified strength and conditioning coaches",
      "Ongoing training and racing across the European Hyrox series",
    ],
    topics: [
      "Hyrox racing",
      "Functional fitness training",
      "Endurance race pacing",
      "Sports nutrition",
    ],
    sameAs: [
      "https://www.hyroxvault.com/about/",
    ],
  },
];

export function findAuthorByName(name?: string): Author | undefined {
  if (!name) return undefined;
  return AUTHORS.find((a) => a.name.toLowerCase() === name.toLowerCase());
}
