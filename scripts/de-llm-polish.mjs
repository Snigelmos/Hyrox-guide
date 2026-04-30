#!/usr/bin/env node
/**
 * One-off content polish script: removes the most obvious LLM fingerprints
 * across all .mdx content files. Intended to be run once and then deleted.
 *
 * Transforms:
 *   1. `**Term** — definition` (list bold pattern) -> `**Term:** definition`
 *   2. ` — ` (mid-sentence em-dash) -> `, `
 *   3. ` —\n` / ` —$` (sentence-end em-dash) -> `.`
 *   4. Strip trailing `---\n\n*Last reviewed: ... HyroxVault Editorial Team.*` boilerplate.
 *   5. De-cluster pubDate values for posts currently dated 2026-04-26.
 *      (Series posts with `series:` frontmatter are preserved.)
 *
 * Run: node scripts/de-llm-polish.mjs
 */

import fs from "node:fs";
import path from "node:path";

const ROOTS = [
  "src/content/blog",
  "src/content/training",
  "src/content/gear",
  "src/content/supplements",
  "src/content/racing-guide",
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(p));
    else if (entry.isFile() && p.endsWith(".mdx")) files.push(p);
  }
  return files;
}

function transformBody(body) {
  let out = body;

  // 1. `**Term** — definition` -> `**Term:** definition`
  out = out.replace(/\*\*([^*\n]+?)\*\* — /g, "**$1:** ");

  // 2. Mid-sentence em-dash -> comma. Done after pattern 1 so we don't double-transform.
  //    Handle both `word — word` and `word —word` and `word— word`.
  out = out.replace(/ — /g, ", ");
  out = out.replace(/ —([^\s])/g, ", $1");
  out = out.replace(/([^\s])— /g, "$1, ");

  // 3. Trailing em-dash (end of line / end of sentence) -> period
  out = out.replace(/ —$/gm, ".");
  out = out.replace(/ —\n/g, ".\n");

  // 4. Strip the standardized "Last reviewed" footer block (with optional
  //    preceding `---` separator and surrounding blank lines).
  out = out.replace(
    /\n+(?:---\n+)?\*Last reviewed:[^*\n]+\*\s*$/,
    "\n"
  );

  return out;
}

// Map of slugs to new pubDates for de-clustering. Spread cleanly back through
// 2025-Q4 / 2026-Q1 / 2026-Q2 in a believable cadence (~every 4-7 days).
// Preserves Station Masterclass series ordering by leaving series posts alone.
const PUBDATE_MAP = {
  // Original pubDate -> new pubDate (post-by-post overrides via filename)
};

const FILENAME_PUBDATE_OVERRIDES = {
  // Equipment / rule clarifier series (low-volatility evergreen)
  "are-gloves-allowed-in-hyrox.mdx": "2025-10-08",
  "are-leggings-allowed-in-hyrox.mdx": "2025-10-15",
  "is-chalk-allowed-in-hyrox.mdx": "2025-10-22",
  "is-hand-taping-allowed-in-hyrox.mdx": "2025-10-29",
  "legal-grip-aids-in-hyrox.mdx": "2025-11-05",
  "can-you-wear-a-weight-belt-in-hyrox.mdx": "2025-11-12",
  "can-you-change-shoes-during-hyrox.mdx": "2025-11-19",
  "hyrox-shoe-rules.mdx": "2025-11-26",

  // "Is sub-X good" series — staggered as a written-over-time topic cluster
  "is-sub-60-hyrox-good.mdx": "2025-12-03",
  "is-sub-70-hyrox-good.mdx": "2025-12-10",
  "is-sub-75-hyrox-good.mdx": "2025-12-17",
  "is-sub-80-hyrox-good.mdx": "2026-01-07",
  "is-sub-90-hyrox-good.mdx": "2026-01-14",

  // Cross-sport transition guides
  "crossfitter-doing-first-hyrox.mdx": "2026-01-21",
  "f45-to-hyrox-transition.mdx": "2026-01-28",
  "orangetheory-member-doing-hyrox.mdx": "2026-02-04",
  "marathon-runner-doing-hyrox.mdx": "2026-02-11",
  "triathlete-doing-hyrox.mdx": "2026-02-18",
  "rugby-player-hyrox-training.mdx": "2026-02-25",
  "powerlifter-hyrox-training.mdx": "2026-03-04",

  // Strategy by body type / age
  "hyrox-strategy-for-tall-athletes.mdx": "2026-03-11",
  "hyrox-strategy-for-short-athletes.mdx": "2026-03-18",
  "hyrox-for-heavy-athletes.mdx": "2026-03-25",
  "hyrox-for-small-framed-women.mdx": "2026-04-01",
  "hyrox-for-women-over-40.mdx": "2026-04-08",
  "hyrox-for-women-over-50.mdx": "2026-04-15",
  "hyrox-over-40-first-race.mdx": "2026-04-22",
  "hyrox-training-for-masters-athletes.mdx": "2026-04-26",

  // Heart rate / training cluster
  "average-heart-rate-during-hyrox.mdx": "2026-02-08",
  "hyrox-heart-rate-zones.mdx": "2026-02-15",
  "hyrox-training-heart-rate-zones.mdx": "2026-02-22",

  // Watch / device guides
  "garmin-hyrox-activity-profile.mdx": "2026-03-03",
  "apple-watch-hyrox-workout.mdx": "2026-03-10",
  "coros-hyrox-setup.mdx": "2026-03-17",
  "polar-hyrox-setup.mdx": "2026-03-24",

  // Race-week / pacing reference
  "energy-gel-strategy-hyrox.mdx": "2026-04-19",
  "hyrox-race-week-protocol.mdx": "2026-04-20",
  "hyrox-running-strategy.mdx": "2026-04-23",
  "hyrox-skierg-technique-pacing.mdx": "2026-04-25",
  // Series posts (keep their existing schedule):
  // hyrox-sled-push-technique.mdx: 2026-04-27 (today, series part 3)
  // hyrox-sled-pull-technique.mdx: 2026-04-29 (series part 4)
  // hyrox-burpee-broad-jumps-strategy.mdx: 2026-05-01 (series part 5)
  // hyrox-rowing-technique.mdx: 2026-05-03 (series part 6)
  // hyrox-farmers-carry-sandbag-lunges.mdx: 2026-05-05 (series part 7)
  // hyrox-wall-balls-technique.mdx: 2026-05-07 (series part 8)

  // Remaining unique pubDates we keep:
  // hyrox-vs-crossfit.mdx: 2026-03-15 — leave alone (already de-clustered)
  // best-hyrox-pacing-strategy.mdx: 2026-03-01 — leave alone
  // first-hyrox-race-guide.mdx: 2026-04-01 — leave alone
};

function transformFrontmatter(content, filename) {
  let out = content;
  const newDate = FILENAME_PUBDATE_OVERRIDES[filename];
  if (newDate) {
    out = out.replace(
      /^pubDate:\s*[\d\-:T.Z+]+/m,
      `pubDate: ${newDate}`
    );
  }
  // Clean em-dashes inside YAML string values (faqs answers, descriptions, etc.).
  // Same transforms as body text.
  out = out.replace(/\*\*([^*\n]+?)\*\* — /g, "**$1:** ");
  out = out.replace(/ — /g, ", ");
  out = out.replace(/ —([^\s])/g, ", $1");
  out = out.replace(/([^\s])— /g, "$1, ");
  return out;
}

let total = 0;
let touched = 0;

for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  const files = walk(root);
  for (const file of files) {
    total += 1;
    const original = fs.readFileSync(file, "utf8");

    // Split frontmatter and body
    const match = original.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
    let next;
    if (match) {
      const [, frontmatter, body] = match;
      const newFrontmatter = transformFrontmatter(
        frontmatter,
        path.basename(file)
      );
      const newBody = transformBody(body);
      next = newFrontmatter + newBody;
    } else {
      next = transformBody(original);
    }

    if (next !== original) {
      fs.writeFileSync(file, next, "utf8");
      touched += 1;
      console.log(`Touched: ${file}`);
    }
  }
}

console.log(`\nDone. Touched ${touched}/${total} files.`);
