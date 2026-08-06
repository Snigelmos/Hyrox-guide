"""
Emit a Pinterest bulk-upload CSV from a batch module (e.g. cards_2026_08).

Pinterest fetches every row's Media URL from the public web, so the rendered
cards must be committed under public/images/pins/ and live on the deployed site
before the CSV is uploaded. This script warns about any image it cannot find
locally, which is the cheapest way to catch a row that would 404.

Columns follow Pinterest's bulk creation tool: Title, Media URL, Pinterest
board, Thumbnail, Description, Link, Publish date, Keywords. Output is UTF-8
with CRLF line endings and RFC 4180 quoting.

Examples:
    python build_csv.py --cards cards_2026_08
    python build_csv.py --cards cards_2026_08 --split 4
"""

from __future__ import annotations

import argparse
import csv
import importlib
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

COLUMNS = [
    "Title",
    "Media URL",
    "Pinterest board",
    "Thumbnail",
    "Description",
    "Link",
    "Publish date",
    "Keywords",
]

TITLE_MAX = 100
DESCRIPTION_MAX = 500
# Pinterest caps a single bulk file at 200 rows.
ROWS_MAX = 200


def clamp(value: str, limit: int, label: str, pin_id: str) -> str:
    if len(value) <= limit:
        return value
    print(f"warn: {pin_id} {label} is {len(value)} chars, truncating to {limit}")
    return value[: limit - 1].rstrip() + "\u2026"


def build_rows(module, pins_dir: str, image_ext: str) -> list[dict]:
    base_url = module.BASE_URL.rstrip("/")
    rows = []
    seen_titles: set[str] = set()
    for pin in module.PINS:
        pin_id = pin["id"]
        meta = pin["pin"]
        filename = f"{pin_id}.{image_ext}"

        local = REPO_ROOT / pins_dir / filename
        if not local.exists():
            print(f"warn: {pin_id} has no rendered image at {local}")

        title = clamp(meta["title"], TITLE_MAX, "Title", pin_id)
        if title in seen_titles:
            raise SystemExit(f"duplicate Title on {pin_id}: Pinterest rejects the file")
        seen_titles.add(title)

        rows.append(
            {
                "Title": title,
                "Media URL": f"{base_url}/{pins_dir.removeprefix('public/')}/{filename}",
                "Pinterest board": meta["board"],
                "Thumbnail": "",
                "Description": clamp(
                    meta["description"], DESCRIPTION_MAX, "Description", pin_id
                ),
                "Link": meta["link"],
                "Publish date": meta["publish"],
                "Keywords": ", ".join(meta["keywords"]),
            }
        )
    return rows


def write_csv(rows: list[dict], path: Path) -> None:
    if len(rows) > ROWS_MAX:
        raise SystemExit(f"{len(rows)} rows exceeds Pinterest's {ROWS_MAX}-row limit")
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS, lineterminator="\r\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {path}  ({len(rows)} pins)")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cards", required=True, help="batch module, e.g. cards_2026_08")
    ap.add_argument("--pins-dir", default="public/images/pins")
    ap.add_argument("--ext", default="jpg")
    ap.add_argument("--out", default=None, help="output path (default derived from --cards)")
    ap.add_argument(
        "--split",
        type=int,
        default=0,
        help="also emit files of N rows each, for when Pinterest rejects "
             "publish dates far in the future",
    )
    args = ap.parse_args()

    module = importlib.import_module(args.cards)
    rows = build_rows(module, args.pins_dir, args.ext)

    here = Path(__file__).resolve().parent
    stem = args.cards.replace("cards_", "pinterest-bulk-").replace("_", "-")
    out = Path(args.out) if args.out else here / f"{stem}.csv"
    write_csv(rows, out)

    if args.split:
        part_dir = out.with_suffix("")
        part_dir.mkdir(exist_ok=True)
        for i in range(0, len(rows), args.split):
            part = rows[i : i + args.split]
            write_csv(part, part_dir / f"part-{i // args.split + 1:02d}.csv")


if __name__ == "__main__":
    main()
