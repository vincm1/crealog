# Design: Flexible Spalten-Komponente (1–4 Spalter) für Storyblok

**Datum:** 2026-07-13
**Status:** Genehmigt (Schema + Ansatz vom Nutzer bestätigt)
**Space:** `293145431528152` (Region EU)

## Ziel

Eine wiederverwendbare, redaktionell steuerbare Spalten-Komponente für Storyblok, die
1, 2, 3 oder 4 Spalten nebeneinander darstellt. Jede Spalte enthält Headline, Subline,
Text und optional ein Bild. Zusätzlich kann jede Spalte einen Teaser-Text mit Button und
Link (z.B. zu einer Landingpage) tragen, und die gesamte Sektion kann einen eigenen
Teaser + Button darunter zeigen. Der Block ist nach Registrierung automatisch auf **allen**
Seiten/Stories verfügbar; Redakteure fügen ihn in Storyblok per Klick ein.

## Ansatz

Ein flexibler Eltern-Block `columns` mit einem Dropdown „Anzahl Spalten" (1–4) und beliebig
vielen genesteten `column_item`-Bloks. Dies folgt dem bestehenden Muster
`feature_grid` → `feature_item` (siehe `src/storyblok/features/`).

Verworfene Alternative: vier getrennte Bloks (1/2/3/4-Spalter). Mehr Pflegeaufwand,
weniger flexibel, kein Mehrwert.

## Storyblok-Schema

### Block `columns` (nestable)

| Feld | Typ | Pflicht | Zweck |
|---|---|---|---|
| `columns` | Dropdown (Optionen `1`,`2`,`3`,`4`; Default `3`) | ja | Anzahl Spalten |
| `badge` | Text | nein | Sektions-Eyebrow (via `SubPageBadge`) |
| `title` | Text | **ja** | Sektions-Headline (Pflicht) |
| `subtitle` | Textarea | nein | Sektions-Subline |
| `items` | Blocks (eingeschränkt auf `column_item`) | ja | die Spalten |
| `cta_text` | Text | nein | Sektions-Teaser unter dem Grid |
| `cta_button_text` | Text | nein | Beschriftung des Sektions-Buttons |
| `cta_link` | Link/Multilink | nein | Ziel des Sektions-Buttons |

### Block `column_item` (nestable, nur innerhalb `columns`)

| Feld | Typ | Pflicht | Zweck |
|---|---|---|---|
| `image` | Asset (Bild) | nein | Bild oben in der Karte |
| `headline` | Text | ja | Überschrift der Spalte |
| `subline` | Text | nein | Unterzeile |
| `text` | Textarea | nein | Fließtext |
| `teaser_text` | Textarea | nein | Teaser-Text über dem Button |
| `button_text` | Text | nein | Beschriftung des Spalten-Buttons |
| `link` | Link/Multilink | nein | Ziel-Landingpage der Spalte |

**Link-Verhalten:** `link`/`cta_link` sind Multilink-Felder — Redakteure wählen entweder eine
interne Story oder geben eine externe URL ein. Button + Link werden nur gerendert, wenn
Button-Text **und** Link gesetzt sind.

## Render-Komponenten (Astro)

Konvention wie bei allen bestehenden Bloks: `.astro`-Datei, `const { blok } = Astro.props`,
Wurzel-Element mit `{...storyblokEditable(blok)}`, scoped `<style>`, Font `"Poppins", Calibri, sans-serif`.

### `src/storyblok/content/Columns.astro`

- Section-Wrapper: weißer Hintergrund, `max-w-6xl`, horizontales Padding wie `FeatureGrid`.
- Responsives Grid über eine `colClass`-Map (analog `FeatureGrid.astro`):
  - `1` → einspaltig
  - `2` → `sm:grid-cols-2`
  - `3` → `sm:grid-cols-2 lg:grid-cols-3`
  - `4` → `sm:grid-cols-2 lg:grid-cols-4`
  - Fallback (unbekannt) → `3`-Verhalten.
- Header (`badge` → `SubPageBadge`, `title`, `subtitle`) wird **immer** gerendert.
  `title` ist Pflicht; `badge` und `subtitle` erscheinen nur, wenn gesetzt.
- `items` werden über `<StoryblokComponent blok={item} />` gerendert.
- Optionaler Sektions-CTA unter dem Grid — nur wenn `cta_button_text` **und** `cta_link`
  gesetzt sind; `cta_text` optional darüber.

### `src/storyblok/content/ColumnItem.astro`

- Karten-Layout, volle Spaltenhöhe:
  - Optionales Bild oben (Seitenverhältnis ~16:9, `border-radius`, `object-cover`).
    Fehlt das Bild, rückt der Text nach oben — identische Komponente, sauberer Fallback.
  - Headline (immer), Subline (optional), Text (optional).
  - Am Fuß: optionaler Teaser-Text + Button-Link (nur wenn `button_text` **und** `link`).
- Multilink → `href`: aus `link.url || link.cached_url` auflösen. Externe Links (http/https,
  bzw. `linktype === "url"`) erhalten `target="_blank" rel="noopener"`; interne Links werden
  bei Bedarf mit führendem `/` normalisiert.

## Registrierung

In `astro.config.mjs` unter `storyblok.components` ergänzen:

```js
columns: "storyblok/content/Columns",
column_item: "storyblok/content/ColumnItem",
```

Damit ist der Block auf allen Seiten/Stories verfügbar (Anforderung „alle Seiten" erfüllt).
Der Block wird **nicht** fest in einzelne bestehende Seiten geschrieben.

## Referenzseite

In `src/pages/komponenten.astro`, Gruppe „Subpages" (`subpage`-Array), einen Demo-Eintrag
`columns` ergänzen mit Beispieldaten, die alle Varianten zeigen:
- 3-Spalter mit Header (badge/title/subtitle),
- zwei Spalten mit Bild, eine Spalte **ohne** Bild,
- mindestens eine Spalte mit Teaser-Text + Button + Link,
- ein Sektions-CTA (`cta_text` + `cta_button_text` + `cta_link`).

Bild-URLs: bestehende Demo-Assets (`DEMO_IMG` / `EXPERT_IMG`) wiederverwenden.

## Storyblok-Bloks anlegen (per MCP)

Im Space `293145431528152` beide Component-Definitionen anlegen:
1. `search` nach der passenden Create-Component-Operation.
2. `describe` der Operation (Pflichtschritt) für Parameter & Body-Schema.
3. Read-only prüfen, ob `columns` / `column_item` bereits existieren (Namenskonflikt vermeiden).
4. `execute_mutating` (Create Component) für `column_item` zuerst, dann `columns` — inkl.
   Dropdown-Optionen (1–4) und Einschränkung von `items` auf `column_item`.

## Testing / Verifikation

- `pnpm build` läuft ohne Fehler durch (statischer Build).
- `pnpm dev` → `/komponenten` zeigt den neuen `columns`-Block korrekt: alle vier
  Spalten-Anzahlen wirken plausibel, Variante mit/ohne Bild, Button-Link funktioniert,
  Sektions-CTA sichtbar.
- Responsives Verhalten (Mobil einspaltig, Aufklappen ab `sm`/`lg`) per Browser prüfen.
- Multilink-Auflösung: interner Link → korrekter Pfad, externer Link → neues Tab.

## Nicht im Scope (YAGNI)

- Rich-Text im `text`-Feld (Plain Textarea reicht, konsistent mit bestehenden Bloks).
- Hintergrund-/Farbvarianten der Sektion.
- Bild als Vollflächen-Hintergrund oder Icon-Variante (bewusst „Bild oben" gewählt).
