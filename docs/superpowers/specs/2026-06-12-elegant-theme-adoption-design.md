# Elegant Theme Adoption — Design Spec

**Date:** 2026-06-12  
**Scope:** Homepage only (`/`)

## Goal

Make the Elegant variant the sole, canonical website theme. Remove all other variants (Original, Classic) and their associated components.

## Decisions

- Elegant becomes the new `index.astro` (main route `/`)
- Classic and Original variants are deleted entirely — no backup kept
- `Company.astro` is updated in-place (no new Elegant variant file)
- `about.astro` and other sub-pages are out of scope

## Elegant Color Palette

| Role | Value |
|---|---|
| Hero background | `#050a0f` |
| Primary blue | `#004990` |
| Link/accent blue | `#1d6bbf` |
| Bright accent | `#38a8ff` |
| Light section bg | `#f8faff` / `#f1f5fb` |
| Heading text | `#0a1628` |
| Body text | `#6b7280` |
| Muted text | `#9ca3af` |
| Borders | `#e2e8f0` / `#dce5f0` |
| Font | Plus Jakarta Sans |

## Changes

### 1. `src/pages/index.astro` — full replacement

Replace with Elegant component composition:

```
Navbar
HeroElegant
Company
SolutionsElegant
TestimonialsV2Elegant
FooterElegant
```

- Remove old `Testimonials` import (non-Elegant, was doubled in index-elegant.astro)
- Set `<title>` to `"AI-driven Platform for Enterprises & Telcos | CreaLog"`
- Keep `lang="de"`

### 2. Files to delete

- `src/pages/index-elegant.astro`
- `src/pages/index-classic.astro`
- `src/components/themes/classic/` (entire directory)

### 3. `src/components/Navbar/Navbar.astro`

- Remove `<select id="variant-switcher">` and associated script block
- Fix CX Solutions button: `{{ placeholder_xy }}` → `CX Solutions`, `font-{{}}` → `font-medium`
- No color changes needed (navbar already matches Elegant)

### 4. `src/components/Company.astro`

- `bg-[rgb(252,176,64)]` → `bg-[#1d6bbf]` (label line)
- `text-[rgb(252,176,64)]` → `text-[#1d6bbf]` (label text + CTA arrow)

## Out of Scope

- `about.astro` and other sub-pages
- Any new content or copy changes
- Mobile responsive changes
- New sections or features
