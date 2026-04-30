#!/usr/bin/env node
/**
 * scripts/new-post.mjs
 *
 * Scaffolds a new blog post with valid frontmatter and a de-LLM-friendly body
 * shape (varied opener, no default faqs block, no "Last reviewed" footer).
 *
 * Usage:
 *   npm run new-post -- <slug> <category> [flags]
 *
 * Examples:
 *   npm run new-post -- hyrox-sled-mistakes station-guides
 *   npm run new-post -- best-hyrox-pacing-strategy race-strategy --cornerstone
 *   npm run new-post -- hyrox-vs-crossfit beginner --with-faqs
 *   npm run new-post -- my-first-race race-recaps --opener=scenario
 *
 * Flags:
 *   --cornerstone       Use the cornerstone scaffold (prose Common questions,
 *                       citation / asset / quote placeholders). Implies no faqs
 *                       array.
 *   --with-faqs         Include a single faqs placeholder in frontmatter
 *                       (non-cornerstone posts only). Off by default.
 *   --opener=<style>    Force opener style: direct | problem | question | scenario.
 *                       Default: deterministic hash of slug across the four.
 *
 * Category must be one of:
 *   training, nutrition, race-strategy, station-guides, gear,
 *   beginner, race-recaps, news
 *
 * After scaffolding, open the file and run the AI prompt in
 * scripts/new-post.md to generate the full article. See
 * .cursor/rules/content-style.mdc for the de-LLM editorial style rules.
 */

import { writeFile, access, readdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

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

const CONTENT_DIRS = [
  "src/content/blog",
  "src/content/training",
  "src/content/gear",
  "src/content/supplements",
  "src/content/racing-guide",
];

const OPENER_STYLES = ["direct", "problem", "question", "scenario"];

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq === -1) {
        flags[arg.slice(2)] = true;
      } else {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      }
    } else {
      positional.push(arg);
    }
  }
  return { flags, positional };
}

async function* walkMdx(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkMdx(full);
    } else if (e.isFile() && e.name.endsWith(".mdx")) {
      yield full;
    }
  }
}

async function gatherExistingPubDates() {
  const dates = new Set();
  for (const dir of CONTENT_DIRS) {
    for await (const file of walkMdx(dir)) {
      let content;
      try {
        content = await readFile(file, "utf8");
      } catch {
        continue;
      }
      const match = content.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
      if (match) dates.add(match[1]);
    }
  }
  return dates;
}

function nextNonCollidingDate(taken) {
  const start = new Date();
  for (let i = 0; i < 90; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    if (!taken.has(iso)) return iso;
  }
  return start.toISOString().slice(0, 10);
}

function openerForSlug(slug, override) {
  if (override && OPENER_STYLES.includes(override)) return override;
  const byte = createHash("md5").update(slug).digest()[0];
  return OPENER_STYLES[byte % OPENER_STYLES.length];
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildOpener(style, title) {
  switch (style) {
    case "direct":
      return [
        `TODO direct lead paragraph that answers the query in <=60 words. No H2 above this paragraph.`,
        ``,
        `TODO 1-2 sentences expanding on why it's more nuanced than the lead suggests.`,
      ].join("\n");
    case "problem":
      return [
        `## The problem`,
        ``,
        `TODO 1-2 sentences naming the specific situation the reader is in.`,
        ``,
        `TODO 1-2 sentences on why it's worth solving and what's coming below.`,
      ].join("\n");
    case "question": {
      const heading = title.trim().endsWith("?") ? title.trim() : "Will this work for me?";
      return [
        `## ${heading}`,
        ``,
        `TODO 2-3 sentence answer with at least one concrete number (time, weight, HR, cadence).`,
      ].join("\n");
    }
    case "scenario":
      return [
        `TODO open with a concrete moment from training or a recent race (1-2 sentences). Date, venue, surface, monitor reading - the kind of specific that proves you were there.`,
        ``,
        `TODO 1-2 sentences pivoting from the moment to the answer.`,
      ].join("\n");
    default:
      return `TODO opener.`;
  }
}

function buildCornerstoneBody(slug, openerBlock) {
  return [
    openerBlock,
    ``,
    `## TODO cornerstone H2`,
    ``,
    `TODO 2-3 paragraphs of analysis. Use first-person plural ("we", "our") when`,
    `speaking from editorial-team experience. Cite at least one outbound source`,
    `for any precise number.`,
    ``,
    `<figure>`,
    `  <img src="/images/blog/${slug}/TODO-asset-1.jpg" alt="TODO descriptive alt text" />`,
    `  <figcaption>TODO caption for the original photo / video / data screenshot. Mention venue, date, or device.</figcaption>`,
    `</figure>`,
    ``,
    `## TODO second cornerstone H2`,
    ``,
    `TODO continue. Soft target: 1 outbound authoritative citation per 800 words.`,
    `Use real sources: <a href="https://www.concept2.com/" rel="external">Concept2</a>,`,
    `<a href="https://jissn.biomedcentral.com/" rel="external">ISSN</a>,`,
    `<a href="https://hyrox.com/" rel="external">official Hyrox rules</a>, or`,
    `peer-reviewed papers. Do not invent sources.`,
    ``,
    `> {/* TODO: replace with real quote and credential. Coach or athlete name, certification, link. */}`,
    `> "TODO 2-3 sentence quote that adds something the prose doesn't already say."`,
    `> — <Name>, <credential>`,
    ``,
    `## TODO third cornerstone H2`,
    ``,
    `TODO continue prose. Vary paragraph length. Avoid stacks of 3 or more`,
    `bulleted lists in a row, especially with the "**Term:** explanation" pattern.`,
    ``,
    `## Common questions`,
    ``,
    `**TODO question 1?**`,
    ``,
    `TODO 2-3 sentence prose answer. Be specific. Cite a source if you're using a`,
    `precise number.`,
    ``,
    `**TODO question 2?**`,
    ``,
    `TODO 2-3 sentence prose answer.`,
    ``,
    `**TODO question 3?**`,
    ``,
    `TODO 2-3 sentence prose answer.`,
    ``,
  ].join("\n");
}

function buildStandardBody(openerBlock) {
  return [
    openerBlock,
    ``,
    `## TODO H2`,
    ``,
    `TODO continue. Include 4+ internal links from the approved list in`,
    `\`scripts/new-post.md\`. Hedge any unsourced precise number with "typically"`,
    `or "for many athletes around"; cite the rest.`,
    ``,
    `## TODO H2`,
    ``,
    `TODO continue.`,
    ``,
  ].join("\n");
}

function buildFrontmatter({ title, pubDate, category, cornerstone, withFaqs }) {
  const lines = [
    `---`,
    `title: "${title}"`,
    `description: "TODO write a 140-160 char meta description that includes the target keyword and a reason to click."`,
    `pubDate: ${pubDate}`,
    `author: "HyroxVault Editorial Team"`,
    `category: "${category}"`,
    `tags: []`,
  ];
  if (!cornerstone && withFaqs) {
    lines.push(
      `faqs:`,
      `  - question: "TODO first FAQ question"`,
      `    answer: "TODO answer."`,
    );
  }
  lines.push(`---`, ``);
  return lines.join("\n");
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const [slug, category] = positional;

  if (!slug || !category) {
    console.error(
      "Usage: npm run new-post -- <slug> <category> [--cornerstone] [--with-faqs] [--opener=<style>]\n" +
        "Categories: " +
        [...VALID_CATEGORIES].join(", "),
    );
    process.exit(1);
  }

  if (!VALID_CATEGORIES.has(category)) {
    console.error(
      `Invalid category "${category}". Must be one of: ${[...VALID_CATEGORIES].join(", ")}`,
    );
    process.exit(1);
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    console.error(`Invalid slug "${slug}". Use lowercase letters, digits and hyphens only.`);
    process.exit(1);
  }

  const cornerstone = Boolean(flags.cornerstone);
  const withFaqs = Boolean(flags["with-faqs"]);
  const openerOverride = typeof flags.opener === "string" ? flags.opener : undefined;

  if (cornerstone && withFaqs) {
    console.error(
      "Cornerstone posts must use the prose 'Common questions' section, not a faqs: array. " +
        "Drop --with-faqs.",
    );
    process.exit(1);
  }

  if (openerOverride && !OPENER_STYLES.includes(openerOverride)) {
    console.error(
      `Invalid --opener="${openerOverride}". Must be one of: ${OPENER_STYLES.join(", ")}`,
    );
    process.exit(1);
  }

  const target = path.resolve("src/content/blog", `${slug}.mdx`);
  try {
    await access(target, constants.F_OK);
    console.error(`File already exists: ${target}`);
    process.exit(1);
  } catch {
    // Expected: file should not exist.
  }

  const taken = await gatherExistingPubDates();
  const pubDate = nextNonCollidingDate(taken);
  const today = new Date().toISOString().slice(0, 10);

  const title = titleFromSlug(slug);
  const openerStyle = openerForSlug(slug, openerOverride);
  const openerBlock = buildOpener(openerStyle, title);

  const frontmatter = buildFrontmatter({
    title,
    pubDate,
    category,
    cornerstone,
    withFaqs,
  });

  const banner =
    `{/* See .cursor/rules/content-style.mdc for editorial style: em-dash budget, opener variation, citation requirement, no boilerplate footer. Delete this comment before publishing. */}\n\n`;

  const body = cornerstone
    ? buildCornerstoneBody(slug, openerBlock)
    : buildStandardBody(openerBlock);

  const contents = frontmatter + banner + body;

  await writeFile(target, contents, "utf8");
  console.log(`Created ${target}`);
  console.log(`  opener style: ${openerStyle}${openerOverride ? " (forced)" : ""}`);
  console.log(`  cornerstone: ${cornerstone}`);
  console.log(`  faqs in frontmatter: ${!cornerstone && withFaqs}`);
  if (pubDate !== today) {
    console.log(
      `  pubDate: ${pubDate} (today ${today} already used by an existing post; staggered to next free day)`,
    );
  } else {
    console.log(`  pubDate: ${pubDate}`);
  }
  console.log(
    `\nNext: read .cursor/rules/content-style.mdc, then open scripts/new-post.md, paste the prompt into Cursor chat with slug="${slug}", and replace the scaffold body.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
