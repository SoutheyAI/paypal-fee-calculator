import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://feecalc.org',
  integrations: [
    tailwind(),
    mdx(),
    sitemap({
      // 确保包含所有重要页面
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date()
    }),
    react()
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en", "ja", "ko", "de", "fr", "it"],
    routing: {
      prefixDefaultLocale: false
    }
  }
});
