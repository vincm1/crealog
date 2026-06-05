# Design Spec: Theme Variants Classic & Elegant

## Goal

Create two additional index pages for client presentation:
- `/index-classic` — Blue / Orange (Variant B)
- `/index-elegant` — Blue / White (Variant C)

Each page is a complete, standalone copy of the homepage with swapped color tokens. The existing `index.astro` (Dark Navy / Amber) remains unchanged.

## Architecture

**Approach: Themed component copies per variant**

Each variant gets its own component files under `src/components/themes/{classic,elegant}/`. This keeps variants fully isolated, requires no changes to the existing components, and avoids complex CSS variable wiring across Tailwind arbitrary classes.

Pages:
- `src/pages/index-classic.astro`
- `src/pages/index-elegant.astro`

Themed components needed (files with significant color dependencies):
- `Hero{Classic,Elegant}.astro`
- `Solutions{Classic,Elegant}.astro` + `SolutionsTabs{Classic,Elegant}.vue`
- `TestimonialsV2{Classic,Elegant}.astro` + `TestimonialCardV2{Classic,Elegant}.astro`
- `Footer{Classic,Elegant}.astro`

Shared as-is (colors are neutral or close enough):
- `Navbar.astro`, `Company.astro`, `Testimonials.astro`, `TestimonialCard.astro`, `Layout.astro`

## Color Tokens

| Token | Current (Dark/Amber) | Classic (B) | Elegant (C) |
|---|---|---|---|
| Hero bg | `#050d1e` | `#0f2548` | `#ffffff` |
| Section dark bg | `#050d1e` | `#0f2548` | `#f8faff` |
| Accent | `rgb(252,176,64)` | `#ff6600` | `#004990` |
| Primary blue | `#004990` | `#004990` | `#004990` |
| CTA button | `#004990` | `#ff6600` | `#004990` |
| Text on dark | `white / white/45` | `white / white/50` | `#0a1628 / #4b5563` |
| Tab active bg | amber | orange `#ff6600` | blue `#004990` |
| Tab active text | `#050d1e` | `white` | `white` |
| Card border | `white/8%` | `white/8%` | `#e2e8f0` |
| Card bg | `white/4%` | `white/4%` | `white` |

## Key Design Decisions

- **Classic**: Keeps dark navy aesthetic, replaces amber with vivid orange. More energetic, traditional corporate feel.
- **Elegant**: Flips dark sections to white/near-white. Clean, minimal, no warm tones. All accent = deep blue.
- **Navbar/Footer for Elegant**: Footer switches to light background with dark text.
- **SolutionsTabs for Elegant**: White background, blue active tab, dark card borders/text.
