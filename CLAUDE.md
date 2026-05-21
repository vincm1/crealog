# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**crealog-website** — Marketing/corporate website for Crealog, a technology company focused on communication solutions. Built with Astro 6 + Vue 3.

## Commands

```bash
pnpm dev        # Start dev server (localhost:4321)
pnpm build      # Production build → dist/
pnpm preview    # Preview production build locally
```

Requires Node >= 22.12.0. Use pnpm, not npm or yarn.

## Stack

- **Astro 6** — static site generation, file-based routing under `src/pages/`
- **Vue 3** via `@astrojs/vue` — for interactive island components
- No TypeScript strict config, no test framework yet

## Architecture

Astro's island architecture is the core pattern here:

- `src/layouts/` — base HTML shells (e.g. `Layout.astro`) wrapping pages via `<slot />`
- `src/pages/` — file-based routes; each `.astro` file becomes a URL
- `src/components/` — reusable `.astro` components (static) and `.vue` components (interactive islands)
- `src/assets/` — images/SVGs imported directly into components via Astro's asset pipeline

**When to use Vue vs Astro components:** Use `.astro` for purely static markup. Use `.vue` only when client-side interactivity is needed (forms, dropdowns, animations). Add the `client:load` / `client:visible` directive on the import site to hydrate.

## Conventions

- Scoped styles belong in the `<style>` block of each `.astro` or `.vue` file — no global CSS files yet
- The `Layout.astro` title is currently `"Astro Basics"` — update it to the real brand name before launch
- `lang="en"` is set in `Layout.astro`; change to `"de"` if the primary audience is German
