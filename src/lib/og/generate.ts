/**
 * Build-time PNG generator for Open Graph cards.
 *
 * Wraps satori (JSX/element tree -> SVG) and resvg-js (SVG -> PNG).
 * Fonts are loaded once from public/fonts/ and cached for the build run.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { ogTemplate, type OgTemplateInput } from "./template";

// Resolve via Node module resolution so this works from any CWD during build.
// We use WOFF (not WOFF2 — satori does not decode WOFF2) from @fontsource/inter,
// installed as a build dependency.
const requireFromHere = createRequire(import.meta.url);
const fontDir = path.join(
  path.dirname(requireFromHere.resolve("@fontsource/inter/package.json")),
  "files"
);

let cachedFonts:
  | { name: string; data: Buffer; weight: 400 | 700 | 900; style: "normal" }[]
  | null = null;

async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  const regular = fs.readFileSync(path.join(fontDir, "inter-latin-400-normal.woff"));
  const bold = fs.readFileSync(path.join(fontDir, "inter-latin-700-normal.woff"));
  const black = fs.readFileSync(path.join(fontDir, "inter-latin-900-normal.woff"));
  cachedFonts = [
    { name: "Inter", data: regular, weight: 400, style: "normal" },
    { name: "Inter", data: bold, weight: 700, style: "normal" },
    { name: "Inter", data: black, weight: 900, style: "normal" },
  ];
  return cachedFonts;
}

export async function generateOgImage(input: OgTemplateInput): Promise<Buffer> {
  const fonts = await loadFonts();
  // satori expects a React-element-shaped tree; the template returns one without JSX.
  const svg = await satori(ogTemplate(input) as unknown as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts,
  });
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    background: "rgba(0,0,0,1)",
  });
  return Buffer.from(resvg.render().asPng());
}
