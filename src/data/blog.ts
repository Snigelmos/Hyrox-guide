import { getCollection, type CollectionEntry } from "astro:content";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_META,
  type BlogCategory,
} from "../content.config";

export type BlogPost = CollectionEntry<"blog">;

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await getCollection("blog");
  const now = new Date();
  return posts
    .filter((p) => p.data.pubDate <= now)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export async function getPostsByCategory(
  category: BlogCategory
): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.data.category === category);
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((p) => p.data.tags?.includes(tag));
}

export async function getPostsBySeries(series: string): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts
    .filter((p) => p.data.series?.name === series)
    .sort((a, b) => (a.data.series?.order ?? 0) - (b.data.series?.order ?? 0));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const set = new Set<string>();
  for (const p of posts) {
    for (const t of p.data.tags ?? []) set.add(t);
  }
  return Array.from(set).sort();
}

export async function getAllSeries(): Promise<
  { name: string; postCount: number; latest: Date }[]
> {
  const posts = await getAllPosts();
  const map = new Map<string, { postCount: number; latest: Date }>();
  for (const p of posts) {
    const s = p.data.series?.name;
    if (!s) continue;
    const existing = map.get(s);
    if (existing) {
      existing.postCount += 1;
      if (p.data.pubDate > existing.latest) existing.latest = p.data.pubDate;
    } else {
      map.set(s, { postCount: 1, latest: p.data.pubDate });
    }
  }
  return Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const SERIES_META: Record<
  string,
  { label: string; description: string; totalPlanned?: number }
> = {
  "station-masterclass": {
    label: "The Hyrox Station Masterclass",
    description:
      "A beginner's guide to the 8km run and 8 Hyrox stations, one at a time. New part every other day — technique, pacing, common mistakes, drills, and a race-day rep scheme.",
    totalPlanned: 8,
  },
  "race-day-masterclass": {
    label: "The Hyrox Race Day Masterclass",
    description:
      "Everything that happens on race day — from breakfast to the finish line. Six parts covering morning routine, transitions, warm-up, hitting the wall, race-day kit, and doubles strategy.",
    totalPlanned: 6,
  },
  "second-race-blueprint": {
    label: "The Second-Race Blueprint",
    description:
      "Already raced once? This four-part series maps the fastest path to a big PR — from fixing first-race mistakes to a full sub-60 training block.",
    totalPlanned: 4,
  },
  "nutrition-hybrid-athlete": {
    label: "Nutrition for Hyrox Athletes",
    description:
      "Five-part nutrition series covering race-day breakfast, carb loading, hydration, post-race recovery, and daily fuelling for hybrid athletes in training.",
    totalPlanned: 5,
  },
  "training-science": {
    label: "The Hyrox Training Science Series",
    description:
      "The 'why' behind the training — concurrent programming, Zone 2, peaking, VO2max intervals, and deload weeks. Five parts for athletes who want to train smarter.",
    totalPlanned: 5,
  },
};

export { BLOG_CATEGORIES, BLOG_CATEGORY_META };
export type { BlogCategory };
