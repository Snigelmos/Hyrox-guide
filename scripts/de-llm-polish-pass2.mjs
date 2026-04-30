#!/usr/bin/env node
/**
 * Pass 2 of the de-LLM polish: opener and closer variation.
 *
 * Transforms:
 *   1. Remove `## Short answer` heading lines (drops the H2, lead paragraph
 *      remains as the direct opener -- Pattern A from the plan).
 *      Custom files get bespoke openers (Patterns B/C/D).
 *   2. Drop the entire `## Related guides` / `## Cross-references` /
 *      `## Related rules` / `## Related` block on ~half of posts. The block
 *      runs from the heading to end of file (allowing a trailing `---`).
 *   3. Rename / vary the closer heading on the half we keep.
 *
 * Run: node scripts/de-llm-polish-pass2.mjs
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

// Files that get a bespoke opener pattern instead of the default
// "drop the ## Short answer heading" treatment.
const BESPOKE_OPENERS = {
  // Pattern B: question lead
  "is-sub-60-hyrox-good.mdx": "## So, is sub-60 actually realistic?\n",
  "is-sub-70-hyrox-good.mdx": "## What does it really take to break 70?\n",
  "is-sub-90-hyrox-good.mdx": "## How realistic is sub-90 for a first-timer?\n",
  // Pattern C: "the problem" framing
  "f45-to-hyrox-transition.mdx":
    "## The gap most F45-to-Hyrox athletes underestimate\n",
  "crossfitter-doing-first-hyrox.mdx":
    "## Where CrossFit fitness translates, and where it doesn't\n",
  // Pattern D: scenario / story lead
  "hyrox-strategy-for-short-athletes.mdx":
    "## The shorter athlete on the start line\n",
  // (rest get Pattern A: heading removed entirely)
};

// Files where we DROP the entire closer block (Related/Cross-references).
const DROP_CLOSER = new Set([
  "are-gloves-allowed-in-hyrox.mdx",
  "are-leggings-allowed-in-hyrox.mdx",
  "is-chalk-allowed-in-hyrox.mdx",
  "is-hand-taping-allowed-in-hyrox.mdx",
  "can-you-change-shoes-during-hyrox.mdx",
  "can-you-wear-a-weight-belt-in-hyrox.mdx",
  "legal-grip-aids-in-hyrox.mdx",
  "hyrox-shoe-rules.mdx",
  "polar-hyrox-setup.mdx",
  "coros-hyrox-setup.mdx",
  "garmin-hyrox-activity-profile.mdx",
  "apple-watch-hyrox-workout.mdx",
  "hyrox-heart-rate-zones.mdx",
  "hyrox-training-heart-rate-zones.mdx",
  "average-heart-rate-during-hyrox.mdx",
  "is-sub-70-hyrox-good.mdx",
  "is-sub-75-hyrox-good.mdx",
  "is-sub-80-hyrox-good.mdx",
  "hyrox-strategy-for-tall-athletes.mdx",
  "hyrox-strategy-for-short-athletes.mdx",
]);

// Files where we KEEP the closer block but rename the heading.
const RENAME_CLOSER = {
  "crossfitter-doing-first-hyrox.mdx": "## Keep reading",
  "f45-to-hyrox-transition.mdx": "## More on transitioning to Hyrox",
  "marathon-runner-doing-hyrox.mdx": "## More for runners",
  "triathlete-doing-hyrox.mdx": "## More for triathletes",
  "powerlifter-hyrox-training.mdx": "## More on strength-to-Hyrox",
  "rugby-player-hyrox-training.mdx": "## More for team-sport athletes",
  "orangetheory-member-doing-hyrox.mdx": "## Other class-fitness transitions",
  "hyrox-for-women-over-40.mdx": "## More for women over 40",
  "hyrox-for-women-over-50.mdx": "## More for women over 50",
  "hyrox-for-small-framed-women.mdx": "## More on body-type strategy",
  "hyrox-for-heavy-athletes.mdx": "## More on body-type strategy",
  "hyrox-over-40-first-race.mdx": "## More for masters athletes",
  "hyrox-training-for-masters-athletes.mdx": "## More for masters athletes",
  "is-sub-60-hyrox-good.mdx": "## Compare with other goal times",
  "is-sub-90-hyrox-good.mdx": "## Compare with other goal times",
};

function detectEol(content) {
  return content.includes("\r\n") ? "\r\n" : "\n";
}

function transformOpener(body, filename, eol) {
  const bespoke = BESPOKE_OPENERS[filename];
  if (bespoke !== undefined) {
    const replacement = bespoke.replace(/\n/g, eol);
    return body.replace(
      new RegExp(`^## Short answer${eol === "\r\n" ? "\\r\\n" : "\\n"}`, "m"),
      replacement
    );
  }
  // Pattern A: drop the heading entirely so the lead paragraph stands alone.
  // Also drop the blank line that follows so we don't leave 2 blanks.
  const eolEsc = eol === "\r\n" ? "\\r\\n" : "\\n";
  return body.replace(
    new RegExp(`^## Short answer${eolEsc}${eolEsc}`, "m"),
    ""
  );
}

function transformCloser(body, filename, eol) {
  const eolEsc = eol === "\r\n" ? "\\r\\n" : "\\n";
  if (DROP_CLOSER.has(filename)) {
    return body.replace(
      new RegExp(
        `${eolEsc}${eolEsc}## (?:Related guides|Cross-references|Related rules|Related)\\b[\\s\\S]*$`
      ),
      eol
    );
  }
  const newHeading = RENAME_CLOSER[filename];
  if (newHeading) {
    return body.replace(
      new RegExp(
        `${eolEsc}${eolEsc}## (?:Related guides|Cross-references|Related rules|Related)\\b[^${eolEsc}]*`
      ),
      eol + eol + newHeading
    );
  }
  return body;
}

let total = 0;
let touched = 0;

for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  const files = walk(root);
  for (const file of files) {
    total += 1;
    const original = fs.readFileSync(file, "utf8");
    const filename = path.basename(file);

    const eol = detectEol(original);
    const match = original.match(/^(---\r?\n[\s\S]*?\r?\n---\r?\n)([\s\S]*)$/);
    let next;
    if (match) {
      const [, frontmatter, body] = match;
      let newBody = transformOpener(body, filename, eol);
      newBody = transformCloser(newBody, filename, eol);
      next = frontmatter + newBody;
    } else {
      let newBody = transformOpener(original, filename, eol);
      newBody = transformCloser(newBody, filename, eol);
      next = newBody;
    }

    if (next !== original) {
      fs.writeFileSync(file, next, "utf8");
      touched += 1;
      console.log(`Touched: ${file}`);
    }
  }
}

console.log(`\nDone. Touched ${touched}/${total} files.`);
