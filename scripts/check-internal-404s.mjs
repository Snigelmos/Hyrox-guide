#!/usr/bin/env node
/**
 * scripts/check-internal-404s.mjs
 *
 * One-shot validator that catches the kind of 404 the lenient
 * link-graph-audit cannot: an internal link to /gear/<slug>/ where the
 * route is registered but no static path is generated for that slug.
 *
 * Walks all source MDX/Astro files for internal links and verifies that
 * each target URL has a corresponding `dist/<path>/index.html` file
 * (or matching static asset). Run AFTER `astro build`.
 *
 *   node scripts/check-internal-404s.mjs
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const DIST = "dist";
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
      if (href.startsWith("/_") || href.startsWith("//")) continue;
      if (href.includes("[") || href.includes("$")) continue;
      // Skip explicit asset paths.
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

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  // Smoke-check that dist/ exists.
  if (!(await exists(DIST))) {
    console.error(
      `${DIST}/ not found. Run \`astro build\` first.`,
    );
    process.exit(2);
  }

  const allFiles = [];
  for (const d of SOURCE_DIRS) {
    await walk(d, allFiles);
  }

  /** map: target URL -> Set of source files linking to it */
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
  for (const [href, sources] of targets) {
    const indexHtml = path.join(DIST, href.replace(/^\//, ""), "index.html");
    if (!(await exists(indexHtml))) {
      // Also accept exact-file matches like /sitemap.xml served as /sitemap.xml
      const exact = path.join(DIST, href.replace(/^\//, "").replace(/\/$/, ""));
      if (!(await exists(exact))) {
        missing.push({ href, sources: [...sources] });
      }
    }
  }

  console.log(
    `Checked ${targets.size} unique internal URLs across ${allFiles.length} source files.\n`,
  );

  if (missing.length === 0) {
    console.log("PASS: No internal 404s.");
    process.exit(0);
  }

  console.log(`FAIL: ${missing.length} internal 404 target(s):\n`);
  for (const { href, sources } of missing.sort((a, b) =>
    a.href.localeCompare(b.href),
  )) {
    console.log(`  ${href}`);
    for (const src of sources.slice(0, 5)) {
      console.log(`    from: ${src}`);
    }
    if (sources.length > 5) {
      console.log(`    ... and ${sources.length - 5} more sources`);
    }
  }
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
