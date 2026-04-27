#!/usr/bin/env node
/**
 * scripts/refresh-old-posts.mjs
 *
 * Reads every .mdx file under src/content/blog and lists the ones with a
 * pubDate older than 6 months, sorted oldest first. Use this as a monthly
 * prompt to refresh high-traffic posts (Google rewards freshness).
 *
 * Usage:
 *   node scripts/refresh-old-posts.mjs              # lists all old posts
 *   node scripts/refresh-old-posts.mjs --months 12  # custom age threshold
 *
 * After refreshing a post, bump `dateModified` to today in its frontmatter
 * (do not change pubDate) and re-run: npm run indexnow -- <url>
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

function parseFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let [, key, val] = kv;
    val = val.trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

async function main() {
  const argIdx = process.argv.indexOf("--months");
  const months =
    argIdx >= 0 ? Number(process.argv[argIdx + 1]) : 6;

  if (!Number.isFinite(months) || months <= 0) {
    console.error("Invalid --months value.");
    process.exit(1);
  }

  const now = Date.now();
  const threshold = now - months * 30 * 24 * 60 * 60 * 1000;

  const dir = path.resolve("src/content/blog");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));

  const aged = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const src = await readFile(full, "utf8");
    const fm = parseFrontmatter(src);
    if (!fm.pubDate) continue;
    const pub = new Date(fm.pubDate);
    if (isNaN(pub.getTime())) continue;
    if (pub.getTime() > threshold) continue;

    const modified = fm.dateModified ? new Date(fm.dateModified) : null;
    const lastTouched = modified && !isNaN(modified.getTime()) ? modified : pub;
    if (lastTouched.getTime() > threshold) continue;

    const daysOld = Math.floor((now - lastTouched.getTime()) / (1000 * 60 * 60 * 24));
    aged.push({
      slug: f.replace(/\.mdx$/, ""),
      title: fm.title,
      pubDate: fm.pubDate,
      dateModified: fm.dateModified || "—",
      daysOld,
      url: `https://www.hyroxvault.com/blog/${f.replace(/\.mdx$/, "")}/`,
    });
  }

  aged.sort((a, b) => b.daysOld - a.daysOld);

  if (aged.length === 0) {
    console.log(`No posts older than ${months} months. Nothing to refresh.`);
    return;
  }

  console.log(`\nPosts to refresh (older than ${months} months):\n`);
  console.log("Days old | Slug".padEnd(60) + "| URL");
  console.log("-".repeat(100));
  for (const p of aged) {
    console.log(
      `${String(p.daysOld).padStart(8)} | ${p.slug.padEnd(50)} | ${p.url}`
    );
  }
  console.log(`\nTotal: ${aged.length} post(s).`);
  console.log(
    `\nRefresh workflow:\n` +
      `  1. Open the .mdx file.\n` +
      `  2. Use the AI prompt in scripts/new-post.md with "update mode" — keep the URL and slug,\n` +
      `     rewrite any outdated sections, and add new internal links to newer posts.\n` +
      `  3. Set dateModified to today's date in frontmatter.\n` +
      `  4. Commit and deploy.\n` +
      `  5. npm run indexnow -- <url>\n`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
