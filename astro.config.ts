import { defineConfig } from "astro/config";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

import { GYMS, hasIndexablePage } from "./src/data/gym-finder";
import {
  allEventPaths,
  RETIRED_EVENT_SLUGS,
  RETIRED_EVENT_EXPLAINERS,
} from "./src/data/events";
import { getResults } from "./src/data/event-results";

// Permanent 301 redirects for events that used to have a live page but have
// been retired (no longer on the calendar, replaced by another city, etc.).
// Source of truth: RETIRED_EVENT_SLUGS in src/data/events.ts. Each retired
// entry covers BOTH the detail page and its /results/ sub-page so external
// links and old Google results never 404.
const retiredEventRedirects: Record<string, string> = Object.fromEntries(
  RETIRED_EVENT_SLUGS.flatMap(({ year, slug, redirectTo }) => [
    [`/events/${year}/${slug}/`, redirectTo],
    [`/events/${year}/${slug}/results/`, redirectTo],
  ]),
);

// Retired-with-explainer events render a real page at /events/<year>/<slug>/
// (handled by events/[year]/[city].astro). The /results/ subpage has no data,
// so 301 it to the parent explainer page rather than 404.
for (const { year, slug } of RETIRED_EVENT_EXPLAINERS) {
  retiredEventRedirects[`/events/${year}/${slug}/results/`] =
    `/events/${year}/${slug}/`;
}

/**
 * Permanent 301 redirects for non-event URLs that Google has indexed but that
 * no longer resolve to a page. Each entry was sourced from a confirmed GSC
 * "Hittades inte (404)" report.
 *
 * Categories:
 *   - Retired blog post slugs that have been replaced by a renamed canonical
 *     post (preserves any external backlinks).
 *   - Removed individual gym detail pages (`/gyms/g/<slug>/`) that previously
 *     existed under an older gym dataset. They redirect to the relevant city
 *     hub so the user lands on a useful page rather than the global gyms
 *     index.
 *
 * Maintenance: when a blog post is renamed, add the old slug here. When a gym
 * detail page is removed from gyms.ts, add the slug here pointing at the
 * city hub (or country hub if no city hub exists for that location).
 */
const retired404Redirects: Record<string, string> = {
  "/blog/hyrox-race-day-pacing/": "/blog/best-hyrox-pacing-strategy/",
  "/blog/hyrox-rowing-pacing/": "/blog/hyrox-rowing-technique/",
  "/gyms/g/f45-toronto-yonge/": "/gyms/toronto/",
  "/gyms/g/f45-dubai-marina/": "/gyms/dubai/",
  "/gyms/g/pure-fitness-soho/": "/gyms/london/",
  // Consolidated /training/workouts/ session library into /workouts/ to
  // resolve cannibalization between the two hubs (May 2026 SEO pass).
  "/training/workouts/": "/workouts/",
  // Collapsed three named author personas into a single anonymous editorial
  // team profile (May 2026 anonymisation pass). Old slugs were /author/john/
  // (Adam Smith), /author/niklas/ (James Andersen), /author/jesper/ (Max
  // Jespersen) — each redirects to the canonical team profile.
  "/author/john/": "/author/editorial-team/",
  "/author/niklas/": "/author/editorial-team/",
  "/author/jesper/": "/author/editorial-team/",
  // Gym city slug consolidation (May 2026 data cleanup).
  // /gyms/alexandri/ was a typo for /gyms/alexandria/ (one gym).
  // /gyms/ca/ was a bare state abbreviation; the gym is in San Diego.
  // Washington had three slugs; all normalised to /gyms/washington-dc/.
  "/gyms/alexandri/": "/gyms/alexandria/",
  "/gyms/ca/": "/gyms/san-diego/",
  "/gyms/washington/": "/gyms/washington-dc/",
  "/gyms/washington-d-c/": "/gyms/washington-dc/",
  // Removed gym detail page — redirect to its city hub (May 2026 data cleanup).
  "/gyms/g/migros-fitness-zurich-sihlcity/": "/gyms/zurich/",
};

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
  if (/^\/blog\/category\/[^/]+\/\d+\/$/.test(path)) return false;
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
  redirects: { ...retiredEventRedirects, ...retired404Redirects },
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
