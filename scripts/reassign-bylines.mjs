#!/usr/bin/env node
/**
 * Re-bucket every blog post `author` frontmatter to one of the three
 * editorial team full names based on the topic split documented in
 * src/data/authors.ts.
 *
 * Run once after editing the BYLINE_MAP:
 *   node scripts/reassign-bylines.mjs
 *
 * Idempotent: re-running with the same map leaves files alone.
 *
 * Beat split:
 *   Adam Smith     — strength, station efficiency, gym-based
 *                    programming. CrossFit / F45 / rugby / powerlifter
 *                    transitions. Grip aids, weight belts,
 *                    heavy-athlete shoes.
 *   James Andersen — running. Pacing, Zone 2, VO2max, heart-rate
 *                    zones, watches and HRMs. Marathon / triathlete /
 *                    cyclist / swimmer transitions. Carbon-plate shoes.
 *   Max Jespersen  — all-rounder + nutrition + racing. Supplements,
 *                    gels, hydration, carb loading, recovery. Race
 *                    format, sub-X blueprints, race-week protocol,
 *                    race-day bag, population-specific guides, gear
 *                    buying guides (non-strength, non-running).
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, "..", "src", "content", "blog");

const ADAM = "Adam Smith";
const JAMES = "James Andersen";
const MAX = "Max Jespersen";

const BYLINE_MAP = {
  // --- Adam Smith: strength, stations, CrossFit/gym DNA ---
  "are-gloves-allowed-in-hyrox": ADAM,
  "best-hyrox-shoes-for-heavy-athletes": ADAM,
  "can-you-wear-a-weight-belt-in-hyrox": ADAM,
  "crossfitter-doing-first-hyrox": ADAM,
  "f45-to-hyrox-transition": ADAM,
  "how-heavy-is-the-hyrox-sled": ADAM,
  "hyrox-12-week-no-equipment-training-plan": ADAM,
  "hyrox-50-pound-equipment-upgrade": ADAM,
  "hyrox-burpee-broad-jumps-strategy": ADAM,
  "hyrox-concurrent-training": ADAM,
  "hyrox-deload-weeks": ADAM,
  "hyrox-farmers-carry-sandbag-lunges": ADAM,
  "hyrox-hotel-room-training": ADAM,
  "hyrox-park-outdoor-training": ADAM,
  "hyrox-rowing-technique": ADAM,
  "hyrox-skierg-technique-pacing": ADAM,
  "hyrox-sled-pull-technique": ADAM,
  "hyrox-sled-push-technique": ADAM,
  "hyrox-train-at-home": ADAM,
  "hyrox-training-without-gym-realistic-expectations": ADAM,
  "hyrox-vs-crossfit": ADAM,
  "hyrox-wall-balls-technique": ADAM,
  "is-chalk-allowed-in-hyrox": ADAM,
  "is-hand-taping-allowed-in-hyrox": ADAM,
  "legal-grip-aids-in-hyrox": ADAM,
  "powerlifter-hyrox-training": ADAM,
  "rugby-player-hyrox-training": ADAM,

  // --- James Andersen: running, pacing, watches, run-sport transitions ---
  "average-heart-rate-during-hyrox": JAMES,
  "best-heart-rate-monitor-for-hyrox": JAMES,
  "carbon-plate-shoes-for-hyrox": JAMES,
  "coros-hyrox-setup": JAMES,
  "garmin-hyrox-activity-profile": JAMES,
  "hyrox-cyclist-transition": JAMES,
  "hyrox-heart-rate-zones": JAMES,
  "hyrox-running-strategy": JAMES,
  "hyrox-swimmer-transition": JAMES,
  "hyrox-training-heart-rate-zones": JAMES,
  "hyrox-vo2max-training": JAMES,
  "hyrox-zone-2-training": JAMES,
  "marathon-runner-doing-hyrox": JAMES,
  "orangetheory-member-doing-hyrox": JAMES,
  "polar-hyrox-setup": JAMES,
  "triathlete-doing-hyrox": JAMES,

  // --- Max Jespersen: nutrition, racing, all-rounder, buying guides ---
  "apple-watch-hyrox-workout": MAX,
  "are-leggings-allowed-in-hyrox": MAX,
  "best-compression-sleeves-for-hyrox": MAX,
  "best-hyrox-pacing-strategy": MAX,
  "best-hyrox-race-bag": MAX,
  "best-hyrox-shoes-for-wide-feet": MAX,
  "can-you-change-shoes-during-hyrox": MAX,
  "can-you-walk-during-hyrox": MAX,
  "energy-gel-strategy-hyrox": MAX,
  "first-hyrox-race-guide": MAX,
  "how-long-does-a-hyrox-race-take": MAX,
  "how-much-does-hyrox-cost": MAX,
  "hyrox-bad-knees-guide": MAX,
  "hyrox-beginners-complete-guide-2026": MAX,
  "hyrox-carb-loading-guide": MAX,
  "hyrox-cut-off-time": MAX,
  "hyrox-daily-nutrition-hybrid-athletes": MAX,
  "hyrox-doubles-strategy": MAX,
  "hyrox-for-heavy-athletes": MAX,
  "hyrox-for-men-over-50": MAX,
  "hyrox-for-small-framed-women": MAX,
  "hyrox-for-women-over-40": MAX,
  "hyrox-for-women-over-50": MAX,
  "hyrox-hitting-the-wall": MAX,
  "hyrox-hydration-strategy": MAX,
  "hyrox-injury-guide": MAX,
  "hyrox-over-40-first-race": MAX,
  "hyrox-peak-for-race": MAX,
  "hyrox-post-race-recovery-nutrition": MAX,
  "hyrox-pro-division-qualification": MAX,
  "hyrox-race-day-bag": MAX,
  "hyrox-race-day-breakfast": MAX,
  "hyrox-race-day-morning": MAX,
  "hyrox-race-logistics-guide": MAX,
  "hyrox-race-week-no-gym-taper": MAX,
  "hyrox-race-week-protocol": MAX,
  "hyrox-second-race-pr-guide": MAX,
  "hyrox-shoe-rules": MAX,
  "hyrox-simulation-workouts": MAX,
  "hyrox-strategy-for-short-athletes": MAX,
  "hyrox-strategy-for-tall-athletes": MAX,
  "hyrox-sub-60-blueprint": MAX,
  "hyrox-sub-75-blueprint": MAX,
  "hyrox-sub-90-blueprint": MAX,
  "hyrox-training-for-masters-athletes": MAX,
  "hyrox-transitions-guide": MAX,
  "hyrox-warmup-protocol": MAX,
  "is-sub-60-hyrox-good": MAX,
  "is-sub-70-hyrox-good": MAX,
  "is-sub-75-hyrox-good": MAX,
  "is-sub-80-hyrox-good": MAX,
  "is-sub-90-hyrox-good": MAX,
  "what-is-the-hyrox-roxzone": MAX,
};

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

const counts = { [ADAM]: 0, [JAMES]: 0, [MAX]: 0, unchanged: 0, missing: [] };

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
  `Updated: ${ADAM}=${counts[ADAM]}, ${JAMES}=${counts[JAMES]}, ${MAX}=${counts[MAX]}, unchanged=${counts.unchanged}`,
);
if (counts.missing.length > 0) {
  console.log(
    `Missing from BYLINE_MAP (${counts.missing.length}): ${counts.missing.join(", ")}`,
  );
  process.exit(1);
}
