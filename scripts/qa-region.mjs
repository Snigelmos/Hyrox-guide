#!/usr/bin/env node
/**
 * Universal QA + typed module emitter.
 *
 * Usage: node scripts/qa-region.mjs <regionId> [--no-url-check]
 *
 * Reads _research/<regionId>-discovered.json, applies strict QA rules
 * from scripts/lib/qa-rules.mjs, optionally HEAD-checks every website
 * URL, dedupes by venue, and emits:
 *
 *   src/data/<regionId>-gyms.generated.ts
 *   _research/<regionId>-qa-report.md
 *
 * The generated module exports `<UPPER>_GYMS: Gym[]` (e.g. UK_GYMS).
 *
 * Pass `--no-url-check` to skip the HTTP HEAD validation pass (useful
 * when iterating quickly or behind a flaky network).
 */

import { writeFileSync, readFileSync } from "node:fs";
import {
  classifyRecord,
  batchUrlHealth,
} from "./lib/qa-rules.mjs";
import {
  toGym,
  emitModule,
  venueDedupe,
} from "./lib/gym-emit.mjs";
import { loadJson } from "./lib/store-search.mjs";

const ROOT = process.cwd();
const regionId = process.argv[2];
const skipUrlCheck = process.argv.includes("--no-url-check");

if (!regionId) {
  console.error("Usage: node scripts/qa-region.mjs <regionId> [--no-url-check]");
  process.exit(1);
}

const CONFIG_PATH = `${ROOT}/_research/regions/${regionId}.config.json`;
const IN_PATH = `${ROOT}/_research/${regionId}-discovered.json`;
const OUT_TS = `${ROOT}/src/data/${regionId}-gyms.generated.ts`;
const OUT_REPORT = `${ROOT}/_research/${regionId}-qa-report.md`;

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
const records = loadJson(IN_PATH, []);

console.log(`QA region ${regionId} (${records.length} records)`);

const seenIds = new Set();
const passed = [];
const dropped = [];
const flagged = [];

for (const rec of records) {
  const { reasons, warnings } = classifyRecord(rec, config, seenIds);
  if (reasons.length > 0) {
    dropped.push({ rec, reasons });
    continue;
  }
  seenIds.add(rec.id);
  if (warnings.length > 0) flagged.push({ slug: rec.slug, name: rec.name, warnings });
  passed.push(rec);
}

console.log(`  Strict pass: ${passed.length} kept, ${dropped.length} dropped`);

// URL health check.
let urlReport = new Map();
if (!skipUrlCheck) {
  const urls = passed.map((r) => r.url).filter(Boolean);
  if (urls.length > 0) {
    console.log(`  URL HEAD checking ${urls.length} websites...`);
    urlReport = await batchUrlHealth(urls, { concurrency: 20, timeoutMs: 8000 });
    let okCount = 0;
    let badCount = 0;
    for (const r of passed) {
      if (!r.url) continue;
      const result = urlReport.get(r.url);
      if (!result || !result.ok) {
        r.url = undefined;
        flagged.push({
          slug: r.slug,
          name: r.name,
          warnings: ["url-dead-cleared"],
        });
        badCount++;
      } else {
        okCount++;
      }
    }
    console.log(`    ${okCount} OK, ${badCount} cleared`);
  }
}

// Re-apply hasViableContact after URL clearing — some records that
// passed thanks to a broken URL now lose their only contact channel.
const stillPassing = [];
const droppedAfterUrlCheck = [];
for (const r of passed) {
  if (!r.url) {
    // Re-classify against config; if it now fails for "no website + no street",
    // drop it.
    const recheck = classifyRecord(r, config, new Set());
    if (recheck.reasons.length > 0) {
      droppedAfterUrlCheck.push({ rec: r, reasons: recheck.reasons });
      continue;
    }
  }
  stillPassing.push(r);
}

// Map to Gym shape.
let gyms = stillPassing.map((r) => toGym(r, { verifiedAt: config.verifiedAt ?? "2026-04" }));

// Venue dedupe.
const { kept, dropped: dedupeDropped } = venueDedupe(gyms);
gyms = kept;

// Sort.
gyms.sort((a, b) => {
  if (a.country !== b.country) return a.country.localeCompare(b.country);
  if (a.city !== b.city) return a.city.localeCompare(b.city);
  return a.name.localeCompare(b.name);
});

// Emit TS.
const exportName = (config.exportName ?? `${regionId.toUpperCase()}_GYMS`);
const tsModule = emitModule({
  exportName,
  regionLabel: config.regionLabel ?? regionId,
  gyms,
  sourceFile: IN_PATH.replace(ROOT, "").replace(/\\/g, "/"),
});
writeFileSync(OUT_TS, tsModule);

// Emit report.
const lines = [];
lines.push(`# QA report — ${config.regionLabel ?? regionId}`);
lines.push("");
lines.push(`Generated ${new Date().toISOString()}`);
lines.push("");
lines.push(`- Discovered: ${records.length}`);
lines.push(`- Strict pass: ${stillPassing.length} (after URL check)`);
lines.push(`- After venue dedupe: ${gyms.length}`);
lines.push(`- Strict drop: ${dropped.length}`);
lines.push(`- Dropped after URL clearing: ${droppedAfterUrlCheck.length}`);
lines.push(`- Venue dedupe drop: ${dedupeDropped.length}`);
lines.push(`- Flagged (kept with warnings): ${flagged.length}`);
lines.push("");

const byCountry = {};
for (const g of gyms) byCountry[g.country] = (byCountry[g.country] ?? 0) + 1;
lines.push("## Final dataset by country");
lines.push("");
for (const [k, v] of Object.entries(byCountry).sort()) {
  lines.push(`- ${k}: ${v}`);
}
lines.push("");

if (dropped.length > 0) {
  lines.push("## Strict-rule drops");
  lines.push("");
  lines.push("| slug | name | city | country | reasons |");
  lines.push("|---|---|---|---|---|");
  for (const d of dropped.slice(0, 200)) {
    lines.push(
      `| ${d.rec.slug ?? d.rec.id} | ${d.rec.name} | ${d.rec.city} | ${d.rec.country} | ${d.reasons.join("; ")} |`,
    );
  }
  if (dropped.length > 200) lines.push(`\n_(showing first 200 of ${dropped.length})_`);
  lines.push("");
}

if (droppedAfterUrlCheck.length > 0) {
  lines.push("## Dropped after URL HEAD failed");
  lines.push("");
  for (const d of droppedAfterUrlCheck.slice(0, 100)) {
    lines.push(`- ${d.rec.slug ?? d.rec.id} (${d.rec.name}, ${d.rec.city}): ${d.reasons.join("; ")}`);
  }
  lines.push("");
}

if (dedupeDropped.length > 0) {
  lines.push("## Venue duplicates merged");
  lines.push("");
  for (const d of dedupeDropped.slice(0, 100)) {
    lines.push(`- ${d.slug} merged into ${d.keptSlug} (${d.name} @ ${d.city})`);
  }
  lines.push("");
}

if (flagged.length > 0) {
  lines.push("## Flagged (kept) with warnings");
  lines.push("");
  for (const f of flagged.slice(0, 100)) {
    lines.push(`- ${f.slug} (${f.name}): ${f.warnings.join(", ")}`);
  }
  lines.push("");
}

writeFileSync(OUT_REPORT, lines.join("\n"));

console.log("");
console.log(`Wrote ${gyms.length} gyms -> ${OUT_TS}`);
console.log(`Report: ${OUT_REPORT}`);
