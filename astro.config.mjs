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
