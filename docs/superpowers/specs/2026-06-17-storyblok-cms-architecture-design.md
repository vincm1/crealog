# Storyblok CMS Architecture — Design Spec

**Date:** 2026-06-17
**Scope:** Landing page (CMS-editable content) + all sub-pages (CX Solutions, Telco Solutions, Professional Services) as editor-created Storyblok stories

---

## Goal

Enable editors to manage the CreaLog website content — texts, images, component order on the landing page, and full sub-page creation — without developer involvement. The visual design stays fixed; CMS controls content and structure within defined constraints.

---

## Storyblok Content Structure

### Content Types

**`landing_page`** — exactly one story named `home`, no URL slug (always served at `/` by `index.astro`):

| Field | Type | Notes |
|---|---|---|
| `body` | Blocks | Reorderable array of landing-page blocks |

Allowed blocks in `body`: `hero_block`, `company_block`, `management_block`, `solutions_block`, `industries_block`, `testimonials_block`, `cta_block`

**`sub_page`** — all product/solution pages:

| Field | Type | Notes |
|---|---|---|
| `product_hero` | Blocks (max 1) | Required — always rendered first |
| `body` | Blocks | Free block selection |

Allowed blocks in `product_hero`: `product_hero`
Allowed blocks in `body`: `feature_grid`, `cards_section`, `stats_section`, `references_section`, `cta_section`

### Folder Structure in Storyblok

```
Content (root)
├── home                            (story, type: landing_page)
│
├── cx-solutions/                   (folder — fixed, pre-created)
│   ├── voice-platform              (story, type: sub_page)
│   └── ...                         (editor creates freely)
│
├── telco-solutions/                (folder — fixed, pre-created)
│   └── service-delivery-platform
│
└── professional-services/          (folder — fixed, pre-created)
    └── ...
```

The three folders are created once by a developer. All stories inside are editor-managed.

---

## URL Formation

Storyblok's `full_slug` maps 1:1 to the public URL:

| Storyblok slug | URL |
|---|---|
| `home` | `/` |
| `cx-solutions/voice-platform` | `/cx-solutions/voice-platform` |
| `telco-solutions/service-delivery-platform` | `/telco-solutions/service-delivery-platform` |
| `professional-services/managed-services` | `/professional-services/managed-services` |

Storyblok auto-generates the slug from the story title. No manual URL mapping needed.

---

## Astro Architecture

### Routing

```
src/pages/
├── index.astro          Fetches story "home" → LandingLayout
└── [...slug].astro      getStaticPaths fetches all non-home stories
                         → detects content_type → renders SubPageLayout
```

**`index.astro`** fetches the `home` story, wraps it in `LandingLayout`, renders blocks via `StoryblokComponent`.

**`[...slug].astro`** uses `getStaticPaths()` to build a static page per story. Each page uses `SubPageLayout`, renders `product_hero` first (always), then `body` blocks.

### Layouts

```
src/layouts/
├── LandingLayout.astro   <Navbar darkHero={true}> + <slot> + <FooterElegant>
└── SubPageLayout.astro   <Navbar> (white) + <slot> + <FooterElegant>
```

Both layouts include `app.css`, the HTML shell, and `lang="de"`. `<title>` is hardcoded per layout for now (SEO out of scope).

### Storyblok Component Mapping

**Landing-page blocks** — thin wrappers around existing Elegant components:

```
src/storyblok/landing/
├── HeroBlock.astro          → <HeroElegant> with editable: headline, subline, badge_text, cta_primary_text, cta_secondary_text
├── CompanyBlock.astro       → <CompanyElegant> with editable: eyebrow, title, subtitle, body_text, cta_text, cta_href, stats[]
├── ManagementBlock.astro    → <ManagementElegant> with editable: (passes blok props through)
├── SolutionsBlock.astro     → <SolutionsElegant> with editable: title, items[]
├── IndustriesBlock.astro    → <IndustriesElegant> with editable: title, items[]
├── TestimonialsBlock.astro  → <TestimonialsV2Elegant> with editable: title, testimonials[]
└── CTABlock.astro           → <CTAElegant> with editable: headline, subline, cta_text, cta_href
```

The Elegant components themselves are not modified — blocks pass CMS content as props.

**Sub-page blocks** — already exist, no changes:

```
src/storyblok/
├── ProductHero.astro
├── FeatureGrid.astro / FeatureItem.astro
├── CardsSection.astro / CardItem.astro
├── StatsSection.astro / StatItem.astro
├── ReferencesSection.astro / ReferenceLogo.astro
└── CtaSection.astro
```

---

## `astro.config.mjs` — Component Registrations

```js
components: {
  // Landing-page blocks (new)
  hero_block:         "storyblok/landing/HeroBlock",
  company_block:      "storyblok/landing/CompanyBlock",
  management_block:   "storyblok/landing/ManagementBlock",
  solutions_block:    "storyblok/landing/SolutionsBlock",
  industries_block:   "storyblok/landing/IndustriesBlock",
  testimonials_block: "storyblok/landing/TestimonialsBlock",
  cta_block:          "storyblok/landing/CTABlock",

  // Sub-page blocks (existing, unchanged)
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
}
```

---

## Draft vs. Published

```js
version: import.meta.env.DEV ? "draft" : "published"
```

- **Dev server** (`pnpm dev`): fetches draft content — Storyblok visual editor points to `https://localhost:4324`
- **Build** (`pnpm build`): fetches only published content

---

## Editorial Workflow

1. Editor opens Storyblok
2. For landing page: opens `home` story → drags blocks, edits text/image fields → publishes
3. For new sub-page: opens correct folder (e.g. `cx-solutions`) → creates story → fills `product_hero` (required) → adds optional blocks → publishes
4. Next build picks up published content (or dev server shows draft immediately)

---

## Out of Scope

- SEO fields (`seo_title`, `seo_description`) on sub-pages — added later
- Navigation/Navbar management via CMS (links stay hardcoded)
- Blog or news section
- Multi-language content (DE only for now)
- Authentication / gated content
- Image optimization pipeline beyond Storyblok's built-in CDN
