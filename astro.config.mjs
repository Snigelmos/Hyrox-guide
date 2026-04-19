import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hyroxguide.com",
  integrations: [react(), mdx(), sitemap()],
  prefetch: true,
  vite: {
    plugins: [tailwindcss()],
  },
});
