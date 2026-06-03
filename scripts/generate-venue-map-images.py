#!/usr/bin/env python3
"""
scripts/generate-venue-map-images.py

Make every Hyrox venue map readable on mobile.

Mobile browsers (iOS Safari, Android Chrome) refuse to embed a cross-origin
PDF in an <iframe>, so any event whose `courseMapUrl` is a PDF shows a blank
box on phones. This script renders the first page of each PDF venue map to a
local JPG under public/images/events/ and backfills `courseMapImageUrl` into
src/data/events.ts. EventCourseSection.astro renders that image inline (an
<img> works on every device) and keeps the official PDF as the "open
full-size" link.

It is idempotent: re-running regenerates the same JPGs (byte-identical when the
source PDF is unchanged, so no spurious git diff) and only inserts
`courseMapImageUrl` when missing. That makes it safe to run on a schedule from
the scan-venue-maps GitHub Action, right after that job refreshes courseMapUrl.

Scope: only NON-PAST events are processed (past event pages don't render the
course section). Events whose courseMapUrl is already a raster image, a
Facebook link, or empty are skipped — they already work on mobile.

Usage:
  python scripts/generate-venue-map-images.py            # convert + patch
  python scripts/generate-venue-map-images.py --dry-run  # report only
  python scripts/generate-venue-map-images.py --slug stockholm
  python scripts/generate-venue-map-images.py --all      # include past events

Requires: PyMuPDF (pip install pymupdf)
"""

from __future__ import annotations

import argparse
import datetime as _dt
import os
import re
import sys
import urllib.request

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF is required: pip install pymupdf")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EVENTS_PATH = os.path.join(ROOT, "src", "data", "events.ts")
IMAGE_DIR = os.path.join(ROOT, "public", "images", "events")
IMAGE_URL_PREFIX = "/images/events"
TARGET_LONG_EDGE = 2400
JPG_QUALITY = 88
USER_AGENT = "Mozilla/5.0 (compatible; hyroxvault-mapgen/1.0; +https://www.hyroxvault.com)"

PDF_RE = re.compile(r"\.pdf(\?|#|$)", re.IGNORECASE)


# --------------------------------------------------------------------------
# events.ts parsing — brace-matched object extraction (events.ts is TS, not
# importable from Python). Mirrors scripts/scan-venue-maps.mjs.
# --------------------------------------------------------------------------
def extract_event_objects(src: str):
    arr = re.search(r"export\s+const\s+EVENTS\s*:\s*[^=]*=\s*\[", src)
    if not arr:
        raise RuntimeError("Could not locate `export const EVENTS` array")
    i = arr.end()
    objects = []
    depth_brace = 0
    depth_bracket = 1
    in_str = None
    obj_start = -1
    n = len(src)
    while i < n:
        c = src[i]
        prev = src[i - 1] if i > 0 else ""
        if in_str:
            if c == in_str and prev != "\\":
                in_str = None
            i += 1
            continue
        if c in ('"', "'", "`"):
            in_str = c
            i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            nl = src.find("\n", i)
            i = n if nl == -1 else nl
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            end = src.find("*/", i + 2)
            i = n if end == -1 else end + 1
            i += 1
            continue
        if c == "[":
            depth_bracket += 1
        elif c == "]":
            depth_bracket -= 1
            if depth_bracket == 0:
                break
        elif c == "{":
            if depth_brace == 0 and depth_bracket == 1:
                obj_start = i
            depth_brace += 1
        elif c == "}":
            depth_brace -= 1
            if depth_brace == 0 and obj_start != -1:
                objects.append({"start": obj_start, "end": i + 1, "text": src[obj_start : i + 1]})
                obj_start = -1
        i += 1
    return objects


def strip_comments(text: str) -> str:
    text = re.sub(r"/\*[\s\S]*?\*/", "", text)
    text = re.sub(r"(^|[^:])//[^\n]*", r"\1", text)
    return text


def str_field(text: str, name: str):
    m = re.search(r'(?:^|[\s,{])' + name + r'\s*:\s*"([^"]*)"', strip_comments(text))
    return m.group(1) if m else None


def num_field(text: str, name: str):
    m = re.search(r'(?:^|[\s,{])' + name + r'\s*:\s*(\d+)', strip_comments(text))
    return int(m.group(1)) if m else None


def bool_field(text: str, name: str):
    m = re.search(r'(?:^|[\s,{])' + name + r'\s*:\s*(true|false)', strip_comments(text))
    if not m:
        return None
    return m.group(1) == "true"


def is_past(end_date: str | None, start_date: str | None) -> bool:
    raw = end_date or start_date
    if not raw:
        return False
    try:
        d = _dt.date.fromisoformat(raw[:10])
    except ValueError:
        return False
    return _dt.date.today() > (d + _dt.timedelta(days=1))


# --------------------------------------------------------------------------
# PDF -> JPG
# --------------------------------------------------------------------------
def render_pdf_to_jpg(pdf_url: str, out_path: str) -> tuple[int, int]:
    req = urllib.request.Request(pdf_url, headers={"User-Agent": USER_AGENT})
    data = urllib.request.urlopen(req, timeout=90).read()
    doc = fitz.open(stream=data, filetype="pdf")
    page = doc[0]
    rect = page.rect
    long_edge = max(rect.width, rect.height) or 1
    zoom = TARGET_LONG_EDGE / long_edge
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    pix.save(out_path, jpg_quality=JPG_QUALITY)
    return pix.width, pix.height


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="report only; no downloads or writes")
    ap.add_argument("--all", action="store_true", help="include past events")
    ap.add_argument("--slug", help="only process this event slug")
    args = ap.parse_args()

    with open(EVENTS_PATH, "r", encoding="utf-8") as f:
        src = f.read()

    objects = extract_event_objects(src)
    targets = []
    for obj in objects:
        text = obj["text"]
        slug = str_field(text, "slug")
        if not slug:
            continue
        if args.slug and slug != args.slug:
            continue
        # Respect the per-event lock: courseMapAuto: false means a human
        # controls this event's map (the auto-matcher picked the wrong asset),
        # so never (re)generate an image for it.
        if bool_field(text, "courseMapAuto") is False:
            continue
        course_map_url = str_field(text, "courseMapUrl")
        if not course_map_url or not PDF_RE.search(course_map_url):
            continue  # no map, or already a raster image / FB link -> fine on mobile
        if not args.all and is_past(str_field(text, "endDate"), str_field(text, "startDate")):
            continue
        year = num_field(text, "year")
        existing_img = str_field(text, "courseMapImageUrl")
        targets.append(
            {
                "slug": slug,
                "year": year,
                "pdf": course_map_url,
                "existing_img": existing_img,
                "obj": obj,
            }
        )

    if not targets:
        print("No non-past PDF venue maps to process.")
        return 0

    print(f"Processing {len(targets)} PDF venue map(s){' (dry run)' if args.dry_run else ''}...")

    # Patch from last object to first so byte offsets stay valid.
    patches = []  # (start, end, new_text)
    for t in targets:
        slug, year = t["slug"], t["year"]
        fname = f"{slug}-course-map-{year}.jpg"
        rel_url = f"{IMAGE_URL_PREFIX}/{fname}"
        out_path = os.path.join(IMAGE_DIR, fname)

        if args.dry_run:
            print(f"  WOULD CONVERT  {slug:<16} {t['pdf']} -> {rel_url}")
            continue

        try:
            w, h = render_pdf_to_jpg(t["pdf"], out_path)
            print(f"  CONVERTED      {slug:<16} {w}x{h}px -> {rel_url}")
        except Exception as exc:  # noqa: BLE001 - report and continue
            print(f"  FAILED         {slug:<16} {t['pdf']} ({exc})")
            continue

        if t["existing_img"] == rel_url:
            continue  # field already set correctly

        obj_text = t["obj"]["text"]
        if "courseMapImageUrl" in strip_comments(obj_text):
            new_obj = re.sub(
                r'(\bcourseMapImageUrl\s*:\s*)"[^"]*"',
                lambda m: f'{m.group(1)}"{rel_url}"',
                obj_text,
                count=1,
            )
        else:
            # insert right after the courseMapUrl line, matching its indent
            m = re.search(r'^([ \t]*)courseMapUrl\s*:\s*"[^"]*",?[ \t]*$', obj_text, re.MULTILINE)
            indent = m.group(1) if m else "    "
            insert = f'\n{indent}courseMapImageUrl: "{rel_url}",'
            new_obj = re.sub(
                r'(^[ \t]*courseMapUrl\s*:\s*"[^"]*",?[ \t]*$)',
                lambda mm: mm.group(1) + insert,
                obj_text,
                count=1,
                flags=re.MULTILINE,
            )
        if new_obj != obj_text:
            patches.append((t["obj"]["start"], t["obj"]["end"], new_obj))

    if args.dry_run:
        return 0

    if patches:
        patches.sort(key=lambda p: p[0], reverse=True)
        updated = src
        for start, end, new_text in patches:
            updated = updated[:start] + new_text + updated[end:]
        with open(EVENTS_PATH, "w", encoding="utf-8", newline="\n") as f:
            f.write(updated)
        print(f"\nPatched courseMapImageUrl into {len(patches)} event(s) in src/data/events.ts")
    else:
        print("\nNo events.ts changes needed (courseMapImageUrl already set).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
