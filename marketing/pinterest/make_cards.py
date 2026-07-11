"""
Workout-card compositor for HyroxVault Pinterest pins (June 2026 batch).

GPT generates a photographic background (no text); this script overlays the
exact, verified workout/tips content as a branded card so reps and times are
always correct and legible. Run after backgrounds exist in --bg-dir as
pin-01.png ... pin-07.png. Falls back to a dark gradient if a background is
missing.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1000, 1500
ACCENT = (198, 255, 64)        # hyrox lime
INK = (255, 255, 255)
MUTED = (200, 206, 214)
PANEL = (12, 14, 18, 175)      # semi-transparent dark panel

FONTS = Path("C:/Windows/Fonts")
F_TITLE = FONTS / "ariblk.ttf"     # Arial Black
F_BOLD = FONTS / "segoeuib.ttf"    # Segoe UI Bold
F_REG = FONTS / "segoeui.ttf"      # Segoe UI


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


# Each card: kicker, title, subtitle, style (pairs|bullets|checks),
# rows (pairs = [label, detail]; bullets/checks = [text]),
# optional tips (small bullets), footer.
CARDS: dict[str, dict] = {
    "pin-01": {
        "kicker": "SAMPLE HYROX WORKOUT",
        "title": "20-MINUTE HYROX WORKOUT",
        "subtitle": "\u201cLunch Break Hyrox\u201d \u00b7 4 rounds for time",
        "style": "pairs",
        "rows": [
            ["SkiErg", "250 m"],
            ["Row", "250 m"],
            ["Wall balls", "10 reps"],
            ["Burpee broad jumps", "10 reps"],
            ["Treadmill run", "400 m"],
        ],
        "footer": "4 rounds  \u00b7  Elite under 16 min  \u00b7  Average 20\u201325 min",
    },
    "pin-02": {
        "kicker": "HYROX BENCHMARK",
        "title": "THE 100 WALL BALL TEST",
        "subtitle": "For time \u00b7 6 kg / 4 kg \u00b7 10 ft / 9 ft target",
        "style": "pairs",
        "rows": [
            ["Warm-up", "10 squats + 10 reps"],
            ["The test", "100 wall balls, for time"],
            ["Race split", "25 \u00b7 25 \u00b7 25 \u00b7 25"],
        ],
        "footer": "Men: sub-7 good, sub-5 elite   |   Women: sub-7:30, sub-5:30",
    },
    "pin-03": {
        "kicker": "HYROX RUNNING TEST",
        "title": "COMPROMISED RUNNING TEST",
        "subtitle": "Can you run fast on tired legs?",
        "style": "pairs",
        "rows": [
            ["Run 1", "1 km @ goal pace"],
            ["Station", "100 wall balls"],
            ["Run 2", "1 km, match Run 1"],
        ],
        "footer": "Gap under 10 sec = race-ready  \u00b7  30 sec+ = train stations",
    },
    "pin-04": {
        "kicker": "HYROX BENCHMARK",
        "title": "2K ROW + 50 WALL BALLS",
        "subtitle": "A Hyrox finish-line fatigue test",
        "style": "pairs",
        "rows": [
            ["Warm-up", "5 min row + 10 reps"],
            ["Row", "2,000 m"],
            ["Then", "50 wall balls"],
        ],
        "footer": "Men: sub-12 good, sub-10 elite  |  Women: sub-13:30, sub-11:30",
    },
    "pin-05": {
        "kicker": "RACE-DAY TIP",
        "title": "HYROX PACING STRATEGY",
        "subtitle": "Don't blow up in the first 4 minutes",
        "style": "bullets",
        "rows": [
            "Time budget: runs 45\u201350%, stations 38\u201342%, transitions 8\u201312%",
            "Negative-split your 8 runs \u2014 start controlled, finish fast",
            "Add a 10% buffer to your training station times",
            "Run 5 is always slowest after burpees \u2014 plan the drop",
            "Hit ~85% HR by minute 4, then hold it steady",
        ],
        "footer": "Full station-by-station plan on hyroxvault.com",
    },
    "pin-06": {
        "kicker": "RACE-DAY TIP",
        "title": "STOP LOSING TIME IN THE ROXZONE",
        "subtitle": "16 transitions \u00b7 where 5\u20138 minutes vanish",
        "style": "pairs",
        "rows": [
            ["First-timer \u00b7 25 sec each", "6:40 lost"],
            ["Practised \u00b7 15 sec each", "4:00"],
            ["Efficient \u00b7 8 sec each", "2:08"],
        ],
        "tips": [
            "Catch your breath walking to the run lane, not at the station",
            "Drop the handle or rope and go \u2014 marshals reset it",
            "Treat the roxzone as a jog, never a walk",
        ],
        "footer": "Free 4\u20135 minutes with zero extra training",
    },
    "pin-07": {
        "kicker": "RACE-DAY CHECKLIST",
        "title": "HYROX RACE-DAY CHECKLIST",
        "subtitle": "Race bag \u2014 packed the night before",
        "style": "checks",
        "rows": [
            "Race ID + photo ID (saved offline)",
            "Singlet, shorts & shoes you've trained in",
            "Watch + HR monitor, charged & paired",
            "1 L water + electrolytes",
            "2\u20133 fuel gels + tested carb breakfast",
            "Backup socks + towel",
            "Foam roller / lacrosse ball",
            "Cash or card for after",
        ],
        "footer": "Full printable 49-item checklist on hyroxvault.com",
    },
}


def wrap(draw, text, fnt, max_w):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def make_background() -> Image.Image:
    bg = Image.new("RGB", (W, H), (18, 20, 26))
    return bg


def cover(img: Image.Image) -> Image.Image:
    img = img.convert("RGB")
    scale = max(W / img.width, H / img.height)
    nw, nh = int(img.width * scale), int(img.height * scale)
    img = img.resize((nw, nh), Image.LANCZOS)
    left, top = (nw - W) // 2, (nh - H) // 2
    return img.crop((left, top, left + W, top + H))


def scrim(img: Image.Image) -> Image.Image:
    overlay = Image.new("L", (W, H), 0)
    px = overlay.load()
    for y in range(H):
        # darker toward the bottom where the panel sits
        a = int(90 + 120 * (y / H))
        for x in range(W):
            px[x, y] = a
    black = Image.new("RGB", (W, H), (6, 8, 11))
    return Image.composite(black, img, overlay)


M = 64
INNER = W - 2 * M
PAD = 46


def layout_rows(d, cfg, start_y, draw):
    """Lay out the body rows. Returns end y. When draw is False, only measures."""
    ry = start_y
    style = cfg["style"]
    if style == "pairs":
        fl = font(F_BOLD, 38)
        for label, detail in cfg["rows"]:
            if draw:
                d.text((M + 6, ry), label, font=fl, fill=INK)
                vw = d.textlength(detail, font=fl)
                d.text((W - 40 - PAD - vw, ry + 2), detail, font=fl, fill=ACCENT)
            ry += 88
        if cfg.get("tips"):
            ry += 10
            fti = font(F_REG, 28)
            fdot = font(F_BOLD, 28)
            for t in cfg["tips"]:
                if draw:
                    d.text((M + 6, ry), "\u2022", font=fdot, fill=ACCENT)
                for ln in wrap(d, t, fti, INNER - 40):
                    if draw:
                        d.text((M + 40, ry), ln, font=fti, fill=MUTED)
                    ry += 36
                ry += 8
    elif style == "bullets":
        fb = font(F_BOLD, 33)
        fdot = font(F_BOLD, 33)
        for t in cfg["rows"]:
            if draw:
                d.text((M + 6, ry), "\u2022", font=fdot, fill=ACCENT)
            for ln in wrap(d, t, fb, INNER - 44):
                if draw:
                    d.text((M + 42, ry), ln, font=fb, fill=INK)
                ry += 44
            ry += 22
    elif style == "checks":
        fc = font(F_BOLD, 32)
        box = 30
        for t in cfg["rows"]:
            if draw:
                d.rounded_rectangle([M + 6, ry + 2, M + 6 + box, ry + 2 + box],
                                    radius=6, outline=ACCENT, width=3)
            lines = wrap(d, t, fc, INNER - 64)
            for i, ln in enumerate(lines):
                if draw:
                    d.text((M + 6 + box + 22, ry), ln, font=fc, fill=INK)
                if i < len(lines) - 1:
                    ry += 42
            ry += 60
    return ry


def draw_card(cfg: dict, bg_path: Path | None, out_path: Path) -> None:
    if bg_path and bg_path.exists():
        base = scrim(cover(Image.open(bg_path)))
    else:
        base = scrim(make_background())
    base = base.convert("RGBA")
    d = ImageDraw.Draw(base)

    # Kicker
    d.text((M, 70), cfg["kicker"], font=font(F_BOLD, 30), fill=ACCENT)

    # Title (wrapped)
    ft = font(F_TITLE, 62)
    y = 112
    for line in wrap(d, cfg["title"], ft, INNER):
        d.text((M, y), line, font=ft, fill=INK, stroke_width=2, stroke_fill=(0, 0, 0))
        y += 70

    # Subtitle
    fs = font(F_BOLD, 32)
    y += 6
    for line in wrap(d, cfg["subtitle"], fs, INNER):
        d.text((M, y), line, font=fs, fill=MUTED)
        y += 42

    # Accent rule
    y += 18
    d.rectangle([M, y, M + 90, y + 6], fill=ACCENT)
    y += 34

    panel_top = y
    content_start = panel_top + PAD
    content_end = layout_rows(d, cfg, content_start, draw=False)
    panel_bottom = content_end + PAD - 12

    # Panel
    panel = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle(
        [40, panel_top, W - 40, panel_bottom], radius=28, fill=PANEL)
    base = Image.alpha_composite(base, panel)
    d = ImageDraw.Draw(base)

    layout_rows(d, cfg, content_start, draw=True)

    # Footer
    fff = font(F_BOLD, 27)
    fy = panel_bottom + 26
    for ln in wrap(d, cfg["footer"], fff, INNER):
        tw = d.textlength(ln, font=fff)
        d.text(((W - tw) / 2, fy), ln, font=fff, fill=MUTED)
        fy += 34

    base.convert("RGB").save(out_path, "PNG")
    print(f"wrote {out_path}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bg-dir", default="_bg")
    ap.add_argument("--out-dir", default="images")
    ap.add_argument("--only", default=None, help="single pin id, e.g. pin-01")
    args = ap.parse_args()

    base = Path(__file__).resolve().parent
    bg_dir = (base / args.bg_dir).resolve()
    out_dir = (base / args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    items = CARDS.items()
    if args.only:
        items = [(args.only, CARDS[args.only])]
    for pin_id, cfg in items:
        bg = bg_dir / f"{pin_id}.png"
        draw_card(cfg, bg, out_dir / f"{pin_id}.png")


if __name__ == "__main__":
    main()
