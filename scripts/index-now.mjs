#!/usr/bin/env node
/**
 * scripts/index-now.mjs
 *
 * Pings IndexNow (used by Bing, Yandex, Seznam) with a list of URLs so they
 * get crawled immediately after publishing instead of waiting for the usual
 * sitemap pull. Google does not support IndexNow but picks up new URLs from
 * the sitemap within ~24h anyway.
 *
 * Default behaviour (no args):
 *   - Fetches https://www.hyroxvault.com/sitemap-index.xml, walks every
 *     child sitemap, and submits every <loc> URL. This is the canonical
 *     indexable URL set after isIndexableSitemapUrl() filters in
 *     astro.config.ts, so it covers blog posts, hubs, events, gyms,
 *     calculators, methodology — everything that should be in search.
 *
 * Override:
 *   node scripts/index-now.mjs <url> [...<url>]
 *     Submits exactly the listed URLs instead of reading the sitemap.
 *
 * IndexNow accepts up to 10,000 URLs per request; we chunk if needed.
 */

const HOST = "www.hyroxvault.com";
const KEY = "66ba454ee442174bc368efc9f6bc6c19";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";
const SITEMAP_INDEX_URL = `https://${HOST}/sitemap-index.xml`;
const SITEMAP_FALLBACK_URL = `https://${HOST}/sitemap-0.xml`;
const MAX_PER_REQUEST = 10_000;
const USER_AGENT = "hyroxvault-indexnow/1.0 (+https://www.hyroxvault.com)";

async function fetchLocs(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error(`Failed to fetch ${url} (${res.status} ${res.statusText})`);
  }
  const xml = await res.text();
  const matches = xml.match(/<loc>([^<]+)<\/loc>/g) ?? [];
  return matches.map((m) => m.slice(5, -6).trim()).filter(Boolean);
}

async function collectSitemapUrls() {
  const childSitemaps = await fetchLocs(SITEMAP_INDEX_URL);
  if (childSitemaps.length === 0) {
    // Older single-file sitemap layout — fall back to sitemap-0.xml.
    return await fetchLocs(SITEMAP_FALLBACK_URL);
  }
  const urls = new Set();
  for (const child of childSitemaps) {
    const childUrls = await fetchLocs(child);
    for (const u of childUrls) urls.add(u);
  }
  return [...urls];
}

async function submitChunk(urlList) {
  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": USER_AGENT,
    },
    body: JSON.stringify(body),
  });
  if (res.status < 200 || res.status >= 300) {
    const text = await res.text().catch(() => "");
    throw new Error(`IndexNow returned ${res.status}: ${text}`);
  }
  return res.status;
}

async function main() {
  const argv = process.argv.slice(2);
  let urlList;
  if (argv.length > 0) {
    urlList = argv;
    console.log(`Submitting ${urlList.length} URL(s) from CLI args...`);
  } else {
    console.log(`Fetching sitemap index: ${SITEMAP_INDEX_URL}`);
    urlList = await collectSitemapUrls();
    console.log(`Found ${urlList.length} URL(s) across sitemap(s).`);
  }

  if (urlList.length === 0) {
    console.log("No URLs to submit.");
    return;
  }

  for (let i = 0; i < urlList.length; i += MAX_PER_REQUEST) {
    const chunk = urlList.slice(i, i + MAX_PER_REQUEST);
    console.log(`Pinging IndexNow with chunk of ${chunk.length}...`);
    const status = await submitChunk(chunk);
    console.log(`  OK (${status})`);
  }

  console.log(`Done. Submitted ${urlList.length} URL(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
