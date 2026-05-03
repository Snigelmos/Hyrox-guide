/**
 * Build-time Open Graph image generator.
 *
 * Emits one 1200x630 PNG per important page. URL pattern:
 *   /og/index.png            -> homepage
 *   /og/blog/<slug>.png      -> per blog post
 *   /og/<section>.png        -> per section landing
 *   /og/<section>/<slug>.png -> per section sub-page
 *
 * BaseLayout looks up its own OG image by deriving the path from
 * Astro.url.pathname (see ogPathFor in src/lib/og/path.ts).
 *
 * NOTE: We deliberately do NOT enumerate every gym page (200+) — those
 * fall back to /og/gyms.png to keep the build fast. Add specific paths
 * here if a particular page becomes a heavy share target.
 */

import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { generateOgImage } from "../../lib/og/generate";

type OgEntry = {
  params: { path: string };
  props: { title: string; category?: string };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const entries: OgEntry[] = [];

  entries.push({
    params: { path: "index" },
    props: { title: "The Hyrox Vault — Race, Train, Fuel.", category: "home" },
  });

  const allBlogPosts = await getCollection("blog");
  // Skip OG images for scheduled (future-dated) posts — their /blog/<slug>/
  // page does not exist yet, so the OG would be orphan output.
  const now = new Date();
  const blogPosts = allBlogPosts.filter((p) => p.data.pubDate <= now);
  for (const post of blogPosts) {
    entries.push({
      params: { path: `blog/${post.id}` },
      props: { title: post.data.title, category: post.data.category },
    });
  }

  const racingGuide = await getCollection("racing-guide");
  for (const entry of racingGuide) {
    entries.push({
      params: { path: `racing-guide/${entry.id}` },
      props: { title: entry.data.title, category: "racing-guide" },
    });
  }

  const training = await getCollection("training");
  for (const entry of training) {
    entries.push({
      params: { path: `training/${entry.id}` },
      props: { title: entry.data.title, category: "training" },
    });
  }

  const gear = await getCollection("gear");
  for (const entry of gear) {
    entries.push({
      params: { path: `gear/${entry.id}` },
      props: { title: entry.data.title, category: "gear" },
    });
  }

  const supplements = await getCollection("supplements");
  for (const entry of supplements) {
    entries.push({
      params: { path: `supplements/${entry.id}` },
      props: { title: entry.data.title, category: "supplements" },
    });
  }

  const staticPages: { path: string; title: string; category: string }[] = [
    { path: "blog", title: "HyroxVault Blog — Race Strategy, Training, Gear", category: "blog" },
    { path: "training", title: "Hyrox Training Plans — Beginner to Advanced", category: "training" },
    { path: "supplements", title: "Hyrox Supplements — Evidence-Based Picks", category: "supplements" },
    { path: "gear", title: "Hyrox Gear Reviews — Shoes, Apparel, Accessories", category: "gear" },
    { path: "racing-guide", title: "Hyrox Racing Guide — Format, Stations, Strategy", category: "racing-guide" },
    { path: "calculator", title: "Hyrox Time Calculator — Free Race Predictor", category: "calculator" },
    { path: "competitions", title: "Upcoming Hyrox Competitions Worldwide", category: "competitions" },
    { path: "gyms", title: "Hyrox Gym Finder — Train at an Affiliated Gym", category: "gyms" },
    { path: "gyms/map", title: "Hyrox Gym Map — Find a Gym Near You", category: "gyms" },
    { path: "about", title: "About HyroxVault — Editorial Team & Disclosure", category: "about" },
    { path: "faq", title: "Hyrox FAQ — Common Questions Answered", category: "faq" },
    { path: "glossary", title: "Hyrox Glossary — Terms & Abbreviations", category: "glossary" },
    { path: "qualifiers", title: "Hyrox Qualifiers — Standards & Pathways", category: "qualifiers" },
    { path: "events", title: "Hyrox Events Calendar", category: "events" },
    { path: "compare", title: "Hyrox Comparisons — Format, Gear, Training", category: "compare" },
    { path: "stations", title: "Hyrox Stations — All 8 Workouts Explained", category: "stations" },
    { path: "times", title: "Hyrox Time Standards by Division", category: "times" },
    { path: "training-plans", title: "Hyrox Training Plans — Pick Your Program", category: "training-plans" },
    { path: "workouts", title: "Hyrox Workout Library", category: "workouts" },
  ];
  for (const page of staticPages) {
    entries.push({
      params: { path: page.path },
      props: { title: page.title, category: page.category },
    });
  }

  return entries;
};

export const GET: APIRoute = async ({ props }) => {
  const { title, category } = props as { title: string; category?: string };
  const png = await generateOgImage({ title, category });
  return new Response(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
