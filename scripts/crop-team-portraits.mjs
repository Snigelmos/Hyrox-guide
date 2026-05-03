#!/usr/bin/env node
/**
 * One-shot script: take a horizontal triptych (left/middle/right portraits
 * of John, Niklas, Jesper) and emit three square portraits ready for the
 * /author/, /about/ and /team/ surfaces.
 *
 * Source : ./team-source.png  (any horizontal image whose width is roughly
 *          three times its height, with one face centred per third)
 * Output : public/team/john.jpg, niklas.jpg, jesper.jpg
 *
 * Each output is a centred square crop of the corresponding third of the
 * source, resized to 512×512 and re-encoded as a JPG at quality 82.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "team-source.png");
const OUT_DIR = join(ROOT, "public", "team");

const NAMES = ["john", "niklas", "jesper"];
const OUT_SIZE = 512;
const QUALITY = 82;

async function main() {
  const meta = await sharp(SRC).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Could not read source dimensions.");
  }
  const panelWidth = Math.floor(meta.width / 3);
  // Inset each panel horizontally so the hairline divider between source
  // panels does not bleed into the cropped portrait.
  const inset = 8;
  const sideLen = Math.min(panelWidth - inset * 2, meta.height);
  // Faces in the source triptych sit in the upper portion of each panel.
  // A pure vertical centre crop loses the head, so bias the square up by
  // ~12 % of the source height to land the face roughly in the middle.
  const yOffset = Math.max(
    0,
    Math.floor((meta.height - sideLen) / 2 - meta.height * 0.12),
  );

  console.log(
    `Source: ${meta.width}×${meta.height}, panel=${panelWidth}, square=${sideLen}, yOffset=${yOffset}`,
  );

  for (let i = 0; i < NAMES.length; i++) {
    const name = NAMES[i];
    const xOffset =
      i * panelWidth + inset + Math.floor((panelWidth - inset * 2 - sideLen) / 2);
    const outPath = join(OUT_DIR, `${name}.jpg`);
    await sharp(SRC)
      .extract({ left: xOffset, top: yOffset, width: sideLen, height: sideLen })
      .resize(OUT_SIZE, OUT_SIZE)
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(outPath);
    console.log(`Wrote ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
