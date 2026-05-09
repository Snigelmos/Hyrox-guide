# AI Post Generation Prompt, Hyrox Guide

Copy the block below into a new Cursor chat (or Claude / ChatGPT) and fill in `<TARGET_KEYWORD>` and `<CLUSTER_ID>` from `src/data/content-backlog.json`. The AI will return a complete `.mdx` file ready to drop into `src/content/blog/`.

Always read `.cursor/rules/content-style.mdc` first. The rule is the source of truth for em-dash budget, opener variation, citation requirement, voice, and FAQ handling. The prompt below is consistent with it; if you ever see a conflict, the rule wins.

Review checklist after generation (~5 min per post):

1. First paragraph answers the query directly. Opener style varies between posts (see rule).
2. All 4+ internal links point to pages that exist. Check against `src/pages/` and `src/content/`.
3. Em-dash count is at most 2 in the body. No `**Term** —` definition pattern.
4. Every precise number is either cited (real outbound link) or hedged (`typically`, `roughly`).
5. No `*Last reviewed: ... HyroxVault Editorial Team.*` footer. Closer heading varies post-to-post (or is omitted).
6. Voice is first-person plural (`we`, `our`). No singular byline.
7. For cornerstone posts: prose `## Common questions` instead of `faqs:` array. For non-cornerstone: `faqs:` is optional, not required.
8. `howToSteps` only on actual technique / how-to posts.
9. `category` matches one from `BLOG_CATEGORIES`.
10. `pubDate` is whatever the scaffold wrote (it has been staggered to avoid clustering). Do NOT change it to today.

Then: `git add . && git commit -m "blog: add <slug>"` → Vercel auto-deploys → run `npm run indexnow -- https://hyroxvault.com/blog/<slug>/`.

---

## The prompt

```
You are writing a single SEO-optimised blog post for hyroxvault.com, a site covering Hyrox racing, training, and gear. The site is run by a small editorial team that races. Voice is first-person plural ("we", "our"), not a single coach byline. Read .cursor/rules/content-style.mdc before writing; it is the source of truth.

INPUTS
- Target keyword / query: <TARGET_KEYWORD>
- Cluster id from src/data/content-backlog.json: <CLUSTER_ID>
- Existing scaffold file (already created by scripts/new-post.mjs): src/content/blog/<slug>.mdx
- Cornerstone or not: <CORNERSTONE_YES_OR_NO>

HARD CONSTRAINTS, the file must pass Zod validation against this schema (src/content.config.ts):

```ts
z.object({
  title: z.string(),              // 45-65 chars, contains target keyword, year if topical
  description: z.string(),        // 140-160 chars, natural CTA, no em-dashes
  pubDate: z.date(),              // KEEP whatever the scaffold wrote. Do NOT replace with today.
  dateModified: z.date().optional(),
  author: z.string().optional(),  // "HyroxVault Editorial Team"
  category: z.enum([
    "training","nutrition","race-strategy","station-guides",
    "gear","beginner","race-recaps","news"
  ]),
  tags: z.array(z.string()).optional(),    // 4-8 tags
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
- Preserve the `pubDate` value from the scaffold. Replace title, description, tags, and body.
- Delete the `{/* See .cursor/rules/content-style.mdc ... */}` banner line on output.
- No explanation. No code fence around the file.

CONTENT STRUCTURE
- 900-1,400 words for non-cornerstone posts. 1,400-2,200 words for cornerstone posts.
- Opener varies post to post. Pick one of: direct lead paragraph (no H2 above), problem framing, question lead, scenario / story lead. Do NOT default to "## Short answer".
- 3-6 H2 sections after the opener. Each H2 is a sub-question or a concrete topic, not a generic label.
- Include >=1 table OR >=1 numbered list OR >=1 bullet list per ~400 words. Avoid stacking 3+ bulleted lists in a row, and avoid the "**Term:** explanation" pattern repeated across consecutive lists.
- Write in first-person plural ("we", "our") when speaking from editorial-team experience. Use second person ("you") when giving the reader instructions. Active voice. Vary paragraph length: some 2-sentence punches, some 4-5 sentence analyses.
- Em-dash budget: at most 2 em-dashes in the body. Never use `**Term** — definition`; use `**Term:** definition` if you need that pattern.
- Every precise number (HR bpm, percentages, wattage, splits, supplement dosages) needs either an outbound citation to a real authoritative source OR hedging language. Soft target for cornerstones: 1 outbound citation per 800 words. Use `rel="external"` (no nofollow) on genuine references. Real sources only: Concept2, ISSN (jissn.biomedcentral.com), ACSM, IOC consensus statements, results.hyrox.com, official Hyrox rules PDFs, peer-reviewed papers indexed on PubMed. Do NOT invent sources.
- NO emojis. NO marketing fluff. NO "in conclusion". NO "Last reviewed: ... HyroxVault Editorial Team." footer.

CLOSER
- About half of posts should omit any explicit "Related guides" / "Cross-references" block and lean on inline contextual links instead. When you do include a closer, vary the heading: "Keep reading", "More for runners", "What to read next", etc. Never use the literal "## Related guides" every time.

CORNERSTONE-ONLY ADDITIONS
- Insert 2-3 `<figure>` placeholder blocks for original photos / video frames / data screenshots. Captions describe what the asset shows (venue, date, device). Use placeholder image paths under `/images/blog/<slug>/`.
- Insert 1-2 named-quote placeholder slots inside blockquotes, with `{/* TODO: replace with real quote from <name> */}` markers and a believable attribution line below the quote.
- Replace the FAQ frontmatter pattern with a prose `## Common questions` section: 3-5 bolded questions, each followed by a 2-3 sentence prose answer. Do NOT include a `faqs:` array in the frontmatter for cornerstone posts.

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
- /workouts/                                 — Workouts library
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
- Non-cornerstone posts: `faqs:` is OPTIONAL. Include 3-5 Q&As only when they match real "People Also Ask" style queries around the target keyword and add information not already in the body. Each answer: 2-3 sentences, specific, actionable. Vary the opening phrase across questions; do not start every answer with "Yes," or "It depends,".
- Cornerstone posts: do NOT include `faqs:` in the frontmatter. Use a prose `## Common questions` section in the body instead.

HOWTO FRONTMATTER (only for technique / "how to X" queries)
- If the post is a step-by-step technique / how-to post, include `howToSteps` with 4-6 items.
- Each step: `name` (<=6 words), `text` (1-2 sentence action).

AFFILIATE CTA
- If the post relates to shoes, gloves, grip aids, compression gear: include a sentence linking to /gear/shoes/ or /gear/accessories/.
- If nutrition-related: link to /supplements/energy-gels/, /supplements/electrolytes/, etc.
- If training-related: link to /calculator/ near the end for pacing.
- Do NOT write "buy now" CTAs, just natural internal links.

TONE
- Specific, numeric, slightly weary. Voice of a small editorial team that races, edits each other, and reads the literature, not a single hype coach.
- First-person plural ("we", "our") when describing editorial-team experience. Second person ("you") when giving the reader instructions.
- Cite specifics: which race, which surface, which monitor reading, which paper. Vague is the strongest LLM tell.
- Never apologise for length, never pad sentences, never use rhetorical flourishes like "treat this station as a gift the course is giving you".

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
