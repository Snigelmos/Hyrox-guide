import { defineConfig } from "astro/config";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

import { GYMS, hasIndexablePage } from "./src/data/gym-finder";
import { allEventPaths } from "./src/data/events";
import { getResults } from "./src/data/event-results";

/**
 * Sitemap noindex allowlist.
 *
 * The sitemap should only include URLs that are indexable, canonical, and
 * return 200. Anything we mark as `noindex` in BaseLayout (or via per-page
 * <meta robots>) MUST also be excluded here, otherwise GSC reports the
 * mismatch as "Submitted URL marked noindex".
 *
 * If you add a new noindex code-path, mirror it here.
 */
const STATIC_NOINDEX_PATHS = new Set<string>([
  "/calculator/share/",
  "/calculator/pacing-band/",
  "/calculator/embed/",
]);

const NOINDEX_PREFIXES: string[] = [
  "/blog/tag/",
  "/blog/category/",
];

const nonIndexableGymPaths = new Set<string>(
  GYMS.filter((g) => !hasIndexablePage(g)).map((g) => `/gyms/g/${g.slug}/`),
);

// Mirror the `noindex={!results}` rule in src/pages/events/[year]/[city]/results.astro:
// any results URL without a published RaceResult is noindex and must not be
// in the sitemap.
const unpublishedResultsPaths = new Set<string>(
  allEventPaths()
    .filter(({ year, slug }) => !getResults(year, slug))
    .map(({ year, slug }) => `/events/${year}/${slug}/results/`),
);

// Mirror the scheduled-post handling in src/pages/blog/[slug].astro: posts
// with `pubDate > now` are built (so internal links don't 404) but emitted
// with `noindex` and must not appear in the sitemap until promoted by the
// every-2-day Vercel rebuild in .github/workflows/scheduled-publish.yml.
//
// Returns:
// - scheduledBlogPaths: future-dated /blog/<slug>/ URLs (noindex)
// - preLaunchSeriesPaths: /blog/series/<name>/ URLs whose entire series is
//   still scheduled (also noindex; mirrors series/[series].astro logic).
function readScheduledBlogContext(): {
  scheduledBlogPaths: Set<string>;
  preLaunchSeriesPaths: Set<string>;
} {
  const dir = "./src/content/blog";
  const scheduledBlogPaths = new Set<string>();
  const seriesTotals = new Map<string, { total: number; published: number }>();
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return { scheduledBlogPaths, preLaunchSeriesPaths: new Set() };
  }
  const now = Date.now();
  const PUB_DATE_RE = /^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m;
  const SERIES_NAME_RE = /^\s+name:\s*['"]?([^'"\n]+?)['"]?\s*$/m;
  for (const name of entries) {
    if (!name.endsWith(".mdx")) continue;
    const slug = name.replace(/\.mdx$/, "");
    let frontmatter: string;
    try {
      const file = readFileSync(join(dir, name), "utf8");
      const match = file.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      frontmatter = match ? match[1] : "";
    } catch {
      continue;
    }
    const dateMatch = frontmatter.match(PUB_DATE_RE);
    if (!dateMatch) continue;
    const pubMs = Date.parse(dateMatch[1]);
    const isScheduled = Number.isFinite(pubMs) && pubMs > now;
    if (isScheduled) {
      scheduledBlogPaths.add(`/blog/${slug}/`);
    }
    // Detect series membership (frontmatter has `series:\n  name: foo\n  order: N`).
    const seriesBlockMatch = frontmatter.match(
      /^series:\r?\n([\s\S]*?)(?=^\S|\Z)/m,
    );
    if (seriesBlockMatch) {
      const nameMatch = seriesBlockMatch[1].match(SERIES_NAME_RE);
      if (nameMatch) {
        const seriesName = nameMatch[1].trim();
        const acc = seriesTotals.get(seriesName) ?? {
          total: 0,
          published: 0,
        };
        acc.total += 1;
        if (!isScheduled) acc.published += 1;
        seriesTotals.set(seriesName, acc);
      }
    }
  }
  const preLaunchSeriesPaths = new Set<string>();
  for (const [seriesName, counts] of seriesTotals) {
    if (counts.published === 0) {
      preLaunchSeriesPaths.add(`/blog/series/${seriesName}/`);
    }
  }
  return { scheduledBlogPaths, preLaunchSeriesPaths };
}

const { scheduledBlogPaths, preLaunchSeriesPaths } = readScheduledBlogContext();

function isIndexableSitemapUrl(pageUrl: string): boolean {
  let path: string;
  try {
    path = new URL(pageUrl).pathname;
  } catch {
    path = pageUrl;
  }
  if (STATIC_NOINDEX_PATHS.has(path)) return false;
  if (NOINDEX_PREFIXES.some((p) => path.startsWith(p))) return false;
  if (nonIndexableGymPaths.has(path)) return false;
  if (unpublishedResultsPaths.has(path)) return false;
  if (scheduledBlogPaths.has(path)) return false;
  if (preLaunchSeriesPaths.has(path)) return false;
  return true;
}

export default defineConfig({
  site: "https://www.hyroxvault.com",
  output: "static",
  adapter: vercel(),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: isIndexableSitemapUrl,
    }),
  ],
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
