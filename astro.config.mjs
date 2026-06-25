// @ts-check
import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import tailwindcss from "@tailwindcss/vite";
import { storyblok } from "@storyblok/astro";
import { loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";
import vercel from "@astrojs/vercel";
import icon from "astro-icon";


const env = loadEnv("", process.cwd(), "STORYBLOK");

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(),
    icon(),
    storyblok({
      accessToken: env.STORYBLOK_DELIVERY_API_TOKEN,
      components: {
        page: "storyblok/pages/Page",
        sub_page: "storyblok/pages/SubPage",
        // Landing-page blocks
        hero_block: "storyblok/landing/HeroBlock",
        company_block: "storyblok/landing/CompanyBlock",
        management_block: "storyblok/landing/ManagementBlock",
        solutions_block: "storyblok/landing/SolutionsBlock",
        industries_block: "storyblok/landing/IndustriesBlock",
        testimonials_block: "storyblok/landing/TestimonialsBlock",
        cta_block: "storyblok/landing/CTABlock",
        // Sub-page blocks
        management_people: "storyblok/company/ManagementPeople",
        hero: "storyblok/heroes/Hero",
        company: "storyblok/company/Company",
        management: "storyblok/company/Management",
        product_hero: "storyblok/heroes/ProductHero",
        feature_grid: "storyblok/features/FeatureGrid",
        feature_item: "storyblok/features/FeatureItem",
        references_section: "storyblok/references/ReferencesSection",
        reference_logo: "storyblok/references/ReferenceLogo",
        cta_banner: "storyblok/cta/CtaBanner",
        intro_text: "storyblok/content/IntroText",
        expert_cta: "storyblok/cta/ExpertCta",
        product_tabs: "storyblok/content/ProductTabs",
        product_tab_item: "storyblok/content/ProductTabItem",
        solution_references: "storyblok/references/SolutionReferences",
        solution_reference_item: "storyblok/references/SolutionReferenceItem",
        solution_banner: "storyblok/references/SolutionBanner",
        logos_cta: "storyblok/references/SolutionReferences",
        logos_cta_item: "storyblok/references/SolutionReferenceItem",
      },
      // Gelöschte/unbekannte Blöcke crashen die Seite nicht, sondern werden ignoriert.
      enableFallbackComponent: true,
      livePreview: true,
      apiOptions: {
        region: "eu",
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss(), mkcert()],
  },
  output: "server",
  adapter: vercel(),
});
