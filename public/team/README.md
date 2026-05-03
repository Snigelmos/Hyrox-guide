# Team portrait images

Real portraits of John, Niklas, and Jesper live in this folder as
`john.jpg`, `niklas.jpg`, `jesper.jpg`. They are referenced from:

- `/author/` (the team listing) — 64 × 64 circular crop.
- `/author/<slug>/` (individual profile pages) — 128 × 128 circular crop.
- `/about/` (the team grid in the About page) — 48 × 48 circular crop.
- Person JSON-LD on each `/author/<slug>/` page.

## Replacing a portrait

Drop a new file under the same filename. Specs we use:

- Square crop, head and shoulders, face roughly centred.
- Minimum **256 × 256 px**, ideally **512 × 512 px**.
- Optimised JPG, target **< 80 kB**.
- Solid or softly-blurred background reads better than a busy scene at
  thumbnail size.

## Re-cropping from a triptych source

If you have a horizontal triptych (left/middle/right portraits in one
image) and want to regenerate all three portraits at once:

1. Save the triptych as `team-source.png` in the repo root.
2. Run `node scripts/crop-team-portraits.mjs`.

The script splits the source into thirds, takes a centred square out of
each panel, biases the crop upward so the face lands roughly in the
middle, and writes 512 × 512 JPGs back into this folder. Delete
`team-source.png` after running.
