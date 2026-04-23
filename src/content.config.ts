import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const racingGuide = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/racing-guide" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    icon: z.string().optional(),
  }),
});

const training = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/training" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    duration: z.string().optional(),
    order: z.number().optional(),
    icon: z.string().optional(),
  }),
});

const gear = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/gear" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    order: z.number().optional(),
  }),
});

const supplements = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/supplements" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    order: z.number().optional(),
    icon: z.string().optional(),
    dateModified: z.string().optional(),
    products: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.string().optional(),
          rating: z.number().optional(),
          affiliateUrl: z.string(),
          badge: z.string().optional(),
          image: z.string().optional(),
        })
      )
      .optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
  }),
});

export const BLOG_CATEGORIES = [
  "training",
  "nutrition",
  "race-strategy",
  "station-guides",
  "gear",
  "beginner",
  "race-recaps",
  "news",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_CATEGORY_META: Record<
  BlogCategory,
  { label: string; description: string }
> = {
  training: {
    label: "Training",
    description: "Programs, drills, and workouts to build Hyrox fitness.",
  },
  nutrition: {
    label: "Nutrition",
    description: "Fuelling, supplements, hydration, and race-day eating.",
  },
  "race-strategy": {
    label: "Race Strategy",
    description: "Pacing, tapering, and how to execute on race day.",
  },
  "station-guides": {
    label: "Station Guides",
    description: "Technique and training for each Hyrox station.",
  },
  gear: {
    label: "Gear",
    description: "Shoes, apparel, grip tools, and race-day kit.",
  },
  beginner: {
    label: "Beginner",
    description: "First-timer guides and how to get into Hyrox.",
  },
  "race-recaps": {
    label: "Race Recaps",
    description: "Event coverage, results, and takeaways.",
  },
  news: {
    label: "News",
    description: "Updates, announcements, and community stories.",
  },
};

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    dateModified: z.date().optional(),
    author: z.string().optional(),
    category: z.enum(BLOG_CATEGORIES),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    featured: z.boolean().optional(),
    series: z
      .object({
        name: z.string(),
        order: z.number(),
      })
      .optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
    howToSteps: z
      .array(
        z.object({
          name: z.string(),
          text: z.string(),
          image: z.string().optional(),
        })
      )
      .optional(),
    howToName: z.string().optional(),
  }),
});

export const collections = {
  "racing-guide": racingGuide,
  training,
  gear,
  supplements,
  blog,
};
