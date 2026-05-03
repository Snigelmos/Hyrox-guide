#!/usr/bin/env node
/**
 * scripts/reddit-prompts.mjs
 *
 * Pulls recent r/Hyrox posts via Reddit's public JSON API, filters to
 * questions whose title overlaps with topics already covered on the site,
 * and writes a weekly digest to docs/reddit-prompts.md.
 *
 * The goal is to make the once-per-week off-site outreach effort
 * mechanical: open the digest, pick the best 1-2 prompts, write a
 * substantive answer, drop a single contextual link to the best
 * matching page, post.
 *
 * Usage:
 *   npm run reddit-prompts
 *
 * Notes:
 *   - Reddit's /r/<sub>/new.json endpoint is rate-limited. We fetch one
 *     page (25 posts) and stop. Run weekly.
 *   - We do not authenticate. The endpoint is read-only and public.
 *   - Always read the actual thread before commenting; the title alone
 *     is not enough to know if your link is genuinely useful.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SUBREDDIT = "Hyrox";
const POSTS_LIMIT = 50;
const OUT_PATH = "docs/reddit-prompts.md";
const USER_AGENT = "HyroxVault-PromptFinder/1.0 (https://www.hyroxvault.com)";

const QUESTION_HINTS = [
  "?",
  "how do",
  "how to",
  "how much",
  "how many",
  "how long",
  "what is",
  "what are",
  "what's the",
  "is it",
  "should i",
  "anyone",
  "any tips",
  "advice",
  "help",
  "recommend",
  "best",
  "vs",
  "or",
  "first hyrox",
  "first race",
];

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

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "from", "into", "what", "how", "why",
  "are", "you", "your", "this", "any", "can", "use", "get", "best", "vs",
  "guide", "hyrox", "have", "has", "would", "could", "should", "going",
  "doing", "anyone", "tips", "advice", "help", "first", "race", "race1",
  "training", "out", "all", "off", "but", "for", "also", "when", "than",
  "between", "anybody", "people", "looking", "getting", "really",
]);

function tokenise(s) {
  return (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (w) => w.length > 2 && !STOPWORDS.has(w),
  );
}

async function loadOnSitePages() {
  const dir = path.resolve("src/content/blog");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx"));
  const pages = [];
  for (const f of files) {
    const slug = f.replace(/\.mdx$/, "");
    const src = await readFile(path.join(dir, f), "utf8");
    const fm = parseFrontmatter(src);
    pages.push({
      slug,
      title: fm.title || slug,
      url: `https://www.hyroxvault.com/blog/${slug}/`,
      tokens: new Set([
        ...tokenise(fm.title || ""),
        ...tokenise(fm.description || ""),
        ...tokenise(slug.replace(/-/g, " ")),
      ]),
    });
  }
  // Add core utility pages too — calculator, comparisons, training, etc.
  const utilities = [
    { slug: "calculator", title: "Hyrox Race Time Predictor", url: "https://www.hyroxvault.com/calculator/", keywords: "calculator predictor finish time goal pace splits" },
    { slug: "training", title: "Hyrox Training Plans", url: "https://www.hyroxvault.com/training/", keywords: "training plan beginner intermediate advanced 12 week 8 week" },
    { slug: "training-plans", title: "Hyrox Training Plans Library", url: "https://www.hyroxvault.com/training-plans/", keywords: "training plan beginner sub 60 sub 75 sub 90" },
    { slug: "compare", title: "Hyrox vs other races", url: "https://www.hyroxvault.com/compare/", keywords: "compare versus crossfit marathon spartan deka triathlon ironman ocr" },
    { slug: "racing-guide", title: "Hyrox Racing Guide", url: "https://www.hyroxvault.com/racing-guide/", keywords: "racing guide rules categories times standards what is hyrox" },
    { slug: "stations", title: "Hyrox Stations Standards", url: "https://www.hyroxvault.com/stations/", keywords: "station weight standard sled wall ball lunge farmers carry burpee" },
    { slug: "supplements", title: "Hyrox Supplements", url: "https://www.hyroxvault.com/supplements/", keywords: "supplement creatine protein gel pre-workout electrolyte caffeine" },
    { slug: "gear", title: "Hyrox Gear", url: "https://www.hyroxvault.com/gear/", keywords: "gear shoe shoes equipment apparel clothing socks belt" },
    { slug: "gyms", title: "Hyrox Gym Finder", url: "https://www.hyroxvault.com/gyms/", keywords: "gym find affiliated train class london berlin new york" },
    { slug: "events", title: "Hyrox Events Calendar", url: "https://www.hyroxvault.com/events/", keywords: "event calendar 2026 london berlin new york dubai sydney register" },
    { slug: "records", title: "Hyrox World Records", url: "https://www.hyroxvault.com/records/", keywords: "record fastest world champion hunter mcintyre lauren weeks" },
    { slug: "qualifiers", title: "Hyrox Qualifying Times", url: "https://www.hyroxvault.com/qualifiers/", keywords: "qualifying time pro world championship age group" },
    { slug: "race-day-checklist", title: "Hyrox Race-Day Checklist", url: "https://www.hyroxvault.com/race-day-checklist/", keywords: "race day checklist what bring nutrition shoes" },
  ];
  for (const u of utilities) {
    pages.push({
      slug: u.slug,
      title: u.title,
      url: u.url,
      tokens: new Set(tokenise(`${u.title} ${u.keywords}`)),
    });
  }
  return pages;
}

function isLikelyQuestion(title) {
  const t = title.toLowerCase();
  return QUESTION_HINTS.some((q) => t.includes(q));
}

function bestMatch(title, pages) {
  const tokens = tokenise(title);
  if (tokens.length === 0) return null;
  let best = null;
  let bestScore = 0;
  for (const p of pages) {
    let score = 0;
    for (const t of tokens) if (p.tokens.has(t)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  if (!best || bestScore < 2) return null;
  return { page: best, score: bestScore };
}

async function fetchRedditPosts(sub, limit = 50) {
  const url = `https://www.reddit.com/r/${sub}/new.json?limit=${limit}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Reddit fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return (data?.data?.children ?? []).map((c) => c.data);
}

async function main() {
  const pages = await loadOnSitePages();

  let posts;
  try {
    posts = await fetchRedditPosts(SUBREDDIT, POSTS_LIMIT);
  } catch (err) {
    console.error(
      `Could not reach Reddit (${err.message}). Reddit can be flaky from CI; rerun in a minute.`,
    );
    process.exit(1);
  }

  const enriched = posts
    .filter((p) => !p.stickied && !p.over_18)
    .filter((p) => isLikelyQuestion(p.title))
    .map((p) => {
      const match = bestMatch(p.title, pages);
      return {
        title: p.title,
        url: `https://www.reddit.com${p.permalink}`,
        author: p.author,
        ageHours: Math.floor((Date.now() / 1000 - p.created_utc) / 3600),
        comments: p.num_comments,
        score: p.score,
        match,
      };
    })
    .filter((p) => p.match)
    .sort((a, b) => {
      // Prioritise: high match score, low existing comments (still earnable),
      // recent age.
      const aScore = a.match.score * 3 - a.comments + Math.max(0, 24 - a.ageHours) * 0.1;
      const bScore = b.match.score * 3 - b.comments + Math.max(0, 24 - b.ageHours) * 0.1;
      return bScore - aScore;
    });

  if (enriched.length === 0) {
    console.error(
      `No matching question posts in the latest ${POSTS_LIMIT} from r/${SUBREDDIT}. Try again later this week.`,
    );
    process.exit(0);
  }

  const today = new Date().toISOString().slice(0, 10);
  const lines = [];
  lines.push(`# r/${SUBREDDIT} prompt digest — ${today}`);
  lines.push("");
  lines.push(
    `Found ${enriched.length} recent question posts whose title overlaps with content already on the site. Pick the best 1-2 and post a substantive comment. Use the suggested page URL only if it's genuinely the right answer in context — never link-drop.`,
  );
  lines.push("");
  lines.push(`## How to use this`);
  lines.push("");
  lines.push(
    `1. Open the top 3 posts below.\n` +
      `2. Read the actual thread, not just the title.\n` +
      `3. Pick 1 (max 2) where one of our pages is genuinely the best answer.\n` +
      `4. Write a substantive 80-150 word comment that answers the question fully on its own. The link is supporting, not the body.\n` +
      `5. Drop the suggested URL inline once, with natural anchor text.\n` +
      `6. Re-run \`npm run reddit-prompts\` next week.\n`,
  );
  lines.push("");
  lines.push(`## Top prompts`);
  lines.push("");
  enriched.slice(0, 12).forEach((p, i) => {
    lines.push(`### ${i + 1}. ${p.title}`);
    lines.push("");
    lines.push(
      `- **Posted:** ${p.ageHours}h ago by u/${p.author} · **Score:** ${p.score} · **Comments:** ${p.comments}`,
    );
    lines.push(`- **Thread:** ${p.url}`);
    lines.push(
      `- **Best matching page:** [${p.match.page.title}](${p.match.page.url}) (match score ${p.match.score})`,
    );
    lines.push("");
  });

  await writeFile(path.resolve(OUT_PATH), lines.join("\n"), "utf8");
  console.log(
    `\nWrote ${OUT_PATH} (${enriched.length} prompts).\n` +
      `Open it, pick 1-2 prompts to action this week.\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
