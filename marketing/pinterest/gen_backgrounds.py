"""
Generate photographic backgrounds for Pinterest pins via the local content
API's image-only endpoint (no text-model spend). Prompts deliberately avoid any
text or logos so make_cards.py owns all on-image copy.

Spending is gated. Running without --yes asks the API for an estimate only;
nothing is charged and no image is written. Re-run with --yes once the cost has
been approved.

Examples:
    python gen_backgrounds.py --prompts cards_2026_08              # estimate
    python gen_backgrounds.py --prompts cards_2026_08 --yes        # generate
    python gen_backgrounds.py --prompts cards_2026_08 --yes --force
"""

from __future__ import annotations

import argparse
import base64
import importlib
import json
import urllib.error
import urllib.request
from pathlib import Path

API = "http://127.0.0.1:8077/image"
STYLE = (
    "Photorealistic, cinematic, dark and moody functional-fitness gym, "
    "desaturated cool tones, dramatic side lighting, shallow depth of field, "
    "athletic and gritty, vertical composition with the main subject in the "
    "lower half of the frame. Absolutely no text, no numbers, no captions, no "
    "watermarks, no brand logos, no signage. One adult athlete unless noted."
)

# June 2026 batch. Newer batches live in their own cards_*.py module and are
# selected with --prompts.
PROMPTS = {
    "pin-01": "A fit athlete mid wall-ball throw, slamming a medicine ball upward, sweat, motion, blurred dark gym background.",
    "pin-02": "Low three-quarter angle of an athlete catching a wall ball at the bottom of a squat, chalk dust, intense effort, dark gym.",
    "pin-03": "Side view of an athlete running hard on a treadmill in a dark gym, slight motion blur on the legs, sweat, dramatic rim light.",
    "pin-04": "An athlete pulling hard on an indoor rowing machine, side profile, strong back and arms, dark gym, dramatic light.",
    "pin-05": "A determined Hyrox-style athlete standing between efforts glancing at a sports watch on the wrist, hands on hips, arena floor, moody light.",
    "pin-06": "An athlete jogging through an indoor competition transition area between equipment stations, motion, blurred crowd and lights in the background.",
    "pin-07": "A neat flat lay on a dark gym bench of race-day gear: cross-training shoes, a water bottle, a folded towel, energy gels, a sports watch. Top-down, tidy, no text.",
}


def post(body: dict) -> dict:
    req = urllib.request.Request(
        API, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        return json.loads(resp.read())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--prompts",
        default=None,
        help="module holding this batch's PROMPTS and STYLE (e.g. cards_2026_08); "
             "defaults to the June set in this file",
    )
    ap.add_argument("--out", default="_bg")
    ap.add_argument("--quality", default="low", choices=["low", "medium", "high"])
    ap.add_argument("--size", default="1024x1536")
    ap.add_argument(
        "--yes",
        action="store_true",
        help="approve the spend and actually generate (otherwise estimate only)",
    )
    ap.add_argument(
        "--force", action="store_true", help="regenerate backgrounds that already exist"
    )
    args = ap.parse_args()

    prompts, style = PROMPTS, STYLE
    if args.prompts:
        module = importlib.import_module(args.prompts)
        prompts = module.PROMPTS
        style = getattr(module, "STYLE", STYLE)

    out = (Path(__file__).resolve().parent / args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)

    pending = [
        (pin_id, subject)
        for pin_id, subject in prompts.items()
        if args.force or not (out / f"{pin_id}.png").exists()
    ]
    skipped = len(prompts) - len(pending)
    if skipped:
        print(f"skipping {skipped} background(s) that already exist (use --force to redo)")
    if not pending:
        print("nothing to generate")
        return

    total = 0.0
    for pin_id, subject in pending:
        body = {
            "prompt": f"{subject} {style}",
            "quality": args.quality,
            "size": args.size,
        }
        if args.yes:
            body["confirm"] = True
        try:
            data = post(body)
        except urllib.error.URLError as exc:
            raise SystemExit(
                f"cannot reach the content API at {API} ({exc}). Start it from "
                "'Affiliate pages master' with: "
                r".\.venv\Scripts\python.exe scripts\content_api\cli.py serve"
            ) from exc

        if data.get("requires_approval"):
            est = float(data["estimated_usd"])
            total += est
            print(f"{pin_id}: estimate ${est:.3f} (nothing charged)")
            continue

        (out / f"{pin_id}.png").write_bytes(base64.b64decode(data["image_base64"]))
        est = float(data.get("usage", {}).get("estimated_usd", 0) or 0)
        total += est
        print(f"{pin_id}: ok  (${est:.3f})")

    verb = "spent" if args.yes else "ESTIMATE ONLY, nothing charged"
    print(f"\n{len(pending)} image(s) at {args.quality} quality — ${total:.3f} total  [{verb}]")
    if not args.yes:
        print("Re-run with --yes once this cost is approved.")


if __name__ == "__main__":
    main()
