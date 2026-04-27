// Generates favicon PNGs from public/favicon.svg using sharp.
// Run: node scripts/generate-favicons.mjs
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "..", "public");
const svgPath = path.join(publicDir, "favicon.svg");

const ACCENT = "#38bdf8";
const BG = "#09090b";

// A maskable icon needs ~20% safe-area padding around the logo so platforms
// can crop it into circles/squircles without clipping the mark.
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="512" height="512">
  <rect width="100" height="100" fill="${ACCENT}"/>
  <path d="M30 30 H38 V46 H62 V30 H70 V70 H62 V54 H38 V70 H30 Z" fill="${BG}"/>
</svg>`;

async function main() {
  const svg = await readFile(svgPath);

  const targets = [
    { size: 16, file: "favicon-16.png" },
    { size: 32, file: "favicon-32.png" },
    { size: 48, file: "favicon-48.png" },
    { size: 180, file: "apple-touch-icon.png" },
    { size: 192, file: "icon-192.png" },
    { size: 512, file: "icon-512.png" },
  ];

  for (const { size, file } of targets) {
    const out = path.join(publicDir, file);
    await sharp(svg, { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`wrote ${file} (${size}x${size})`);
  }

  await sharp(Buffer.from(maskableSvg), { density: 384 })
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, "icon-maskable-512.png"));
  console.log("wrote icon-maskable-512.png (512x512)");

  // Build a minimal multi-image .ico (16, 32, 48) so legacy clients and the
  // /favicon.ico convention work without a separate dependency.
  const icoSizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    icoSizes.map((size) =>
      sharp(svg, { density: 384 })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer(),
    ),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(icoSizes.length, 4);

  const dirEntries = [];
  let offset = 6 + 16 * icoSizes.length;
  for (let i = 0; i < icoSizes.length; i++) {
    const size = icoSizes[i];
    const png = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(png.length, 8); // bytes
    entry.writeUInt32LE(offset, 12); // offset
    offset += png.length;
    dirEntries.push(entry);
  }

  const ico = Buffer.concat([header, ...dirEntries, ...pngBuffers]);
  await writeFile(path.join(publicDir, "favicon.ico"), ico);
  console.log(`wrote favicon.ico (${icoSizes.join(", ")})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
