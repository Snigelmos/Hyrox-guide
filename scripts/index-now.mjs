#!/usr/bin/env node
/**
 * scripts/index-now.mjs
 *
 * Pings IndexNow (used by Bing, Yandex, Seznam) with a list of URLs so they
 * get crawled immediately after publishing instead of waiting for the usual
 * sitemap pull.
 *
 * Usage:
 *   node scripts/index-now.mjs https://hyroxvault.com/blog/my-new-post/ \
 *                              https://hyroxvault.com/blog/
 *
 * Or with no args, it pings every blog post URL derived from src/content/blog.
 */

import { readdir } from "node:fs/promises";
import path from "node:path";

const HOST = "www.hyroxvault.com";
const KEY = "66ba454ee442174bc368efc9f6bc6c19";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/IndexNow";

async function collectBlogUrls() {
  const dir = path.resolve("src/content/blog");
  const files = await readdir(dir);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => `https://${HOST}/blog/${f.replace(/\.mdx$/, "")}/`);
}

async function main() {
  const argv = process.argv.slice(2);
  const urlList = argv.length > 0 ? argv : await collectBlogUrls();

  if (urlList.length === 0) {
    console.log("No URLs to submit.");
    return;
  }

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  console.log(`Pinging IndexNow with ${urlList.length} URL(s)...`);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  if (res.status >= 200 && res.status < 300) {
    console.log(`OK (${res.status}) — URLs submitted.`);
  } else {
    const text = await res.text().catch(() => "");
    console.error(`FAILED (${res.status}): ${text}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
