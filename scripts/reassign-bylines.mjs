#!/usr/bin/env node
/**
 * Re-bucket every blog post `author` frontmatter to one of John, Niklas
 * or Jesper based on the topic split documented in src/data/authors.ts.
 *
 * Run once after editing the BYLINE_MAP:
 *   node scripts/reassign-bylines.mjs
 *
 * Idempotent: re-running with the same map leaves files alone.
 *
 * Beat split:
 *   John   — strength, station efficiency, gym-based programming.
 *            CrossFit / F45 / rugby / powerlifter transitions.
 *            Grip aids, weight belts, heavy-athlete shoes.
 *   Niklas — running. Pacing, Zone 2, VO2max, heart-rate zones,
 *            watches and HRMs. Marathon / triathlete / cyclist /
 *            swimmer transitions. Carbon-plate shoes.
 *   Jesper — all-rounder + nutrition + racing. Supplements, gels,
 *            hydration, carb loading, recovery. Race format,
 *            sub-X blueprints, race-week protocol, race-day bag,
 *            population-specific guides, gear buying guides
 *            (non-strength, non-running).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, "..", "src", "content", "blog");

const BYLINE_MAP = {
  // --- John: strength, stations, CrossFit/gym DNA ---
  "are-gloves-allowed-in-hyrox": "John",
  "best-hyrox-shoes-for-heavy-athletes": "John",
  "can-you-wear-a-weight-belt-in-hyrox": "John",
  "crossfitter-doing-first-hyrox": "John",
  "f45-to-hyrox-transition": "John",
  "how-heavy-is-the-hyrox-sled": "John",
  "hyrox-12-week-no-equipment-training-plan": "John",
  "hyrox-50-pound-equipment-upgrade": "John",
  "hyrox-burpee-broad-jumps-strategy": "John",
  "hyrox-concurrent-training": "John",
  "hyrox-deload-weeks": "John",
  "hyrox-farmers-carry-sandbag-lunges": "John",
  "hyrox-hotel-room-training": "John",
  "hyrox-park-outdoor-training": "John",
  "hyrox-rowing-technique": "John",
  "hyrox-skierg-technique-pacing": "John",
  "hyrox-sled-pull-technique": "John",
  "hyrox-sled-push-technique": "John",
  "hyrox-train-at-home": "John",
  "hyrox-training-without-gym-realistic-expectations": "John",
  "hyrox-vs-crossfit": "John",
  "hyrox-wall-balls-technique": "John",
  "is-chalk-allowed-in-hyrox": "John",
  "is-hand-taping-allowed-in-hyrox": "John",
  "legal-grip-aids-in-hyrox": "John",
  "powerlifter-hyrox-training": "John",
  "rugby-player-hyrox-training": "John",

  // --- Niklas: running, pacing, watches, run-sport transitions ---
  "average-heart-rate-during-hyrox": "Niklas",
  "best-heart-rate-monitor-for-hyrox": "Niklas",
  "carbon-plate-shoes-for-hyrox": "Niklas",
  "coros-hyrox-setup": "Niklas",
  "garmin-hyrox-activity-profile": "Niklas",
  "hyrox-cyclist-transition": "Niklas",
  "hyrox-heart-rate-zones": "Niklas",
  "hyrox-running-strategy": "Niklas",
  "hyrox-swimmer-transition": "Niklas",
  "hyrox-training-heart-rate-zones": "Niklas",
  "hyrox-vo2max-training": "Niklas",
  "hyrox-zone-2-training": "Niklas",
  "marathon-runner-doing-hyrox": "Niklas",
  "orangetheory-member-doing-hyrox": "Niklas",
  "polar-hyrox-setup": "Niklas",
  "triathlete-doing-hyrox": "Niklas",

  // --- Jesper: nutrition, racing, all-rounder, buying guides ---
  "apple-watch-hyrox-workout": "Jesper",
  "are-leggings-allowed-in-hyrox": "Jesper",
  "best-compression-sleeves-for-hyrox": "Jesper",
  "best-hyrox-pacing-strategy": "Jesper",
  "best-hyrox-race-bag": "Jesper",
  "best-hyrox-shoes-for-wide-feet": "Jesper",
  "can-you-change-shoes-during-hyrox": "Jesper",
  "can-you-walk-during-hyrox": "Jesper",
  "energy-gel-strategy-hyrox": "Jesper",
  "first-hyrox-race-guide": "Jesper",
  "how-long-does-a-hyrox-race-take": "Jesper",
  "how-much-does-hyrox-cost": "Jesper",
  "hyrox-bad-knees-guide": "Jesper",
  "hyrox-beginners-complete-guide-2026": "Jesper",
  "hyrox-carb-loading-guide": "Jesper",
  "hyrox-cut-off-time": "Jesper",
  "hyrox-daily-nutrition-hybrid-athletes": "Jesper",
  "hyrox-doubles-strategy": "Jesper",
  "hyrox-for-heavy-athletes": "Jesper",
  "hyrox-for-men-over-50": "Jesper",
  "hyrox-for-small-framed-women": "Jesper",
  "hyrox-for-women-over-40": "Jesper",
  "hyrox-for-women-over-50": "Jesper",
  "hyrox-hitting-the-wall": "Jesper",
  "hyrox-hydration-strategy": "Jesper",
  "hyrox-injury-guide": "Jesper",
  "hyrox-over-40-first-race": "Jesper",
  "hyrox-peak-for-race": "Jesper",
  "hyrox-post-race-recovery-nutrition": "Jesper",
  "hyrox-pro-division-qualification": "Jesper",
  "hyrox-race-day-bag": "Jesper",
  "hyrox-race-day-breakfast": "Jesper",
  "hyrox-race-day-morning": "Jesper",
  "hyrox-race-logistics-guide": "Jesper",
  "hyrox-race-week-no-gym-taper": "Jesper",
  "hyrox-race-week-protocol": "Jesper",
  "hyrox-second-race-pr-guide": "Jesper",
  "hyrox-shoe-rules": "Jesper",
  "hyrox-simulation-workouts": "Jesper",
  "hyrox-strategy-for-short-athletes": "Jesper",
  "hyrox-strategy-for-tall-athletes": "Jesper",
  "hyrox-sub-60-blueprint": "Jesper",
  "hyrox-sub-75-blueprint": "Jesper",
  "hyrox-sub-90-blueprint": "Jesper",
  "hyrox-training-for-masters-athletes": "Jesper",
  "hyrox-transitions-guide": "Jesper",
  "hyrox-warmup-protocol": "Jesper",
  "is-sub-60-hyrox-good": "Jesper",
  "is-sub-70-hyrox-good": "Jesper",
  "is-sub-75-hyrox-good": "Jesper",
  "is-sub-80-hyrox-good": "Jesper",
  "is-sub-90-hyrox-good": "Jesper",
  "what-is-the-hyrox-roxzone": "Jesper",
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
