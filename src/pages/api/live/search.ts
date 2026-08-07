import type { APIRoute } from "astro";
import { EVENTS } from "../../../data/events";
import {
  getResultsLocation,
  getSearchDivisionIds,
} from "../../../lib/hyrox-live";
import {
  getActiveEventsOnDate,
  getRecentlyFinishedEventsOnDate,
  getUpcomingEventsOnDate,
} from "../../../lib/race-status";

export const prerender = false;

/**
 * Athlete search across the official Hyrox timing portal.
 *
 * The portal has no cross-race search: every query must name one division-day
 * id, and `event=ALL` is silently ignored. Asking without an id returns
 * whichever race the portal defaults to — which is why this endpoint used to
 * answer Cape Town Pro Friday for every search regardless of the race the
 * spectator picked.
 *
 * So a race is optional here, but only because we fan out: with no race we
 * search every division of every race that is live now, and fall back to
 * recently-finished and imminent races when nothing is on the floor. Each match
 * carries the race it was actually found in.
 *
 * Query params:
 *   q      - surname or bib (required)
 *   type   - "name" | "bib"
 *   race   - optional "<slug>:<year>" to search a single race
 */

interface LiveMatch {
  idp: string;
  event: string;
  name: string;
  bib: string | null;
  country: string | null;
  ageGroup: string | null;
  totalTime: string | null;
  divisionLabel: string | null;
  detailUrl: string;
  raceSlug: string;
  raceYear: number;
  raceName: string;
  season: string;
}

const HX_BASE = "https://results.hyrox.com";
const HX_BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
};

/** Upstream is a third party — cap how hard one visitor can make us hit it. */
const MAX_DIVISIONS_PER_REQUEST = 60;
const UPSTREAM_CONCURRENCY = 8;

const DIVISION_LABELS: Record<string, string> = {
  HPRO: "HYROX PRO",
  HOPEN: "HYROX",
  HSAT: "HYROX (Sat)",
  HSUN: "HYROX (Sun)",
  HD: "HYROX DOUBLES",
  HDP: "HYROX PRO DOUBLES",
  HMD: "HYROX MIXED DOUBLES",
  HRELAY: "HYROX TEAM RELAY",
  HMR: "HYROX TEAM RELAY",
  HADP: "HYROX ADAPTIVE",
  HA: "HYROX ADAPTIVE",
  H: "HYROX",
  HE: "HYROX ELITE 15",
  HDE: "HYROX ELITE 15 DOUBLES",
};

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

function divisionFromEventId(eventId: string): string | null {
  const prefix = eventId.split("_")[0];
  return DIVISION_LABELS[prefix] ?? null;
}

interface RaceContext {
  slug: string;
  year: number;
  name: string;
  season: string;
}

function parseMatches(
  html: string,
  race: RaceContext,
  divisionLabelFallback: string | null,
): LiveMatch[] {
  const matches: LiveMatch[] = [];
  const itemRx = /<li class="[^"]*list-group-item[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRx.exec(html)) !== null) {
    const block = m[1];
    const link = block.match(/<a\s+href="([^"]*idp=[^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!link) continue;
    const href = decodeHtml(link[1]);
    const name = decodeHtml(link[2].replace(/<[^>]+>/g, "")).trim();
    if (!name) continue;
    const idpMatch = href.match(/[?&]idp=([^&]+)/);
    const eventMatch = href.match(/[?&]event=([^&]+)/);
    if (!idpMatch || !eventMatch) continue;
    const idp = decodeURIComponent(idpMatch[1]);
    const event = decodeURIComponent(eventMatch[1]);
    if (!idp || !event) continue;

    const country =
      block.match(/<span class="nation__abbr">([A-Z]+)<\/span>/)?.[1] ?? null;

    let bib: string | null = null;
    const bibBlock = block.match(
      /type-start_no[^>]*>(?:<div[^>]*>[^<]*<\/div>)?\s*([^<][^<]*?)\s*<\/div>/,
    );
    if (bibBlock) {
      const cleaned = bibBlock[1].replace(/\s+/g, " ").trim();
      if (cleaned && cleaned !== "–") bib = cleaned;
    }

    // The Mika template wraps the value in an outer field div with an
    // optional inner mobile-only label div. Capture the bare text *after*
    // the optional inner <div>.
    let ageGroup: string | null = null;
    const ageBlock = block.match(
      /type-age_class[^>]*>(?:<div[^>]*>[^<]*<\/div>)?\s*([^<][^<]*?)\s*<\/div>/,
    );
    if (ageBlock) {
      const cleaned = ageBlock[1].replace(/\s+/g, " ").trim();
      if (cleaned && cleaned !== "–") ageGroup = cleaned;
    }

    let totalTime: string | null = null;
    const timeBlock = block.match(
      /type-time[^>]*>(?:<div[^>]*>[^<]*<\/div>)?\s*(?:<span[^>]*>([^<]+)<\/span>|([^<\s][^<]*?))\s*<\/div>/,
    );
    if (timeBlock) {
      const raw = (timeBlock[1] ?? timeBlock[2] ?? "").trim();
      const tm = /(\d{1,2}:\d{2}:\d{2})/.exec(raw);
      if (tm) totalTime = tm[1];
    }

    const slug = href.replace(/^[^?]*/, "");
    matches.push({
      idp,
      event,
      name,
      bib,
      country,
      ageGroup,
      totalTime,
      divisionLabel: divisionFromEventId(event) ?? divisionLabelFallback,
      detailUrl: `${HX_BASE}/${race.season}/${slug}`,
      raceSlug: race.slug,
      raceYear: race.year,
      raceName: race.name,
      season: race.season,
    });
  }
  return matches;
}

function dedupe(list: LiveMatch[]): LiveMatch[] {
  const seen = new Set<string>();
  const out: LiveMatch[] = [];
  for (const m of list) {
    const key = `${m.idp}|${m.event}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(m);
  }
  return out;
}

/** Races to search when the spectator hasn't named one. */
function candidateRaces(now: Date): RaceContext[] {
  const pools = [
    getActiveEventsOnDate(now, EVENTS),
    getRecentlyFinishedEventsOnDate(now, 14, EVENTS),
    getUpcomingEventsOnDate(now, 10, EVENTS),
  ];
  const out: RaceContext[] = [];
  const seen = new Set<string>();
  for (const pool of pools) {
    for (const ev of pool) {
      const key = `${ev.year}:${ev.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const located = getResultsLocation(ev.slug, ev.year);
      if (!located) continue;
      out.push({
        slug: ev.slug,
        year: ev.year,
        name: `Hyrox ${ev.city} ${ev.year}`,
        season: located.season,
      });
    }
    // A live race is what spectators mean by "now" — don't dilute the results
    // (or the upstream budget) with older races when one is on the floor.
    if (out.length > 0) break;
  }
  return out;
}

interface Task {
  race: RaceContext;
  divisionId: string;
  divisionLabel: string | null;
}

function buildTasks(races: RaceContext[]): Task[] {
  const tasks: Task[] = [];
  for (const race of races) {
    const located = getResultsLocation(race.slug, race.year);
    if (!located) continue;
    const ids = new Set(getSearchDivisionIds(located));
    for (const d of located.divisions) {
      if (!ids.has(d.id)) continue;
      tasks.push({ race, divisionId: d.id, divisionLabel: d.label });
    }
  }
  return tasks.slice(0, MAX_DIVISIONS_PER_REQUEST);
}

async function runTask(
  task: Task,
  q: string,
  type: "name" | "bib",
): Promise<LiveMatch[]> {
  const param = type === "bib" ? "search%5Bstart_no%5D" : "search%5Bname%5D";
  const url =
    `${HX_BASE}/${task.race.season}/?pid=search` +
    `&event=${encodeURIComponent(task.divisionId)}` +
    `&${param}=${encodeURIComponent(q)}`;
  try {
    const res = await fetch(url, {
      headers: { ...HX_BROWSER_HEADERS, Referer: `${HX_BASE}/${task.race.season}/` },
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseMatches(html, task.race, task.divisionLabel);
  } catch {
    return [];
  }
}

/** Worker pool so a 40-division weekend doesn't open 40 sockets at once. */
async function fanOut(
  tasks: Task[],
  q: string,
  type: "name" | "bib",
): Promise<{ matches: LiveMatch[]; failures: number }> {
  const collected: LiveMatch[] = [];
  let cursor = 0;
  let failures = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      const found = await runTask(task, q, type);
      if (found.length === 0) failures++;
      collected.push(...found);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(UPSTREAM_CONCURRENCY, tasks.length) }, worker),
  );
  return { matches: dedupe(collected), failures };
}

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get("q") ?? "").trim();
  const type = url.searchParams.get("type") === "bib" ? "bib" : "name";
  const raceParam = url.searchParams.get("race");

  if (!q) {
    return json({ matches: [], error: "missing query" }, 400);
  }
  if (!/^[\w\d\-\s.,'']{1,80}$/u.test(q)) {
    return json({ matches: [], error: "invalid query" }, 400);
  }

  const now = new Date();
  let races: RaceContext[];
  if (raceParam) {
    const [slug, yearStr] = raceParam.split(":");
    const year = Number(yearStr);
    const ev = EVENTS.find((e) => e.slug === slug && e.year === year);
    const located = ev ? getResultsLocation(ev.slug, ev.year) : null;
    if (!ev || !located) {
      return json(
        {
          matches: [],
          error: "unmapped race",
          detail:
            "Hyrox hasn't published a startlist for that race yet, so there is nothing to search.",
        },
        404,
      );
    }
    races = [
      {
        slug: ev.slug,
        year: ev.year,
        name: `Hyrox ${ev.city} ${ev.year}`,
        season: located.season,
      },
    ];
  } else {
    races = candidateRaces(now);
  }

  if (races.length === 0) {
    return json(
      {
        matches: [],
        error: "no searchable races",
        detail:
          "No Hyrox race is live, recently finished, or has a published startlist right now.",
      },
      200,
    );
  }

  const tasks = buildTasks(races);
  if (tasks.length === 0) {
    return json({ matches: [], error: "no divisions" }, 200);
  }

  const { matches } = await fanOut(tasks, q, type);

  // Finished entries first (they have a time), then alphabetically — a
  // spectator scanning a long surname list wants the settled results at top.
  matches.sort(
    (a, b) =>
      Number(Boolean(b.totalTime)) - Number(Boolean(a.totalTime)) ||
      a.raceName.localeCompare(b.raceName) ||
      a.name.localeCompare(b.name),
  );

  return new Response(
    JSON.stringify({
      matches,
      races: races.map((r) => ({ slug: r.slug, year: r.year, name: r.name })),
      divisionsSearched: tasks.length,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    },
  );
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
