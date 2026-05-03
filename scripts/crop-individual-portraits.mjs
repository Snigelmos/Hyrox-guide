#!/usr/bin/env node
/**
 * Crop three individual portrait sources (one per person) into the
 * 512x512 JPGs we use for /author/* and the About page.
 *
 * Inputs (placed in repo root before running):
 *   src-john.png
 *   src-niklas.png
 *   src-jesper.png
 *
 * Outputs:
 *   public/team/john.jpg
 *   public/team/niklas.jpg
 *   public/team/jesper.jpg
 *
 * Composition: crop a square that takes the full image width and biases
 * vertically so the face (which sits in the upper third of all three
 * sources) ends up roughly centred in the square. We avoid the very top
 * edge so we don't chop off hair.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TARGET = 512;

const PEOPLE = [
  { src: "src-john.png", out: "public/team/john.jpg" },
  { src: "src-niklas.png", out: "public/team/niklas.jpg" },
  { src: "src-jesper.png", out: "public/team/jesper.jpg" },
];

for (const { src, out } of PEOPLE) {
  const inPath = join(ROOT, src);
  const outPath = join(ROOT, out);
  const img = sharp(inPath);
  const meta = await img.metadata();
  const { width, height } = meta;

  // Square side equals the image width (these sources are portrait orientation).
  const side = Math.min(width, height);

  // Vertical position: start a small fraction of the height from the top so
  // we don't cut hair, but keep the face well inside the frame.
  // For our portrait sources (face in upper ~35% of the image), starting at
  // ~6% of height puts the eyes near the rule-of-thirds upper line of the
  // 512x512 crop.
  const top = Math.max(0, Math.round(height * 0.06));
  const cropTop = Math.min(top, height - side);

  // Horizontal: dead centre.
  const left = Math.max(0, Math.round((width - side) / 2));

  await sharp(inPath)
    .extract({ left, top: cropTop, width: side, height: side })
    .resize(TARGET, TARGET, { fit: "cover" })
    .jpeg({ quality: 85, progressive: true, mozjpeg: true })
    .toFile(outPath);

  console.log(`${out}  ${width}x${height} -> ${TARGET}x${TARGET}`);
}
