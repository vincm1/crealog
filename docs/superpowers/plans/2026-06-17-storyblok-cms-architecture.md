# Storyblok CMS Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the CreaLog website to Storyblok so editors can manage landing-page text/order and create new sub-pages (CX Solutions, Telco Solutions, Professional Services) without touching code.

**Architecture:** One `LandingLayout` + one `SubPageLayout` wrap all pages. `index.astro` fetches the `home` story and renders its `body` blocks via `StoryblokComponent`. A catch-all `[...slug].astro` builds a static page per non-home story using `getStaticPaths`. Landing-page blocks are thin wrappers around existing Elegant components; those components gain optional props so CMS content can flow in (current hardcoded values become defaults).

**Tech Stack:** Astro 6, `@storyblok/astro`, Vue 3 (existing), Tailwind CSS, pnpm

## Global Constraints

- Use `pnpm`, never `npm` or `yarn`
- Node >= 22.12.0
- Storyblok API region: `eu`
- `version: import.meta.env.DEV ? "draft" : "published"` everywhere
- All pages `lang="de"`
- No SEO fields yet (out of scope)
- Do NOT modify `src/components/themes/elegant/*.vue` files (Vue interactivity components)
- Do NOT delete existing `src/pages/telco-solutions/` or `src/pages/telco_solutions/` — they stay hardcoded; `[...slug].astro` serves only Storyblok-managed stories

---

## File Map

**Create:**
```
src/layouts/LandingLayout.astro
src/layouts/SubPageLayout.astro
src/storyblok/landing/HeroBlock.astro
src/storyblok/landing/CompanyBlock.astro
src/storyblok/landing/CTABlock.astro
src/storyblok/landing/ManagementBlock.astro
src/storyblok/landing/SolutionsBlock.astro
src/storyblok/landing/IndustriesBlock.astro
src/storyblok/landing/TestimonialsBlock.astro
src/pages/[...slug].astro
```

**Modify:**
```
src/components/themes/elegant/HeroElegant.astro      — add optional props
src/components/themes/elegant/CompanyElegant.astro   — add optional props
src/components/themes/elegant/CTAElegant.astro       — add optional props
src/pages/index.astro                                — switch to Storyblok + LandingLayout
astro.config.mjs                                     — register 7 new landing blocks
```

---

## Task 1: Create Layout Components

**Files:**
- Create: `src/layouts/LandingLayout.astro`
- Create: `src/layouts/SubPageLayout.astro`

**Interfaces:**
- Produces: `<LandingLayout>` — HTML shell with `<Navbar darkHero={true}>`, `<slot>`, `<FooterElegant>`
- Produces: `<SubPageLayout>` — HTML shell with `<Navbar>` (white), `<slot>`, `<FooterElegant>`

- [ ] **Step 1: Create LandingLayout.astro**

```astro
---
// src/layouts/LandingLayout.astro
import "../assets/app.css";
import Navbar from "../components/Navbar/Navbar.astro";
import FooterElegant from "../components/themes/elegant/FooterElegant.astro";
---
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <title>AI-driven Platform for Enterprises & Telcos | CreaLog</title>
  </head>
  <body>
    <Navbar darkHero={true} />
    <slot />
    <FooterElegant />
  </body>
</html>
<style>
  html, body { margin: 0; width: 100%; height: 100%; }
</style>
```

- [ ] **Step 2: Create SubPageLayout.astro**

```astro
---
// src/layouts/SubPageLayout.astro
import "../assets/app.css";
import Navbar from "../components/Navbar/Navbar.astro";
import FooterElegant from "../components/themes/elegant/FooterElegant.astro";
---
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <title>CreaLog</title>
  </head>
  <body>
    <Navbar />
    <slot />
    <FooterElegant />
  </body>
</html>
<style>
  html, body { margin: 0; width: 100%; height: 100%; }
</style>
```

- [ ] **Step 3: Verify build succeeds**

```bash
pnpm build
```

Expected: `✓ Completed` with no errors. The layouts are not yet imported anywhere so this is just a syntax check.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/LandingLayout.astro src/layouts/SubPageLayout.astro
git commit -m "feat: add LandingLayout and SubPageLayout"
```

---

## Task 2: Add Props to HeroElegant + Create HeroBlock

**Files:**
- Modify: `src/components/themes/elegant/HeroElegant.astro`
- Create: `src/storyblok/landing/HeroBlock.astro`

**Interfaces:**
- Consumes: `HeroElegant` (already exists, no props today)
- Produces: `HeroElegant` with optional props (defaults = current hardcoded values)
- Produces: `HeroBlock` — Storyblok wrapper that passes `blok` fields to `HeroElegant`

- [ ] **Step 1: Add optional props to HeroElegant frontmatter**

In `src/components/themes/elegant/HeroElegant.astro`, replace the empty frontmatter (`---` / `---`) with:

```astro
---
import VoiceNetwork from "../../VoiceNetwork.vue";

const {
  badge_text = "AI-Powered Voice Solutions",
  headline = "Die Zukunft des",
  headline_accent = "Kundenkontakts",
  subline = "Intelligente Sprachlösungen, die Kundengespräche automatisieren — schneller, skalierbarer und natürlicher als je zuvor.",
  cta_primary_text = "Jetzt starten",
  cta_primary_href = "/kontakt",
  cta_secondary_text = "Lösungen ansehen",
  cta_secondary_href = "/loesungen",
} = Astro.props;
---
```

- [ ] **Step 2: Replace hardcoded strings in HeroElegant HTML**

Find and replace these four sections in the HTML of `HeroElegant.astro`:

Replace the badge text span:
```astro
<!-- before -->
          AI-Powered Voice Solutions
<!-- after -->
          {badge_text}
```

Replace the h1 content (lines 109–117):
```astro
<!-- before -->
        Die Zukunft des<br />
        <span
          class="text-transparent bg-clip-text"
          style="background-image: linear-gradient(135deg, #60b8ff 0%, #a5d8ff 60%, #c8e8ff 100%);"
        >
          Kundenkontakts
        </span>
<!-- after -->
        {headline}<br />
        <span
          class="text-transparent bg-clip-text"
          style="background-image: linear-gradient(135deg, #60b8ff 0%, #a5d8ff 60%, #c8e8ff 100%);"
        >
          {headline_accent}
        </span>
```

Replace the subline paragraph content:
```astro
<!-- before -->
        Intelligente Sprachlösungen, die Kundengespräche automatisieren —
        schneller, skalierbarer und natürlicher als je zuvor.
<!-- after -->
        {subline}
```

Replace the CTA links (lines 130–146):
```astro
<!-- before -->
        <a
          href="/kontakt"
          class="cta-primary px-8 py-[14px] text-white font-semibold text-sm rounded-full"
          style="background: rgba(0,73,144,0.9); border: 1px solid rgba(56,168,255,0.3);"
        >
          Jetzt starten
        </a>
        <a
          href="/loesungen"
          class="group flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style="color: rgba(160,200,240,0.6);"
          onmouseover="this.style.color='rgba(210,235,255,0.9)'"
          onmouseout="this.style.color='rgba(160,200,240,0.6)'"
        >
          Lösungen ansehen
          <span class="text-[#38a8ff] group-hover:translate-x-1 transition-transform duration-200">→</span>
        </a>
<!-- after -->
        <a
          href={cta_primary_href}
          class="cta-primary px-8 py-[14px] text-white font-semibold text-sm rounded-full"
          style="background: rgba(0,73,144,0.9); border: 1px solid rgba(56,168,255,0.3);"
        >
          {cta_primary_text}
        </a>
        <a
          href={cta_secondary_href}
          class="group flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style="color: rgba(160,200,240,0.6);"
          onmouseover="this.style.color='rgba(210,235,255,0.9)'"
          onmouseout="this.style.color='rgba(160,200,240,0.6)'"
        >
          {cta_secondary_text}
          <span class="text-[#38a8ff] group-hover:translate-x-1 transition-transform duration-200">→</span>
        </a>
```

- [ ] **Step 3: Create HeroBlock.astro**

```astro
---
// src/storyblok/landing/HeroBlock.astro
import { storyblokEditable } from "@storyblok/astro";
import HeroElegant from "../../components/themes/elegant/HeroElegant.astro";

const { blok } = Astro.props;
---
<div {...storyblokEditable(blok)}>
  <HeroElegant
    badge_text={blok.badge_text}
    headline={blok.headline}
    headline_accent={blok.headline_accent}
    subline={blok.subline}
    cta_primary_text={blok.cta_primary_text}
    cta_primary_href={blok.cta_primary_href}
    cta_secondary_text={blok.cta_secondary_text}
    cta_secondary_href={blok.cta_secondary_href}
  />
</div>
```

- [ ] **Step 4: Verify build succeeds**

```bash
pnpm build
```

Expected: `✓ Completed`. The homepage still renders from hardcoded imports in `index.astro` — visually unchanged, defaults kick in.

- [ ] **Step 5: Commit**

```bash
git add src/components/themes/elegant/HeroElegant.astro src/storyblok/landing/HeroBlock.astro
git commit -m "feat: HeroElegant accepts optional props, add HeroBlock Storyblok wrapper"
```

---

## Task 3: Add Props to CompanyElegant + Create CompanyBlock

**Files:**
- Modify: `src/components/themes/elegant/CompanyElegant.astro`
- Create: `src/storyblok/landing/CompanyBlock.astro`

**Interfaces:**
- Produces: `CompanyElegant` with optional props (stats stay hardcoded)
- Produces: `CompanyBlock` — Storyblok wrapper

- [ ] **Step 1: Add optional props to CompanyElegant frontmatter**

Replace the top of `src/components/themes/elegant/CompanyElegant.astro`:

```astro
---
const {
  eyebrow = "Über CreaLog",
  title = "Sprachkommunikation neu",
  title_accent = "gedacht. Seit 1993.",
  body_text_1 = "CreaLog ist ein führender Anbieter von KI-gestützten Sprachlösungen für den professionellen Kundenkontakt. Mit mehr als 30 Jahren Erfahrung in der deutschen Telekommunikationsbranche entwickeln wir Plattformen, die Unternehmen dabei helfen, Kundengespräche zu automatisieren, zu analysieren und nachhaltig zu verbessern.",
  body_text_2 = "Von mittelständischen Unternehmen bis hin zu DAX-Konzernen: Unsere Lösungen laufen on-premise, in der Cloud oder hybrid — immer DSGVO-konform und made in Germany.",
  cta_text = "Mehr über CreaLog",
  cta_href = "/about",
} = Astro.props;

const stats = [
  { value: "1993", label: "Gegründet" },
  { value: "100+", label: "Unternehmenskunden" },
  { value: "50+", label: "Mitarbeitende" },
];
---
```

- [ ] **Step 2: Replace hardcoded strings in CompanyElegant HTML**

Replace the eyebrow span text:
```astro
<!-- before -->
            Über CreaLog
<!-- after -->
            {eyebrow}
```

Replace the h2 content:
```astro
<!-- before -->
          Sprachkommunikation neu<br />
          <span class="text-[#004990]">gedacht. Seit 1993.</span>
<!-- after -->
          {title}<br />
          <span class="text-[#004990]">{title_accent}</span>
```

Replace the two body paragraphs:
```astro
<!-- before -->
        <p class="text-[15px] text-gray-500 leading-relaxed">
          CreaLog ist ein führender Anbieter von KI-gestützten Sprachlösungen
          für den professionellen Kundenkontakt. Mit mehr als 30 Jahren Erfahrung
          in der deutschen Telekommunikationsbranche entwickeln wir Plattformen,
          die Unternehmen dabei helfen, Kundengespräche zu automatisieren,
          zu analysieren und nachhaltig zu verbessern.
        </p>

        <p class="text-[15px] text-gray-500 leading-relaxed">
          Von mittelständischen Unternehmen bis hin zu DAX-Konzernen: Unsere
          Lösungen laufen on-premise, in der Cloud oder hybrid — immer
          DSGVO-konform und made in Germany.
        </p>
<!-- after -->
        <p class="text-[15px] text-gray-500 leading-relaxed">
          {body_text_1}
        </p>

        <p class="text-[15px] text-gray-500 leading-relaxed">
          {body_text_2}
        </p>
```

Replace the CTA link (full `<a>` element):
```astro
<!-- before -->
        <div class="pt-2">
          <a
            href="/about"
            class="inline-flex items-center gap-2 text-[#004990] text-sm font-semibold hover:gap-3 transition-all duration-200"
          >
            Mehr über CreaLog
            <span class="text-[#1d6bbf]">→</span>
          </a>
        </div>
<!-- after -->
        <div class="pt-2">
          <a
            href={cta_href}
            class="inline-flex items-center gap-2 text-[#004990] text-sm font-semibold hover:gap-3 transition-all duration-200"
          >
            {cta_text}
            <span class="text-[#1d6bbf]">→</span>
          </a>
        </div>
```

- [ ] **Step 3: Create CompanyBlock.astro**

```astro
---
// src/storyblok/landing/CompanyBlock.astro
import { storyblokEditable } from "@storyblok/astro";
import CompanyElegant from "../../components/themes/elegant/CompanyElegant.astro";

const { blok } = Astro.props;
---
<div {...storyblokEditable(blok)}>
  <CompanyElegant
    eyebrow={blok.eyebrow}
    title={blok.title}
    title_accent={blok.title_accent}
    body_text_1={blok.body_text_1}
    body_text_2={blok.body_text_2}
    cta_text={blok.cta_text}
    cta_href={blok.cta_href}
  />
</div>
```

- [ ] **Step 4: Verify build succeeds**

```bash
pnpm build
```

Expected: `✓ Completed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/themes/elegant/CompanyElegant.astro src/storyblok/landing/CompanyBlock.astro
git commit -m "feat: CompanyElegant accepts optional props, add CompanyBlock Storyblok wrapper"
```

---

## Task 4: Add Props to CTAElegant + Create CTABlock

**Files:**
- Modify: `src/components/themes/elegant/CTAElegant.astro`
- Create: `src/storyblok/landing/CTABlock.astro`

- [ ] **Step 1: Add optional props to CTAElegant frontmatter**

Add at the top of `src/components/themes/elegant/CTAElegant.astro`, replacing the empty frontmatter:

```astro
---
const {
  eyebrow = "Nächster Schritt",
  headline = "Bereit für eine",
  headline_accent = "elegantere Plattform?",
  subline = "Wenn Sie eine Voice- oder Service-Plattform brauchen, die sich präzise in Ihre Infrastruktur einfügt, sollten wir sprechen.",
  cta_primary_text = "Über CreaLog",
  cta_primary_href = "/about",
  cta_secondary_text = "Plattform ansehen",
  cta_secondary_href = "/telco-solutions/service-delivery-platform",
} = Astro.props;
---
```

- [ ] **Step 2: Replace hardcoded strings in CTAElegant HTML**

Replace the eyebrow span:
```astro
<!-- before -->
            <span>Nächster Schritt</span>
<!-- after -->
            <span>{eyebrow}</span>
```

Replace the h2 content:
```astro
<!-- before -->
            Bereit für eine
            <span class="cta-title__accent">elegantere Plattform?</span>
<!-- after -->
            {headline}
            <span class="cta-title__accent">{headline_accent}</span>
```

Replace the subline paragraph:
```astro
<!-- before -->
            Wenn Sie eine Voice- oder Service-Plattform brauchen, die sich präzise in Ihre Infrastruktur einfügt, sollten wir sprechen.
<!-- after -->
            {subline}
```

Replace the CTA buttons:
```astro
<!-- before -->
          <a href="/about" class="cta-btn cta-btn--primary">Über CreaLog</a>
          <a href="/telco-solutions/service-delivery-platform" class="cta-btn cta-btn--ghost">
            Plattform ansehen
          </a>
<!-- after -->
          <a href={cta_primary_href} class="cta-btn cta-btn--primary">{cta_primary_text}</a>
          <a href={cta_secondary_href} class="cta-btn cta-btn--ghost">
            {cta_secondary_text}
          </a>
```

- [ ] **Step 3: Create CTABlock.astro**

```astro
---
// src/storyblok/landing/CTABlock.astro
import { storyblokEditable } from "@storyblok/astro";
import CTAElegant from "../../components/themes/elegant/CTAElegant.astro";

const { blok } = Astro.props;
---
<div {...storyblokEditable(blok)}>
  <CTAElegant
    eyebrow={blok.eyebrow}
    headline={blok.headline}
    headline_accent={blok.headline_accent}
    subline={blok.subline}
    cta_primary_text={blok.cta_primary_text}
    cta_primary_href={blok.cta_primary_href}
    cta_secondary_text={blok.cta_secondary_text}
    cta_secondary_href={blok.cta_secondary_href}
  />
</div>
```

- [ ] **Step 4: Verify build**

```bash
pnpm build
```

Expected: `✓ Completed`.

- [ ] **Step 5: Commit**

```bash
git add src/components/themes/elegant/CTAElegant.astro src/storyblok/landing/CTABlock.astro
git commit -m "feat: CTAElegant accepts optional props, add CTABlock Storyblok wrapper"
```

---

## Task 5: Create Passthrough Landing Blocks

Management, Solutions, Industries, and Testimonials blocks have complex internal data (Vue tabs, hardcoded testimonials). For this iteration they are reorderable via CMS but their content stays hardcoded. Each block is a thin wrapper that renders the Elegant component and wraps it with `storyblokEditable` for visual editor highlighting.

**Files:**
- Create: `src/storyblok/landing/ManagementBlock.astro`
- Create: `src/storyblok/landing/SolutionsBlock.astro`
- Create: `src/storyblok/landing/IndustriesBlock.astro`
- Create: `src/storyblok/landing/TestimonialsBlock.astro`

- [ ] **Step 1: Create ManagementBlock.astro**

```astro
---
// src/storyblok/landing/ManagementBlock.astro
import { storyblokEditable } from "@storyblok/astro";
import ManagementElegant from "../../components/themes/elegant/ManagementElegant.astro";

const { blok } = Astro.props;
---
<div {...storyblokEditable(blok)}>
  <ManagementElegant />
</div>
```

- [ ] **Step 2: Create SolutionsBlock.astro**

```astro
---
// src/storyblok/landing/SolutionsBlock.astro
import { storyblokEditable } from "@storyblok/astro";
import SolutionsElegant from "../../components/themes/elegant/SolutionsElegant.astro";

const { blok } = Astro.props;
---
<div {...storyblokEditable(blok)}>
  <SolutionsElegant />
</div>
```

- [ ] **Step 3: Create IndustriesBlock.astro**

```astro
---
// src/storyblok/landing/IndustriesBlock.astro
import { storyblokEditable } from "@storyblok/astro";
import IndustriesElegant from "../../components/themes/elegant/IndustriesElegant.astro";

const { blok } = Astro.props;
---
<div {...storyblokEditable(blok)}>
  <IndustriesElegant />
</div>
```

- [ ] **Step 4: Create TestimonialsBlock.astro**

```astro
---
// src/storyblok/landing/TestimonialsBlock.astro
import { storyblokEditable } from "@storyblok/astro";
import TestimonialsV2Elegant from "../../components/themes/elegant/TestimonialsV2Elegant.astro";

const { blok } = Astro.props;
---
<div {...storyblokEditable(blok)}>
  <TestimonialsV2Elegant />
</div>
```

- [ ] **Step 5: Verify build**

```bash
pnpm build
```

Expected: `✓ Completed`.

- [ ] **Step 6: Commit**

```bash
git add src/storyblok/landing/
git commit -m "feat: add passthrough landing blocks (Management, Solutions, Industries, Testimonials)"
```

---

## Task 6: Register New Components in astro.config.mjs

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add 7 new landing block entries to the components map**

In `astro.config.mjs`, inside the `storyblok({ ... })` integration's `components` object, add the following entries (before the existing `product_hero` line):

```js
// Landing-page blocks
hero_block:         "storyblok/landing/HeroBlock",
company_block:      "storyblok/landing/CompanyBlock",
management_block:   "storyblok/landing/ManagementBlock",
solutions_block:    "storyblok/landing/SolutionsBlock",
industries_block:   "storyblok/landing/IndustriesBlock",
testimonials_block: "storyblok/landing/TestimonialsBlock",
cta_block:          "storyblok/landing/CTABlock",
```

The final `components` object in `astro.config.mjs` must be:

```js
components: {
  // Landing-page blocks
  hero_block:         "storyblok/landing/HeroBlock",
  company_block:      "storyblok/landing/CompanyBlock",
  management_block:   "storyblok/landing/ManagementBlock",
  solutions_block:    "storyblok/landing/SolutionsBlock",
  industries_block:   "storyblok/landing/IndustriesBlock",
  testimonials_block: "storyblok/landing/TestimonialsBlock",
  cta_block:          "storyblok/landing/CTABlock",
  // Sub-page blocks (existing, unchanged)
  hero:               "storyblok/Hero",
  company:            "storyblok/Company",
  management:         "storyblok/Management",
  product_hero:       "storyblok/ProductHero",
  feature_grid:       "storyblok/FeatureGrid",
  feature_item:       "storyblok/FeatureItem",
  cards_section:      "storyblok/CardsSection",
  card_item:          "storyblok/CardItem",
  stats_section:      "storyblok/StatsSection",
  stat_item:          "storyblok/StatItem",
  references_section: "storyblok/ReferencesSection",
  reference_logo:     "storyblok/ReferenceLogo",
  cta_section:        "storyblok/CtaSection",
},
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

Expected: `✓ Completed`.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: register landing-page Storyblok block components"
```

---

## Task 7: Update index.astro to Use Storyblok + LandingLayout

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `LandingLayout` (Task 1), `StoryblokComponent` from `@storyblok/astro`
- When Storyblok is unreachable: falls back to rendering Elegant components directly

- [ ] **Step 1: Replace index.astro content**

Replace the entire `src/pages/index.astro` with:

```astro
---
import { useStoryblokApi } from "@storyblok/astro";
import StoryblokComponent from "@storyblok/astro/StoryblokComponent.astro";
import LandingLayout from "../layouts/LandingLayout.astro";
import HeroElegant from "../components/themes/elegant/HeroElegant.astro";
import CompanyElegant from "../components/themes/elegant/CompanyElegant.astro";
import ManagementElegant from "../components/themes/elegant/ManagementElegant.astro";
import SolutionsElegant from "../components/themes/elegant/SolutionsElegant.astro";
import IndustriesElegant from "../components/themes/elegant/IndustriesElegant.astro";
import TestimonialsV2Elegant from "../components/themes/elegant/TestimonialsV2Elegant.astro";
import CTAElegant from "../components/themes/elegant/CTAElegant.astro";

let story: any = null;

try {
  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get("cdn/stories/home", {
    version: import.meta.env.DEV ? "draft" : "published",
  });
  story = data.story;
} catch {
  // Storyblok unreachable — fallback to hardcoded components below
}
---

<LandingLayout>
  {story ? (
    story.content.body?.map((blok: any) => (
      <StoryblokComponent blok={blok} />
    ))
  ) : (
    <>
      <HeroElegant />
      <CompanyElegant />
      <ManagementElegant />
      <SolutionsElegant />
      <IndustriesElegant />
      <TestimonialsV2Elegant />
      <CTAElegant />
    </>
  )}
</LandingLayout>
```

- [ ] **Step 2: Verify build succeeds**

```bash
pnpm build
```

Expected: `✓ Completed`. The homepage now fetches from Storyblok (draft in dev, published in build). If the `home` story doesn't exist yet in Storyblok, the fallback renders the hardcoded Elegant components — visually identical to before.

- [ ] **Step 3: Manual visual check**

```bash
pnpm dev
```

Open `https://localhost:4321` (or whichever port). Verify:
- [ ] Dark hero is visible with correct navbar (transparent → white on scroll)
- [ ] All sections render: Hero, Company, Management, Solutions, Industries, Testimonials, CTA, Footer
- [ ] No JS console errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: index.astro fetches Storyblok home story, falls back to Elegant components"
```

---

## Task 8: Create [...slug].astro — Catch-All Sub-Page Route

**Files:**
- Create: `src/pages/[...slug].astro`

**Interfaces:**
- Consumes: `SubPageLayout` (Task 1), `StoryblokComponent`
- `getStaticPaths()` returns one entry per non-home Storyblok story
- Each page renders: `story.content.product_hero` blocks first, then `story.content.body` blocks

- [ ] **Step 1: Create src/pages/[...slug].astro**

```astro
---
import { useStoryblokApi } from "@storyblok/astro";
import StoryblokComponent from "@storyblok/astro/StoryblokComponent.astro";
import SubPageLayout from "../layouts/SubPageLayout.astro";

export async function getStaticPaths() {
  const storyblokApi = useStoryblokApi();
  const { data } = await storyblokApi.get("cdn/stories", {
    version: import.meta.env.DEV ? "draft" : "published",
    excluding_slugs: "home",
  });
  return data.stories.map((story: any) => ({
    params: { slug: story.full_slug },
    props: { story },
  }));
}

const { story } = Astro.props;
---

<SubPageLayout>
  {story.content.product_hero?.map((blok: any) => (
    <StoryblokComponent blok={blok} />
  ))}
  {story.content.body?.map((blok: any) => (
    <StoryblokComponent blok={blok} />
  ))}
</SubPageLayout>
```

- [ ] **Step 2: Verify build succeeds**

```bash
pnpm build
```

Expected: `✓ Completed`. If no non-home stories exist in Storyblok yet, `getStaticPaths` returns `[]` and no catch-all pages are generated — that is correct.

- [ ] **Step 3: Commit**

```bash
git add src/pages/[...slug].astro
git commit -m "feat: add catch-all [...slug].astro route for Storyblok sub-pages"
```

---

## Task 9: Storyblok Space Setup (Manual)

These steps happen in the Storyblok web interface, not in code.

- [ ] **Step 1: Create the `landing_page` content type**

In Storyblok → Content → Schema → Add new Content Type: `landing_page`
- Add field: `body` → Type: Blocks
  - Restrict allowed components: `hero_block`, `company_block`, `management_block`, `solutions_block`, `industries_block`, `testimonials_block`, `cta_block`

- [ ] **Step 2: Create the `sub_page` content type**

Add new Content Type: `sub_page`
- Add field: `product_hero` → Type: Blocks, max: 1
  - Restrict: `product_hero`
- Add field: `body` → Type: Blocks
  - Restrict: `feature_grid`, `cards_section`, `stats_section`, `references_section`, `cta_section`

- [ ] **Step 3: Create block schemas for landing-page blocks**

For each block name below, create a new Block component in Storyblok → Block Library:

**`hero_block`:**
- `badge_text` (Text) — default: `AI-Powered Voice Solutions`
- `headline` (Text) — default: `Die Zukunft des`
- `headline_accent` (Text) — default: `Kundenkontakts`
- `subline` (Textarea)
- `cta_primary_text` (Text)
- `cta_primary_href` (Text)
- `cta_secondary_text` (Text)
- `cta_secondary_href` (Text)

**`company_block`:**
- `eyebrow` (Text)
- `title` (Text)
- `title_accent` (Text)
- `body_text_1` (Textarea)
- `body_text_2` (Textarea)
- `cta_text` (Text)
- `cta_href` (Text)

**`cta_block`:**
- `eyebrow` (Text)
- `headline` (Text)
- `headline_accent` (Text)
- `subline` (Textarea)
- `cta_primary_text` (Text)
- `cta_primary_href` (Text)
- `cta_secondary_text` (Text)
- `cta_secondary_href` (Text)

**`management_block`, `solutions_block`, `industries_block`, `testimonials_block`:**
- No fields needed (passthrough — content is hardcoded in the Elegant components)

- [ ] **Step 4: Create the `home` story**

In Storyblok → Content → New Story:
- Name: `Home`
- Slug: leave as `home`
- Content Type: `landing_page`
- Add blocks to `body` in this order: `hero_block`, `company_block`, `management_block`, `solutions_block`, `industries_block`, `testimonials_block`, `cta_block`
- Fill in the text fields for `hero_block`, `company_block`, and `cta_block` with current German copy
- Save and Publish

- [ ] **Step 5: Create the three folders**

In Storyblok → Content → New Folder:
- `cx-solutions` (Slug: `cx-solutions`)
- `telco-solutions` (Slug: `telco-solutions`)
- `professional-services` (Slug: `professional-services`)

- [ ] **Step 6: Verify the `home` story renders via Storyblok**

```bash
pnpm dev
```

Open `https://localhost:4321`. Because DEV mode fetches draft content, you should now see the landing page driven by the Storyblok `home` draft story. Edit a text field in Storyblok → the visual editor should reflect the change instantly.

- [ ] **Step 7: Create a test sub-page**

In Storyblok → Content → `cx-solutions` folder → New Story:
- Name: `Test Page`
- Slug: auto-generated as `test-page`
- Content Type: `sub_page`
- Add a `product_hero` block → fill title and subtitle
- Add a `feature_grid` block
- Save and Publish (or Save as Draft for dev preview)

- [ ] **Step 8: Verify test sub-page renders**

```bash
pnpm build && pnpm preview
```

Open `http://localhost:4321/cx-solutions/test-page`. Verify:
- [ ] Navbar is white (no darkHero)
- [ ] `product_hero` block renders at top
- [ ] `feature_grid` block renders below
- [ ] Footer is visible
