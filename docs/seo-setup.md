# SEO Setup Walkthrough — hyroxvault.com

This file is your one-time checklist. Do it once and you never touch marketing again — traffic grows from organic search because Google, Bing, and Yandex now know how to find, index, and rank your pages correctly.

Estimated time: ~20 minutes.

---

## 1. Google Search Console (GSC) — verify ownership

GSC is the free dashboard where you see which queries bring people to your site, which pages rank, and any indexing errors. It's the single most important SEO tool.

1. Open https://search.google.com/search-console and sign in with any Google account.
2. Click **Add property** → choose the **Domain** option (not URL prefix).
3. Enter `hyroxvault.com` and click Continue.
4. Google will show a **TXT record** to add to your DNS. Copy it.
5. Open https://vercel.com/dashboard → your `hyroxvault.com` domain → **DNS**.
6. Add a new record:
   - Type: `TXT`
   - Name: `@` (root)
   - Value: the `google-site-verification=...` string from step 4
   - TTL: default
7. Wait 1–5 minutes, return to GSC, click **Verify**.

Then:

8. In the GSC left sidebar, click **Sitemaps**.
9. Enter `sitemap-index.xml` and click **Submit**.

Done. Google will start re-crawling within hours.

---

## 2. Bing Webmaster Tools

Bing drives 5–10% of search traffic (more for affiliate/commercial intent). It's free and takes 1 click if you already did GSC.

1. Open https://www.bing.com/webmasters and sign in.
2. Click **Import from Google Search Console**.
3. Authorise, pick `hyroxvault.com`, click Import.

Bing now has the sitemap and ownership verified automatically.

---

## 3. IndexNow — instant indexing for new posts

Bing, Yandex, and Seznam support **IndexNow**, a tiny API that tells them "this URL just changed, crawl it now." No more waiting days for a new post to appear in search.

Setup (already done in this repo):

- `public/66ba454ee442174bc368efc9f6bc6c19.txt` — the key file Bing will fetch to prove ownership
- `scripts/index-now.mjs` — the script that pings the API

Each time you publish a new post, run:

```bash
npm run indexnow -- https://hyroxvault.com/blog/your-new-post/
```

Or, for convenience after a deploy, run with no arguments to submit every blog URL at once:

```bash
npm run indexnow
```

Google does **not** support IndexNow but they'll pick the post up from the sitemap + RSS feed within ~24h anyway.

---

## 4. RSS feed

Available at https://hyroxvault.com/rss.xml — automatically generated from every blog post.

It's linked from every page's `<head>` via `<link rel="alternate" type="application/rss+xml">`, which:
- Lets Google Discover pick up fresh content faster
- Allows Feedly, Inoreader, and other aggregators to subscribe
- Gives you a URL to submit to r/Hyrox's sidebar or partner newsletters when convenient (but you don't have to)

---

## 5. Monitoring (monthly, 10 minutes)

Once a month, open GSC → **Performance** → **Search results**. Look at:

1. **Top queries** — what people search when they find you. Any that rank position 5–15? Those are your refresh targets — rewrite that post to match the query intent more tightly.
2. **Top pages** — which posts get the most clicks. Add more internal links from these high-traffic pages to your lower-traffic ones.
3. **Pages with impressions but no clicks** — title/description isn't compelling. Rewrite those meta descriptions.

That's it. Don't waste time on anything else.

---

## 6. Optional but worth it: Google Analytics 4 (GA4)

Vercel Analytics is already set up and gives you visitor counts. If you want per-page dwell time and scroll depth, add GA4:

1. https://analytics.google.com → create property for `hyroxvault.com`.
2. Copy the measurement ID (`G-XXXXXXX`).
3. Add this block to `src/layouts/BaseLayout.astro` just before `</head>`:

```astro
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

Not required. Vercel Analytics is enough for top-level traffic shape.
