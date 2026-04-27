#!/usr/bin/env node
/**
 * scripts/new-post.mjs
 *
 * Scaffolds a new blog post with valid frontmatter.
 *
 * Usage:
 *   npm run new-post -- <slug> <category>
 *   npm run new-post -- hyrox-sled-mistakes station-guides
 *
 * Category must be one of:
 *   training, nutrition, race-strategy, station-guides, gear,
 *   beginner, race-recaps, news
 *
 * After scaffolding, open the file and run the AI prompt in
 * scripts/new-post.md to generate the full article.
 */

import { writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const VALID_CATEGORIES = new Set([
  "training",
  "nutrition",
  "race-strategy",
  "station-guides",
  "gear",
  "beginner",
  "race-recaps",
  "news",
]);

async function main() {
  const [slug, category] = process.argv.slice(2);

  if (!slug || !category) {
    console.error(
      "Usage: npm run new-post -- <slug> <category>\n" +
        "Categories: " +
        [...VALID_CATEGORIES].join(", ")
    );
    process.exit(1);
  }

  if (!VALID_CATEGORIES.has(category)) {
    console.error(`Invalid category "${category}". Must be one of: ${[...VALID_CATEGORIES].join(", ")}`);
    process.exit(1);
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error(`Invalid slug "${slug}". Use lowercase letters, digits and hyphens only.`);
    process.exit(1);
  }

  const target = path.resolve("src/content/blog", `${slug}.mdx`);

  try {
    await access(target, constants.F_OK);
    console.error(`File already exists: ${target}`);
    process.exit(1);
  } catch {}

  const today = new Date().toISOString().slice(0, 10);
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const contents = `---
title: "${title}"
description: "TODO — write a 140-160 char meta description that includes the target keyword and a reason to click."
pubDate: ${today}
author: "HyroxVault Editorial Team"
category: "${category}"
tags: []
faqs:
  - question: "TODO first FAQ question"
    answer: "TODO answer."
---

## TODO first H2 answering the main query

TODO first paragraph (<= 60 words) that directly answers the target query.

## TODO second H2

Continue writing. Include 4+ internal links from the approved list in \`scripts/new-post.md\`.

> Delete this block once you've replaced the body with the full article.
`;

  await writeFile(target, contents, "utf8");
  console.log(`Created ${target}`);
  console.log(
    `\nNext: open scripts/new-post.md, paste the prompt into Cursor chat with slug="${slug}", and replace the scaffold body with the generated article.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
