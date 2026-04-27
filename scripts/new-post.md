# AI Post Generation Prompt — Hyrox Guide

Copy the block below into a new Cursor chat (or Claude / ChatGPT) and fill in `<TARGET_KEYWORD>` and `<CLUSTER_ID>` from `src/data/content-backlog.json`. The AI will return a complete `.mdx` file ready to drop into `src/content/blog/`.

Review checklist after generation (~5 min per post):

1. Read the first paragraph — does it answer the query in the first 60 words?
2. Are all 4+ internal links pointing to pages that actually exist? Check against `src/pages/` and `src/content/`.
3. Does `faqs` frontmatter contain 3–5 Q&As?
4. Is `howToSteps` included for technique/HowTo posts only?
5. Does `category` match one from `BLOG_CATEGORIES`?
6. Is `pubDate` today's date in `YYYY-MM-DD` format?

Then: `git add . && git commit -m "blog: add <slug>"` → Vercel auto-deploys → run `npm run indexnow -- https://hyroxvault.com/blog/<slug>/`.

---

## The prompt

```
You are writing a single SEO-optimised blog post for hyroxvault.com, a site covering Hyrox racing, training, and gear.

INPUTS
- Target keyword / query: <TARGET_KEYWORD>
- Cluster id from src/data/content-backlog.json: <CLUSTER_ID>

HARD CONSTRAINTS — the file must pass Zod validation against this schema (src/content.config.ts):

```ts
z.object({
  title: z.string(),              // 45–65 chars, contains target keyword, year if topical
  description: z.string(),        // 140–160 chars, natural CTA
  pubDate: z.date(),              // today in YYYY-MM-DD
  dateModified: z.date().optional(),
  author: z.string().optional(),  // "HyroxVault Editorial Team"
  category: z.enum([
    "training","nutrition","race-strategy","station-guides",
    "gear","beginner","race-recaps","news"
  ]),
  tags: z.array(z.string()).optional(),    // 4–8 tags
  image: z.string().optional(),
  featured: z.boolean().optional(),
  series: z.object({ name: z.string(), order: z.number() }).optional(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  howToSteps: z.array(z.object({
    name: z.string(), text: z.string(), image: z.string().optional()
  })).optional(),
  howToName: z.string().optional(),
})
```

OUTPUT FORMAT
- Return ONLY the raw MDX file contents, starting with `---` frontmatter.
- No explanation. No code fence around the file.
- File name should be `<slug>.mdx` (matches cluster entry slug), but you don't need to output the file name — just the contents.

CONTENT STRUCTURE
- 900–1,400 words total.
- First paragraph answers the query directly in ≤60 words. Then a hook line for why it's more complex than that.
- 3–6 H2 sections. Each H2 is a long-tail sub-question (People Also Ask style).
- Include ≥1 table OR ≥1 numbered list OR ≥1 bullet list per 300 words — structured data earns featured snippets.
- Write in second person ("you"). Active voice. Short paragraphs (≤3 sentences).
- Include ≥1 concrete number per 200 words (time, weight, rep count, distance).
- NO emojis. NO marketing fluff. NO "in conclusion".

INTERNAL LINKS (required, minimum 4)
Pick from these pages that actually exist. Link inline with descriptive anchor text (NOT "click here"):

- /calculator/                               — Hyrox time calculator
- /racing-guide/what-is-hyrox/               — Race overview
- /racing-guide/stations/                    — All stations explained
- /racing-guide/times/                       — Time standards
- /racing-guide/race-day-tips/               — Race-day tips
- /racing-guide/categories/                  — Categories & divisions
- /training/beginner/                        — Beginner training
- /training/intermediate/                    — Intermediate training
- /training/advanced/                        — Advanced training
- /training/running/                         — Running programming
- /training/stations/                        — Station training
- /training/workouts/                        — Workouts library
- /gear/shoes/                               — Shoe recommendations
- /gear/clothing/                            — Apparel
- /gear/accessories/                         — Gloves / grip aids
- /gear/home-gym/                            — Home gym setup
- /supplements/                              — Supplement hub
- /supplements/energy-gels/                  — Energy gels
- /supplements/electrolytes/                 — Electrolytes
- /supplements/protein-powder/               — Protein powder
- /supplements/creatine/                     — Creatine
- /supplements/pre-workout/                  — Pre-workout
- /supplements/recovery/                     — Recovery
- /supplements/protocol/                     — Race-day protocol
- /competitions/                             — Upcoming events
- /faq/                                      — Main FAQ
- /about/                                    — About the site
- /blog/first-hyrox-race-guide/              — First Hyrox guide
- /blog/best-hyrox-pacing-strategy/          — Pacing strategy
- /blog/hyrox-race-week-protocol/            — Race-week taper
- /blog/energy-gel-strategy-hyrox/           — Gel strategy
- /blog/hyrox-running-strategy/              — Running strategy
- /blog/hyrox-skierg-technique-pacing/       — SkiErg technique
- /blog/hyrox-sled-push-technique/           — Sled push
- /blog/hyrox-sled-pull-technique/           — Sled pull
- /blog/hyrox-burpee-broad-jumps-strategy/   — Burpee broad jumps
- /blog/hyrox-rowing-technique/              — Rowing technique
- /blog/hyrox-vs-crossfit/                   — Hyrox vs CrossFit

Before returning, verify every link is on this list. Do NOT invent URLs.

FAQ FRONTMATTER
- Include `faqs` with 3–5 Q&As that match real "People Also Ask" style queries around the target keyword.
- Each answer: 2–3 sentences, specific, actionable.

HOWTO FRONTMATTER (only for technique / "how to X" queries)
- If the post is a step-by-step technique/how-to post, include `howToSteps` with 4–6 items.
- Each step: `name` (≤6 words), `text` (1–2 sentence action).

AFFILIATE CTA
- If the post relates to shoes, gloves, grip aids, compression gear: include a sentence linking to /gear/shoes/ or /gear/accessories/.
- If nutrition-related: link to /supplements/energy-gels/, /supplements/electrolytes/, etc.
- If training-related: link to /calculator/ near the end for pacing.
- Do NOT write "buy now" CTAs — just natural internal links.

TONE
- Confident, specific, numeric. Like a coach who's raced Hyrox 10+ times.
- OK to say "most beginners" or "we see in data" — authoritative voice.
- Never apologise for length or pad sentences.

BEGIN.
```

---

## Quickstart

```bash
# 1. Scaffold a file with matching frontmatter keys so Zod won't fail on first commit
npm run new-post -- hyrox-sled-mistakes-that-cost-time station-guides

# 2. Open the created src/content/blog/<slug>.mdx — it's a stub
# 3. Run the prompt above in Cursor chat, replace stub contents
# 4. Review, commit, deploy
# 5. npm run indexnow -- https://hyroxvault.com/blog/<slug>/
```
