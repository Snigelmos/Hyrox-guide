import type { APIRoute } from "astro";

export const prerender = false;

interface LiveSplit {
  kind: "run" | "station";
  index: number;
  label: string;
  time: string;
  place: number | null;
}

interface LiveAthleteSnapshot {
  athlete: {
    name: string;
    bib: string | null;
    country: string | null;
    ageGroup: string | null;
    division: string | null;
    race: string | null;
  };
  splits: LiveSplit[];
  totalTime: string | null;
  rankOverall: number | null;
  rankAge: number | null;
  isFinished: boolean;
  fetchedAt: string;
  source: string;
}

const HX_BASE = "https://results.hyrox.com";

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripTags(s: string): string {
  return decodeHtml(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function extractCellValue(html: string, label: string): string | null {
  const rx = new RegExp(
    `<th[^>]*class="[^"]*desc[^"]*"[^>]*>\\s*${escapeRegex(label)}\\s*</th>\\s*<td[^>]*>([\\s\\S]*?)</td>`,
    "i",
  );
  const m = rx.exec(html);
  if (!m) return null;
  const v = stripTags(m[1]);
  if (!v || v === "–") return null;
  return v;
}

function parseTimeFromCell(cellHtml: string): string | null {
  const v = stripTags(cellHtml);
  if (!v || v === "–") return null;
  const m = /(\d{1,2}:\d{2}:\d{2})/.exec(v);
  return m ? m[1] : null;
}

function parsePlaceFromCell(cellHtml: string): number | null {
  const v = stripTags(cellHtml);
  if (!v || v === "–") return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
}

function parseSplits(html: string): LiveSplit[] {
  const splits: LiveSplit[] = [];
  for (let n = 1; n <= 8; n++) {
    // Run row: <tr class=" f-time_0N">
    const runRx = new RegExp(
      `<tr[^>]*class="[^"]*\\bf-time_0${n}\\b[^"]*"[^>]*>([\\s\\S]*?)</tr>`,
    );
    const runM = runRx.exec(html);
    if (runM) {
      const block = runM[1];
      const labelM = block.match(/<th[^>]*>([\s\S]*?)<\/th>/);
      const timeM = block.match(
        new RegExp(`<td[^>]*class="[^"]*f-time_0${n}\\b[^"]*"[^>]*>([\\s\\S]*?)</td>`),
      );
      const label = labelM ? stripTags(labelM[1]) : `Running ${n}`;
      const time = timeM ? parseTimeFromCell(timeM[1]) : null;
      if (time) {
        splits.push({ kind: "run", index: n, label, time, place: null });
      }
    }
    // Station row: <tr class="list-highlight f-time_1N">
    const stRx = new RegExp(
      `<tr[^>]*class="[^"]*list-highlight[^"]*\\bf-time_1${n}\\b[^"]*"[^>]*>([\\s\\S]*?)</tr>`,
    );
    const stM = stRx.exec(html);
    if (stM) {
      const block = stM[1];
      const labelM = block.match(/<th[^>]*>([\s\S]*?)<\/th>/);
      const timeM = block.match(
        new RegExp(`<td[^>]*class="[^"]*f-time_1${n}\\b[^"]*"[^>]*>([\\s\\S]*?)</td>`),
      );
      const placeM = block.match(
        /<td[^>]*class="\s*last\s*"[^>]*>([\s\S]*?)<\/td>/,
      );
      const label = labelM ? stripTags(labelM[1]) : `Station ${n}`;
      const time = timeM ? parseTimeFromCell(timeM[1]) : null;
      const place = placeM ? parsePlaceFromCell(placeM[1]) : null;
      if (time) {
        splits.push({ kind: "station", index: n, label, time, place });
      }
    }
  }
  return splits;
}

function parseSnapshot(html: string, source: string): LiveAthleteSnapshot | null {
  const name = extractCellValue(html, "Name");
  if (!name) return null;
  const bib = extractCellValue(html, "Bib Number");
  const ageGroup = extractCellValue(html, "Age Group");
  const country =
    html.match(/<span class="nation__abbr">([A-Z]+)<\/span>/)?.[1] ?? null;
  const division = extractCellValue(html, "Division");
  const race = extractCellValue(html, "Race");
  const rankOverallStr = extractCellValue(html, "Rank \\(M/W\\)") ?? extractCellValue(html, "Rank (M/W)");
  const rankAgeStr = extractCellValue(html, "Rank \\(AG\\)") ?? extractCellValue(html, "Rank (AG)");

  // Overall finish time lives in <tr class=" f-time_finish_netto right">
  const overallM = html.match(
    /<tr[^>]*class="[^"]*f-time_finish_netto[^"]*"[^>]*>[\s\S]*?<td[^>]*class="[^"]*f-time_finish_netto[^"]*"[^>]*>([\s\S]*?)<\/td>/,
  );
  const totalTime = overallM ? parseTimeFromCell(overallM[1]) : null;

  const splits = parseSplits(html);
  const stationsDone = splits.filter((s) => s.kind === "station").length;
  const isFinished = totalTime !== null || stationsDone === 8;

  return {
    athlete: { name, bib, country, ageGroup, division, race },
    splits,
    totalTime,
    rankOverall: rankOverallStr ? parseInt(rankOverallStr, 10) || null : null,
    rankAge: rankAgeStr ? parseInt(rankAgeStr, 10) || null : null,
    isFinished,
    fetchedAt: new Date().toISOString(),
    source,
  };
}

export const GET: APIRoute = async ({ url }) => {
  const idp = (url.searchParams.get("idp") ?? "").trim();
  const event = (url.searchParams.get("event") ?? "").trim();
  const season = url.searchParams.get("season") ?? "season-9";

  if (!idp || !event) {
    return json({ error: "missing idp or event" }, 400);
  }
  if (!/^[A-Za-z0-9_]{4,40}$/.test(idp)) {
    return json({ error: "invalid idp" }, 400);
  }
  if (!/^[A-Za-z0-9_]{4,60}$/.test(event)) {
    return json({ error: "invalid event" }, 400);
  }
  if (!/^season-\d{1,2}$/.test(season)) {
    return json({ error: "invalid season" }, 400);
  }

  const params = new URLSearchParams({
    content: "detail",
    fpid: "search",
    pid: "search",
    idp,
    lang: "EN_CAP",
    event,
  });
  const upstream = `${HX_BASE}/${season}/?${params.toString()}`;

  let html: string;
  try {
    const res = await fetch(upstream, {
      headers: {
        "User-Agent": "HyroxVault-Live/1.0 (+https://hyroxvault.com/live/)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      return json({ error: `upstream ${res.status}` }, 502);
    }
    html = await res.text();
  } catch {
    return json({ error: "fetch failed" }, 502);
  }

  const snapshot = parseSnapshot(html, upstream);
  if (!snapshot) {
    return json({ error: "could not parse athlete" }, 502);
  }

  return new Response(JSON.stringify(snapshot), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
    },
  });
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
