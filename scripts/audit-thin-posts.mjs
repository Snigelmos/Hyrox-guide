#!/usr/bin/env node
/**
 * Word-count audit for thin content.
 * Walks src/content/{blog,training,gear,supplements,racing-guide} for .mdx files,
 * strips frontmatter / fenced code / JSX-ish blocks / markdown punctuation, and
 * prints any file whose remaining word count falls below the threshold.
 *
 * Usage: node scripts/audit-thin-posts.mjs [threshold]
 *   threshold defaults to 400
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ROOTS = [
  "src/content/blog",
  "src/content/training",
  "src/content/gear",
  "src/content/supplements",
  "src/content/racing-guide",
];

const threshold = Number(process.argv[2]) || 400;

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, acc);
    else if (entry.endsWith(".mdx")) acc.push(full);
  }
  return acc;
}

function stripFrontmatter(content) {
  if (!content.startsWith("---")) return content;
  const end = content.indexOf("\n---", 3);
  if (end === -1) return content;
  return content.slice(end + 4);
}

function countBodyWords(content) {
  let body = stripFrontmatter(content);

  body = body.replace(/```[\s\S]*?```/g, " ");
  body = body.replace(/`[^`]*`/g, " ");
  body = body.replace(/^import\s.+from\s.+;?\s*$/gm, " ");
  body = body.replace(/<figure[\s\S]*?<\/figure>/gi, " ");
  body = body.replace(/<[^>]+\/>/g, " ");
  body = body.replace(/<\/?[a-zA-Z][^>]*>/g, " ");
  body = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, " ");
  body = body.replace(/!\[[^\]]*\]\([^\)]*\)/g, " ");
  body = body.replace(/\[([^\]]+)\]\([^\)]*\)/g, "$1");
  body = body.replace(/[#>*_~`\-=+|]/g, " ");
  body = body.replace(/\s+/g, " ").trim();

  if (!body) return 0;
  return body.split(" ").filter(Boolean).length;
}

const files = ROOTS.flatMap((root) => {
  const abs = join(ROOT, root);
  try {
    return walk(abs);
  } catch {
    return [];
  }
});

const thin = [];
const all = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  const words = countBodyWords(content);
  all.push({ file: relative(ROOT, file).replace(/\\/g, "/"), words });
  if (words < threshold) thin.push({ file: relative(ROOT, file).replace(/\\/g, "/"), words });
}

all.sort((a, b) => a.words - b.words);

console.log(`Audited ${files.length} MDX files. Threshold: ${threshold} words.\n`);
console.log("Bottom 15 by word count:");
for (const row of all.slice(0, 15)) {
  console.log(`  ${row.words.toString().padStart(5)}  ${row.file}`);
}
console.log("");

if (thin.length === 0) {
  console.log(`No posts under ${threshold} words.`);
} else {
  console.log(`${thin.length} post(s) under ${threshold} words:`);
  for (const row of thin.sort((a, b) => a.words - b.words)) {
    console.log(`  ${row.words.toString().padStart(5)}  ${row.file}`);
  }
}
