#!/usr/bin/env node
/**
 * scripts/gsc-action-plan.mjs
 *
 * Turns a Google Search Console "Queries" CSV export into a ranked, actionable
 * refresh plan that pairs each borderline query with the on-site page that
 * ranks for it and a recommended action (add content, rewrite meta, add
 * internal link).
 *
 * Pair with docs/gsc-weekly-review.md.
 *
 * Usage:
 *   1. In GSC: Performance -> Search results, last 28 days, filter Position
 *      4-16. Click "Pages" tab, then "Export" -> "Download CSV". You'll get
 *      a file like Queries.csv (also Pages.csv works).
 *   2. Drop the CSV at the path below (default: ./gsc-export.csv).
 *   3. node scripts/gsc-action-plan.mjs [--csv path/to/file.csv] [--out path]
 *
 * Output:
 *   docs/gsc-action-plan.md — markdown plan with one section per priority.
 *
 * The script is conservative: it never edits content. It produces the plan
 * file. To execute the plan, ask Cursor to read it and draft diffs.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ARG_FLAGS = {
  csv: argFlag("csv", "gsc-export.csv"),
  out: argFlag("out", "docs/gsc-action-plan.md"),
  minPosition: Number(argFlag("min", "4")),
  maxPosition: Number(argFlag("max", "16")),
  minImpressions: Number(argFlag("impressions", "30")),
};

function argFlag(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1];
}

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

/**
 * Tiny CSV parser that handles quoted fields with commas. GSC exports use
 * UTF-8 BOM and standard RFC-4180 quoting.
 */
function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(cur);
        cur = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        if (row.some((v) => v !== "")) rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += c;
      }
    }
  }
  if (cur.length || row.length) {
    row.push(cur);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => (obj[h] = (r[i] ?? "").trim()));
    return obj;
  });
}

const POST_KEYWORDS_RE = /[a-z0-9]+/g;

function tokenise(s) {
  return (s.toLowerCase().match(POST_KEYWORDS_RE) ?? []).filter(
    (w) => w.length > 2 && !STOPWORDS.has(w),
  );
}

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "from", "into", "what", "how",
  "why", "are", "you", "your", "this", "any", "can", "use", "get", "best",
  "vs", "guide", "hyrox",
]);

async function loadPosts() {
  const dir = path.resolve("src/content/blog");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const posts = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, "");
    const src = await readFile(path.join(dir, f), "utf8");
    const fm = parseFrontmatter(src);
    posts.push({
      slug,
      file: path.join("src/content/blog", f),
      title: fm.title || slug,
      description: fm.description || "",
      pubDate: fm.pubDate || "",
      dateModified: fm.dateModified || "",
      url: `https://www.hyroxvault.com/blog/${slug}/`,
      tokens: new Set([
        ...tokenise(fm.title || ""),
        ...tokenise(fm.description || ""),
        ...tokenise(slug.replace(/-/g, " ")),
      ]),
    });
  }
  return posts;
}

function findBestMatch(query, posts) {
  const qTokens = tokenise(query);
  if (qTokens.length === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const p of posts) {
    let score = 0;
    for (const t of qTokens) if (p.tokens.has(t)) score += 1;
    const slugMatch = qTokens.every((t) =>
      p.slug.includes(t),
    );
    if (slugMatch) score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  if (!best) return null;
  if (bestScore < 2) return { post: best, score: bestScore, weak: true };
  return { post: best, score: bestScore, weak: false };
}

function recommendAction(row) {
  const ctr = row.ctr;
  const pos = row.position;
  const impressions = row.impressions;

  if (pos >= 4 && pos <= 8 && ctr < 0.02 && impressions >= 100) {
    return {
      type: "rewrite-meta",
      summary:
        "Position is close to page 1 but click-through is below 2%. The title or meta description is not earning the click. Rewrite both to lead with the exact query phrase and add a specific number/benefit.",
    };
  }
  if (pos >= 8 && pos <= 16) {
    return {
      type: "add-content",
      summary:
        "Position 8-16 means Google sees relevance but the page doesn't fully answer the query. Add 200-400 words that use the query phrase as an H2 or H3 and answer it directly.",
    };
  }
  if (pos >= 4 && pos < 8) {
    return {
      type: "add-internal-links",
      summary:
        "Position 4-7 is the highest-leverage band. Add 2-3 contextual internal links from your highest-traffic pages, using the query phrase as anchor text. Bump dateModified.",
    };
  }
  return {
    type: "review",
    summary: "Manual review — query falls outside the standard intervention bands.",
  };
}

function priorityScore(row) {
  // Higher = more important. Combines impression volume with proximity to
  // page 1 and CTR gap.
  const proximity = Math.max(0, 16 - row.position) / 16;
  const ctrGap = Math.max(0, 0.05 - row.ctr) / 0.05;
  return Math.round(row.impressions * (0.4 + 0.4 * proximity + 0.2 * ctrGap));
}

function pickQueryColumn(row) {
  // GSC export columns vary slightly: "Top queries" or "Query".
  const candidates = ["query", "top queries", "queries"];
  for (const c of candidates) if (row[c]) return row[c];
  return row[Object.keys(row)[0]] || "";
}

async function main() {
  const csvPath = path.resolve(ARG_FLAGS.csv);
  if (!existsSync(csvPath)) {
    console.error(
      `\nNo CSV at ${csvPath}.\n\n` +
        `Export "Queries" from GSC -> Performance -> Search results (last 28 days).\n` +
        `Save as gsc-export.csv at the repo root, or pass --csv <path>.\n`,
    );
    process.exit(1);
  }

  const csv = await readFile(csvPath, "utf8");
  const rowsRaw = parseCsv(csv);
  if (rowsRaw.length === 0) {
    console.error("CSV parsed to zero rows. Make sure you exported the right report.");
    process.exit(1);
  }

  const rows = rowsRaw
    .map((r) => ({
      query: pickQueryColumn(r),
      clicks: Number((r.clicks || "0").replace(/,/g, "")),
      impressions: Number((r.impressions || "0").replace(/,/g, "")),
      ctr: Number(String(r.ctr || "0").replace("%", "")) / 100,
      position: Number(r.position || "0"),
    }))
    .filter(
      (r) =>
        r.query &&
        Number.isFinite(r.position) &&
        r.position >= ARG_FLAGS.minPosition &&
        r.position <= ARG_FLAGS.maxPosition &&
        r.impressions >= ARG_FLAGS.minImpressions,
    );

  if (rows.length === 0) {
    console.error(
      `No rows matched the filters (position ${ARG_FLAGS.minPosition}-${ARG_FLAGS.maxPosition}, impressions >= ${ARG_FLAGS.minImpressions}).`,
    );
    process.exit(0);
  }

  const posts = await loadPosts();

  const items = rows
    .map((r) => {
      const match = findBestMatch(r.query, posts);
      const action = recommendAction(r);
      return {
        ...r,
        match,
        action,
        priority: priorityScore(r),
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const today = new Date().toISOString().slice(0, 10);

  const lines = [];
  lines.push(`# GSC weekly action plan — ${today}`);
  lines.push("");
  lines.push(
    `Source: ${path.relative(process.cwd(), csvPath)}. Position window ${ARG_FLAGS.minPosition}-${ARG_FLAGS.maxPosition}, impressions >= ${ARG_FLAGS.minImpressions}.`,
  );
  lines.push("");
  lines.push(
    `Picked **${items.length}** queries. Action the top 3-5 this week. Re-run next Monday.`,
  );
  lines.push("");
  lines.push(`## Top priorities`);
  lines.push("");
  lines.push(
    `| # | Query | Position | Impr | CTR | Action | Page |`,
  );
  lines.push(`| - | --- | --- | --- | --- | --- | --- |`);
  items.slice(0, 12).forEach((it, i) => {
    const pageCell = it.match?.post
      ? `[\`${it.match.post.slug}\`](${it.match.post.file})${it.match.weak ? " ?" : ""}`
      : "(no match)";
    lines.push(
      `| ${i + 1} | ${it.query} | ${it.position.toFixed(1)} | ${it.impressions} | ${(it.ctr * 100).toFixed(1)}% | ${it.action.type} | ${pageCell} |`,
    );
  });
  lines.push("");

  lines.push(`## Detailed plan`);
  lines.push("");
  items.slice(0, 12).forEach((it, i) => {
    lines.push(`### ${i + 1}. "${it.query}"`);
    lines.push("");
    lines.push(
      `- **Position:** ${it.position.toFixed(1)} · **Impressions:** ${it.impressions} · **Clicks:** ${it.clicks} · **CTR:** ${(it.ctr * 100).toFixed(2)}%`,
    );
    if (it.match?.post) {
      lines.push(`- **Page:** \`${it.match.post.file}\``);
      lines.push(`- **URL:** ${it.match.post.url}`);
      lines.push(
        `- **Last touched:** ${it.match.post.dateModified || it.match.post.pubDate || "unknown"}`,
      );
      if (it.match.weak) {
        lines.push(
          `- **Match confidence:** weak (score ${it.match.score}). Verify this is the right page before editing.`,
        );
      }
    } else {
      lines.push(
        `- **Page:** no on-site match — consider creating a new post targeting this query.`,
      );
    }
    lines.push(`- **Action (${it.action.type}):** ${it.action.summary}`);
    lines.push("");
    lines.push(`#### Cursor prompt`);
    lines.push("");
    lines.push("```");
    if (it.match?.post && it.action.type === "add-content") {
      lines.push(
        `Open ${it.match.post.file}. The page ranks #${it.position.toFixed(0)} for "${it.query}" (${it.impressions} impressions/month). Add a 250-350 word section with H2 or H3 that uses the exact phrase "${it.query}" and answers it directly. Match the editorial style in .cursor/rules/content-style.mdc. Bump dateModified to today. Then run npm run indexnow -- ${it.match.post.url}`,
      );
    } else if (it.match?.post && it.action.type === "rewrite-meta") {
      lines.push(
        `Open ${it.match.post.file}. The page ranks #${it.position.toFixed(0)} for "${it.query}" with ${(it.ctr * 100).toFixed(1)}% CTR. Rewrite the title and description so the title leads with "${it.query}" verbatim and the description includes a specific number or benefit. Keep title under 60 chars, description under 155. Bump dateModified.`,
      );
    } else if (it.match?.post && it.action.type === "add-internal-links") {
      lines.push(
        `Find 2-3 high-traffic pages on the site that should link to ${it.match.post.file} using anchor text containing "${it.query}". Add the links inline (not in a "related" block). Bump dateModified on the linked pages too. Then run npm run indexnow -- ${it.match.post.url}`,
      );
    } else {
      lines.push(
        `Investigate why "${it.query}" matches no on-site page. If it represents a real search intent, scaffold a new post with: npm run new-post -- <slug> <category>`,
      );
    }
    lines.push("```");
    lines.push("");
  });

  if (items.length > 12) {
    lines.push(`## Backlog (${items.length - 12} more)`);
    lines.push("");
    lines.push(`| Query | Position | Impr | CTR | Page |`);
    lines.push(`| --- | --- | --- | --- | --- |`);
    items.slice(12).forEach((it) => {
      const slug = it.match?.post?.slug ?? "(no match)";
      lines.push(
        `| ${it.query} | ${it.position.toFixed(1)} | ${it.impressions} | ${(it.ctr * 100).toFixed(1)}% | ${slug} |`,
      );
    });
    lines.push("");
  }

  lines.push(`## After you action items`);
  lines.push("");
  lines.push(
    `1. Set \`dateModified\` to today on every edited post.\n` +
      `2. Commit and push.\n` +
      `3. Run \`npm run indexnow\` to ping Bing/Yandex.\n` +
      `4. Log the action in your weekly tracker (see \`docs/gsc-weekly-review.md\`).\n` +
      `5. Re-run \`node scripts/gsc-action-plan.mjs\` next Monday.\n`,
  );

  const outPath = path.resolve(ARG_FLAGS.out);
  await writeFile(outPath, lines.join("\n"), "utf8");
  console.log(
    `\nWrote action plan to ${path.relative(process.cwd(), outPath)} (${items.length} items).\n` +
      `Open it, then ask Cursor: "Read docs/gsc-action-plan.md and execute the top 5 priorities."\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
