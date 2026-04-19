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

const blog = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  "racing-guide": racingGuide,
  training,
  gear,
  supplements,
  blog,
};
