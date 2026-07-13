# Spalten-Komponente (1–4 Spalter) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein flexibler Storyblok-Block `columns` (1–4 Spalten) mit genesteten `column_item`-Bloks — jede Spalte mit Headline, Subline, Text, optionalem Bild und optionalem Teaser+Button+Link, plus optionalem Sektions-CTA.

**Architecture:** Zwei Astro-Render-Komponenten nach dem bestehenden Muster `feature_grid → feature_item`. Eine kleine geteilte JS-Hilfsfunktion löst Storyblok-Multilinks zu `href` + `isExternal` auf (DRY, von beiden Komponenten genutzt). Registrierung in `astro.config.mjs` macht den Block auf allen Seiten verfügbar. Die Component-Definitionen werden zusätzlich per Storyblok Management API (MCP) im Space angelegt.

**Tech Stack:** Astro 6, `@storyblok/astro`, Tailwind (Utility-Grid-Klassen), scoped `<style>`, Poppins-Font. Kein Test-Framework im Projekt → Verifikation über `pnpm build` (Kompilierung) und visuelle Browser-Prüfung von `/komponenten` (Playwright MCP).

## Global Constraints

- Node >= 22.12.0; Paketmanager **pnpm** (nicht npm/yarn).
- Font aller Blöcke: `"Poppins", Calibri, sans-serif`.
- Jede Render-Komponente: `const { blok } = Astro.props;` und Wurzel-Element mit `{...storyblokEditable(blok)}`.
- Scoped Styles im `<style>`-Block der jeweiligen Datei; keine globalen CSS-Dateien.
- Storyblok Space-ID: `293145431528152`, Region `eu`.
- Storyblok Block-Namen (technisch): `columns`, `column_item`. Beide `is_nestable: true`.
- Sektions-`title` ist **Pflicht**; Button+Link rendern nur, wenn Button-Text **und** aufgelöster Link vorhanden sind.

---

## File Structure

- **Create** `src/storyblok/utils/link.js` — teilt die Multilink→href-Auflösung (von ColumnItem & Columns genutzt).
- **Create** `src/storyblok/content/ColumnItem.astro` — rendert eine einzelne Spalte (Karte).
- **Create** `src/storyblok/content/Columns.astro` — rendert Header + responsives Grid + Sektions-CTA.
- **Modify** `astro.config.mjs` — registriert `columns` und `column_item`.
- **Modify** `src/pages/komponenten.astro` — Demo-Eintrag mit allen Varianten in Gruppe „Subpages".
- **Storyblok (MCP)** — Component-Definitionen `column_item` und `columns` im Space anlegen.

---

### Task 1: Multilink-Hilfsfunktion

**Files:**
- Create: `src/storyblok/utils/link.js`

**Interfaces:**
- Produces: `resolveStoryblokLink(link) → { href: string, isExternal: boolean }`. `link` ist ein Storyblok-Multilink-Objekt (`{ linktype, url, cached_url }`) oder `undefined`. Bei fehlendem/leerem Link ist `href` ein leerer String.

- [ ] **Step 1: Datei mit der Hilfsfunktion anlegen**

Create `src/storyblok/utils/link.js`:

```js
// Löst ein Storyblok-Multilink-Feld zu einer nutzbaren URL auf.
// Multilink-Form: { linktype: "url"|"story"|"email"|"asset", url, cached_url }
export function resolveStoryblokLink(link) {
  if (!link) return { href: "", isExternal: false };

  const raw = link.url || link.cached_url || "";
  if (!raw) return { href: "", isExternal: false };

  const isExternal =
    link.linktype === "url" ||
    /^https?:\/\//.test(raw) ||
    /^(mailto|tel):/.test(raw);

  if (isExternal) return { href: raw, isExternal: true };

  // Interne Story: führenden Slash normalisieren → immer genau ein "/" am Anfang.
  return { href: "/" + raw.replace(/^\/+/, ""), isExternal: false };
}
```

- [ ] **Step 2: Auflösungslogik manuell verifizieren**

Run: `node -e "import('./src/storyblok/utils/link.js').then(m=>{console.log(m.resolveStoryblokLink({linktype:'url',url:'https://example.com'}));console.log(m.resolveStoryblokLink({linktype:'story',cached_url:'landingpage'}));console.log(m.resolveStoryblokLink(undefined));})"`

Expected (drei Zeilen):
```
{ href: 'https://example.com', isExternal: true }
{ href: '/landingpage', isExternal: false }
{ href: '', isExternal: false }
```

- [ ] **Step 3: Commit**

```bash
git add src/storyblok/utils/link.js
git commit -m "feat: add Storyblok multilink resolver helper"
```

---

### Task 2: ColumnItem.astro (eine Spalte)

**Files:**
- Create: `src/storyblok/content/ColumnItem.astro`

**Interfaces:**
- Consumes: `resolveStoryblokLink` aus `../utils/link.js` (Task 1).
- Consumes (blok-Felder): `image` (asset), `headline` (text), `subline` (text), `text` (textarea), `teaser_text` (textarea), `button_text` (text), `link` (multilink).
- Produces: Storyblok-Komponente für component-Key `column_item` (in Task 4 registriert). Wird von `Columns.astro` via `<StoryblokComponent>` gerendert.

- [ ] **Step 1: Komponente schreiben**

Create `src/storyblok/content/ColumnItem.astro`:

```astro
---
import { storyblokEditable } from "@storyblok/astro";
import { resolveStoryblokLink } from "../utils/link.js";

const { blok } = Astro.props;

const { href, isExternal } = resolveStoryblokLink(blok.link);
const showButton = Boolean(blok.button_text && href);
const extAttrs = isExternal ? { target: "_blank", rel: "noopener" } : {};

const img = blok.image;
const imgSrc = img?.filename;
---

<article {...storyblokEditable(blok)} class="ci-card">
  {imgSrc && (
    <div class="ci-media">
      <img src={imgSrc} alt={img.alt || ""} loading="lazy" class="ci-img" />
    </div>
  )}

  <div class="ci-body">
    {blok.headline && <h3 class="ci-headline">{blok.headline}</h3>}
    {blok.subline && <p class="ci-subline">{blok.subline}</p>}
    {blok.text && <p class="ci-text">{blok.text}</p>}

    {(blok.teaser_text || showButton) && (
      <div class="ci-teaser">
        {blok.teaser_text && <p class="ci-teaser-text">{blok.teaser_text}</p>}
        {showButton && (
          <a href={href} class="ci-button" {...extAttrs}>
            {blok.button_text}
            <svg class="ci-button-arrow" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    )}
  </div>
</article>

<style>
  .ci-card {
    font-family: "Poppins", Calibri, sans-serif;
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #ffffff;
    border: 1px solid #eaeff5;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(10, 22, 40, 0.05);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }

  .ci-card:hover {
    border-color: #c7d9f0;
    box-shadow: 0 8px 32px -8px rgba(0, 64, 129, 0.14);
    transform: translateY(-2px);
  }

  .ci-media {
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #f1f5f9;
  }

  .ci-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .ci-body {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    padding: 1.875rem;
    flex: 1 1 auto;
  }

  .ci-headline {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.3;
    color: #0a1628;
  }

  .ci-subline {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #2563eb;
  }

  .ci-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.68;
    color: #6b7280;
  }

  .ci-teaser {
    margin-top: auto;
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .ci-teaser-text {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #475569;
  }

  .ci-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    align-self: flex-start;
    font-size: 14px;
    font-weight: 600;
    color: #004081;
    text-decoration: none;
    transition: gap 0.2s ease, color 0.2s ease;
  }

  .ci-button:hover {
    color: #013a73;
    gap: 0.65rem;
  }

  .ci-button-arrow {
    width: 1rem;
    height: 1rem;
    flex: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .ci-card { transition: none; }
    .ci-card:hover { transform: none; }
  }
</style>
```

- [ ] **Step 2: Review**

Prüfen: Bild wird nur bei `imgSrc` gerendert (Fallback ohne Bild = Text rückt hoch, da `.ci-media` fehlt); Button nur bei `showButton`; externe Links bekommen `target`/`rel`. Build-Verifikation erfolgt integriert in Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/storyblok/content/ColumnItem.astro
git commit -m "feat: add ColumnItem Storyblok block (single column card)"
```

---

### Task 3: Columns.astro (Grid + Header + Sektions-CTA)

**Files:**
- Create: `src/storyblok/content/Columns.astro`

**Interfaces:**
- Consumes: `resolveStoryblokLink` aus `../utils/link.js` (Task 1); `SubPageBadge` aus `../../components/SubPageBadge.astro`; `StoryblokComponent` aus `@storyblok/astro/StoryblokComponent.astro`.
- Consumes (blok-Felder): `columns` ("1".."4"), `badge` (text), `title` (text, Pflicht), `subtitle` (textarea), `items` (bloks: `column_item`), `cta_text` (text), `cta_button_text` (text), `cta_link` (multilink).
- Produces: Storyblok-Komponente für component-Key `columns` (in Task 4 registriert).

- [ ] **Step 1: Komponente schreiben**

Create `src/storyblok/content/Columns.astro`:

```astro
---
import { storyblokEditable } from "@storyblok/astro";
import StoryblokComponent from "@storyblok/astro/StoryblokComponent.astro";
import SubPageBadge from "../../components/SubPageBadge.astro";
import { resolveStoryblokLink } from "../utils/link.js";

const { blok } = Astro.props;

const colClass: Record<string, string> = {
  "1": "",
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};
const cols = colClass[blok.columns] ?? "sm:grid-cols-2 lg:grid-cols-3";

const { href: ctaHref, isExternal: ctaExternal } = resolveStoryblokLink(blok.cta_link);
const showCta = Boolean(blok.cta_button_text && ctaHref);
const ctaExtAttrs = ctaExternal ? { target: "_blank", rel: "noopener" } : {};
---

<section {...storyblokEditable(blok)} class="cols-section">
  <div class="mx-auto max-w-6xl px-6 lg:px-10">

    <div class="cols-header">
      {blok.badge && <SubPageBadge text={blok.badge} />}
      <h2 class="cols-title">{blok.title}</h2>
      {blok.subtitle && <p class="cols-subtitle">{blok.subtitle}</p>}
    </div>

    <div class={`grid grid-cols-1 ${cols} gap-5`}>
      {blok.items?.map((item: any) => (
        <StoryblokComponent blok={item} />
      ))}
    </div>

    {(blok.cta_text || showCta) && (
      <div class="cols-cta">
        {blok.cta_text && <p class="cols-cta-text">{blok.cta_text}</p>}
        {showCta && (
          <a href={ctaHref} class="cols-cta-btn" {...ctaExtAttrs}>
            {blok.cta_button_text}
            <svg class="cols-cta-arrow" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    )}

  </div>
</section>

<style>
  .cols-section {
    font-family: "Poppins", Calibri, sans-serif;
    background: #ffffff;
    padding: 6rem 0 7rem;
    color: #0f1e30;
  }

  .cols-header {
    text-align: center;
    margin-bottom: 4rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }

  .cols-title {
    margin: 0;
    font-size: clamp(2rem, 4.5vw, 3rem);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: #0a1628;
    max-width: 22ch;
  }

  .cols-subtitle {
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: #64748b;
    max-width: 54ch;
  }

  .cols-cta {
    margin-top: 3.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
  }

  .cols-cta-text {
    margin: 0;
    font-size: 1.0625rem;
    line-height: 1.7;
    color: #475569;
    max-width: 52ch;
  }

  .cols-cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.85rem 1.6rem;
    border-radius: 9999px;
    background: linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%);
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    text-decoration: none;
    box-shadow: 0 4px 16px -4px rgba(37, 99, 235, 0.5);
    transition: transform 0.2s ease, box-shadow 0.2s ease, gap 0.2s ease;
  }

  .cols-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px -6px rgba(37, 99, 235, 0.55);
    gap: 0.7rem;
  }

  .cols-cta-arrow {
    width: 1rem;
    height: 1rem;
    flex: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .cols-cta-btn { transition: none; }
    .cols-cta-btn:hover { transform: none; }
  }
</style>
```

- [ ] **Step 2: Review**

Prüfen: Header wird immer gerendert (`title` erwartet); `cols`-Fallback auf 3-Spalten-Verhalten; Sektions-CTA nur bei `cta_text` oder `showCta`; `items` iteriert genestete `column_item`-Bloks. Build-Verifikation folgt in Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/storyblok/content/Columns.astro
git commit -m "feat: add Columns Storyblok block (responsive 1-4 column grid)"
```

---

### Task 4: Registrieren, Demo einbinden & end-to-end verifizieren

**Files:**
- Modify: `astro.config.mjs` (Komponenten-Map, nach Zeile 43 `product_tabs: ...`)
- Modify: `src/pages/komponenten.astro` (`subpage`-Array, nach dem `cta_banner`-Eintrag)

**Interfaces:**
- Consumes: `columns` (Task 3) und `column_item` (Task 2) Komponentendateien.

- [ ] **Step 1: Komponenten registrieren**

In `astro.config.mjs`, in `storyblok.components`, direkt nach der Zeile
`product_tab_item: "storyblok/content/ProductTabItem",` ergänzen:

```js
        columns: "storyblok/content/Columns",
        column_item: "storyblok/content/ColumnItem",
```

- [ ] **Step 2: Demo-Eintrag in Referenzseite ergänzen**

In `src/pages/komponenten.astro`, im `subpage`-Array, direkt **nach** dem Objekt mit `id: "cta_banner"` (schließende `},` bei Zeile 222) und **vor** dem schließenden `];` (Zeile 223) einfügen:

```js
  {
    id: "columns",
    label: "Columns (1–4 Spalter)",
    desc: "Flexibler Spalten-Block (1–4) mit Headline/Subline/Text, optionalem Bild, Teaser+Button pro Spalte und optionalem Sektions-CTA.",
    blok: {
      component: "columns",
      columns: "3",
      badge: "Übersicht",
      title: "Unsere Leistungen im Überblick",
      subtitle: "Drei Spalten – eine mit Bild und Button, eine mit Bild, eine ohne Bild – plus Abschluss-CTA.",
      items: [
        {
          component: "column_item",
          image: { filename: DEMO_IMG, alt: "Demo" },
          headline: "Mit Bild & Button",
          subline: "Voice Bots",
          text: "Automatisierte Anrufannahme rund um die Uhr – natürlich und effizient.",
          teaser_text: "Mehr über unsere Voice-Lösungen erfahren.",
          button_text: "Zur Landingpage",
          link: { linktype: "url", url: "https://crealog.com" },
        },
        {
          component: "column_item",
          image: { filename: EXPERT_IMG, alt: "Demo" },
          headline: "Nur mit Bild",
          subline: "Beratung",
          text: "Persönliche Experten-Beratung für Ihre Kommunikationsinfrastruktur.",
        },
        {
          component: "column_item",
          headline: "Ohne Bild",
          subline: "Integration",
          text: "Nahtlose Anbindung an CRM, ERP und bestehende Telefonie – DSGVO-konform.",
          button_text: "Details ansehen",
          link: { linktype: "story", cached_url: "loesungen" },
        },
      ],
      cta_text: "Sie möchten alle Lösungen im Detail sehen?",
      cta_button_text: "Alle Lösungen ansehen",
      cta_link: { linktype: "story", cached_url: "loesungen" },
    },
  },
```

- [ ] **Step 3: Build ausführen (Kompilierungs-Check)**

Run: `pnpm build`
Expected: Build endet mit „Complete!" / Exit 0, keine Fehler zu `columns`, `column_item` oder `resolveStoryblokLink`.
(Falls der Build wegen fehlendem `STORYBLOK_DELIVERY_API_TOKEN` an den Storyblok-Stories abbricht, ist das umgebungsbedingt und unabhängig von diesen Komponenten — dann mit Step 4 im Dev-Server verifizieren.)

- [ ] **Step 4: Visuelle Verifikation im Browser**

Dev-Server starten (Hintergrund): `pnpm dev`
Dann per Playwright MCP `http://localhost:4321/komponenten` öffnen, zum Anker `#columns` scrollen und einen Screenshot machen.

Expected/Prüfen:
- Header „Unsere Leistungen im Überblick" mit Badge sichtbar.
- Drei Karten nebeneinander (ab `lg`): Karte 1 mit Bild + „Zur Landingpage"-Button, Karte 2 mit Bild ohne Button, Karte 3 ohne Bild mit „Details ansehen"-Button.
- Sektions-CTA-Button „Alle Lösungen ansehen" unter dem Grid.
- Fensterbreite verkleinern → Spalten stapeln sich (einspaltig auf Mobil).

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/pages/komponenten.astro
git commit -m "feat: register columns block and add demo to komponenten reference page"
```

---

### Task 5: Storyblok Component-Definitionen anlegen (MCP)

**Files:** keine (Storyblok Management API im Space `293145431528152`).

**Interfaces:**
- Consumes: technische Namen `column_item`, `columns` und die in den Global Constraints / im Schema festgelegten Feldtypen.

- [ ] **Step 1: Passende Operation & Schema ermitteln**

- `search` mit Keyword „create component" → Create-Component-`operationId` finden.
- `describe` dieser Operation aufrufen (Pflicht!) → genaue Body-Struktur & `executeWith` klären.
- Read-only (`execute_readonly`, „list components") prüfen, ob `columns`/`column_item` im Space bereits existieren. Falls ja: nicht doppelt anlegen (ggf. updaten statt create).

- [ ] **Step 2: Block `column_item` anlegen**

`execute_mutating` (Create Component) mit `space_id: 293145431528152`, `name: "column_item"`, `is_nestable: true`, und folgendem Feld-Schema (an das in `describe` gezeigte Body-Format anpassen):

| pos | key | type | Optionen |
|---|---|---|---|
| 0 | `image` | `asset` | filetypes: `["images"]` |
| 1 | `headline` | `text` | `required: true` |
| 2 | `subline` | `text` | — |
| 3 | `text` | `textarea` | — |
| 4 | `teaser_text` | `textarea` | — |
| 5 | `button_text` | `text` | — |
| 6 | `link` | `multilink` | — |

- [ ] **Step 3: Block `columns` anlegen**

`execute_mutating` (Create Component) mit `space_id: 293145431528152`, `name: "columns"`, `is_nestable: true`, Feld-Schema:

| pos | key | type | Optionen |
|---|---|---|---|
| 0 | `columns` | `option` | options: `1,2,3,4`; `default_value: "3"` |
| 1 | `badge` | `text` | — |
| 2 | `title` | `text` | `required: true` |
| 3 | `subtitle` | `textarea` | — |
| 4 | `items` | `bloks` | `component_whitelist: ["column_item"]` |
| 5 | `cta_text` | `text` | — |
| 6 | `cta_button_text` | `text` | — |
| 7 | `cta_link` | `multilink` | — |

- [ ] **Step 4: Verifizieren**

`execute_readonly` (Get/List Component) für beide Blöcke → bestätigen, dass alle Felder mit den korrekten Typen angelegt sind, `title`/`headline` als `required`, und `items` auf `column_item` eingeschränkt ist.

Keine Code-Änderung → kein Git-Commit in diesem Task.

---

## Self-Review

**Spec coverage:**
- Flexibler Block + Items (1–4) → Task 3 (`columns` Dropdown), Task 5 (Schema). ✓
- Headline/Subline/Text pro Spalte → Task 2. ✓
- Bild optional (mit/ohne) → Task 2 (`imgSrc`-Guard), Task 4 Demo zeigt beide Fälle. ✓
- Teaser + Button + Link pro Spalte → Task 2 + Task 1 (Multilink). ✓
- Sektions-Header **Pflicht** → Task 3 (immer gerendert), Task 5 (`title required`). ✓
- Sektions-CTA (Teaser + Button + Link) → Task 3. ✓
- Multilink zu Landingpage (intern/extern) → Task 1. ✓
- Registrierung / „alle Seiten" → Task 4. ✓
- Referenzseite-Demo aller Varianten → Task 4. ✓
- Storyblok-Bloks per MCP → Task 5. ✓

**Placeholder scan:** Keine TBD/TODO; aller Code vollständig; MCP-Task nennt konkrete Feld-Schemata (Body-Format wird korrekt aus `describe` übernommen, kein Platzhalter).

**Type consistency:** `resolveStoryblokLink(link) → { href, isExternal }` einheitlich in Task 1 definiert und in Task 2 & 3 identisch genutzt. Feld-Keys (`headline`, `subline`, `text`, `teaser_text`, `button_text`, `link`, `columns`, `badge`, `title`, `subtitle`, `items`, `cta_text`, `cta_button_text`, `cta_link`) sind in Render-Komponenten (Task 2/3), Demo (Task 4) und Storyblok-Schema (Task 5) konsistent.
