/**
 * Every affiliate productKey referenced by content or page code must exist in
 * src/data/affiliateLinks.ts.
 *
 * A missing key does not crash anything: /go/<key> logs a warning and bounces
 * the visitor to /gear/. That is the right runtime behaviour and exactly the
 * wrong thing to discover from analytics three weeks later, so it fails here
 * instead.
 *
 * Run: node scripts/check-affiliate-keys.mjs
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not URL.pathname: this repo lives under a path with spaces and
// the raw pathname keeps them percent-encoded.
const ROOT = fileURLToPath(new URL("..", import.meta.url));

const known = new Set(
  [...(await readFile(join(ROOT, "src/data/affiliateLinks.ts"), "utf8")).matchAll(
    /productKey:\s*"([^"]+)"/g,
  )].map((m) => m[1]),
);

const problems = [];

// 1. Supplement guides declare a key per product.
const supplementsDir = join(ROOT, "src/content/supplements");
for (const file of await readdir(supplementsDir)) {
  const text = await readFile(join(supplementsDir, file), "utf8");
  for (const m of text.matchAll(/^\s*productKey:\s*"([^"]+)"/gm)) {
    if (!known.has(m[1])) {
      problems.push(`src/content/supplements/${file}: unknown productKey "${m[1]}"`);
    }
  }
}

// 2. Gear comparisons reference two keys per row.
const gear = await readFile(join(ROOT, "src/data/gear-comparisons.ts"), "utf8");
for (const m of gear.matchAll(/product[AB]Key:\s*"([^"]+)"/g)) {
  if (!known.has(m[1])) {
    problems.push(`src/data/gear-comparisons.ts: unknown productKey "${m[1]}"`);
  }
}

// 3. Literal keys passed straight to a button in page code.
for (const page of ["src/pages/index.astro"]) {
  const text = await readFile(join(ROOT, page), "utf8");
  for (const m of text.matchAll(/productKey:\s*"([^"]+)"/g)) {
    if (!known.has(m[1])) problems.push(`${page}: unknown productKey "${m[1]}"`);
  }
}

if (problems.length) {
  console.error(`Unknown affiliate product keys (${problems.length}):`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(`\nKnown keys: ${[...known].sort().join(", ")}`);
  process.exit(1);
}

console.log(`Affiliate keys OK — ${known.size} registered, all references resolve.`);
