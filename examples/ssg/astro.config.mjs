// @ts-check
import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import reactI18next from "astro-react-i18next";

// https://astro.build/config
export default defineConfig({
  integrations: [
    reactI18next({
      defaultLocale: "en-US",
      locales: ["en-US", "fr-FR", "zh-TW"],
    }),
    react(),
  ],
});
