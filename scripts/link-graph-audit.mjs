#!/usr/bin/env node
/**
 * scripts/link-graph-audit.mjs
 *
 * Walks every blog .mdx and content .astro file, extracts internal links,
 * and reports:
 *
 *   1. Orphan pages — discoverable URLs with zero inbound links from other
 *      pages (dead ends from a SEO crawler's perspective).
 *   2. Under-linked pages — URLs with fewer than N inbound links (default 3).
 *   3. Hub coverage — for each cluster (racing-guide, training, supplements,
 *      gear, blog, calculator, gyms), confirms a hub page exists and links
 *      to spoke articles, and that spokes link back up.
 *
 * Output: docs/link-graph-audit.md (gitignored).
 *
 * Usage:
 *   npm run link-audit
 *   node scripts/link-graph-audit.mjs --min 5  (require >=5 inbound links)
 */

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const MIN_INBOUND = Number(argFlag("min", "3"));
const OUT_PATH = "docs/link-graph-audit.md";

function argFlag(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1];
}

const SCAN_DIRS = [
  "src/content/blog",
  "src/content/racing-guide",
  "src/content/training",
  "src/content/gear",
  "src/content/supplements",
  "src/pages",
];

const HREF_RE = /(?:href|to)=\{?["'`]([^"'`}\s]+)["'`]/g;
const MD_LINK_RE = /\]\((\/[^)\s]+)\)/g;

const STATIC_PAGES = [
  "/",
  "/about/",
  "/blog/",
  "/calculator/",
  "/competitions/",
  "/compare/",
  "/events/",
  "/faq/",
  "/gear/",
  "/glossary/",
  "/gyms/",
  "/gyms/map/",
  "/gyms/submit/",
  "/qualifiers/",
  "/race-day-checklist/",
  "/racing-guide/",
  "/stations/",
  "/supplements/",
  "/times/",
  "/training/",
  "/training/stations/",
  "/training/workouts/",
  "/training-plans/",
  "/workouts/",
  "/methodology/",
  "/hyrox/",
];

async function walkFiles(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(full, acc);
    } else if (
      entry.name.endsWith(".mdx") ||
      entry.name.endsWith(".astro") ||
      entry.name.endsWith(".md")
    ) {
      acc.push(full);
    }
  }
  return acc;
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
      if (!href.endsWith("/") && !href.includes(".")) href += "/";
      if (href.startsWith("/_") || href.startsWith("//")) continue;
      if (href.includes("[") || href.includes("$")) continue;
      found.add(href);
    }
  }
  return found;
}

function fileToUrl(file) {
  const norm = file.replace(/\\/g, "/");
  if (norm.includes("src/content/blog/")) {
    const slug = path.basename(norm).replace(/\.mdx$/, "");
    return `/blog/${slug}/`;
  }
  if (norm.includes("src/content/racing-guide/")) {
    const slug = path.basename(norm).replace(/\.mdx$/, "");
    return `/racing-guide/${slug}/`;
  }
  if (norm.includes("src/content/training/")) {
    const slug = path.basename(norm).replace(/\.mdx$/, "");
    return `/training/${slug}/`;
  }
  if (norm.includes("src/content/gear/")) {
    const slug = path.basename(norm).replace(/\.mdx$/, "");
    return `/gear/${slug}/`;
  }
  if (norm.includes("src/content/supplements/")) {
    const slug = path.basename(norm).replace(/\.mdx$/, "");
    return `/supplements/${slug}/`;
  }
  if (norm.includes("src/pages/")) {
    const rel = norm.split("src/pages/")[1].replace(/\.astro$/, "").replace(/\.md$/, "");
    if (rel.includes("[")) return null;
    if (rel === "index") return "/";
    if (rel.endsWith("/index")) return `/${rel.slice(0, -6)}/`;
    return `/${rel}/`;
  }
  return null;
}

function classify(url) {
  if (url.startsWith("/blog/")) return "blog";
  if (url.startsWith("/racing-guide/")) return "racing-guide";
  if (url.startsWith("/training/")) return "training";
  if (url.startsWith("/training-plans/")) return "training-plans";
  if (url.startsWith("/calculator/")) return "calculator";
  if (url.startsWith("/supplements/")) return "supplements";
  if (url.startsWith("/gear/")) return "gear";
  if (url.startsWith("/gyms/")) return "gyms";
  if (url.startsWith("/events/")) return "events";
  if (url.startsWith("/compare/")) return "compare";
  if (url.startsWith("/glossary/")) return "glossary";
  if (url.startsWith("/qualifiers/")) return "qualifiers";
  if (url.startsWith("/stations/")) return "stations";
  if (url.startsWith("/times/")) return "times";
  if (url.startsWith("/hyrox/")) return "hyrox";
  if (url.startsWith("/workouts/")) return "workouts";
  if (url.startsWith("/author/")) return "author";
  return "other";
}

const HUB_URLS = {
  blog: "/blog/",
  "racing-guide": "/racing-guide/",
  training: "/training/",
  "training-plans": "/training-plans/",
  calculator: "/calculator/",
  supplements: "/supplements/",
  gear: "/gear/",
  gyms: "/gyms/",
  events: "/events/",
  compare: "/compare/",
  glossary: "/glossary/",
  qualifiers: "/qualifiers/",
  stations: "/stations/",
  hyrox: "/hyrox/",
  workouts: "/workouts/",
};

async function main() {
  const allFiles = [];
  for (const d of SCAN_DIRS) {
    try {
      await stat(d);
      await walkFiles(d, allFiles);
    } catch {
      // dir may not exist on every checkout
    }
  }

  /**
   * Each entry: { url, file, outbound: Set<string> }
   */
  const pages = [];
  const inboundCount = new Map();
  const inboundSources = new Map();

  for (const f of allFiles) {
    const url = fileToUrl(f);
    if (!url) continue;
    const content = await readFile(f, "utf8");
    const outbound = extractLinks(content);
    pages.push({ url, file: f, outbound });
    inboundCount.set(url, inboundCount.get(url) ?? 0);
  }

  for (const p of pages) {
    for (const target of p.outbound) {
      inboundCount.set(target, (inboundCount.get(target) ?? 0) + 1);
      const arr = inboundSources.get(target) ?? [];
      arr.push(p.url);
      inboundSources.set(target, arr);
    }
  }

  const ownPages = new Set(pages.map((p) => p.url));
  const orphans = pages
    .filter((p) => p.url !== "/" && (inboundCount.get(p.url) ?? 0) === 0)
    .filter((p) => !STATIC_PAGES.includes(p.url));
  const underLinked = pages
    .filter(
      (p) =>
        p.url !== "/" &&
        (inboundCount.get(p.url) ?? 0) > 0 &&
        (inboundCount.get(p.url) ?? 0) < MIN_INBOUND,
    )
    .filter((p) => !STATIC_PAGES.includes(p.url));

  // Prefix list for routes generated by getStaticPaths from data files.
  // Without enumerating those data files in JS we conservatively accept
  // any /<prefix>/<slug>/ URL as valid; missing entries surface as
  // 404s in production but won't be flagged here.
  const DYNAMIC_PREFIXES = [
    "/og/",
    "/team/",
    "/blog/category/",
    "/blog/tag/",
    "/blog/series/",
    "/blog/page/",
    "/events/2026/",
    "/events/2027/",
    "/events/2025/",
    "/calculator/age-",
    "/calculator/share",
    "/gyms/",
    "/author/",
    "/qualifiers/",
    "/training-plans/",
    "/calculator/sub-",
    "/compare/",
    "/gear/",
    "/supplements/",
    "/workouts/",
    "/hyrox/",
    "/stations/",
    "/training/stations/",
    "/glossary/",
    "/times/",
  ];
  const isDynamicAccepted = (target) =>
    DYNAMIC_PREFIXES.some((p) => target.startsWith(p)) && target !== "/";

  const brokenInternal = [];
  for (const p of pages) {
    for (const target of p.outbound) {
      if (target.includes(".")) continue;
      if (ownPages.has(target)) continue;
      if (STATIC_PAGES.includes(target)) continue;
      if (isDynamicAccepted(target)) continue;
      brokenInternal.push({ from: p.url, to: target });
    }
  }

  const byCluster = new Map();
  for (const p of pages) {
    const c = classify(p.url);
    if (!byCluster.has(c)) byCluster.set(c, []);
    byCluster.get(c).push(p);
  }

  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# Internal link graph audit — ${today}`);
  lines.push("");
  lines.push(
    `Scanned ${pages.length} files across ${SCAN_DIRS.length} content directories.`,
  );
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Total content pages | ${pages.length} |`);
  lines.push(`| Orphans (zero inbound) | ${orphans.length} |`);
  lines.push(`| Under-linked (< ${MIN_INBOUND} inbound) | ${underLinked.length} |`);
  lines.push(`| Broken internal links | ${brokenInternal.length} |`);
  lines.push("");

  lines.push(`## Cluster sizes`);
  lines.push("");
  lines.push(`| Cluster | Pages | Hub URL | Hub linked from cluster |`);
  lines.push(`| --- | --- | --- | --- |`);
  for (const [cluster, clusterPages] of [...byCluster].sort(
    (a, b) => b[1].length - a[1].length,
  )) {
    const hub = HUB_URLS[cluster];
    if (!hub) {
      lines.push(`| ${cluster} | ${clusterPages.length} | (no hub) | n/a |`);
      continue;
    }
    const linksToHubFromCluster = clusterPages.filter((p) =>
      p.outbound.has(hub),
    ).length;
    lines.push(
      `| ${cluster} | ${clusterPages.length} | ${hub} | ${linksToHubFromCluster}/${clusterPages.length} |`,
    );
  }
  lines.push("");

  if (orphans.length > 0) {
    lines.push(`## Orphan pages (action: add inbound links)`);
    lines.push("");
    lines.push(`These pages have zero inbound links from other content. They're discoverable only via direct URL or sitemap. SEO impact is significant — Google rarely ranks orphans well.`);
    lines.push("");
    lines.push(`| URL | File |`);
    lines.push(`| --- | --- |`);
    for (const p of orphans) {
      lines.push(`| ${p.url} | \`${p.file}\` |`);
    }
    lines.push("");
  }

  if (underLinked.length > 0) {
    lines.push(`## Under-linked pages (< ${MIN_INBOUND} inbound)`);
    lines.push("");
    lines.push(`These pages have inbound links but fewer than ${MIN_INBOUND}. Add 1-2 contextual internal links from high-traffic pages — use the page's primary query phrase as anchor text.`);
    lines.push("");
    lines.push(`| URL | Inbound | File |`);
    lines.push(`| --- | --- | --- |`);
    for (const p of underLinked.slice(0, 50)) {
      const count = inboundCount.get(p.url) ?? 0;
      lines.push(`| ${p.url} | ${count} | \`${p.file}\` |`);
    }
    if (underLinked.length > 50) {
      lines.push(`| (... ${underLinked.length - 50} more rows truncated) | | |`);
    }
    lines.push("");
  }

  if (brokenInternal.length > 0) {
    lines.push(`## Broken internal links`);
    lines.push("");
    lines.push(`| From | To |`);
    lines.push(`| --- | --- |`);
    for (const b of brokenInternal.slice(0, 40)) {
      lines.push(`| ${b.from} | ${b.to} |`);
    }
    if (brokenInternal.length > 40) {
      lines.push(`| (... ${brokenInternal.length - 40} more) | |`);
    }
    lines.push("");
  }

  lines.push(`## Cursor prompts`);
  lines.push("");
  if (orphans.length > 0) {
    lines.push(`### Fix orphan pages`);
    lines.push("");
    lines.push("```");
    lines.push(
      `For each URL in the "Orphan pages" section above, find 2-3 high-traffic pages on the site that should link to it using anchor text matching the page's main topic. Add the links inline (not as a related-posts block). Open the orphan file to see its title and pick natural anchor phrases.`,
    );
    lines.push("```");
    lines.push("");
  }
  if (underLinked.length > 0) {
    lines.push(`### Boost under-linked pages`);
    lines.push("");
    lines.push("```");
    lines.push(
      `Pick the top 10 under-linked pages from the table above. For each, identify the highest-traffic existing page in its cluster and add a contextual inline link to it using the page's title/topic as anchor text.`,
    );
    lines.push("```");
    lines.push("");
  }
  if (brokenInternal.length > 0) {
    lines.push(`### Fix broken internal links`);
    lines.push("");
    lines.push("```");
    lines.push(
      `Resolve each broken link in the table above by either updating the href to the correct existing URL, or removing the link if no equivalent page exists.`,
    );
    lines.push("```");
    lines.push("");
  }

  await writeFile(path.resolve(OUT_PATH), lines.join("\n"), "utf8");
  console.log(
    `\nWrote ${OUT_PATH} (${orphans.length} orphans, ${underLinked.length} under-linked, ${brokenInternal.length} broken).\n` +
      `Then ask Cursor: "Read docs/link-graph-audit.md and fix the orphan and under-linked sections."\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
