"""
Pinterest batch — Aug-Oct 2026: 20 simple Hyrox workout pins.

Single source of truth for the batch. Every pin carries three things:

  background  where the photo comes from — either an AI prompt sent to the
              local content API, or an existing site hero reused for free
  card        the copy composited onto the image by make_cards.py
  pin         the Pinterest row emitted by build_csv.py

Two pins a week (Mon + Thu, 09:00) from 2026-08-10 to 2026-10-15. Boards
rotate so no two consecutive pins land on the same board.

Card `style` is one of pairs | bullets | checks — see make_cards.py.
"""

from __future__ import annotations

# Appended to every AI background prompt. The compositor owns all on-image
# copy, so the generated photo must be completely free of text.
STYLE = (
    "Photorealistic, cinematic, dark and moody functional-fitness gym, "
    "desaturated cool tones, dramatic side lighting, shallow depth of field, "
    "athletic and gritty, vertical composition with the main subject in the "
    "lower half of the frame. Absolutely no text, no numbers, no captions, no "
    "watermarks, no brand logos, no signage. One adult athlete unless noted."
)

BOARD_WORKOUTS = "HYROX Workouts"
BOARD_BEGINNERS = "HYROX Training for Beginners"
BOARD_STATIONS = "HYROX Wall Ball and Station Work"
BOARD_RUNNING = "HYROX Running Workouts"

BASE_URL = "https://www.hyroxvault.com"

# `focus` is the horizontal crop anchor (0 = left edge, 1 = right edge) used
# when a landscape hero is cropped to the 2:3 pin frame.
PINS: list[dict] = [
    {
        "id": "pin-2026-08-01",
        "background": {
            "kind": "ai",
            "prompt": (
                "A fit adult athlete mid-stroke on an indoor rowing machine, low "
                "three-quarter angle from the front, strong back and arms, sweat, "
                "dark gym behind."
            ),
        },
        "card": {
            "kicker": "BEGINNER HYROX WORKOUT",
            "title": "THE 30-MINUTE HYROX STARTER",
            "subtitle": "3 rounds \u00b7 no race weight needed",
            "style": "pairs",
            "rows": [
                ["Row", "500 m"],
                ["Wall balls", "15 reps"],
                ["Run", "400 m"],
                ["Burpee broad jumps", "10 reps"],
                ["Rest", "2 min between rounds"],
            ],
            "footer": "3 rounds  \u00b7  25\u201335 min  \u00b7  Scale the ball, not the reps",
        },
        "pin": {
            "title": "30-minute beginner Hyrox workout you can start this week",
            "description": (
                "Three rounds of a 500 m row, 15 wall balls, a 400 m run and 10 burpee "
                "broad jumps, with two minutes rest between rounds. No race weight and no "
                "full station setup - just the first Hyrox session most beginners can "
                "actually finish. Save it for your first training week."
            ),
            "board": BOARD_BEGINNERS,
            "link": f"{BASE_URL}/training/beginner/",
            "keywords": [
                "beginner hyrox workout",
                "hyrox workout for beginners",
                "first hyrox workout",
                "30 minute hyrox workout",
            ],
            "publish": "2026-08-10T09:00:00",
            "alt": (
                "Beginner Hyrox workout card: 3 rounds of a 500 m row, 15 wall balls, "
                "a 400 m run and 10 burpee broad jumps."
            ),
        },
    },
    {
        "id": "pin-2026-08-02",
        "background": {
            "kind": "local",
            "path": "src/assets/heroes/training-hero.png",
            "focus": 0.55,
        },
        "card": {
            "kicker": "WALL BALL SESSION",
            "title": "WALL BALL LADDER: 10-20-30-20-10",
            "subtitle": "90 reps \u00b7 6 kg / 4 kg \u00b7 10 ft / 9 ft target",
            "style": "pairs",
            "rows": [
                ["Set 1", "10 reps"],
                ["Set 2", "20 reps"],
                ["Set 3", "30 reps"],
                ["Set 4", "20 reps"],
                ["Set 5", "10 reps"],
                ["Rest", "1 sec per rep just done"],
            ],
            "footer": "90 reps total  \u00b7  Under 9 min is a solid first score",
        },
        "pin": {
            "title": "Wall ball ladder workout: 90 reps at Hyrox race weight",
            "description": (
                "A wall ball ladder that builds unbroken capacity without wrecking your "
                "shoulders: 10, 20, 30, 20 then 10 reps at 6 kg/4 kg to a 10 ft/9 ft "
                "target, resting one second for every rep you just did. Ninety quality "
                "reps in under 15 minutes. Save it for your next station day."
            ),
            "board": BOARD_STATIONS,
            "link": f"{BASE_URL}/stations/wall-balls/standards/",
            "keywords": [
                "hyrox wall ball workout",
                "wall ball ladder",
                "wall ball training",
                "hyrox wall balls",
            ],
            "publish": "2026-08-13T09:00:00",
            "alt": (
                "Wall ball ladder workout card: sets of 10, 20, 30, 20 and 10 reps at "
                "Hyrox race weight."
            ),
        },
    },
    {
        "id": "pin-2026-08-03",
        "background": {
            "kind": "ai",
            "prompt": (
                "Low-angle view of an athlete's legs and running shoes striding along an "
                "indoor running track lane, motion blur on the feet, dark arena, dramatic "
                "overhead light."
            ),
        },
        "card": {
            "kicker": "HYROX RUNNING WORKOUT",
            "title": "5 x 400 M AT RACE PACE",
            "subtitle": "The session that teaches your legs one speed",
            "style": "pairs",
            "rows": [
                ["Warm-up", "10 min easy + 4 strides"],
                ["Work", "5 x 400 m at goal pace"],
                ["Rest", "60 sec walk between reps"],
                ["Cool-down", "5 min easy"],
            ],
            "footer": "Every 400 within 3 sec of the first  \u00b7  Add a rep next week",
        },
        "pin": {
            "title": "5 x 400 m Hyrox running workout to lock in race pace",
            "description": (
                "Hyrox running is eight separate 1 km efforts at one repeatable pace, and "
                "400 m repeats are the cheapest way to learn it. Run five at goal race pace "
                "with a 60-second walk between, and keep every rep within three seconds of "
                "the first. Add a rep each week. Save it for your next run day."
            ),
            "board": BOARD_RUNNING,
            "link": f"{BASE_URL}/training/running/",
            "keywords": [
                "hyrox running workout",
                "400m repeats",
                "hyrox race pace",
                "hyrox running training",
            ],
            "publish": "2026-08-17T09:00:00",
            "alt": (
                "Hyrox running workout card: 5 x 400 m at goal race pace with a "
                "60-second walk between reps."
            ),
        },
    },
    {
        "id": "pin-2026-08-04",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete standing between efforts in a dark functional-fitness gym, "
                "hands on hips, chest heaving, a wall ball target and a SkiErg machine "
                "visible behind, moody side light."
            ),
        },
        "card": {
            "kicker": "SAMPLE HYROX WORKOUT",
            "title": "THE 20-MINUTE HYROX EMOM",
            "subtitle": "Every minute on the minute \u00b7 20 rounds",
            "style": "pairs",
            "rows": [
                ["Minute 1", "12 wall balls"],
                ["Minute 2", "10 burpee broad jumps"],
                ["Minute 3", "15 cal SkiErg"],
                ["Minute 4", "200 m run"],
                ["Repeat", "5 times through"],
            ],
            "footer": "Rest is whatever's left in the minute  \u00b7  Scale to keep 15 sec back",
        },
        "pin": {
            "title": "20-minute Hyrox EMOM: four stations, twenty rounds",
            "description": (
                "An every-minute-on-the-minute Hyrox session you can run in any gym: 12 "
                "wall balls, 10 burpee broad jumps, 15 calories on the SkiErg, then a 200 m "
                "run, five times through. Your rest is whatever is left in the minute, so "
                "scale the reps to keep 15 seconds back. Save it for a short training day."
            ),
            "board": BOARD_WORKOUTS,
            "link": f"{BASE_URL}/workouts/",
            "keywords": [
                "hyrox emom",
                "20 minute hyrox workout",
                "hyrox workout",
                "functional fitness emom",
            ],
            "publish": "2026-08-20T09:00:00",
            "alt": (
                "20-minute Hyrox EMOM card: wall balls, burpee broad jumps, SkiErg "
                "calories and a 200 m run, five times through."
            ),
        },
    },
    {
        "id": "pin-2026-08-05",
        "background": {
            "kind": "ai",
            "prompt": (
                "Side view of an athlete on a SkiErg machine at the top of the pull, arms "
                "overhead about to drive down, dark gym, sharp rim light on the shoulders."
            ),
        },
        "card": {
            "kicker": "SKIERG SESSION",
            "title": "SKIERG 6 x 250 M",
            "subtitle": "Find the pace you can hold for 1,000 m",
            "style": "pairs",
            "rows": [
                ["Warm-up", "3 min easy ski"],
                ["Work", "6 x 250 m hard"],
                ["Rest", "45 sec standing"],
                ["Target", "All 6 splits within 2 sec"],
            ],
            "footer": "Race pace = your average split + 3 sec per 500 m",
        },
        "pin": {
            "title": "SkiErg 6 x 250 m workout to find your Hyrox race split",
            "description": (
                "The Hyrox SkiErg goes wrong when you open too hard and pay for it on the "
                "sled. Six 250 m efforts with 45 seconds rest teach you a split you can "
                "actually repeat: hold all six within two seconds of each other, then add "
                "three seconds per 500 m for race pace. Save it for station day."
            ),
            "board": BOARD_STATIONS,
            "link": f"{BASE_URL}/stations/skierg/standards/",
            "keywords": [
                "hyrox skierg workout",
                "skierg intervals",
                "skierg pacing",
                "hyrox ski erg",
            ],
            "publish": "2026-08-24T09:00:00",
            "alt": (
                "SkiErg workout card: 6 x 250 m hard with 45 seconds rest, holding all "
                "six splits within two seconds."
            ),
        },
    },
    {
        "id": "pin-2026-08-06",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete pushing a weighted sled across a dark gym floor, side-on so the "
                "forward body angle is clear, back to camera, chalk dust and haze in the air."
            ),
        },
        "card": {
            "kicker": "SAMPLE HYROX WORKOUT",
            "title": "PUSH, PULL, RUN TRIPLET",
            "subtitle": "4 rounds \u00b7 the middle of a Hyrox race",
            "style": "pairs",
            "rows": [
                ["Sled push", "25 m at race weight"],
                ["Sled pull", "25 m at race weight"],
                ["Run", "400 m"],
                ["Rest", "90 sec"],
            ],
            "footer": "Race weight 152 / 102 kg push  \u00b7  103 / 78 kg pull",
        },
        "pin": {
            "title": "Sled push, sled pull, run: the Hyrox middle-of-race triplet",
            "description": (
                "Stations 2 and 3 are where first-timers lose the race, and they always come "
                "with a run attached. Four rounds of a 25 m sled push, a 25 m sled pull and a "
                "400 m run at race weight teaches your legs to keep moving after the sled. "
                "Ninety seconds rest between rounds. Save it."
            ),
            "board": BOARD_WORKOUTS,
            "link": f"{BASE_URL}/workouts/hyrox-simulation-workout/",
            "keywords": [
                "hyrox sled workout",
                "sled push sled pull",
                "hyrox station workout",
                "hyrox training",
            ],
            "publish": "2026-08-27T09:00:00",
            "alt": (
                "Hyrox triplet workout card: 25 m sled push, 25 m sled pull and a 400 m "
                "run, four rounds."
            ),
        },
    },
    {
        "id": "pin-2026-08-07",
        "background": {
            "kind": "ai",
            "prompt": (
                "Close view of a treadmill deck and belt in motion inside a dark gym, running "
                "shoes mid-stride entering the frame from above, motion blur, cold blue rim "
                "light."
            ),
        },
        "card": {
            "kicker": "HYROX RUNNING WORKOUT",
            "title": "THE 1-2-3-2-1 TREADMILL PYRAMID",
            "subtitle": "Nine minutes of work \u00b7 no watch maths",
            "style": "pairs",
            "rows": [
                ["Up", "1, then 2, then 3 min hard"],
                ["Down", "2, then 1 min hard"],
                ["Rest", "Equal to the effort just run"],
                ["Pace", "Race pace on the 3 min rep"],
            ],
            "footer": "9 min of work  \u00b7  Run the pyramid twice when it feels easy",
        },
        "pin": {
            "title": "Treadmill pyramid workout for Hyrox: 1-2-3-2-1 minutes",
            "description": (
                "A running session with no watch maths: run one minute hard, then two, then "
                "three, then back down, resting as long as the effort you just ran. Hold race "
                "pace on the three-minute rep and go faster on the ones. Nine minutes of work "
                "that fits any lunch break. Save it for a treadmill day."
            ),
            "board": BOARD_RUNNING,
            "link": f"{BASE_URL}/training/running/",
            "keywords": [
                "hyrox treadmill workout",
                "treadmill pyramid",
                "hyrox running intervals",
                "treadmill intervals",
            ],
            "publish": "2026-08-31T09:00:00",
            "alt": (
                "Treadmill pyramid workout card: 1, 2, 3, 2 and 1 minute hard efforts with "
                "equal rest."
            ),
        },
    },
    {
        "id": "pin-2026-08-08",
        "background": {
            "kind": "local",
            "path": "src/assets/heroes/home-hero.png",
            "focus": 0.72,
        },
        "card": {
            "kicker": "SLED PUSH SESSION",
            "title": "THE SLED PUSH PYRAMID",
            "subtitle": "Build to 152 kg / 102 kg race weight",
            "style": "pairs",
            "rows": [
                ["Set 1", "25 m at 60% race weight"],
                ["Set 2", "25 m at 80%"],
                ["Set 3", "25 m at race weight"],
                ["Set 4", "25 m at race weight"],
                ["Rest", "2 min \u00b7 walk it off"],
            ],
            "footer": "Short steps, low hips, never stop pushing",
        },
        "pin": {
            "title": "Sled push pyramid workout to survive Hyrox race weight",
            "description": (
                "Most athletes stall on the sled because they only ever train it light. This "
                "pyramid walks you up to race weight in one session: 25 m at 60 percent, 25 m "
                "at 80 percent, then two sets at the full 152 kg or 102 kg, with two minutes "
                "walking rest. Short steps, low hips. Save it."
            ),
            "board": BOARD_STATIONS,
            "link": f"{BASE_URL}/stations/sled-push/standards/",
            "keywords": [
                "hyrox sled push workout",
                "sled push training",
                "sled push race weight",
                "hyrox sled",
            ],
            "publish": "2026-09-03T09:00:00",
            "alt": (
                "Sled push pyramid card: four 25 m pushes building from 60 percent to full "
                "Hyrox race weight."
            ),
        },
    },
    {
        "id": "pin-2026-08-09",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete jogging across an indoor gym floor with medicine balls and a wall "
                "ball target blurred in the foreground, dark gym, cool blue light, sense of "
                "motion."
            ),
        },
        "card": {
            "kicker": "SAMPLE HYROX WORKOUT",
            "title": "THE 4 x 4 DESCENDING LADDER",
            "subtitle": "Runs stay the same \u00b7 reps shrink",
            "style": "pairs",
            "rows": [
                ["Round 1", "800 m run + 40 wall balls"],
                ["Round 2", "800 m run + 30 wall balls"],
                ["Round 3", "800 m run + 20 wall balls"],
                ["Round 4", "800 m run + 10 wall balls"],
            ],
            "footer": "100 wall balls  \u00b7  Shrinking reps keep your running honest",
        },
        "pin": {
            "title": "Descending ladder workout: 4 runs and 100 wall balls",
            "description": (
                "Four 800 m runs paired with 40, 30, 20 and 10 wall balls. The reps shrink as "
                "you tire, so you keep running honestly instead of jogging to recover. A "
                "hundred wall balls in total and about 35 minutes, with no sled or SkiErg "
                "needed. Save it for a mid-week session."
            ),
            "board": BOARD_WORKOUTS,
            "link": f"{BASE_URL}/workouts/mini-hyrox-simulation/",
            "keywords": [
                "hyrox workout",
                "wall ball workout",
                "descending ladder workout",
                "hyrox running and wall balls",
            ],
            "publish": "2026-09-07T09:00:00",
            "alt": (
                "Descending ladder workout card: four 800 m runs with 40, 30, 20 and 10 "
                "wall balls."
            ),
        },
    },
    {
        "id": "pin-2026-08-10",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete mid burpee broad jump, feet leaving the floor, arms swinging "
                "forward, dark gym with lane lines on the floor, motion and chalk dust."
            ),
        },
        "card": {
            "kicker": "BURPEE BROAD JUMP SESSION",
            "title": "80 M OF BURPEE BROAD JUMPS",
            "subtitle": "Broken into sets so you never stall",
            "style": "pairs",
            "rows": [
                ["Work", "4 x 20 m"],
                ["Rest", "45 sec between sets"],
                ["Rhythm", "Chest down, feet in, jump"],
                ["Goal", "Same time for all 4 sets"],
            ],
            "footer": "Under 5 min for the full 80 m is race-ready",
        },
        "pin": {
            "title": "Burpee broad jump workout: 80 m broken into four sets",
            "description": (
                "The Hyrox burpee broad jump station is 80 m long and it is where pacing falls "
                "apart. Train it broken: four sets of 20 m with 45 seconds rest, holding the "
                "same time for every set, with one breath at the top of each jump. Under five "
                "minutes for the full 80 m is race-ready. Save it."
            ),
            "board": BOARD_STATIONS,
            "link": f"{BASE_URL}/stations/burpee-broad-jumps/standards/",
            "keywords": [
                "hyrox burpee broad jumps",
                "burpee broad jump workout",
                "hyrox station training",
                "burpee workout",
            ],
            "publish": "2026-09-10T09:00:00",
            "alt": (
                "Burpee broad jump workout card: four sets of 20 m with 45 seconds rest "
                "between sets."
            ),
        },
    },
    {
        "id": "pin-2026-08-11",
        "background": {
            "kind": "ai",
            "prompt": (
                "An adult athlete running alone on an empty city street at dawn, seen from "
                "behind, cold desaturated tones, wet asphalt, long shadows, cinematic and calm."
            ),
        },
        "card": {
            "kicker": "NO-EQUIPMENT HYROX WORKOUT",
            "title": "HALF HYROX, NO EQUIPMENT",
            "subtitle": "4 runs \u00b7 4 bodyweight stations",
            "style": "pairs",
            "rows": [
                ["1 km run, then", "40 air squats"],
                ["1 km run, then", "20 burpee broad jumps"],
                ["1 km run, then", "40 walking lunges"],
                ["1 km run, then", "40 push-ups"],
            ],
            "footer": "4 km of running  \u00b7  No gym, no sled, no excuses",
        },
        "pin": {
            "title": "Half Hyrox with no equipment: 4 runs, 4 bodyweight stations",
            "description": (
                "No sled, no SkiErg, no wall ball - just a 1 km run before each of four "
                "bodyweight stations: 40 air squats, 20 burpee broad jumps, 40 walking lunges "
                "and 40 push-ups. Four kilometres of running in Hyrox format that you can do "
                "from your front door. Save it for a travel week."
            ),
            "board": BOARD_BEGINNERS,
            "link": f"{BASE_URL}/training/beginner/",
            "keywords": [
                "hyrox workout no equipment",
                "bodyweight hyrox workout",
                "hyrox at home",
                "beginner hyrox training",
            ],
            "publish": "2026-09-14T09:00:00",
            "alt": (
                "No-equipment Hyrox workout card: four 1 km runs each followed by a "
                "bodyweight station."
            ),
        },
    },
    {
        "id": "pin-2026-08-12",
        "background": {
            "kind": "local",
            "path": "src/assets/heroes/racing-guide-hero.png",
            "focus": 0.62,
        },
        "card": {
            "kicker": "COMPROMISED RUNNING",
            "title": "THE RUN-STATION BRICK",
            "subtitle": "4 rounds \u00b7 run tired, on purpose",
            "style": "pairs",
            "rows": [
                ["Run", "800 m at race pace"],
                ["Station", "20 wall balls"],
                ["Straight into", "The next 800 m"],
                ["Rest", "None until round 4 ends"],
            ],
            "footer": "Compare run 1 and run 4  \u00b7  A gap under 15 sec is good",
        },
        "pin": {
            "title": "Run-station brick workout: 4 x 800 m with wall balls",
            "description": (
                "Fresh legs are not the problem in Hyrox - station legs are. Four rounds of an "
                "800 m run at race pace straight into 20 wall balls, with no rest until the "
                "last round ends. Compare your first and fourth run: a gap under 15 seconds "
                "means your pacing holds up. Save it."
            ),
            "board": BOARD_RUNNING,
            "link": f"{BASE_URL}/workouts/compromised-running-test/",
            "keywords": [
                "compromised running hyrox",
                "run station brick",
                "hyrox running workout",
                "hyrox brick workout",
            ],
            "publish": "2026-09-17T09:00:00",
            "alt": (
                "Run-station brick card: four rounds of an 800 m run straight into 20 wall "
                "balls with no rest."
            ),
        },
    },
    {
        "id": "pin-2026-08-13",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete walking down a gym lane carrying a heavy kettlebell in each hand, "
                "side-on, shoulders braced, dark gym floor with lane lines, gritty light."
            ),
        },
        "card": {
            "kicker": "FARMERS CARRY SESSION",
            "title": "FARMERS CARRY 4 x 200 M",
            "subtitle": "2 x 24 kg / 2 x 16 kg race weight",
            "style": "pairs",
            "rows": [
                ["Work", "4 x 200 m, unbroken"],
                ["Rest", "90 sec, shake the arms out"],
                ["Grip", "Hook the handle, don't crush it"],
                ["If you drop", "Reset in 5 sec, keep walking"],
            ],
            "footer": "800 m of carry  \u00b7  Grip is trainable \u2014 train it weekly",
        },
        "pin": {
            "title": "Farmers carry workout for Hyrox: 4 x 200 m at race weight",
            "description": (
                "The Hyrox farmers carry is 200 m with 2 x 24 kg or 2 x 16 kg, and grip is the "
                "only thing that fails. Train four sets of 200 m with 90 seconds rest, hooking "
                "the handles rather than crushing them, and resetting within five seconds if "
                "you drop. Save it for your weekly station day."
            ),
            "board": BOARD_STATIONS,
            "link": f"{BASE_URL}/stations/farmers-carry/standards/",
            "keywords": [
                "hyrox farmers carry",
                "farmers carry workout",
                "grip training hyrox",
                "hyrox station workout",
            ],
            "publish": "2026-09-21T09:00:00",
            "alt": (
                "Farmers carry workout card: four 200 m carries at Hyrox race weight with "
                "90 seconds rest."
            ),
        },
    },
    {
        "id": "pin-2026-08-14",
        "background": {
            "kind": "local",
            "path": "src/assets/heroes/gyms-hero.png",
            "focus": 0.38,
        },
        "card": {
            "kicker": "SAMPLE HYROX WORKOUT",
            "title": "ALL 8 STATIONS AT HALF DISTANCE",
            "subtitle": "One round \u00b7 500 m run between each",
            "style": "pairs",
            "rows": [
                ["SkiErg", "500 m"],
                ["Sled push", "2 x 12.5 m"],
                ["Sled pull", "2 x 12.5 m"],
                ["Burpee broad jumps", "40 m"],
                ["Row", "500 m"],
                ["Farmers carry", "100 m"],
                ["Sandbag lunges", "50 m"],
                ["Wall balls", "50 reps"],
            ],
            "footer": "Half a Hyrox, all of the skills  \u00b7  About 35 min",
        },
        "pin": {
            "title": "All 8 Hyrox stations at half distance in one 35-minute round",
            "description": (
                "Every Hyrox station in one session at half distance: 500 m SkiErg, two sled "
                "pushes and pulls, 40 m of burpee broad jumps, a 500 m row, a 100 m carry, "
                "50 m of sandbag lunges and 50 wall balls, with a 500 m run between each. All "
                "the skills, a third of the recovery cost. Save it."
            ),
            "board": BOARD_WORKOUTS,
            "link": f"{BASE_URL}/workouts/hyrox-simulation-workout/",
            "keywords": [
                "hyrox simulation workout",
                "half hyrox workout",
                "hyrox station circuit",
                "hyrox training session",
            ],
            "publish": "2026-09-24T09:00:00",
            "alt": (
                "Half-distance Hyrox circuit card listing all eight stations with a 500 m "
                "run between each."
            ),
        },
    },
    {
        "id": "pin-2026-08-15",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete mid-lunge with a heavy sandbag across the shoulders, side profile, "
                "knee close to the floor, dark gym with painted lane lines, gritty side light."
            ),
        },
        "card": {
            "kicker": "SANDBAG LUNGE SESSION",
            "title": "SANDBAG LUNGES 4 x 50 M",
            "subtitle": "20 kg / 10 kg \u00b7 station 7 on dead legs",
            "style": "pairs",
            "rows": [
                ["Work", "4 x 50 m"],
                ["Rest", "60 sec, bag on the floor"],
                ["Knee", "Touch the ground every rep"],
                ["Switch", "Change shoulder every 25 m"],
            ],
            "footer": "200 m total  \u00b7  Short steps beat long ones every time",
        },
        "pin": {
            "title": "Sandbag lunge workout for Hyrox: 4 x 50 m at race weight",
            "description": (
                "Sandbag lunges are station 7, which means you meet them with nothing left. "
                "Train four sets of 50 m at 20 kg or 10 kg with a minute rest, touching your "
                "knee down every rep and swapping shoulders every 25 m. Short steps beat long "
                "ones once your legs go. Save it."
            ),
            "board": BOARD_STATIONS,
            "link": f"{BASE_URL}/stations/sandbag-lunges/standards/",
            "keywords": [
                "hyrox sandbag lunges",
                "sandbag lunge workout",
                "hyrox lunges",
                "hyrox station training",
            ],
            "publish": "2026-09-28T09:00:00",
            "alt": (
                "Sandbag lunge workout card: four 50 m sets at Hyrox race weight with a "
                "minute rest."
            ),
        },
    },
    {
        "id": "pin-2026-08-16",
        "background": {
            "kind": "ai",
            "prompt": (
                "A row of empty treadmills in a dark gym with one athlete running on the far "
                "machine, seen from behind at a low angle, atmospheric haze, cold blue light."
            ),
        },
        "card": {
            "kicker": "HYROX RUNNING WORKOUT",
            "title": "BUILD TO 8 x 1 KM IN 4 WEEKS",
            "subtitle": "The one running session that matters most",
            "style": "pairs",
            "rows": [
                ["Week 1", "4 x 1 km \u00b7 90 sec rest"],
                ["Week 2", "5 x 1 km \u00b7 90 sec rest"],
                ["Week 3", "6 x 1 km \u00b7 60 sec rest"],
                ["Week 4", "8 x 1 km \u00b7 60 sec rest"],
            ],
            "footer": "Same pace every rep  \u00b7  That's the whole test",
        },
        "pin": {
            "title": "How to build to 8 x 1 km Hyrox repeats in four weeks",
            "description": (
                "Do not start at eight. Build from four repeats with 90 seconds rest to eight "
                "with 60 seconds over four weeks, holding the same pace on every single rep. "
                "Repeatability, not speed, is what the Hyrox run tests. Save the four-week "
                "progression and run it once a week."
            ),
            "board": BOARD_RUNNING,
            "link": f"{BASE_URL}/workouts/hyrox-1k-repeats/",
            "keywords": [
                "hyrox 1k repeats",
                "hyrox running workout",
                "1km repeats",
                "hyrox running progression",
            ],
            "publish": "2026-10-01T09:00:00",
            "alt": (
                "Four-week running progression card building from 4 x 1 km to 8 x 1 km "
                "repeats."
            ),
        },
    },
    {
        "id": "pin-2026-08-17",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete pulling hard on an indoor rowing machine seen from behind and "
                "above, kettlebells and a sandbag on the floor in the blurred foreground, "
                "dark gym."
            ),
        },
        "card": {
            "kicker": "SAMPLE HYROX WORKOUT",
            "title": "GRIP AND GO: THE CARRY TRIPLET",
            "subtitle": "3 rounds \u00b7 everything your hands hate",
            "style": "pairs",
            "rows": [
                ["Farmers carry", "100 m"],
                ["Sandbag lunges", "50 m"],
                ["Row", "500 m"],
                ["Rest", "2 min"],
            ],
            "footer": "Trains the back half of a Hyrox race in 25 min",
        },
        "pin": {
            "title": "The grip-and-go carry triplet: farmers carry, lunges, row",
            "description": (
                "Stations 6, 7 and 8 all punish the same thing - grip and posture. Three rounds "
                "of a 100 m farmers carry, 50 m of sandbag lunges and a 500 m row with two "
                "minutes rest trains the back half of a Hyrox race in about 25 minutes. Save it "
                "for your next station day."
            ),
            "board": BOARD_WORKOUTS,
            "link": f"{BASE_URL}/workouts/200m-walking-lunges/",
            "keywords": [
                "hyrox carry workout",
                "farmers carry sandbag lunge",
                "hyrox grip training",
                "hyrox workout",
            ],
            "publish": "2026-10-05T09:00:00",
            "alt": (
                "Carry triplet workout card: 100 m farmers carry, 50 m sandbag lunges and a "
                "500 m row, three rounds."
            ),
        },
    },
    {
        "id": "pin-2026-08-18",
        "background": {
            "kind": "ai",
            "prompt": (
                "An athlete in a wide braced stance pulling a rope hand over hand with a "
                "weighted sled sliding toward them in the background, side-on, back to camera, "
                "dark gym."
            ),
        },
        "card": {
            "kicker": "SLED PULL SESSION",
            "title": "HEAVY SLED PULL 4 x 25 M",
            "subtitle": "103 kg / 78 kg \u00b7 save your lower back",
            "style": "pairs",
            "rows": [
                ["Work", "4 x 25 m at race weight"],
                ["Rest", "2 min between pulls"],
                ["Stance", "Wide feet, flat back, long arms"],
                ["Rhythm", "Sit back and pull, don't yank"],
            ],
            "footer": "Rounding your back is what hurts \u2014 not the weight",
        },
        "pin": {
            "title": "Heavy sled pull workout: 4 x 25 m at Hyrox race weight",
            "description": (
                "The Hyrox sled pull wrecks lower backs when athletes round their spine and "
                "yank the rope. Four sets of 25 m at 103 kg or 78 kg with two minutes rest, "
                "staying wide-footed with a flat back and long arms, sitting back into every "
                "pull. A hundred metres of quality. Save it."
            ),
            "board": BOARD_STATIONS,
            "link": f"{BASE_URL}/stations/sled-pull/standards/",
            "keywords": [
                "hyrox sled pull workout",
                "sled pull technique",
                "hyrox sled pull",
                "sled pull training",
            ],
            "publish": "2026-10-08T09:00:00",
            "alt": (
                "Sled pull workout card: four 25 m pulls at Hyrox race weight with two "
                "minutes rest."
            ),
        },
    },
    {
        "id": "pin-2026-08-19",
        "background": {
            "kind": "local",
            "path": "src/assets/heroes/gear-hero.png",
            "focus": 0.45,
        },
        "card": {
            "kicker": "HYROX BASE RUN",
            "title": "THE 40-MINUTE EASY RUN",
            "subtitle": "The session most Hyrox athletes skip",
            "style": "pairs",
            "rows": [
                ["Run", "40 min easy"],
                ["Effort", "You can hold a conversation"],
                ["Finish", "6 x 20 sec strides"],
                ["How often", "1\u20132 times a week, all year"],
            ],
            "footer": "Easy runs build the engine  \u00b7  Hard runs just spend it",
        },
        "pin": {
            "title": "The 40-minute easy run most Hyrox athletes skip",
            "description": (
                "Hyrox training goes wrong when every run is hard. Forty minutes at a pace "
                "where you can hold a conversation, finished with six 20-second strides, once "
                "or twice a week, all year round. Easy running builds the engine that your "
                "race-pace sessions spend. Save it as a standing session."
            ),
            "board": BOARD_RUNNING,
            "link": f"{BASE_URL}/training/running/",
            "keywords": [
                "hyrox base run",
                "zone 2 running hyrox",
                "easy run workout",
                "hyrox running training",
            ],
            "publish": "2026-10-12T09:00:00",
            "alt": (
                "Easy run workout card: 40 minutes at conversational pace finished with six "
                "20-second strides."
            ),
        },
    },
    {
        "id": "pin-2026-08-20",
        "background": {
            "kind": "local",
            "path": "src/assets/heroes/events-hero.png",
            "focus": 0.45,
        },
        "card": {
            "kicker": "SAMPLE HYROX WORKOUT",
            "title": "THE SUNDAY LONG GRIND",
            "subtitle": "5 km of running, broken by stations",
            "style": "pairs",
            "rows": [
                ["After km 1", "50 wall balls"],
                ["After km 2", "500 m row"],
                ["After km 3", "50 m sandbag lunges"],
                ["After km 4", "500 m SkiErg"],
                ["After km 5", "You're done"],
            ],
            "footer": "60\u201375 min  \u00b7  One long session a week is enough",
        },
        "pin": {
            "title": "The Sunday long grind: 5 km of running broken by stations",
            "description": (
                "One long Hyrox session a week is enough, and this is it. Run 5 km one "
                "kilometre at a time, stopping after each for a station: 50 wall balls, a "
                "500 m row, 50 m of sandbag lunges, then a 500 m SkiErg. Sixty to 75 minutes "
                "of race-specific work. Save it for the weekend."
            ),
            "board": BOARD_WORKOUTS,
            "link": f"{BASE_URL}/training/intermediate/",
            "keywords": [
                "long hyrox workout",
                "hyrox weekend session",
                "hyrox endurance workout",
                "hyrox training",
            ],
            "publish": "2026-10-15T09:00:00",
            "alt": (
                "Long Hyrox session card: 5 km of running with a station after every "
                "kilometre."
            ),
        },
    },
]


# ---------------------------------------------------------------- derived views
# make_cards.py and gen_backgrounds.py consume these; build_csv.py reads PINS.

CARDS: dict[str, dict] = {p["id"]: p["card"] for p in PINS}

PROMPTS: dict[str, str] = {
    p["id"]: p["background"]["prompt"]
    for p in PINS
    if p["background"]["kind"] == "ai"
}

LOCAL_BACKGROUNDS: dict[str, dict] = {
    p["id"]: p["background"] for p in PINS if p["background"]["kind"] == "local"
}
