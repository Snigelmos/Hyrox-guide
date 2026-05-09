import type { APIRoute } from "astro";

export const prerender = false;

interface LiveMatch {
  idp: string;
  event: string;
  name: string;
  country: string | null;
  ageGroup: string | null;
  totalTime: string | null;
  divisionLabel: string | null;
  detailUrl: string;
}

const HX_BASE = "https://results.hyrox.com";

const DIVISION_LABELS: Record<string, string> = {
  HPRO: "HYROX PRO",
  HOPEN: "HYROX",
  HSAT: "HYROX (Sat)",
  HSUN: "HYROX (Sun)",
  HD: "HYROX DOUBLES",
  HDP: "HYROX PRO DOUBLES",
  HMD: "HYROX MIXED DOUBLES",
  HRELAY: "HYROX TEAM RELAY",
  HADP: "HYROX ADAPTIVE",
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

function parseMatches(html: string): LiveMatch[] {
  const matches: LiveMatch[] = [];
  const itemRx =
    /<li class="[^"]*list-group-item[^"]*"[^>]*>([\s\S]*?)<\/li>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRx.exec(html)) !== null) {
    const block = m[1];
    const link = block.match(
      /<a\s+href="([^"]*idp=[^"]+)"[^>]*>([\s\S]*?)<\/a>/,
    );
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
      country,
      ageGroup,
      totalTime,
      divisionLabel: divisionFromEventId(event),
      detailUrl: `${HX_BASE}/season-9/${slug}`,
    });
  }
  return dedupe(matches);
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

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get("q") ?? "").trim();
  const type = url.searchParams.get("type") === "bib" ? "bib" : "name";
  const season = url.searchParams.get("season") ?? "season-9";

  if (!q) {
    return json({ matches: [], error: "missing query" }, 400);
  }
  if (!/^[\w\d\-\s.,'']{1,80}$/u.test(q)) {
    return json({ matches: [], error: "invalid query" }, 400);
  }
  if (!/^season-\d{1,2}$/.test(season)) {
    return json({ matches: [], error: "invalid season" }, 400);
  }

  const param = type === "bib" ? "search%5Bstart_no%5D" : "search%5Bname%5D";
  const upstream = `${HX_BASE}/${season}/?pid=search&${param}=${encodeURIComponent(q)}`;

  let html: string;
  try {
    const res = await fetch(upstream, {
      headers: {
        "User-Agent":
          "HyroxVault-Live/1.0 (+https://hyroxvault.com/live/)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      return json({ matches: [], error: `upstream ${res.status}` }, 502);
    }
    html = await res.text();
  } catch {
    return json({ matches: [], error: "fetch failed" }, 502);
  }

  const matches = parseMatches(html);
  return new Response(JSON.stringify({ matches, source: upstream }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
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
