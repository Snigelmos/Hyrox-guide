# SEO Audit — Top 20 Pages

**Date:** 2026-05-08
**Auditor:** SEO pass against `seo-page-builder` skill rulebook
**Scope:** 8 primary nav hubs + 7 secondary hubs + 5 representative dynamic templates
**Status:** Recommendations only — no code edits in this pass

---

## Executive summary — top 10 fixes by ROI

These are ranked by impact-to-effort. Full per-page reasoning is below.

| # | Fix | Why it matters | Effort | Files |
|---|-----|----------------|--------|-------|
| 1 | **Remove fabricated review schema on `/supplements/[slug]`** (hardcoded `aggregateRating.ratingCount: 47` and auto-generated `Review` from product description) | Spam-class violation per skill rulebook — Google can manually penalize fake review markup. We currently emit it on every supplement product page. | Low | `src/pages/supplements/[slug].astro` |
| 2 | **Unify brand name to "Hyrox Vault" everywhere** (currently mixed: "Hyrox Guide", "HyroxGuide", "HyroxVault", "Hyrox Vault" appear across `<title>`, JSON-LD `publisher`, OG `site_name`) | Brand-name fragmentation hurts knowledge graph clustering and looks unprofessional in SERPs. Easy mechanical fix. | Low | `BaseLayout.astro`, `JsonLd.astro`, `GuideLayout.astro`, ~12 page files using `\| Hyrox Guide` suffix |
| 3 | **Drop `Article` schema on hub/index pages, replace with `CollectionPage` or `WebPage`** | Article schema implies a single authored piece. Hubs like `/times/`, `/stations/`, `/compare/`, `/gear/`, `/records/`, `/workouts/`, `/glossary/`, `/events/[year]/` are link collections — wrong type. Inaccurate schema is a quality signal violation. | Low | 7 hub pages |
| 4 | **Compress over-long titles** — `/compare/` is ~100+ chars, `/supplements/` is borderline, several `/times/[cat]/[age]/` titles exceed 60 chars after suffix | Truncation in SERPs costs CTR. Skill rule: title tag must be specific, not stuffed. | Low | `compare/index.astro`, `supplements/index.astro`, possibly `times/[category]/[ageGroup].astro` |
| 5 | **Add visible "Last reviewed" / `dateModified` on hubs that update** (`/times/`, `/stations/`, `/supplements/`, `/gear/`, `/calculator/`) | Records page already does this well. Freshness is a trust signal for YMYL-adjacent fitness content and helps with seasonal queries. | Low | 5 files |
| 6 | **Fix homepage H1** — currently brand-only "The Hyrox Vault" (visually styled), no keyword alignment | Homepage H1 is the strongest single on-page signal. Brand-only is acceptable on a known brand but we're not big enough to bank on that. Add a tagline H1 that includes "Hyrox" + the page promise. | Low | `src/components/Hero.astro` |
| 7 | **Add author + methodology link on every commercial / advice hub** (`/training/`, `/calculator/`, `/gear/`, `/supplements/`, `/training-plans/[slug]`) | E-E-A-T signal. Calculator has it, supplements has it, gear references it, but training and training-plans don't. Skill rule: trust signals must match risk level. | Low-medium | 4 files + content collections |
| 8 | **Glossary index — render full inline definitions instead of cards-then-click** | Currently `/glossary/` only shows the term + short definition then forces a click. A glossary that renders all definitions on one indexable page captures every glossary long-tail query in one shot. | Medium | `glossary/index.astro` |
| 9 | **Resolve `/workouts/` vs `/training/workouts/` cannibalization** | Two pages, both about Hyrox workouts, similar audience. Pick one canonical, redirect or differentiate the other clearly with non-overlapping intent. | Medium | `workouts/index.astro`, `training/workouts.astro` |
| 10 | **Calculator H1 missing "Hyrox"** — currently `Race Time Predictor` | Main keywords are "hyrox time calculator" / "hyrox race predictor". H1 should include the brand qualifier. Title tag has it, H1 doesn't. | Low | `calculator.astro` |

**Bonus (LOW effort, MEDIUM impact)** — there's no `description` on a few sub-templates that fall back to BaseLayout default text ("Your complete guide to Hyrox..."). Audit each page that doesn't pass `description` and provide a unique meta. Most pages do, but worth a sweep.

---

## Site-wide cross-cutting findings

### 1. Brand-name fragmentation (CRITICAL)

The site uses four different name variants in metadata:

| Variant | Where |
|---------|-------|
| `Hyrox Vault` | Homepage `<title>`, hero "The Hyrox Vault" H1, footer disclaimer "HyroxVault" |
| `Hyrox Guide` | `GuideLayout.astro` line 76 — appends `\| Hyrox Guide` to every guide title; `JsonLd.astro` default `name`; `events/[year]/index.astro`, `times/index.astro`, `stations/index.astro`, `stations/[station]/standards.astro`, `compare/index.astro`, `times/[category]/[ageGroup]` are inconsistent (some `\| Hyrox Vault`, some `\| Hyrox Guide`) |
| `HyroxGuide` | `JsonLd.astro` Article publisher name; supplement [slug] author = "HyroxGuide Editorial Team" |
| `HyroxVault` | `BaseLayout.astro` `og:site_name`; Footer logo |

**Recommendation:** Pick **Hyrox Vault** (matches domain `hyroxvault.com`). One global config constant, one brand. Mechanical replace.

### 2. Schema type misuse on hub pages

These hubs declare `schemaType="Article"` but are link collections, not articles:

- `/times/` — Article (should be `CollectionPage`)
- `/stations/` — Article (should be `CollectionPage`)
- `/compare/` — Article (should be `CollectionPage`)
- `/gear/` — Article (should be `CollectionPage`)
- `/workouts/` — Article (should be `CollectionPage`)
- `/glossary/` — Article (should be `CollectionPage`)
- `/events/[year]/` — Article (should be `CollectionPage`)
- `/records/` — Article (acceptable — it does have authored prose + tables; arguable, but `Dataset` would be more accurate for the records tables themselves)

`/blog/` defaults to WebSite. Acceptable, but `Blog` or `CollectionPage` would be more precise.

### 3. Fake review schema on supplements (CRITICAL — spam risk)

In `src/pages/supplements/[slug].astro` lines 49-62:

```49:62:src/pages/supplements/[slug].astro
      ...(p.rating && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: p.rating,
          bestRating: 5,
          ratingCount: 47,
        },
        review: {
          "@type": "Review",
          reviewRating: { "@type": "Rating", ratingValue: p.rating, bestRating: 5 },
          author: { "@type": "Organization", name: "HyroxGuide" },
          reviewBody: p.description,
        },
      }),
```

The `ratingCount: 47` is hardcoded across every product on every page. The `Review.reviewBody` is auto-set to the product's marketing description, not an actual review. The skill rulebook explicitly prohibits this: *"Never: fake review schema, ratings not visible/legitimate, schema as a ranking hack, Review/AggregateRating without legitimate visible reviews."* Manual penalties for fake reviews exist; we should remove this immediately.

Also in the same block (line 47): `priceCurrency: "USD"` is hardcoded but pages use `GeoAffiliateButton` to swap Amazon TLDs by visitor geo — the schema currency does not match the geo-targeted offer for non-US visitors.

### 4. Inconsistent breadcrumbs

Some hubs render visible breadcrumb HTML + JSON-LD, some only JSON-LD, some neither:

| Page | Visible breadcrumb | JSON-LD breadcrumb |
|------|--------------------|--------------------|
| `/calculator/` | Yes | No (no `breadcrumbs` prop passed) |
| `/racing-guide/` | No | No |
| `/training/` | No | No |
| `/supplements/` | No | No |
| `/gyms/map/` | Yes | Yes |
| `/blog/` | No | No |
| `/events/2026/` | Yes | Yes |
| `/times/` | No | Yes (`{name:"Race Times"}`) |
| `/stations/` | No | Yes |
| `/gear/` | Yes | Yes |
| `/workouts/` | Yes | Yes |
| `/compare/` | No | Yes |
| `/records/` | Yes | Yes |
| `/glossary/` | Yes | Yes |

**Recommendation:** Either add visible breadcrumbs everywhere (preferred — they're useful UX even at hub depth-1) OR drop the JSON-LD breadcrumb on hub roots that don't have a parent. Inconsistency within a site is the problem.

### 5. Generic gradient-only H1s

Several hub H1s render only a single styled word/phrase that's brand-adjacent rather than intent-aligned:

- `/racing-guide/` H1: `Racing Guide` (gradient-styled, single phrase)
- `/training/` H1: `Training Programs` (single phrase, no "Hyrox")
- `/blog/` H1: `Blog` (one word)
- `/calculator/` H1: `Race Time Predictor` (no "Hyrox")

The visible `<h1>` should include the primary keyword and clarify intent. *"The H1 must match search intent"* (skill rule). Title tags are fine; H1s are weak. Quick fixes:

- `/racing-guide/` → `The Hyrox Racing Guide` or `How Hyrox Works — A Complete Racing Guide`
- `/training/` → `Hyrox Training Programs — Beginner to Advanced`
- `/blog/` → `Hyrox Blog — Training, Strategy, and Race Recaps`
- `/calculator/` → `Hyrox Race Time Predictor`

### 6. Author / E-E-A-T inconsistency

The site has real editorial team identity (James, Adam, Max are named on the calculator methodology) and an `/author/` index, but most pages either:

- Don't pass an `author` prop at all (BaseLayout defaults to no author)
- Pass `author = "HyroxGuide Team"` via `JsonLd.astro` default
- Or pass the actual editorial team name on a few cornerstone pages

The supplement [slug] page line 165 even prints visible "HyroxGuide Editorial Team" footer text — but the brand is HyroxVault. Cleaning this up is part of the brand-unification fix and the E-E-A-T signal at the same time.

The `content-style.mdc` rule says author should stay `HyroxVault Editorial Team` until the team identity strategy changes. Most pages don't follow this.

### 7. Cannibalization risks

Two pairs to watch:

- **`/workouts/` vs `/training/workouts/`** — both about "Hyrox workouts". Different intent? `/workouts/` is named benchmark tests; `/training/workouts/` is a sample workout library. The naming is confusing and Google can't tell them apart easily. Consider:
  - Rename `/training/workouts/` to `/training/sample-workouts/` or `/training/sessions/`, OR
  - Merge the two and pick one URL as canonical
- **`/compare/hyrox-vs-crossfit/` vs `/blog/hyrox-vs-crossfit/`** — `/compare/index.astro` line 41-54 explicitly links to a blog post that competes for the same query. If `/compare/hyrox-vs-crossfit/` exists, the blog version cannibalizes it. Verify with `Glob` and decide — usually the comparison page wins; redirect or noindex the blog version.

### 8. Schema accuracy on training-plans

`src/pages/training-plans/[slug].astro` declares `schemaType="Article"` but emits an inline `ItemList` schema for the weeks. The Article + FAQ + ItemList combo is fine, but the `Article` headline matches `plan.metaTitle` rather than `plan.title`. Minor — verify the metaTitle is unique enough to be a valid headline. Otherwise drop `Article` and lead with `Course` or `ExercisePlan` (Schema.org has no perfect type, as the comment notes — `Course` is the closest legitimate match for a training program).

### 9. Footer link typo / mismatch

In `src/components/Footer.astro` line 24, footer links to `/hyrox/` ("Hyrox Cities"). This sits under "Tools" alongside the calculator and benchmarks — the labelling is misleading. "Hyrox Cities" is not a tool; it's a location hub. Move under "Discover" or its own category.

### 10. Robots / sitemap hygiene

`robots.txt` is permissive (`Allow: /`). Sitemap-noindex exclusions in `astro.config.ts` are well-handled (`STATIC_NOINDEX_PATHS`, `NOINDEX_PREFIXES`, `unpublishedResultsPaths`, `scheduledBlogPaths`). This is best-in-class. **No fix needed.**

`<meta name="robots" content="index, follow">` is set globally in BaseLayout. Good. The `noindex` prop wires through correctly. No issues.

---

## Per-page audits

### 1. Homepage `/` — `src/pages/index.astro`

**Page type / intent:** Brand homepage (mixed informational + navigational). Captures brand + "hyrox guide / vault" navigational queries plus a small slice of "what is hyrox" informational.

**Above the fold:**
- H1: "The Hyrox Vault" (brand-only) — weak intent signal
- Subhead: "Everything you need to race, train, and fuel your best Hyrox" — good promise
- 7-link primary nav grid + course ribbon — good
- 3 stat tiles ("8 Stations / 8 km / 30+ Countries") — good trust cue

**Information gain:** Decent. The course ribbon visual + "8 km, 8 stations, same format worldwide" framing is useful. Could be stronger.

**Trust signals:** Weak. No author/team mention, no "since" date, no methodology link, no "as featured in" or backlink. The hero badge "Independent Hyrox Resource" is the only credibility cue.

**Internal links:** Strong — primary nav (7) + course ribbon + supplement strip (6 buy buttons) + blog teaser (3 latest posts) + Vault module cards (7 modules). Hub-and-spoke is healthy.

**Metadata:**
- Title: `Hyrox Vault — Training Plans, Race Calculator & Hyrox Gym Finder` (60 chars — good)
- Description: 280 chars — too long, will be truncated. Aim for 150-160.

**Structured data:** Defaults to `WebSite` (correct for homepage). Could add `Organization` schema with `sameAs` links to social profiles for brand entity clustering.

**Affiliate hygiene:** Supplement strip placed after the value section (Vault modules, blog), with disclosure inline. Acceptable. Could be stronger if disclosure was placed *before* CTAs, not after.

**Fixes (priority):**
- HIGH: Replace brand-only H1 with intent-aligned H1 like `The Hyrox Vault — Training, Calculator, Gym Finder & Fuelling`. Visual styling can stay the same; just expand the text.
- MEDIUM: Tighten meta description to 150-160 chars.
- MEDIUM: Add Organization schema with `sameAs` social URLs for entity clustering.
- LOW: Add a single trust cue above the fold (e.g. "Built by HyroxVault Editorial Team — racers and coaches").

**Verdict:** Pass with minor revisions. No major risks.

---

### 2. `/racing-guide/` — `src/pages/racing-guide/index.astro`

**Page type / intent:** Hub page for the "what is hyrox" / "how does hyrox work" informational cluster.

**Above the fold:**
- H1 `Racing Guide` (gradient, brand-only) — weak
- Decent intro paragraph
- 5 guide cards (`what-is-hyrox`, `stations`, `categories`, `race-day-tips`, `times`) with "Start Here" badge on first

**Information gain:** Strong vs competitors. The First-race essentials section + Official Resources external links section are unusual and useful — most competing pages don't link out to official rules / find-a-race / world rankings. That's a genuine information-gain advantage.

**Trust signals:** Missing. No author, no last-updated. The cluster is informational so YMYL risk is low, but date freshness still matters for race rules.

**Internal links:** Good upward (hub cards), good lateral (First race essentials → 6 blog deep-dives), good outward (4 official Hyrox URLs with `noopener noreferrer`). Excellent link architecture.

**Metadata:**
- Title: `Hyrox Racing Guide — Format, Stations, Categories & Race Day Tips` (66 chars — good)
- Description: 156 chars — good

**Structured data:** None passed (defaults to `WebSite` via JsonLd default). Should be `CollectionPage` with `mainEntity` listing the guide pages.

**Fixes:**
- MEDIUM: H1 `Racing Guide` → `The Hyrox Racing Guide — Format, Stations, Race Day`
- MEDIUM: Add visible breadcrumbs and JSON-LD breadcrumbs
- LOW: Add `dateModified` and a "Last reviewed" line under the H1
- LOW: Schema type → `CollectionPage`

**Verdict:** Pass with minor revisions. Strong content/architecture.

---

### 3. `/training/` — `src/pages/training/index.astro`

**Page type / intent:** Hub for training programs + sample workouts + station playbooks.

**Above the fold:**
- H1 `Training Programs` (gradient, brand-only) — weak
- Strong intro framing the "you can't wing a sled push" angle
- 3 prominent featured CTAs (Sample Workouts, Find a Gym, Goal-time plans) — strong
- Multi-week programs grid (3 cards: Beginner / Intermediate / Advanced)

**Information gain:** Very strong. Specialized guides + per-station blog deep-dives + "Train without a gym" + race-prep workouts. The breadth and specificity exceed most competing pages.

**Trust signals:** Missing. No author byline, no methodology link, no last-updated. Difficulty labels are concrete ("8 weeks · First Hyrox", "Sub 1:10 / 1:20") which is good editorial credibility.

**Internal links:** Excellent — links to sample workouts, gym finder, training plans hub, station blog deep-dives, no-gym track, race-prep simulations. Lateral and downward density is great.

**Metadata:**
- Title: `Hyrox Training Plans — Beginner, Intermediate & Advanced Programs` (66 chars — good)
- Description: 117 chars — could be richer

**Structured data:** None (defaults to WebSite). Should be `CollectionPage`. With 3 nested ItemLists (Multi-week, Specialized, Topic), nested ItemList markup is overkill — `CollectionPage` alone is enough.

**Fixes:**
- MEDIUM: H1 → `Hyrox Training Programs — Beginner to Advanced`
- MEDIUM: Add author / methodology link line under intro (link to `/methodology/`)
- LOW: Add `dateModified`, `CollectionPage` schema, breadcrumbs
- LOW: Tighten meta description to include "no-gym options" or "station drills" — current desc is generic

**Verdict:** Pass with minor revisions. Top-tier hub content.

---

### 4. `/supplements/` — `src/pages/supplements/index.astro`

**Page type / intent:** Affiliate commercial hub. Mix of informational (why supplements matter) and transactional (geo buy buttons).

**Above the fold:**
- H1 `Supplements for Hyrox Athletes` — good, intent-aligned
- Strong subhead with hard claim ("60–120 minutes... measurable edge")
- Methodology link in subhead — strong E-E-A-T
- Three CTAs (Why it matters / Top Picks / Race Day Protocol) — well-balanced

**Information gain:** Very strong. The "Why supplements actually matter for Hyrox" section, evidence grade callouts (`Grade A evidence`), specific dosages (5g creatine, 200mg caffeine), and ranked stack with timing are genuinely better than the average affiliate listicle. This page would be useful even if every affiliate link were removed — passes the skill's affiliate test.

**Trust signals:** Strong. "Reviewed by Max against ISSN, ACSM, and IOC consensus", methodology link, evidence grades, transparent affiliate disclosure block at the bottom. The disclosure repeats inline in the supplement strip.

**Internal links:** Good (upward to home, downward to category pages, lateral to /methodology/, /supplements/protocol/).

**Affiliate hygiene:** Strong overall. Disclosure pattern is good. CTAs come *after* the why-it-matters section (value before monetization). The Editor's Picks section places product CTAs before the full ranked stack which is the only minor weakness — but the page has so much above-CTA value that this is acceptable.

**Metadata:**
- Title: `Hyrox Race-Day Fuelling: Gels, Electrolytes & Caffeine Timing (2026)` (66 chars — good)
- Description: 174 chars — slightly long but content-rich

**Structured data:** Defaults to WebSite. Could be `CollectionPage` with item list of supplement guides + a separate `FAQPage` for the visible Q&A blocks (currently no FAQ schema is set).

**Fixes:**
- LOW: Add visible breadcrumbs
- LOW: Schema → `CollectionPage` + add `FAQPage` for the "Why it matters" / "Race Day Protocol" callouts
- LOW: Add `dateModified` field

**Verdict:** Pass. Strongest hub on the site.

---

### 5. `/gyms/map/` — `src/pages/gyms/map.astro`

**Page type / intent:** Local/discovery hub — find Hyrox-affiliated gyms by country.

**Above the fold:**
- H1 `Hyrox Gym Finder` — concise, brand-aligned
- Subhead with hard counts (`{totalGyms} hand-verified... {countries.length} countries`) — strong
- Interactive map (React, `client:only`) — good UX, but **not crawlable**
- Below-the-fold: indexable directory grouped by region → country → gym (US sub-grouped by state)

**Information gain:** Strong. Few competitors have an interactive map plus a fully indexable directory. The 4-category framework (Official ATC / Chain partner / CrossFit box / Boutique) is genuinely useful and the FAQ block answers real searcher questions.

**Trust signals:** Strong. "hand-verified", "reviewed quarterly", explicit warning to verify on the official ATC directory before visiting (skill rule: appropriate caution for trust-sensitive content). Honest about list change frequency.

**Internal links:** Strong — every region/country expander links to country detail page, every gym links to its individual detail page (some have indexable pages, others fall back to city hub via redirects). Submit-a-gym CTA in the sidebar.

**Affiliate hygiene:** N/A (no affiliate links on this page).

**Metadata:**
- Title: `Hyrox Gym Finder — Interactive Map of Hyrox-Affiliated Gyms Worldwide \| Hyrox Vault` (~95 chars — too long, will truncate)
- Description: dynamically built — typically 220+ chars after interpolation. **Too long.** Will truncate.

**Structured data:** Has FAQ (3 questions) + breadcrumbs. WebSite schema. Could add `Place` / `LocalBusiness` schema for gyms but that's better placed on individual gym detail pages, not the index.

**Fixes:**
- HIGH: Tighten title to ~60 chars (e.g. `Hyrox Gym Finder — Interactive Map (Worldwide)`) and meta description to 150-160.
- LOW: Add `dateModified` (the "reviewed quarterly" claim should be backed by a visible last-reviewed date — match the `/records/` pattern)

**Verdict:** Pass. Strong execution; just trim title and add date.

---

### 6. `/calculator/` — `src/pages/calculator.astro`

**Page type / intent:** Free tool. Mixed transactional (use the tool) + informational (methodology, goal-time guides).

**Above the fold:**
- Breadcrumb (visible)
- H1 `Race Time Predictor` (gradient) — **missing "Hyrox"**
- Brief subhead
- React calculator immediately visible — perfect tool-page UX (calculator before content)

**Information gain:** Very high. The free tool itself is differentiated (no major Hyrox competitor offers a 5K + bench + deadlift → predicted finish + station splits + Open/Pro/Doubles toggle + age-graded variants). Plus methodology section, "where the model is weak" honest limitations, embed widget for other sites (link-bait), and goal-time blueprints. This is one of the strongest tool pages I've audited.

**Trust signals:** Excellent. Methodology section names real contributors (James, Adam, Max), describes the model's accuracy band (±5-15 minutes), and explicitly calls out where it's wrong. This is textbook honest E-E-A-T.

**Internal links:** Excellent — to sled push watts calculator, world records, race-day checklist, age-N pages, sub-60/75/90 blueprints, training programs, time benchmarks.

**Metadata:**
- Title: `Hyrox Race Time Predictor — Predict Your Finish Time (2026)` (61 chars — good)
- Description: 175 chars — slightly long

**Structured data:** None — could add `SoftwareApplication` schema to clarify "this is a free tool". Optional, not critical.

**Fixes:**
- HIGH: H1 `Race Time Predictor` → `Hyrox Race Time Predictor` (one-word add, big keyword win)
- MEDIUM: Add JSON-LD breadcrumbs (visible breadcrumbs already present)
- MEDIUM: Add `SoftwareApplication` schema with `applicationCategory: "Health & Fitness"` and free pricing
- LOW: Trim meta description by ~15 chars

**Verdict:** Pass. Top-3 page on the site by SEO strength after the H1 fix.

---

### 7. `/blog/` — `src/pages/blog/index.astro`

**Page type / intent:** Blog index / hub.

**Above the fold:**
- H1 `Blog` (gradient, single word) — extremely weak
- Generic subhead

**Information gain:** Low for the *index page itself*. The page is a paginated list of posts. No introductory editorial framing, no curated "best of" section, no "start here" recommendation for new readers. It's purely a sorted feed.

**Trust signals:** None on the index. Posts themselves carry author/date.

**Internal links:** Categories + active series + featured post + recent posts grid. Good architecture, but nothing to capture brand search "hyrox vault blog" beyond the post titles.

**Metadata:**
- Title: `Hyrox Blog — Training Tips, Race Strategy & News` (50 chars — good)
- Description: 110 chars — slightly thin

**Structured data:** WebSite default. Could be `Blog` schema with `blogPost` list, but Google doesn't reward blog index schema heavily.

**Fixes:**
- HIGH: H1 → `Hyrox Blog — Training, Strategy, and Race Recaps` (or similar — needs at least 5 words including "Hyrox")
- MEDIUM: Add a 1-2 sentence editorial intro under the H1 explaining what the blog covers and how it's organized
- LOW: Consider a "Start here" callout linking to 3 cornerstone posts before the post grid

**Verdict:** Revise. Functionally fine but leaves CTR on the table for "hyrox blog" / "hyrox training tips" / "hyrox news" queries.

---

### 8. `/events/2026/` — `src/pages/events/[year]/index.astro`

**Page type / intent:** Calendar hub with strong commercial / informational mix (people search "hyrox 2026 calendar" / "hyrox events near me").

**Above the fold:**
- Visible breadcrumbs
- H1 = title (`Hyrox 2026 Events Calendar — Full Race Schedule by City`) — duplicates the title tag verbatim
- Subhead = description (also duplicates meta description) — duplicates twice

**Information gain:** Strong — direct list of upcoming + past events with venue and date. Race report links for completed events. Useful at a glance.

**Trust signals:** Implicit (data sourced from event records). No "last updated" visible. For a calendar page, freshness is *critical* — readers need to know how recently it was checked.

**Internal links:** Each event card → event detail page. Solid.

**Metadata:**
- Title: `Hyrox 2026 Events Calendar — Full Race Schedule by City \| Hyrox Guide` (66 chars + suffix → ~72 — slightly over the line) — also "Hyrox Guide" suffix here, "Hyrox Vault" elsewhere. **Brand inconsistency.**
- Description: 137 chars — good

**Structured data:** Article + breadcrumbs. **Wrong** — this is a calendar/list page. Should be `CollectionPage` with `mainEntity: ItemList` of events. Even better: add `Event` schema for each upcoming event (with `name`, `startDate`, `location.address`, `eventStatus`). Big rich-result opportunity for event search.

**Fixes:**
- HIGH: Add `Event` schema for each upcoming event in the year — major rich-result opportunity for "hyrox 2026 [city]" queries
- HIGH: H1 should be different from title (e.g. title = `Hyrox 2026 Events Calendar — Full Race Schedule by City`, H1 = `Every Hyrox 2026 Race — City, Date, Venue`) — title and H1 should reinforce, not duplicate
- MEDIUM: Add visible "Last updated" near the top — calendar freshness matters more than anywhere else
- MEDIUM: Schema type Article → CollectionPage
- LOW: Brand suffix `\| Hyrox Guide` → `\| Hyrox Vault`

**Verdict:** Revise. Has the bones of a strong calendar hub; missing the structured event markup that would unlock rich results.

---

### 9. `/times/` — `src/pages/times/index.astro`

**Page type / intent:** Index of finish-time benchmarks by category × age group.

**Above the fold:**
- H1 = title (very long) — duplication
- Brief subhead
- One-paragraph prose

**Information gain:** Low for the *index*. The page is a directory of links to the per-(category, age) detail pages. Each cell shows a single number (formatHMS finish). No comparative table at index level, no "what's a good time overall" section.

**Trust signals:** None visible. The detail pages have FAQ schema; the index has nothing.

**Internal links:** Strong downward (every age × category cell links to a detail page). Lateral mention of `/calculator/` is good.

**Metadata:**
- Title: `Hyrox Finish Times by Category and Age Group \| Hyrox Guide` (60 chars — good)
- Description: 195 chars — too long

**Structured data:** Article (wrong — this is an index). Should be `CollectionPage`. The detail pages already emit `Dataset` schema, so the index doesn't need to repeat that.

**Fixes:**
- HIGH: Add a "What's a good Hyrox time?" answer section above the tables — even 100 words answering the broad query will let this index rank for `good hyrox time` itself, not just route users to detail pages
- HIGH: Schema Article → CollectionPage
- MEDIUM: Add visible breadcrumbs
- MEDIUM: Add a "Quick benchmarks" overview table at the top showing avg / good / podium for the most common (Open Men 30-39) before the per-category breakdown
- LOW: Brand suffix unify

**Verdict:** Revise. The detail pages are excellent; the index is anaemic and capture-blind for the broadest query in the cluster.

---

### 10. `/stations/` — `src/pages/stations/index.astro`

**Page type / intent:** Index of station standards pages.

**Above the fold:**
- H1 = title (`Hyrox Stations — Weights, Standards, and Technique`) — long
- Brief subhead

**Information gain:** Low for the index. 8 station cards, each showing position + name + distance/reps. No comparison table at-a-glance, no division weight overview, no "official Hyrox rules" external link.

**Trust signals:** None on the index.

**Internal links:** 8 downward to detail pages. Could benefit from upward to /racing-guide/stations/ (the prose explainer) and lateral to /times/ (pacing per station).

**Metadata:**
- Title: 60 chars — good
- Description: 230 chars — too long

**Structured data:** Article (wrong). Should be `CollectionPage`.

**Fixes:**
- HIGH: Add an at-a-glance comparison table at the top showing all 8 stations × division weights (Open M / Open W / Pro M / Pro W) before the cards. This single table is the most-searched fact in the Hyrox SEO space and would capture "hyrox station weights" / "hyrox sled push weight" / etc. as a single page.
- HIGH: Schema Article → CollectionPage
- MEDIUM: Add visible breadcrumbs
- MEDIUM: Trim meta description
- MEDIUM: Add internal link upward to `/racing-guide/stations/` and lateral to `/times/`

**Verdict:** Revise. Currently leaving major informational query traffic on the table.

---

### 11. `/gear/` — `src/pages/gear/index.astro`

**Page type / intent:** Affiliate commercial hub for shoes / apparel / accessories / home gym.

**Above the fold:**
- Visible breadcrumbs
- H1 `Hyrox Gear Guide` — good
- Subhead with methodology link — strong E-E-A-T cue
- "Every recommendation is tested by the editorial team before it ships" — claim that needs to be backed up. The `/methodology/` link is the support; OK if methodology page details the testing process.

**Information gain:** Decent. The "buying guides" + "shoe comparisons" + "equipment comparisons" three-bucket structure is useful. Lacks an "editor's picks" callout (what supplements has) for buyers in a hurry.

**Trust signals:** Methodology link is the main one. Authors/team not mentioned visibly. Affiliate disclosure missing on this index page (it appears on individual gear pages).

**Internal links:** 4 buying guides + N shoe comparisons + N equipment comparisons + lateral to `/blog/hyrox-shoe-rules/` and `/compare/`. Good.

**Affiliate hygiene:** No buy buttons on the index — readers click into a comparison/guide page. This is correct: index gives value first, then routes to specific recommendations.

**Metadata:**
- Title: `Hyrox Gear Guide — Shoes, Apparel, Accessories & Comparisons \| Hyrox Vault` (~75 chars — slightly over)
- Description: 145 chars — good

**Structured data:** Article + breadcrumbs (wrong type — should be `CollectionPage`).

**Fixes:**
- HIGH: Add an explicit affiliate-disclosure block on the index page (currently only on detail pages)
- MEDIUM: Schema Article → CollectionPage
- MEDIUM: Add an "Editor's Picks" 3-card section at the top (top shoe / top accessory / top home-gym item) for transactional intent
- LOW: Trim title to ~60 chars

**Verdict:** Revise.

---

### 12. `/workouts/` — `src/pages/workouts/index.astro`

**Page type / intent:** Hub for named benchmark workouts (Hyrox simulations, race-pace tests).

**Above the fold:**
- Visible breadcrumbs
- H1 `Hyrox Benchmark Workouts` — concise, intent-aligned
- Strong subhead

**Information gain:** Promotes `/training/workouts/` (the 23-session library) at the top, then lists the named benchmark workouts. The promotional CTA is large — it's bigger than the actual page content. This is **internal cannibalization risk**: two pages, similar audience, but the index here mostly redirects readers to the other page.

**Trust signals:** None visible. The named workouts presumably have dates / authors on their detail pages.

**Internal links:** One big lateral to `/training/workouts/` + N downward to individual workout pages.

**Metadata:**
- Title: `Hyrox Benchmark Workouts — Named Tests, Simulations, and Bench Markers \| Hyrox Vault` (~85 chars — too long)
- Description: 152 chars — good

**Structured data:** Article (wrong — should be `CollectionPage`).

**Fixes:**
- HIGH: Resolve cannibalization with `/training/workouts/`. Either:
  - Merge: keep one URL, redirect the other
  - Differentiate clearly: `/workouts/` becomes "named benchmark tests for Hyrox" (Compromised Running, race-pace tests), `/training/workouts/` becomes "training session library" (Norwegian 4×4, station drills). Make sure titles, descriptions, and internal links reflect the split.
- HIGH: Trim title — currently too long
- MEDIUM: Schema Article → CollectionPage
- LOW: Move the big `/training/workouts/` CTA below the named-workouts grid so the index's own value lands first

**Verdict:** Revise. Cannibalization needs to be resolved before this page can rank cleanly.

---

### 13. `/compare/` — `src/pages/compare/index.astro`

**Page type / intent:** Index of Hyrox-vs-other comparison pages.

**Above the fold:**
- H1 = title (very long)
- Subhead = description (also long)
- Both duplicated → wasted above-fold real estate

**Information gain:** Low for the index. Just a grid of comparison cards. No "how to pick" framing, no decision matrix, no "I'm a runner — should I do Hyrox?" navigation aid.

**Trust signals:** None visible.

**Internal links:** N downward + 1 lateral to `/blog/hyrox-vs-crossfit/` — the latter is a **cannibalization risk** if `/compare/hyrox-vs-crossfit/` exists.

**Metadata:**
- Title: `Hyrox Comparisons — vs Marathon, F45, Orangetheory, Spartan, DEKA, CrossFit and More \| Hyrox Guide` — **~100+ chars, will truncate hard in SERPs**
- Description: 287 chars — too long

**Structured data:** Article (wrong — should be `CollectionPage`).

**Fixes:**
- CRITICAL: Title length. Replace with `Hyrox vs Other Fitness Events — Compare Race Formats` (~50 chars). Use the body to enumerate the comparisons.
- CRITICAL: Resolve cannibalization between `/compare/hyrox-vs-crossfit/` and `/blog/hyrox-vs-crossfit/`. Verify both exist; pick canonical; redirect/noindex the other.
- HIGH: H1 different from title (e.g. `Hyrox vs Other Fitness Events`, then a short paragraph framing the choice)
- MEDIUM: Add a "Which is right for you?" decision-tree section before the card grid — capture the upstream "should I do hyrox" query
- MEDIUM: Schema Article → CollectionPage

**Verdict:** Revise — title length is doing real damage right now.

---

### 14. `/records/` — `src/pages/records/index.astro`

**Page type / intent:** Reference page for Hyrox world record times.

**Above the fold:**
- Visible breadcrumbs
- "Last reviewed" date — strong
- H1 `Hyrox World Records — Open, Pro, Doubles, Relay` — clean, intent-aligned
- Subhead with citation to results.hyrox.com

**Information gain:** Strong. Per-division tables, per-event source links, "How we verify a record" section explicitly stating the methodology, "What counts as a world record" section setting expectations honestly. The cross-reference link to `results.hyrox.com` for every record is excellent trust signaling.

**Trust signals:** Best on the site. `Last reviewed` date (uses `RECORDS_LAST_REVIEWED` constant), citations on every record, explicit methodology section, honest "Hyrox doesn't maintain a centralized record book" disclosure. This page is a model.

**Internal links:** Lateral to `/calculator/` (peer benchmark CTA) and `/times/` (age group benchmarks). Good.

**Metadata:**
- Title (head): `Hyrox World Records 2026 — Fastest Times by Division \| Hyrox Vault` (~67 chars — good)
- H1 (page): `Hyrox World Records — Open, Pro, Doubles, Relay` (different from title — good)
- Description: 142 chars — good

**Structured data:** Article + FAQ + breadcrumbs. Article is borderline-acceptable here (the page does have meaningful authored prose). Could optionally add `Dataset` schema for the records tables.

**Fixes:**
- LOW: Optionally add `Dataset` schema for the record tables themselves
- LOW: Add explicit author / editorial team line

**Verdict:** Pass. **Use this page as the reference for what other hubs should look like.**

---

### 15. `/glossary/` — `src/pages/glossary/index.astro`

**Page type / intent:** Index of Hyrox terms with definitions.

**Above the fold:**
- Visible breadcrumbs
- H1 `Hyrox Glossary` — clean
- Subhead

**Information gain:** Low *for the index*. Each term card shows term + shortDefinition then forces a click for the full definition. The index page itself doesn't rank for "hyrox glossary" any harder than a competing page that puts all definitions inline.

**Trust signals:** None visible. Glossaries are low-trust-risk so this is fine.

**Internal links:** N downward to /glossary/[slug]/ pages. No upward / lateral / cross-cluster links.

**Metadata:**
- Title: `Hyrox Glossary — Every Hyrox Term Explained \| Hyrox Vault` (~57 chars — good)
- Description: 168 chars — slightly long

**Structured data:** Article (wrong — `DefinedTermSet` is the correct schema for a glossary, with each entry as `DefinedTerm`).

**Fixes:**
- HIGH: Render the *full* definition inline on the index, not just `shortDefinition`. Make the index the canonical glossary; the per-term pages can be the deep links for share/anchor purposes. This dramatically increases the page's information density.
- HIGH: Schema → `DefinedTermSet` with each glossary entry as a `DefinedTerm`. This is one of the rare cases where structured data has a direct rich-result mapping.
- MEDIUM: Add A-Z navigation jumplinks (`#term-doubles`, `#term-no-rep`, etc.) so readers can jump within the page
- LOW: Add a few cross-cluster links — e.g. roxzone link to `/racing-guide/race-day-tips/`, doubles to `/training-plans/` doubles plan

**Verdict:** Revise. Quick architectural change unlocks meaningful organic capture.

---

### 16. `/times/[category]/[ageGroup]` — sample `/times/men/40-44/` — `src/pages/times/[category]/[ageGroup].astro`

**Page type / intent:** Programmatic informational page answering "what's a good Hyrox time for [division] [age]". Highest-volume programmatic surface area on the site (CATEGORIES × AGE_GROUPS = several dozen pages).

**Above the fold:**
- Visible breadcrumbs
- H1 dynamically generated, intent-aligned (`What's a Good Hyrox Time for Open Men 40-44?`)
- Subhead with the direct numeric answer (`average ~1:32:00. Good is ~1:24:30; podium-level ~1:14:50`)
- 3-tile summary (Average / Good / Podium times) — perfect direct-answer above-fold

**Information gain:** Very high. Each (category, age) tuple gets:
- A unique direct numeric answer
- Tier table (5 tiers) calibrated to that combination
- Per-station pacing splits computed from the model
- Category-specific guidance (`CATEGORY_GUIDANCE`)
- Age-specific guidance (`AGE_GUIDANCE`)
- Pacing plan with per-phase targets
- "Closest matching goal-time guide" cross-link
- Dataset schema with the 5 tier values

This is one of the few legitimate programmatic-SEO templates — every page genuinely has unique, useful, query-specific value (per skill rule).

**Trust signals:** Implicit through data ("aggregated medians across the 2024-2025 racing seasons" claim). No author or methodology link visible on the page. Should add a methodology link at minimum.

**Internal links:** Strong — to per-station blog deep-dives, to `/training/stations/`, to `/supplements/protocol/`, to closest goal-time guide, to other age groups (same category), to other categories (same age group). Excellent lateral linking.

**Metadata:**
- Title: dynamic, ~80-95 chars after suffix — borderline; some combinations will truncate
- Description: dynamic, ~180-210 chars — too long for some combinations

**Structured data:** Article + FAQ + breadcrumbs + Dataset (4 separate scripts). Solid; FAQ is *unique per page* per the comment in the code (line 60-62), preventing FAQ duplication across the 56 pages — this is the right approach.

**Affiliate hygiene:** N/A.

**Fixes:**
- HIGH: Tighten the dynamic title and description templates. Aim for ≤60 chars title and ≤155 desc *after* the brand suffix.
- HIGH: Schema type Article → consider `WebPage` or keep Article (the prose body justifies Article better than other index pages — keep it). The `Dataset` schema is the bigger SEO play.
- MEDIUM: Add a methodology link or "How we calculate average times" anchor under the H1 for E-E-A-T
- MEDIUM: Brand suffix is `\| Hyrox Vault` here (correct) — verify all other dynamic templates match

**Verdict:** Pass with minor revisions. Architecturally one of the strongest pages on the site.

---

### 17. `/stations/[station]/standards` — sample `/stations/wall-balls/standards/` — `src/pages/stations/[station]/standards.astro`

**Page type / intent:** Per-station weight/rules/technique reference. Programmatic but bounded (8 stations).

**Above the fold:**
- Visible breadcrumbs
- "Station N of 8 · {distance/reps}" supertitle
- H1 dynamically chosen between weight-focused and rules-focused (clever — `hasWeightStandards` flag changes the title to match real query intent)
- Subhead = `station.overviewText`

**Information gain:** Strong. Per-division weight cards, full no-rep list, step-by-step technique HowTo, link to deep-dive technique blog post if available, lateral to other stations. Each page has unique data + unique technique. No duplicate content across the 8 instances.

**Trust signals:** None visible. Standards / no-reps are fact, but a "verified against official Hyrox rules PDF [date]" line would help.

**Internal links:** Strong downward (lateral to other 7 stations) and lateral (to `/times/`, `/calculator/`, technique deep-dive). Could add upward to `/racing-guide/stations/` (prose explainer).

**Metadata:**
- Title: dynamically built, varies by `hasWeightStandards` flag, typically 70-90 chars after suffix — slightly long
- Description: dynamic, typically 180-220 chars — too long

**Structured data:** Article + FAQ + HowTo + breadcrumbs. **HowTo schema is well-justified here** — `station.howToSteps` are real, step-by-step, executable instructions. Per skill rule: HowTo schema requires real steps. This page passes that test.

**Fixes:**
- HIGH: Tighten dynamic title/description
- MEDIUM: Add "Verified against Hyrox official rules [date]" line under the standards card grid
- MEDIUM: Add upward link to `/racing-guide/stations/`
- LOW: Brand suffix `\| Hyrox Guide` → `\| Hyrox Vault`

**Verdict:** Pass with minor revisions. Strong execution.

---

### 18. `/supplements/[slug]` — sample `/supplements/creatine/` — `src/pages/supplements/[slug].astro`

**Page type / intent:** Affiliate review page. Mixed informational + transactional.

**Above the fold:**
- Visible breadcrumbs
- Category badge + emoji
- H1 = `entry.data.title` (e.g. "Best Creatine for Hyrox 2026") — strong commercial intent match
- Description subhead
- "Last reviewed" date + author byline ("HyroxGuide Editorial Team") — **author name is wrong (HyroxGuide, not HyroxVault)**
- Quick Answer TL;DR box (per category) — good for featured snippets
- Editor's Pick hero card with rating, price, BUY button — **this is too aggressive above the fold for a fully-affiliate page**

**Information gain:** Strong on the body content (reads like genuine editorial — see `creatine.mdx`: ISSN reference, real test of sled push times, honest hedging). The Quick Answer box is unique to each category. The product picks are minimal (1-2 per page). This passes the skill's "still useful if affiliate links removed" test.

**Trust signals:** Strong-medium. `dateModified` visible. Citations to ISSN, Mayo Clinic, peer-reviewed papers (in MDX). HOWEVER: there are TODO comments in the MDX referring to placeholder photos and unattributed quotes ("`{/* TODO: replace with real attributable quote, ideally from a registered sports dietitian we contact for this post. */}`" — `creatine.mdx` line 39). **This is a real signal that the page hasn't been finished to claimed quality.** The author is "HyroxGuide Editorial Team" — wrong brand.

**Internal links:** Strong sidebar (other supplement guides, links to `/training/`). Body has lateral citations.

**Affiliate hygiene:** Mixed. The Editor's Pick hero card is the SECOND thing the reader sees (after the H1/subhead, before any body content). Per skill rule: "Do not place affiliate CTAs before delivering real value." The Quick Answer between H1 and hero softens this — the Quick Answer counts as value. Acceptable but borderline. The closing buy CTA after the article body is fine. Affiliate disclosure is one short line near the hero card and another at the bottom — could be more prominent.

**Metadata:**
- Title: `${pageTitle} \| Hyrox Guide` where `pageTitle` = `entry.data.title` + " 2026 — Tested & Reviewed" (auto-suffix). Total ~70-80 chars — borderline.
- Description: from frontmatter — typically 150-180 chars — generally OK.

**Structured data:** Article + FAQ + Product ItemList. **Product schema includes fabricated `aggregateRating.ratingCount: 47` and an auto-generated `Review` from `p.description`** — this is the spam-class violation flagged at the top of this report.

**Fixes:**
- CRITICAL: Remove the fabricated `aggregateRating` and `Review` from `productSchema` in `[slug].astro` lines 49-62. Either (a) drop those fields entirely (Product schema without ratings is still valid), or (b) implement a real review system that captures legitimate ratings before re-adding the schema.
- CRITICAL: Replace `priceCurrency: "USD"` hardcode with logic that omits or genuinely matches the Amazon TLD per visitor (or just drop the `offers` block entirely — it's not required for Product schema).
- HIGH: Rename author from "HyroxGuide Editorial Team" to "HyroxVault Editorial Team" (matches the project's content-style rule)
- HIGH: Resolve TODO placeholders in MDX content (`creatine.mdx` lines 39, 56) — fabricated quotes/photos in published content is a trust violation
- MEDIUM: Move the Editor's Pick hero card *below* the body content's first 2-3 sections, or place affiliate disclosure prominently between Quick Answer and hero
- MEDIUM: Tighten title — drop the auto " 2026 — Tested & Reviewed" suffix if `entry.data.title` is already strong; keep only when title lacks a year

**Verdict:** Revise — schema fix is critical and blocking publish-readiness. Body content quality is otherwise strong.

---

### 19. `/training-plans/[slug]` — sample top plan — `src/pages/training-plans/[slug].astro`

**Page type / intent:** Per-goal training plan. Programmatic but high-effort per page (real schedule data per plan).

**Above the fold:**
- Visible breadcrumbs
- 4 metadata pills (duration / sessions per week / difficulty / audience)
- H1 = `plan.title`
- `goalSummary` subhead

**Information gain:** Very high. Each plan has: athlete profile, prerequisites, why-it-works rationale, full week-by-week schedule (resolved sessions per day), week notes for difficult phases, weekly volume notes, common mistakes, full session library with cues/duration/details, FAQ section (frontmatter), related calculator goal cross-link, related workouts, related plans. This is publishable-book-chapter level.

**Trust signals:** Implicit through detail level. No author byline visible. No "designed by [coach]" cue.

**Internal links:** Excellent — to related calculator goal, to benchmark workouts in plan, to other plans, to `/calculator/` for tracking progress.

**Metadata:**
- Title: `${plan.metaTitle} \| Hyrox Vault` — varies per plan
- Description: from `plan.metaDescription` per plan

**Structured data:** Article + FAQ + breadcrumbs + ItemList for the weeks. The `ItemList` for weeks is a nice touch but Google doesn't have a clean rich-result for training plans. Schema.org's `Course` or `CourseInstance` would be more accurate — Course has wider search support than custom ItemList.

**Affiliate hygiene:** N/A.

**Fixes:**
- HIGH: Add an author / coach byline ("Designed by [Adam] for the HyroxVault Editorial Team") for E-E-A-T. Plans without a credible designer are hard to trust.
- MEDIUM: Schema → `Course` with `provider`, `hasCourseInstance`, `numberOfCredits` (or weeks). Drop or supplement the inline ItemList.
- LOW: Add a "Last reviewed" / `dateModified` per plan once content stabilizes

**Verdict:** Pass with minor revisions. Author byline is the main gap.

---

### 20. `/racing-guide/[slug]` — sample top guide — `src/pages/racing-guide/[slug].astro`

**Page type / intent:** Long-form informational guide (MDX content). Cornerstone informational pages.

**Above the fold (via GuideLayout):**
- Visible breadcrumbs (left of viewport)
- H1 from frontmatter
- Description subhead
- Optional illustration (right side)
- Mobile guide-nav details element
- Sticky sidebar (desktop) with module links

**Information gain:** Strong — MDX content quality per `what-is-hyrox.mdx` is editorial-grade with real explanation of format, embedded `RaceFlowVisual` component, FAQ schema in frontmatter, multiple long sections.

**Trust signals:** Mixed. The MDX `faqs:` block is well-structured per the content-style rule. But:
- `showMeta = false` is the default in GuideLayout — published date and author are NOT shown on guide pages even when the frontmatter has them
- `racing-guide` collection schema (per content/config) doesn't capture `dateModified` field — content can't be marked as freshness-checked
- No visible author byline by default

**Internal links:** Inline editorial links in MDX (good). `GuideCrossSell` component below adds standard cross-sells. Sidebar has fixed module links. Could be stronger lateral linking inside MDX.

**Metadata:**
- Title: `${entry.data.title} \| Hyrox Guide` (suffix is wrong — should be Hyrox Vault)
- Description: from frontmatter

**Structured data:** Article + FAQ (via GuideLayout → BaseLayout). Title goes through the title-suffix path. Article schema is correct here (long-form prose).

**Fixes:**
- HIGH: Brand suffix — `GuideLayout.astro` line 76 hardcodes `\| Hyrox Guide`. Change to `\| Hyrox Vault`.
- HIGH: Default `showMeta = true` for racing-guide — readers want to see "By HyroxVault Editorial Team · Updated [date]" on cornerstone informational content
- MEDIUM: Add `dateModified` to the `racing-guide` collection schema (probably `src/content.config.ts`) and surface on the page
- LOW: Increase lateral linking density inside MDX content (case-by-case; not a template fix)

**Verdict:** Pass with revisions. The brand-suffix fix here cascades to every guide page.

---

## Out of scope / next steps

Pages NOT audited that may deserve a follow-up pass once the top-20 fixes ship:

- `/methodology/` — referenced from many pages; should be audited as the trust-anchor page for the whole site
- `/about/` — referenced from footer; should be audited as the brand-trust page
- `/faq/` — referenced from footer + GuideLayout sidebar
- `/qualifiers/` and `/qualifiers/[slug]/` — programmatic, commercial-adjacent
- `/hyrox/[city]/` — local pages (high cannibalization risk if templates are too thin)
- Individual `/blog/[slug]/` cornerstone posts — sub-60/75/90 blueprints, sled-push technique, etc.
- `/gyms/[city]/` and `/gyms/g/[slug]/` — local programmatic pages
- `/calculator/[slug]/` and `/calculator/age-[age]/` — programmatic calculator goal-time pages

Recommended: a separate audit pass on `/methodology/`, `/about/`, and 5-10 cornerstone blog posts once the top-20 fixes are landed.

---

## Recommended next plan

After this report is reviewed, suggested implementation order:

1. **Phase 1 — Schema/spam fixes (CRITICAL, half a day)**
   - Remove fabricated `aggregateRating` and `Review` from `supplements/[slug].astro`
   - Drop `priceCurrency: "USD"` hardcode or remove `offers` block
   - Brand-name unification across `BaseLayout`, `JsonLd`, `GuideLayout`, page files
2. **Phase 2 — Title/description tightening (low effort, half a day)**
   - Compress over-long titles on `/compare/`, `/gyms/map/`, `/workouts/`, `/gear/`, `/events/[year]/`
   - Trim over-long meta descriptions on the same set
3. **Phase 3 — Hub schema and breadcrumb consistency (1 day)**
   - Article → CollectionPage on 7 hubs
   - Add visible breadcrumbs to hubs missing them
   - DefinedTermSet on `/glossary/`
   - Event schema on `/events/[year]/`
4. **Phase 4 — H1 and trust signals (1 day)**
   - H1 fixes on `/`, `/training/`, `/blog/`, `/calculator/`, `/racing-guide/`
   - "Last reviewed" date on `/times/`, `/stations/`, `/supplements/`, `/gear/`, `/calculator/`
   - Author bylines on hub pages and training-plans
5. **Phase 5 — Information gain and cannibalization (variable)**
   - `/glossary/` inline definitions
   - `/stations/` overview table
   - `/times/` index direct-answer section
   - `/workouts/` vs `/training/workouts/` resolution
   - `/compare/hyrox-vs-crossfit/` vs `/blog/hyrox-vs-crossfit/` resolution
6. **Phase 6 — Content TODOs**
   - Resolve fabricated quote / placeholder photo TODOs in `creatine.mdx` and likely other supplement MDX files

Phases 1-4 are mechanical and can ship together. Phases 5-6 require editorial judgement and should be separate PRs.
