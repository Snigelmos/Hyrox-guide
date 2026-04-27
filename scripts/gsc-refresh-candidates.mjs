#!/usr/bin/env node
/**
 * scripts/gsc-refresh-candidates.mjs
 *
 * Lists blog posts in the "ranking maturation window" (30-90 days since last
 * touch). These are typically the highest-leverage refresh candidates for the
 * weekly GSC review — old enough to have GSC data, young enough that
 * intervention still moves rankings.
 *
 * Usage:
 *   node scripts/gsc-refresh-candidates.mjs                # 30-90 day window
 *   node scripts/gsc-refresh-candidates.mjs --min 14 --max 60
 *
 * Pair with the GSC weekly review playbook in docs/gsc-weekly-review.md.
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

function getArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const v = Number(process.argv[idx + 1]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

async function main() {
  const minDays = getArg("min", 30);
  const maxDays = getArg("max", 90);

  if (minDays >= maxDays) {
    console.error("--min must be less than --max");
    process.exit(1);
  }

  const now = Date.now();
  const dir = path.resolve("src/content/blog");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));

  const candidates = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const src = await readFile(full, "utf8");
    const fm = parseFrontmatter(src);
    if (!fm.pubDate) continue;
    const pub = new Date(fm.pubDate);
    if (isNaN(pub.getTime())) continue;

    const modified = fm.dateModified ? new Date(fm.dateModified) : null;
    const lastTouched = modified && !isNaN(modified.getTime()) ? modified : pub;
    const daysOld = Math.floor((now - lastTouched.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOld < minDays || daysOld > maxDays) continue;

    candidates.push({
      slug: f.replace(/\.mdx$/, ""),
      title: fm.title || "(no title)",
      pubDate: fm.pubDate,
      dateModified: fm.dateModified || "—",
      daysOld,
      url: `https://www.hyroxvault.com/blog/${f.replace(/\.mdx$/, "")}/`,
    });
  }

  candidates.sort((a, b) => b.daysOld - a.daysOld);

  if (candidates.length === 0) {
    console.log(`No posts in the ${minDays}-${maxDays} day window. Nothing to review this week.`);
    return;
  }

  console.log(`\nGSC weekly review candidates (${minDays}-${maxDays} days since last touch):\n`);
  console.log("Days old | Slug".padEnd(60) + "| URL");
  console.log("-".repeat(110));
  for (const p of candidates) {
    console.log(
      `${String(p.daysOld).padStart(8)} | ${p.slug.padEnd(50)} | ${p.url}`,
    );
  }
  console.log(`\nTotal: ${candidates.length} candidate(s).`);
  console.log(
    `\nWeekly review workflow:\n` +
      `  1. Open Google Search Console -> Performance -> Search results.\n` +
      `  2. Filter Position 5-15, last 28 days.\n` +
      `  3. Cross-reference the URLs above with GSC queries.\n` +
      `  4. For top 3-5 priorities: add 200-400 words, add internal link, or rewrite meta.\n` +
      `  5. Bump dateModified, deploy, run: npm run indexnow -- <url>\n` +
      `  6. Log the action in your weekly tracker (see docs/gsc-weekly-review.md).\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
