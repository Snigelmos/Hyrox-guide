#!/usr/bin/env node
/**
 * scripts/image-audit.mjs
 *
 * Walks every blog .mdx, every guide .mdx, and reports which posts:
 *   - Have no `image:` set in frontmatter (so PostHero won't render).
 *   - Reference an image path that doesn't exist on disk under /public.
 *   - Have an OG image that doesn't exist either.
 *
 * Output: docs/image-audit.md (gitignored).
 *
 * Run before deploying a content batch. Fix any "missing on disk" cases
 * before pushing — Google warns about missing OG images.
 *
 * Usage:
 *   node scripts/image-audit.mjs
 */

import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const SCAN_DIRS = ["src/content/blog", "src/content/racing-guide", "src/content/training"];
const PUBLIC_DIR = "public";
const OUT_PATH = "docs/image-audit.md";

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

async function fileExists(rel) {
  try {
    await stat(path.resolve(rel));
    return true;
  } catch {
    return false;
  }
}

async function* walkContent(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walkContent(full);
    } else if (e.name.endsWith(".mdx")) {
      yield full;
    }
  }
}

async function main() {
  const records = [];
  for (const d of SCAN_DIRS) {
    try {
      await stat(d);
    } catch {
      continue;
    }
    for await (const f of walkContent(d)) {
      const src = await readFile(f, "utf8");
      const fm = parseFrontmatter(src);
      const heroImage = fm.image;
      let heroExists = null;
      if (heroImage) {
        if (heroImage.startsWith("http")) {
          heroExists = "external";
        } else {
          const rel = path.join(PUBLIC_DIR, heroImage.replace(/^\//, ""));
          heroExists = (await fileExists(rel)) ? "yes" : "no";
        }
      }
      records.push({
        file: f,
        title: fm.title || "(no title)",
        heroImage: heroImage || null,
        heroExists,
      });
    }
  }

  const noHero = records.filter((r) => !r.heroImage);
  const brokenHero = records.filter((r) => r.heroImage && r.heroExists === "no");
  const externalHero = records.filter((r) => r.heroExists === "external");

  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# Image audit — ${today}`);
  lines.push("");
  lines.push(`Scanned ${records.length} content files.`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | --- |`);
  lines.push(`| No hero image set | ${noHero.length} |`);
  lines.push(`| Hero image references missing file | ${brokenHero.length} |`);
  lines.push(`| External hero image (cannot validate) | ${externalHero.length} |`);
  lines.push("");

  if (brokenHero.length > 0) {
    lines.push(`## Broken hero references (FIX FIRST)`);
    lines.push("");
    lines.push(`These post frontmatter \`image:\` paths don't exist on disk. The post will render with a broken image.`);
    lines.push("");
    lines.push(`| File | Image path |`);
    lines.push(`| --- | --- |`);
    for (const r of brokenHero) {
      lines.push(`| \`${r.file}\` | \`${r.heroImage}\` |`);
    }
    lines.push("");
  }

  if (noHero.length > 0) {
    lines.push(`## No hero image (low priority)`);
    lines.push("");
    lines.push(`These posts have no \`image:\` frontmatter. The auto-generated OG image still works for social sharing, but the post page itself shows no hero. Consider adding for the highest-traffic 10-20 posts.`);
    lines.push("");
    lines.push(`| File | Title |`);
    lines.push(`| --- | --- |`);
    for (const r of noHero.slice(0, 50)) {
      lines.push(`| \`${r.file}\` | ${r.title} |`);
    }
    if (noHero.length > 50) {
      lines.push(`| (... ${noHero.length - 50} more) | |`);
    }
    lines.push("");
  }

  if (externalHero.length > 0) {
    lines.push(`## External hero image (review periodically)`);
    lines.push("");
    lines.push(`These posts use an externally-hosted hero image. Risk: if the host removes or rate-limits the URL, the page breaks. Prefer self-hosted under \`/public/images/blog/\`.`);
    lines.push("");
    for (const r of externalHero) {
      lines.push(`- \`${r.file}\` → ${r.heroImage}`);
    }
    lines.push("");
  }

  await writeFile(path.resolve(OUT_PATH), lines.join("\n"), "utf8");
  console.log(
    `\nWrote ${OUT_PATH} (${noHero.length} no hero, ${brokenHero.length} broken, ${externalHero.length} external).\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
