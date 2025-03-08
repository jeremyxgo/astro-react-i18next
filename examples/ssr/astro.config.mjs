// @ts-check
import node from "@astrojs/node";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import reactI18next from "astro-react-i18next";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    react(),
    reactI18next({
      defaultLocale: "en-US",
      locales: ["en-US", "fr-FR", "zh-TW"],
    }),
  ],
});
