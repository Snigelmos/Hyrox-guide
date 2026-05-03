#!/usr/bin/env node
/**
 * One-shot reassignment of blog post `author` frontmatter from the old
 * "HyroxVault Editorial Team" identity to one of John / Niklas / Jesper,
 * using the topic split documented in the act-on-chatgpt-review plan.
 *
 * Run once:
 *   node scripts/reassign-bylines.mjs
 *
 * Idempotent: re-running will leave already-correct values alone and
 * report a per-author count.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, "..", "src", "content", "blog");

/**
 * Map of post slug (filename without .mdx) → author first name.
 * Buckets follow plan: race-strategy/pacing/calculator → John,
 * training/strength/no-gym/population → Niklas,
 * supplements/nutrition/gear → Jesper.
 */
const BYLINE_MAP = {
  // --- John: race strategy, pacing, race day, calc, station strategy ---
  "best-hyrox-pacing-strategy": "John",
  "can-you-walk-during-hyrox": "John",
  "crossfitter-doing-first-hyrox": "John",
  "f45-to-hyrox-transition": "John",
  "first-hyrox-race-guide": "John",
  "how-heavy-is-the-hyrox-sled": "John",
  "how-long-does-a-hyrox-race-take": "John",
  "how-much-does-hyrox-cost": "John",
  "hyrox-burpee-broad-jumps-strategy": "John",
  "hyrox-cut-off-time": "John",
  "hyrox-doubles-strategy": "John",
  "hyrox-farmers-carry-sandbag-lunges": "John",
  "hyrox-hitting-the-wall": "John",
  "hyrox-pro-division-qualification": "John",
  "hyrox-race-day-morning": "John",
  "hyrox-race-logistics-guide": "John",
  "hyrox-race-week-protocol": "John",
  "hyrox-rowing-technique": "John",
  "hyrox-running-strategy": "John",
  "hyrox-second-race-pr-guide": "John",
  "hyrox-simulation-workouts": "John",
  "hyrox-skierg-technique-pacing": "John",
  "hyrox-sled-pull-technique": "John",
  "hyrox-sled-push-technique": "John",
  "hyrox-strategy-for-short-athletes": "John",
  "hyrox-strategy-for-tall-athletes": "John",
  "hyrox-sub-60-blueprint": "John",
  "hyrox-sub-75-blueprint": "John",
  "hyrox-sub-90-blueprint": "John",
  "hyrox-transitions-guide": "John",
  "hyrox-vs-crossfit": "John",
  "hyrox-wall-balls-technique": "John",
  "hyrox-warmup-protocol": "John",
  "is-sub-60-hyrox-good": "John",
  "is-sub-70-hyrox-good": "John",
  "is-sub-75-hyrox-good": "John",
  "is-sub-80-hyrox-good": "John",
  "is-sub-90-hyrox-good": "John",
  "marathon-runner-doing-hyrox": "John",
  "orangetheory-member-doing-hyrox": "John",
  "what-is-the-hyrox-roxzone": "John",

  // --- Niklas: training plans, strength, no-gym, population, programming ---
  "hyrox-12-week-no-equipment-training-plan": "Niklas",
  "hyrox-50-pound-equipment-upgrade": "Niklas",
  "hyrox-bad-knees-guide": "Niklas",
  "hyrox-beginners-complete-guide-2026": "Niklas",
  "hyrox-concurrent-training": "Niklas",
  "hyrox-cyclist-transition": "Niklas",
  "hyrox-deload-weeks": "Niklas",
  "hyrox-for-heavy-athletes": "Niklas",
  "hyrox-for-men-over-50": "Niklas",
  "hyrox-for-small-framed-women": "Niklas",
  "hyrox-for-women-over-40": "Niklas",
  "hyrox-for-women-over-50": "Niklas",
  "hyrox-heart-rate-zones": "Niklas",
  "hyrox-hotel-room-training": "Niklas",
  "hyrox-injury-guide": "Niklas",
  "hyrox-over-40-first-race": "Niklas",
  "hyrox-park-outdoor-training": "Niklas",
  "hyrox-peak-for-race": "Niklas",
  "hyrox-race-week-no-gym-taper": "Niklas",
  "hyrox-swimmer-transition": "Niklas",
  "hyrox-train-at-home": "Niklas",
  "hyrox-training-for-masters-athletes": "Niklas",
  "hyrox-training-heart-rate-zones": "Niklas",
  "hyrox-training-without-gym-realistic-expectations": "Niklas",
  "hyrox-vo2max-training": "Niklas",
  "hyrox-zone-2-training": "Niklas",
  "powerlifter-hyrox-training": "Niklas",
  "rugby-player-hyrox-training": "Niklas",
  "triathlete-doing-hyrox": "Niklas",

  // --- Jesper: supplements, nutrition, recovery, gear, watches, HRMs ---
  "apple-watch-hyrox-workout": "Jesper",
  "are-gloves-allowed-in-hyrox": "Jesper",
  "are-leggings-allowed-in-hyrox": "Jesper",
  "average-heart-rate-during-hyrox": "Jesper",
  "best-compression-sleeves-for-hyrox": "Jesper",
  "best-heart-rate-monitor-for-hyrox": "Jesper",
  "best-hyrox-race-bag": "Jesper",
  "best-hyrox-shoes-for-heavy-athletes": "Jesper",
  "best-hyrox-shoes-for-wide-feet": "Jesper",
  "can-you-change-shoes-during-hyrox": "Jesper",
  "can-you-wear-a-weight-belt-in-hyrox": "Jesper",
  "carbon-plate-shoes-for-hyrox": "Jesper",
  "coros-hyrox-setup": "Jesper",
  "energy-gel-strategy-hyrox": "Jesper",
  "garmin-hyrox-activity-profile": "Jesper",
  "hyrox-carb-loading-guide": "Jesper",
  "hyrox-daily-nutrition-hybrid-athletes": "Jesper",
  "hyrox-hydration-strategy": "Jesper",
  "hyrox-post-race-recovery-nutrition": "Jesper",
  "hyrox-race-day-bag": "Jesper",
  "hyrox-race-day-breakfast": "Jesper",
  "hyrox-shoe-rules": "Jesper",
  "is-chalk-allowed-in-hyrox": "Jesper",
  "is-hand-taping-allowed-in-hyrox": "Jesper",
  "legal-grip-aids-in-hyrox": "Jesper",
  "polar-hyrox-setup": "Jesper",
};

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

const counts = { John: 0, Niklas: 0, Jesper: 0, unchanged: 0, missing: [] };

for (const file of files) {
  const slug = file.replace(/\.mdx$/, "");
  const newAuthor = BYLINE_MAP[slug];
  if (!newAuthor) {
    counts.missing.push(slug);
    continue;
  }
  const path = join(BLOG_DIR, file);
  const original = readFileSync(path, "utf8");
  const updated = original.replace(
    /^author:\s*"[^"]*"\s*$/m,
    `author: "${newAuthor}"`,
  );
  if (updated === original) {
    counts.unchanged += 1;
  } else {
    writeFileSync(path, updated);
    counts[newAuthor] += 1;
  }
}

console.log(
  `Updated: John=${counts.John}, Niklas=${counts.Niklas}, Jesper=${counts.Jesper}, unchanged=${counts.unchanged}`,
);
if (counts.missing.length > 0) {
  console.log(
    `Missing from BYLINE_MAP (${counts.missing.length}): ${counts.missing.join(", ")}`,
  );
  process.exit(1);
}
