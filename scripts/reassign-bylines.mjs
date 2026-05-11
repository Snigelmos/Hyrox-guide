#!/usr/bin/env node
/**
 * Re-byline every blog post under `src/content/blog/*.mdx` to the single
 * `HyroxVault Editorial Team` profile.
 *
 * HyroxVault publishes anonymously: we deliberately do not bucket posts
 * under per-author personas, even internally. This script exists so the
 * byline state can be normalised in one pass if any post drifts back to a
 * legacy name (e.g. via a partial revert or a copy-pasted frontmatter from
 * an older snapshot).
 *
 * Run:
 *   node scripts/reassign-bylines.mjs
 *
 * Idempotent: re-running on an already-normalised tree leaves files alone.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = join(__dirname, "..", "src", "content", "blog");

const TEAM = "HyroxVault Editorial Team";

const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

const counts = { updated: 0, unchanged: 0 };

for (const file of files) {
  const path = join(BLOG_DIR, file);
  const original = readFileSync(path, "utf8");
  const updated = original.replace(
    /^author:\s*"[^"]*"\s*$/m,
    `author: "${TEAM}"`,
  );
  if (updated === original) {
    counts.unchanged += 1;
  } else {
    writeFileSync(path, updated);
    counts.updated += 1;
  }
}

console.log(
  `Bylines normalised to "${TEAM}": updated=${counts.updated}, unchanged=${counts.unchanged}`,
);
