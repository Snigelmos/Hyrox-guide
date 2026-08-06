# Hyrox Vault keyword gap scan, August 2026

Research only. No site source files were changed by this scan.

## Governing thought

Almost every high-value gap identified in Google Search Console already has a page on the site. The constraint is ranking, not coverage. Six existing pages carry 138,000 monthly US searches at a keyword difficulty of 22 or below, and the site sits outside the top 10 for all six. Only one genuinely missing page justifies new work at scale: a results hub for `hyrox results` (12,100/mo, KD 10).

## What was measured

DataForSEO returned search volume, keyword difficulty, CPC, competition, and the top 10 organic results for the 84 gap keywords staged from the GSC analysis. Location was set to the United States (code 2840), language English.

Coverage: 84 of 84 keywords returned volume and difficulty. 70 returned SERP data; 14 fell below the 30/mo volume floor and were skipped before the SERP stage. `hyrox beginner guide` returned no volume at all.

Full per-keyword output: `data/processed/hyrox-keyword-scan.csv`. Cluster scoring: `data/processed/discoveries.csv`.

### Two caveats that change how the numbers should be read

US volume understates two clusters the GSC data flagged. City-qualified gym terms return 10 to 20 searches a month in the US (`hyrox gym london` = 20, `hyrox gym sydney` = 10), yet GSC records `hyrox gym london` at position 46.8 with real impressions. Those impressions are non-US. The same applies to the shoe comparisons: `reebok nano x4 vs nike metcon 9` shows 10 US searches a month against 2,704 GSC impressions. A second scan at UK and German locales would cost about $0.10 and is the logical follow-up.

Current positions below the top 10 come from the GSC figures supplied with the brief. The scan fetched only the top 10 organic results, so it confirms presence in the top 10 and nothing deeper.

## Where a page already exists and only needs to rank better

Ranked by monthly volume multiplied by an achievability factor derived from keyword difficulty and how open the SERP is. These are the cheapest wins because the URL, internal links, and schema already exist.

| # | Target keywords | US vol/mo | KD | Existing URL | Current position | Priority score |
|---|---|---|---|---|---|---|
| 1 | `hyrox workout`, `hyrox workouts` | 49,500 | 2 | `/workouts/` and `/training/workouts` | outside top 10 | 37,100 |
| 2 | `hyrox training plan`, `hyrox training program`, `hyrox training schedule` | 13,760 | 0 | `/training-plans/` | 80 (GSC) | 11,700 |
| 3 | `hyrox near me`, `hyrox gym`, `hyrox gyms`, `hyrox training near me`, `hyrox gyms near me`, `hyrox affiliated gyms`, `hyrox gym finder` | 32,290 | 10 avg | `/gyms/` | 3, 6, 9 in top 10; 12.4 to 26.4 elsewhere (GSC) | 11,300 |
| 4 | `what is hyrox` | 33,100 | 22 | `/racing-guide/what-is-hyrox` | outside top 10 | 9,930 |
| 5 | `hyrox shoes`, `best shoes for hyrox`, `best hyrox shoes` | 8,700 | 0 | `/gear/shoes` | outside top 10 | 6,960 |
| 6 | 8 station terms (`hyrox wall balls` 1,300, `sled push` 880, `sled pull` 880, `burpee broad jump` 480, `ski erg` 390, `farmers carry` 320, `sandbag lunges` 210, `rowing` 210) | 4,720 | 0 to 6 | `/training/stations/<slug>`, `/stations/<slug>/standards` | outside top 10 | 3,780 |
| 7 | `hyrox vs crossfit` | 2,900 | 0 | `/blog/hyrox-vs-crossfit` | outside top 10 | 2,320 |
| 8 | `hyrox times`, `good hyrox time`, `hyrox average time`, `hyrox world record`, `hyrox pro times` | 2,230 | 0 to 9 | `/times/`, `/records/`, `/racing-guide/times` | outside top 10 | 1,560 |
| 9 | `hyrox doubles` | 2,900 | 3 | `/compare/hyrox-singles-vs-doubles`, `/training-plans/hyrox-doubles-training-plan` | outside top 10 | 1,450 |
| 10 | `how to train for hyrox` | 1,600 | 3 | `/training/`, `/training/beginner` | outside top 10 | 1,200 |
| 11 | `hyrox relay` | 1,600 | 5 | `/compare/hyrox-singles-vs-relay`, `/racing-guide/categories` | outside top 10 | 800 |
| 12 | `hyrox rules`, `hyrox equipment` | 1,590 | 7 to 21 | `/racing-guide/rules-equipment` | outside top 10 | 795 |
| 13 | `hyrox tracker`, `hyrox live tracking`, `hyrox athlete tracker`, `hyrox live results`, `hyrox race results`, `hyrox leaderboard` | 1,950 | 15 to 29 | `/live` | 3, 4, 6 for tracker terms | 780 |
| 14 | `hyrox cost`, `hyrox price` | 1,470 | 6 to 25 | `/blog/how-much-does-hyrox-cost` | outside top 10 | 660 |
| 15 | `reebok nano vs nike metcon`, `nike metcon vs nobull` | 340 | 0 to 1 | `/compare/reebok-nano-vs-nike-metcon`, `/compare/nike-metcon-9-vs-nobull-trainer` | outside top 10 | 306 |
| 16 | `hyrox pace calculator`, `hyrox calculator`, `hyrox time calculator` | 270 | 0 | `/calculator` | outside top 10 | 240 |
| 17 | `hyrox gloves`, `hyrox accessories` | 220 | 0 to 8 | `/gear/accessories` | outside top 10 | 175 |
| 18 | `hyrox simulation workout` | 170 | 0 | `/workouts/hyrox-simulation-workout` | outside top 10 | 150 |
| 19 | `hyrox vs deka` | 90 | 0 | `/compare/hyrox-vs-deka` | outside top 10 | 76 |
| 20 | `hyrox gym london`, `hyrox gym new york`, `hyrox gym sydney`, `hyrox gym toronto`, `hyrox gym berlin`, `hyrox gym singapore` | 80 US | 0 to 32 | `/gyms/london`, `/gyms/new-york`, `/gyms/sydney`, `/gyms/toronto`, `/gyms/berlin`, `/gyms/singapore` | 46.8 for London (GSC) | see locale caveat |

### The top three deserve individual comment

**`hyrox workout` is the largest single prize on the site and the SERP is soft.** 49,500 searches a month at KD 2. The top 10 holds hyrox.com, wodwell.com, three individual gym sites (stridefitness, eosfitness, fitnessacademy), Reddit, and Instagram. No publisher of scale defends this. `hyrox workouts` returns the same volume and a near-identical SERP, so treat the pair as one target rather than adding the two figures.

**`hyrox training plan` at position 80 with KD 0 is the clearest failure of execution.** DataForSEO scores the difficulty at zero and the top 10 is gyms and Reddit (stridefitness, puregym, eosfitness, sugarwod, hyroxus). Adding `hyrox training program` (3,600, KD 0, CPC $3.12) and `hyrox training schedule` (260, KD 0), one page addresses 13,760 searches a month against no real defender. Position 80 means the page is effectively unindexed for its head term.

**The gym cluster is the most commercially valuable and the hardest.** Average CPC across the 10 gym keywords is $3.77, the highest of any cluster, and `hyrox gym finder` alone carries an $11.77 CPC. The site already holds position 3 for `hyrox gym finder`, 6 for `hyrox gyms` and `hyrox affiliated gyms`, and 9 for `hyrox gym near me`. It is absent from the top 10 for the four largest terms: `hyrox near me` (9,900), `hyrox gym` (3,600), `hyrox training near me` (3,600), and `hyrox gyms near me` (1,300). Hyrox's own `hyrox-training-finder.hyrox.com` holds position 1 on six of these SERPs and will not be displaced. Position 2 is the realistic ceiling, and the rest of each SERP is individual gym websites, which is winnable.

## Where a new page is needed

| # | Target keyword(s) | US vol/mo | KD | CPC | Suggested slug | Priority score |
|---|---|---|---|---|---|---|
| 1 | `hyrox results` | 12,100 | 10 | none | `/results/` | 4,840 |
| 2 | `hyrox training club` | 2,900 | 26 | $4.22 | `/gyms/training-clubs` | 1,015 |
| 3 | `hyrox wod` | 880 | 0 | $1.58 | `/workouts/hyrox-wod` | 616 |
| 4 | `hyrox training plan pdf` | 210 | 0 | $8.20 | `/training-plans/pdf` | 179 |

**A results hub is the one new page worth building at scale.** `hyrox results` returns 12,100 searches a month at KD 10, and the site has no hub for it. Per-event results live at `/events/[year]/[city]/results` and live tracking at `/live`, but nothing consolidates the intent. The top 10 is hyresult.com, results.hyrox.com, hyroxresults.com, trainrox.com, and hyroxapac.zendesk.com. Specialist sites, not publishers of scale, and the site already ranks 3rd and 4th for the adjacent tracking terms, which shows the topical authority exists.

**`hyrox training club` is Hyrox's own term for an affiliated gym and no page uses it.** 2,900 searches a month at $4.22 CPC. KD 26 is the highest of any recommendation here, and the official training finder holds position 1, but positions 2 through 10 are individual gyms and Facebook.

**`hyrox training plan pdf` is small but carries an $8.20 CPC and a completely open SERP.** Scribd ranks first, followed by puregym, Reddit, tryformd, and hyroxs.com. SERP openness is 1.0. A gated PDF captures email addresses from people who have already decided to train.

**`hyrox wod` needs its own page because wodwell.com owns the term, not hyrox.com.** 880 searches a month at KD 0. The intent differs from `hyrox workout`: users want a single named workout, not a library.

### One cluster to leave alone

`hyrox tickets` (4,400, KD 22) and `hyrox registration` (720, KD 19) look attractive on volume and are not winnable. Six of the six visible results on `hyrox tickets` are hyrox.com or hyroxus.com, giving a SERP openness of 0.2. The intent is navigational to the brand's own checkout. `hyrox divisions` (320, KD 20) should also be parked: its 12-month trend slope is negative 0.28, the steepest decline in the set.

## Three cannibalization problems the scan exposed

Splitting one intent across several URLs explains part of the ranking gap, independent of content quality.

`hyrox workout` intent is split between `/workouts/` and `/training/workouts`. Both target the same 49,500-search term.

`hyrox doubles` intent is split three ways: `/compare/hyrox-singles-vs-doubles`, `/training-plans/hyrox-doubles-training-plan`, and `/racing-guide/categories`. No single page is the canonical answer for a 2,900-search term with a $5.48 CPC. `hyrox relay` has the same problem across `/compare/hyrox-singles-vs-relay` and `/racing-guide/categories`.

`hyrox times` intent is split across `/times/`, `/racing-guide/times`, and `/records/`. Shoe intent is split across `/gear/shoes` and five shoe blog posts, including two that target `wide feet` and `heavy athletes` at 10 US searches a month each.

Consolidating each cluster onto one canonical URL, with the others redirecting or linking up, costs less than writing any new page and addresses the four largest opportunities in the table above.

## Cost of this scan

| Item | Amount |
|---|---|
| Spent on this scan | **$0.051** |
| Paid calls | 12 (9 SERP at $0.002, 3 Google Trends at $0.011) |
| Free cache hits | 63 (search volume, keyword difficulty, and 61 SERPs were already cached) |
| Ledger for 2026-08-06 before | $0.820 |
| Ledger for 2026-08-06 after | **$0.871** |
| Daily cap | raised from $1.00 to $2.00 as approved |
| Headroom remaining today | $1.129 |

The approved estimate was $1.428. Actual spend came in at 3.6% of that for two reasons. The pipeline's internal estimate prices search volume at $0.015 per keyword, while DataForSEO bills a flat $0.075 per call regardless of keyword count, and $0.020 for bulk keyword difficulty. Both of those calls then hit the shared cache and cost nothing. Historical billing pulled from 492 cached responses confirms the flat per-call pricing: SERP $0.002, Google Trends $0.009 to $0.011.

## Recommended sequence

1. Consolidate `/workouts/` and `/training/workouts` onto one URL, then rebuild it for `hyrox workout`. Largest volume, lowest difficulty, soft SERP.
2. Diagnose why `/training-plans/` sits at position 80 for a KD 0 term. Check indexation and internal links before rewriting content.
3. Build `/results/` as a consolidated results hub.
4. Extend `/gyms/` to compete for `hyrox near me` and `hyrox training near me`, and add `/gyms/training-clubs` for the official term.
5. Re-scan the gym city terms and shoe comparisons at UK and German locales, roughly $0.10, before investing in either.
