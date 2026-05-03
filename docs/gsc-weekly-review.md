# Weekly GSC Review Playbook — hyroxvault.com

A 30-minute weekly process to push borderline-ranking pages onto page 1 of Google. Run this every Monday morning (or any consistent day). The discipline of weekly cadence matters more than the time spent.

This complements the monthly review in `docs/seo-setup.md` — the monthly review is strategic; this weekly review is tactical.

---

## Why weekly?

Google ranks pages over a 4-12 week maturation window. New pages typically enter at position 30-50 in week 1, climb to 15-25 in weeks 2-4, and stabilise in weeks 4-12. The biggest leverage is **catching pages that hit position 5-15 and pushing them to 1-4** — that's where 60% of the click-through rate lives.

Weekly review identifies these pages while they're still climbing, before they stabilise at a sub-optimal rank.

---

## The 30-minute weekly process

### Step 1 (5 min) — Pull the GSC report

1. Open https://search.google.com/search-console
2. Pick `hyroxvault.com` as your property
3. Go to **Performance → Search results**
4. Set date range to **last 28 days**
5. Click the **Average position** card to enable it as a column
6. Sort by **Position descending** then click **Filter → Position → Less than → 16** and **Position → Greater than → 4**

You're now looking at every query where you rank in positions 5-15 over the last 28 days. These are your refresh targets.

### Step 2 (10 min) — Identify the top 3-5 priorities

For each query in the table, record:

| Query | Position | Impressions | Clicks | Page (URL) |
| --- | --- | --- | --- | --- |

Prioritise queries with:

- **Higher impressions** (signal of search demand)
- **Position 5-10** (close to page 1, biggest leverage)
- **Low click-through rate** (under 2% suggests title/meta are weak too)
- **Existing page is recent** (< 6 months old) — fresh refresh has more impact

Pick the top 3-5 to action this week. Don't try to refresh all of them — quality > volume.

### Step 3 (15 min) — Refresh the page

For each priority, take one of these actions:

#### Action A: Add 200-400 words of content

The page exists but doesn't fully answer the query. Read the page, identify what's missing, write 200-400 words of new content that directly addresses the query phrase. Use the exact query language as an H2 or H3 if possible.

#### Action B: Add an internal link from a high-traffic page

Find a page on the site with high traffic (check **Top pages** in GSC) and add a contextual internal link from there to the borderline page. Use the query phrase as anchor text.

#### Action C: Rewrite the meta description

If the page ranks well but click-through is low, the meta description (or title tag) isn't compelling. Rewrite it to:
- Use the query phrase verbatim in the first 50 characters
- Include a specific number or benefit
- End with a soft call to action ("see the full breakdown", "complete guide", etc.)

### Step 4 (5 min) — Update + ping IndexNow

After editing the .mdx or .astro file:

1. Set `dateModified` in frontmatter (where applicable) to today's date
2. Commit and deploy
3. Run `npm run indexnow -- <url>` to ping Bing/Yandex
4. Add a row to the tracker below

---

## Weekly tracker template

Maintain a running log of refresh actions. Copy the template below into your weekly notes.

```
| Week of | Query | Page | Position before | Action | Position after (4 weeks) |
| --- | --- | --- | --- | --- | --- |
| 2026-04-27 |  |  |  |  |  |
```

Track results 4 weeks after each action — most refreshes show position improvement within 2-4 weeks if the action was correct.

---

## Surfacing refresh candidates locally

To quickly identify recent posts that are likely in the "ranking maturation window" (30-90 days old), run:

```bash
npm run gsc-weekly
```

This lists every blog post published 30-90 days ago, sorted oldest first. These are typically the pages most worth reviewing in GSC each week — they've been indexed long enough to have data but are still in the climbing window where intervention helps most.

---

## Cursor-driven action plan (the loop)

Once you have the GSC export, generate an actionable, page-matched plan:

1. In GSC, open Performance -> Search results, last 28 days, no filters needed.
2. Click the **Queries** tab, then **Export -> Download CSV**.
3. Save the file at the repo root as `gsc-export.csv` (already gitignored).
4. Run:

```bash
npm run gsc-plan
```

This writes `docs/gsc-action-plan.md`, a ranked plan that:

- Filters to position 4-16, impressions >= 30
- Joins each query to the best-matching on-site page
- Recommends one of three actions per query: `add-content`, `rewrite-meta`, or `add-internal-links`
- Outputs a copy-paste Cursor prompt for each top-12 priority

Then ask Cursor: **"Read `docs/gsc-action-plan.md` and execute the top 5 priorities."** Review the diffs in 15 minutes and merge.

Re-run weekly. The action plan filename always overwrites; archive prior weeks via git history.

---

## When to skip a query

Not every position 5-15 query is worth refreshing. Skip if:

- **Query intent doesn't match your page.** If you rank for "hyrox shoes" with a wall ball post, no amount of refresh will fix the mismatch.
- **Impressions under 50/month.** Low-volume queries don't justify the effort. Focus on queries with 100+ monthly impressions.
- **The query is too generic.** "hyrox" alone is a head term — page 1 requires authority you can't build with content alone.
- **You already actioned this query within the last 6 weeks.** Give the previous refresh time to compound.

---

## Quarterly: pruning low-performers

Once per quarter, run the GSC report for **last 90 days** and identify pages with:

- Zero clicks
- Zero impressions
- Or impressions but zero meaningful queries

These are candidates for either:

- A complete rewrite (if the topic is valuable but the execution failed)
- Consolidation (merge 2-3 low-performing pages into one strong one)
- Deletion + 301 redirect (if the topic is no longer relevant)

Don't keep zero-traffic pages indefinitely — they signal low quality to Google overall.

---

## What to expect over 90 days

If you run this weekly process diligently:

- **Week 4-8:** Several borderline queries should move from position 5-15 to position 1-4
- **Week 8-12:** Click-through rates should improve as meta descriptions tighten
- **Week 12+:** Compound effect — high-CTR pages signal authority to Google, which lifts adjacent pages too

Realistic outcome: 30-50% increase in organic clicks over 90 days from this process alone, on top of new content publishing.
