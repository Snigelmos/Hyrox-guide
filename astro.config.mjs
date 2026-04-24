import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://www.hyroxvault.com",
  output: "static",
  adapter: vercel(),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes("/blog/tag/") && !page.includes("/blog/category/"),
    }),
  ],
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
