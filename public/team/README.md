# Team portrait images

The site renders `/team/john.jpg`, `/team/niklas.jpg`, and `/team/jesper.jpg`
on:

- `/author/` (the team listing page) — 64 × 64 circular crop.
- `/author/<slug>/` (individual profile pages) — 128 × 128 circular crop.
- `/about/` (the team grid in the About page) — 48 × 48 circular crop.

## What to drop in here

Three JPG files, exactly named:

- `john.jpg`
- `niklas.jpg`
- `jesper.jpg`

## Recommended specs

- Square crop, **head and shoulders**, face roughly centred.
- Minimum **256 × 256 px**, ideally **512 × 512 px** so retina screens stay
  sharp.
- Optimised JPG, target **< 80 kB** per file. Use `npx @squoosh/cli` or
  similar before committing if the originals are heavy.
- Solid or softly-blurred background reads better than a busy scene at
  thumbnail size.

## Until real photos exist

If a portrait is missing, the `<img>` tag still renders — the browser will
show a broken-image icon. To avoid that, ship a neutral placeholder JPG
(initials on a brand-coloured square works) under each filename until the
real photos arrive. The Person JSON-LD on each `/author/<slug>/` page will
reference whatever file is at the path, so make sure something always
exists.
