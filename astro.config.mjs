// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { storyblok } from "@storyblok/astro";
import { loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";

const env = loadEnv("", process.cwd(), "STORYBLOK");

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(),
    storyblok({
      accessToken: env.STORYBLOK_DELIVERY_API_TOKEN,
      components: {
        hero: "storyblok/Hero",
        company: "storyblok/Company",
        management: "storyblok/Management",
        product_hero: "storyblok/ProductHero",
        feature_grid: "storyblok/FeatureGrid",
        feature_item: "storyblok/FeatureItem",
        cards_section: "storyblok/CardsSection",
        card_item: "storyblok/CardItem",
        stats_section: "storyblok/StatsSection",
        stat_item: "storyblok/StatItem",
        references_section: "storyblok/ReferencesSection",
        reference_logo: "storyblok/ReferenceLogo",
        cta_section: "storyblok/CtaSection",
      },
      apiOptions: {
        region: "eu",
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss(), mkcert()],
  },
});
