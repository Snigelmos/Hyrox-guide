# Pinterest — Aug-Oct 2026 Workout Batch (20 pins)

Third batch in the workout-card series. Twenty simple, followable Hyrox sessions
rendered as branded cards, two per week for ten weeks, delivered as one
bulk-upload CSV instead of manual pinning.

- **Images:** `public/images/pins/pin-2026-08-01.jpg` ... `-20.jpg`. 1000 x 1500
  JPEG, photographic background plus a text panel carrying the actual session.
- **Copy:** hand-written, no text-model spend. The CSV is the source of truth
  for every title, description and keyword — this document does not repeat them.
- **Cost:** 14 AI backgrounds at low quality = $0.28. The other 6 pins reuse
  existing site heroes from `src/assets/heroes/` and cost nothing.
- **Hosting:** unlike the June batch, these images are committed and deployed.
  Pinterest fetches each row's Media URL from `https://www.hyroxvault.com/images/pins/`,
  so the images must be live before the CSV is uploaded.
- **Anti-spam:** unique image, title and angle per pin; boards rotate so no two
  consecutive pins share one; no session repeats the June batch.

## Boards

All four already exist from the previous batches.

| Board | Pins |
|---|---|
| HYROX Workouts | 6 |
| HYROX Wall Ball and Station Work | 7 |
| HYROX Running Workouts | 5 |
| HYROX Training for Beginners | 2 |

## Posting calendar (Mon + Thu, 09:00)

| # | Date | Workout | Board |
|---|---|---|---|
| 01 | Mon Aug 10 | The 30-Minute Hyrox Starter | Training for Beginners |
| 02 | Thu Aug 13 | Wall Ball Ladder 10-20-30-20-10 | Wall Ball and Station Work |
| 03 | Mon Aug 17 | 5 x 400 m at Race Pace | Running Workouts |
| 04 | Thu Aug 20 | The 20-Minute Hyrox EMOM | Workouts |
| 05 | Mon Aug 24 | SkiErg 6 x 250 m | Wall Ball and Station Work |
| 06 | Thu Aug 27 | Push, Pull, Run Triplet | Workouts |
| 07 | Mon Aug 31 | The 1-2-3-2-1 Treadmill Pyramid | Running Workouts |
| 08 | Thu Sep 3 | The Sled Push Pyramid | Wall Ball and Station Work |
| 09 | Mon Sep 7 | The 4 x 4 Descending Ladder | Workouts |
| 10 | Thu Sep 10 | 80 m of Burpee Broad Jumps | Wall Ball and Station Work |
| 11 | Mon Sep 14 | Half Hyrox, No Equipment | Training for Beginners |
| 12 | Thu Sep 17 | The Run-Station Brick | Running Workouts |
| 13 | Mon Sep 21 | Farmers Carry 4 x 200 m | Wall Ball and Station Work |
| 14 | Thu Sep 24 | All 8 Stations at Half Distance | Workouts |
| 15 | Mon Sep 28 | Sandbag Lunges 4 x 50 m | Wall Ball and Station Work |
| 16 | Thu Oct 1 | Build to 8 x 1 km in 4 Weeks | Running Workouts |
| 17 | Mon Oct 5 | Grip and Go: The Carry Triplet | Workouts |
| 18 | Thu Oct 8 | Heavy Sled Pull 4 x 25 m | Wall Ball and Station Work |
| 19 | Mon Oct 12 | The 40-Minute Easy Run | Running Workouts |
| 20 | Thu Oct 15 | The Sunday Long Grind | Workouts |

## Backgrounds

Six pins reuse an existing site hero rather than a generated image. The crop
anchor (`focus` in `cards_2026_08.py`) decides which part of the landscape frame
survives the crop to 2:3.

| Pin | Hero | Why it fits |
|---|---|---|
| 02 | `training-hero.png` | athlete mid wall-ball throw |
| 08 | `home-hero.png` | sled push in a dark gym |
| 12 | `racing-guide-hero.png` | race lane with a runner and a sled |
| 14 | `gyms-hero.png` | full gym floor with rowers, sleds, kettlebells |
| 19 | `gear-hero.png` | training shoes on a gym floor |
| 20 | `events-hero.png` | finish line at the end of a long effort |

## Uploading

1. Confirm the images are live: open
   `https://www.hyroxvault.com/images/pins/pin-2026-08-01.jpg` in a browser. If
   it 404s, every row in the file will fail.
2. Pinterest business account, desktop. Chevron top-right -> **Settings** ->
   **Import content** -> next to **Upload .csv or .txt file**, click **Upload**.
3. Drop in `marketing/pinterest/pinterest-bulk-2026-08.csv`.
4. Pinterest emails a confirmation and flags any row that needs reformatting.

**If Pinterest rejects the far-out publish dates.** Several sources report the
importer refusing anything more than 14 days ahead. If that happens, re-emit the
batch as five 4-pin files and upload one every fortnight — the images and copy
do not change:

```bash
python build_csv.py --cards cards_2026_08 --split 4
```

## Regenerating

Run from `marketing/pinterest/`.

```bash
# Cost estimate only, nothing charged
python gen_backgrounds.py --prompts cards_2026_08

# Generate the 14 AI backgrounds into _bg/ (only after the cost is approved)
python gen_backgrounds.py --prompts cards_2026_08 --yes

# Composite all 20 cards
python make_cards.py --cards cards_2026_08 --out-dir ../../public/images/pins --format jpg

# One card
python make_cards.py --cards cards_2026_08 --out-dir ../../public/images/pins --format jpg --only pin-2026-08-05

# Rebuild the CSV
python build_csv.py --cards cards_2026_08
```

Everything for this batch — workout content, on-image copy, pin copy, boards,
links, keywords, publish dates and background sources — lives in
`cards_2026_08.py`. `_bg/` is gitignored; the generated backgrounds are
regenerable and cost money, so they are not committed.
