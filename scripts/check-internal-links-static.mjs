#!/usr/bin/env node
/**
 * scripts/check-internal-links-static.mjs
 *
 * Build-free internal-link 404 detector.
 *
 * Walks source MDX/Astro files for internal links and validates each href
 * against:
 *   - Static pages: src/pages/<path>/index.astro or src/pages/<path>.astro
 *   - Dynamic content collections: src/content/<collection>/<slug>.mdx
 *   - Known content slugs (events, gyms, calculator goals, etc.)
 *
 * Use this when you cannot run `astro build` locally (Cursor bundled node
 * has no npm). It does NOT verify static dynamic-route props that come
 * from data files unless explicitly listed below; for those it falls back
 * to a "best-effort" pass and reports unverified hrefs separately.
 *
 *   node scripts/check-internal-links-static.mjs
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const SOURCE_DIRS = [
  "src/content/blog",
  "src/content/racing-guide",
  "src/content/training",
  "src/content/gear",
  "src/content/supplements",
  "src/pages",
];

const HREF_RE = /(?:href|to)=\{?["'`]([^"'`}\s]+)["'`]/g;
const MD_LINK_RE = /\]\((\/[^)\s]+)\)/g;

async function walk(dir, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else if (
      entry.name.endsWith(".mdx") ||
      entry.name.endsWith(".astro") ||
      entry.name.endsWith(".md") ||
      entry.name.endsWith(".ts")
    ) {
      acc.push(full);
    }
  }
  return acc;
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function listSlugsIn(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return new Set(
      entries
        .filter((e) => e.isFile() && (e.name.endsWith(".mdx") || e.name.endsWith(".md")))
        .map((e) => e.name.replace(/\.(mdx|md)$/, ""))
    );
  } catch {
    return new Set();
  }
}

function extractLinks(content) {
  const found = new Set();
  for (const re of [HREF_RE, MD_LINK_RE]) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(content)) !== null) {
      let href = m[1];
      if (!href.startsWith("/")) continue;
      href = href.split("#")[0];
      href = href.split("?")[0];
      if (href.startsWith("/_") || href.startsWith("//")) continue;
      if (href.includes("[") || href.includes("$") || href.includes("{")) continue;
      if (
        href.startsWith("/fonts/") ||
        href.startsWith("/images/") ||
        href.startsWith("/og/") ||
        href.endsWith(".xml") ||
        href.endsWith(".png") ||
        href.endsWith(".jpg") ||
        href.endsWith(".jpeg") ||
        href.endsWith(".webp") ||
        href.endsWith(".svg") ||
        href.endsWith(".ico") ||
        href.endsWith(".webmanifest") ||
        href.endsWith(".pdf") ||
        href.endsWith(".txt")
      )
        continue;
      if (!href.endsWith("/")) href += "/";
      found.add(href);
    }
  }
  return found;
}

// Match an href against a static page file in src/pages/
async function matchesStaticPage(href) {
  const trimmed = href.replace(/^\/+/, "").replace(/\/+$/, "");
  if (trimmed === "") return await exists("src/pages/index.astro");
  const candidates = [
    `src/pages/${trimmed}.astro`,
    `src/pages/${trimmed}/index.astro`,
  ];
  for (const c of candidates) {
    if (await exists(c)) return true;
  }
  return false;
}

async function main() {
  // Pre-load slug sets for dynamic content collections.
  const blogSlugs = await listSlugsIn("src/content/blog");
  const racingGuideSlugs = await listSlugsIn("src/content/racing-guide");
  const trainingSlugs = await listSlugsIn("src/content/training");
  const gearSlugs = await listSlugsIn("src/content/gear");
  const supplementSlugs = await listSlugsIn("src/content/supplements");

  // Pre-load events from events.ts. We use a simple two-pass strategy:
  //
  //   1. Match outer-entry slug/year pairs by their exact 4-space indentation.
  //      Outer entries in EVENTS, RETIRED_EVENT_EXPLAINERS, and RETIRED_EVENT_SLUGS
  //      all use `    slug: "..."` and `    year: NNNN` (4 leading spaces).
  //      Nested substitutes use `      { slug: "...", year: NNNN }` (6+ spaces
  //      and inline), so they're filtered out by the indent rule.
  //
  //   2. Pair each outer slug with its nearest outer year (within 30 lines)
  //      since EVENTS lists slug-before-year while RETIRED_EVENT_EXPLAINERS
  //      lists year-before-slug.
  let eventPaths = new Set(); // "/events/<year>/<slug>/"
  try {
    const eventsTs = await readFile("src/data/events.ts", "utf8");
    const lines = eventsTs.split(/\r?\n/);

    // Pass 1: collect (lineNumber, kind, value) for outer-indent slug/year matches.
    const outerEntries = []; // { line: number, kind: "slug"|"year", value: string }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const slugMatch = line.match(/^    slug:\s*"([^"]+)"/);
      if (slugMatch) outerEntries.push({ line: i, kind: "slug", value: slugMatch[1] });
      const yearMatch = line.match(/^    year:\s*(\d{4})/);
      if (yearMatch) outerEntries.push({ line: i, kind: "year", value: yearMatch[1] });
    }

    // Pass 2: pair each slug with its nearest year (forward or backward) within 30 lines.
    const usedYearLines = new Set();
    for (const slugEntry of outerEntries) {
      if (slugEntry.kind !== "slug") continue;
      let bestYear = null;
      let bestDist = Infinity;
      for (const yearEntry of outerEntries) {
        if (yearEntry.kind !== "year") continue;
        if (usedYearLines.has(yearEntry.line)) continue;
        const dist = Math.abs(yearEntry.line - slugEntry.line);
        if (dist < bestDist && dist <= 30) {
          bestDist = dist;
          bestYear = yearEntry;
        }
      }
      if (bestYear) {
        usedYearLines.add(bestYear.line);
        eventPaths.add(`/events/${bestYear.value}/${slugEntry.value}/`);
        eventPaths.add(`/events/${bestYear.value}/${slugEntry.value}/results/`);
      }
    }
  } catch (e) {
    console.warn("Could not parse events.ts:", e.message);
  }

  // Pre-load calculator goal slugs.
  let calculatorSlugs = new Set();
  try {
    const calcTs = await readFile("src/data/calculator-goals.ts", "utf8");
    const re = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(calcTs)) !== null) {
      calculatorSlugs.add(m[1]);
    }
  } catch {}

  // Pre-load training plan slugs.
  let trainingPlanSlugs = new Set();
  try {
    const tpTs = await readFile("src/data/training-plans.ts", "utf8");
    const re = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(tpTs)) !== null) {
      trainingPlanSlugs.add(m[1]);
    }
  } catch {}

  // Pre-load city evergreens.
  let cityEvergreenSlugs = new Set();
  try {
    const ceTs = await readFile("src/data/city-evergreens.ts", "utf8");
    const re = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(ceTs)) !== null) {
      cityEvergreenSlugs.add(m[1]);
    }
  } catch {}

  // Pre-load comparison slugs.
  let comparisonSlugs = new Set();
  try {
    const compTs = await readFile("src/data/comparisons.ts", "utf8");
    const re = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(compTs)) !== null) {
      comparisonSlugs.add(m[1]);
    }
  } catch {}

  // Pre-load gear comparison slugs.
  let gearComparisonSlugs = new Set();
  try {
    const gcTs = await readFile("src/data/gear-comparisons.ts", "utf8");
    const re = /slug:\s*"([^"]+)"/g;
    let m;
    while ((m = re.exec(gcTs)) !== null) {
      gearComparisonSlugs.add(m[1]);
    }
  } catch {}

  // Walk all source files.
  const allFiles = [];
  for (const d of SOURCE_DIRS) {
    await walk(d, allFiles);
  }

  // Map: target URL -> Set of source files linking to it.
  const targets = new Map();
  for (const f of allFiles) {
    const content = await readFile(f, "utf8");
    const links = extractLinks(content);
    for (const href of links) {
      if (!targets.has(href)) targets.set(href, new Set());
      targets.get(href).add(f);
    }
  }

  const missing = [];
  const unverified = [];

  for (const [href, sources] of targets) {
    let resolved = false;

    // Static page match.
    if (await matchesStaticPage(href)) {
      continue;
    }

    // Dynamic content collection slug matches.
    const blogMatch = href.match(/^\/blog\/([^/]+)\/$/);
    if (blogMatch) {
      if (blogSlugs.has(blogMatch[1])) continue;
      missing.push({ href, sources: [...sources], reason: `blog post '${blogMatch[1]}.mdx' does not exist` });
      continue;
    }

    const seriesMatch = href.match(/^\/blog\/series\/([^/]+)\/$/);
    if (seriesMatch) {
      // Series exist if any blog post has series.name === seriesName. Best-effort skip.
      continue;
    }

    const tagMatch = href.match(/^\/blog\/tag\/([^/]+)\//);
    const categoryMatch = href.match(/^\/blog\/category\/([^/]+)\//);
    if (tagMatch || categoryMatch) continue; // dynamic, generated from posts

    const racingGuideMatch = href.match(/^\/racing-guide\/([^/]+)\/$/);
    if (racingGuideMatch) {
      if (racingGuideSlugs.has(racingGuideMatch[1])) continue;
      missing.push({ href, sources: [...sources], reason: `racing-guide '${racingGuideMatch[1]}.mdx' does not exist` });
      continue;
    }

    const trainingMatch = href.match(/^\/training\/([^/]+)\/$/);
    if (trainingMatch) {
      const slug = trainingMatch[1];
      if (trainingSlugs.has(slug)) continue;
      // Could also be a static page like /training/workouts/, /training/stations/. Already checked above.
      missing.push({ href, sources: [...sources], reason: `training content '${slug}.mdx' does not exist (and no static page)` });
      continue;
    }

    const gearMatch = href.match(/^\/gear\/([^/]+)\/$/);
    if (gearMatch) {
      const slug = gearMatch[1];
      if (gearSlugs.has(slug)) continue;
      if (gearComparisonSlugs.has(slug)) continue;
      missing.push({ href, sources: [...sources], reason: `gear '${slug}.mdx' / comparison does not exist` });
      continue;
    }

    const supplementMatch = href.match(/^\/supplements\/([^/]+)\/$/);
    if (supplementMatch) {
      const slug = supplementMatch[1];
      if (supplementSlugs.has(slug)) continue;
      missing.push({ href, sources: [...sources], reason: `supplement '${slug}.mdx' does not exist` });
      continue;
    }

    const calcMatch = href.match(/^\/calculator\/([^/]+)\/$/);
    if (calcMatch) {
      const slug = calcMatch[1];
      if (calculatorSlugs.has(slug)) continue;
      // Allow age- prefix (handled by separate route).
      if (slug.startsWith("age-")) continue;
      // Allow share/embed/pacing-band etc.
      if (["share", "embed", "pacing-band", "sled-push-watts"].includes(slug)) continue;
      missing.push({ href, sources: [...sources], reason: `calculator goal '${slug}' not in ALL_GOAL_TIME_CONFIGS` });
      continue;
    }

    const eventMatch = href.match(/^\/events\/(\d{4})\/([^/]+)\/(?:results\/)?$/);
    if (eventMatch) {
      if (eventPaths.has(href)) continue;
      missing.push({ href, sources: [...sources], reason: `event ${eventMatch[1]}/${eventMatch[2]} not in EVENTS` });
      continue;
    }

    const trainingPlanMatch = href.match(/^\/training-plans\/([^/]+)\/$/);
    if (trainingPlanMatch) {
      if (trainingPlanSlugs.has(trainingPlanMatch[1])) continue;
      missing.push({ href, sources: [...sources], reason: `training-plan '${trainingPlanMatch[1]}' does not exist` });
      continue;
    }

    const cityEvergreenMatch = href.match(/^\/hyrox\/([^/]+)\/$/);
    if (cityEvergreenMatch) {
      if (cityEvergreenSlugs.has(cityEvergreenMatch[1])) continue;
      // Country-level pages like /hyrox/germany/ are static (already checked above).
      missing.push({ href, sources: [...sources], reason: `city evergreen '${cityEvergreenMatch[1]}' not in CITY_EVERGREENS` });
      continue;
    }

    const compareMatch = href.match(/^\/compare\/([^/]+)\/$/);
    if (compareMatch) {
      if (comparisonSlugs.has(compareMatch[1])) continue;
      missing.push({ href, sources: [...sources], reason: `comparison '${compareMatch[1]}' not in COMPARISONS` });
      continue;
    }

    // /times/[category]/[ageGroup]/, /times/[category]/, /stations/[station]/standards/ etc.
    // Allow these without verifying for now (data-driven, large surface).
    if (
      href.startsWith("/times/") ||
      href.startsWith("/stations/") ||
      href.startsWith("/gyms/") ||
      href.startsWith("/qualifiers/") ||
      href.startsWith("/glossary/") ||
      href.startsWith("/workouts/") ||
      href.startsWith("/author/") ||
      href.startsWith("/compare/")
    ) {
      unverified.push({ href, sources: [...sources] });
      continue;
    }

    unverified.push({ href, sources: [...sources] });
  }

  console.log(
    `Checked ${targets.size} unique internal URLs across ${allFiles.length} source files.\n`
  );

  if (missing.length > 0) {
    console.log(`FAIL: ${missing.length} confirmed broken internal link(s):\n`);
    for (const { href, sources, reason } of missing.sort((a, b) =>
      a.href.localeCompare(b.href)
    )) {
      console.log(`  ${href}`);
      console.log(`    reason: ${reason}`);
      for (const src of sources.slice(0, 3)) {
        console.log(`    from:   ${src}`);
      }
      if (sources.length > 3) {
        console.log(`    ... and ${sources.length - 3} more sources`);
      }
    }
    console.log();
  } else {
    console.log("PASS: No confirmed broken internal links.\n");
  }

  if (unverified.length > 0) {
    console.log(`Unverified (data-driven dynamic routes, manual review): ${unverified.length} URLs`);
    // Don't print every one; just summarise by prefix.
    const byPrefix = new Map();
    for (const { href } of unverified) {
      const m = href.match(/^(\/[^/]+\/)/);
      const prefix = m ? m[1] : href;
      byPrefix.set(prefix, (byPrefix.get(prefix) ?? 0) + 1);
    }
    for (const [prefix, count] of [...byPrefix].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${prefix}  -> ${count} unverified`);
    }
  }

  process.exit(missing.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
