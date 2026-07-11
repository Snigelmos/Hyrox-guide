"""
Generate photographic backgrounds for the 7 June workout-tips pins via the
local content API's image-only endpoint (no text-model spend). Saves to
_bg/pin-0X.png. Prompts deliberately avoid any text/logos so the compositor
owns all on-image copy.
"""

import base64
import json
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

PROMPTS = {
    "pin-01": "A fit athlete mid wall-ball throw, slamming a medicine ball upward, sweat, motion, blurred dark gym background.",
    "pin-02": "Low three-quarter angle of an athlete catching a wall ball at the bottom of a squat, chalk dust, intense effort, dark gym.",
    "pin-03": "Side view of an athlete running hard on a treadmill in a dark gym, slight motion blur on the legs, sweat, dramatic rim light.",
    "pin-04": "An athlete pulling hard on an indoor rowing machine, side profile, strong back and arms, dark gym, dramatic light.",
    "pin-05": "A determined Hyrox-style athlete standing between efforts glancing at a sports watch on the wrist, hands on hips, arena floor, moody light.",
    "pin-06": "An athlete jogging through an indoor competition transition area between equipment stations, motion, blurred crowd and lights in the background.",
    "pin-07": "A neat flat lay on a dark gym bench of race-day gear: cross-training shoes, a water bottle, a folded towel, energy gels, a sports watch. Top-down, tidy, no text.",
}


def main() -> None:
    out = Path(__file__).resolve().parent / "_bg"
    out.mkdir(exist_ok=True)
    total = 0.0
    for pin_id, subject in PROMPTS.items():
        body = json.dumps({
            "prompt": f"{subject} {STYLE}",
            "quality": "low",
            "size": "1024x1536",
        }).encode()
        req = urllib.request.Request(API, data=body,
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=240) as resp:
            data = json.loads(resp.read())
        (out / f"{pin_id}.png").write_bytes(base64.b64decode(data["image_base64"]))
        spent = data.get("usage", {}).get("estimated_usd", 0)
        total = spent  # ledger returns cumulative for the client; print per-call below
        print(f"{pin_id}: ok  (call est ${data.get('usage', {}).get('estimated_usd')})")
    print("done")


if __name__ == "__main__":
    main()
