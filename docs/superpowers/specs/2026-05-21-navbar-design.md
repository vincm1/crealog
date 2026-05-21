# Navbar Design

## Ziel

Responsive Navbar für die Crealog-Website mit Logo links, Desktop-Links in der Mitte, Hamburger-Menü rechts (mobile).

## Dateistruktur

```
src/components/Navbar/
├── Navbar.astro       ← Layout-Shell
├── CXSolution.astro   ← Submenu-Items CX Solutions
└── INSolution.astro   ← Submenu-Items IN Solutions
```

## Layout

| Zone           | Desktop                                      | Mobile            |
|----------------|----------------------------------------------|-------------------|
| `navbar-start` | Logo "Crealog" (Text-Placeholder)            | Logo "Crealog"    |
| `navbar-center` | CX Solutions, IN Solutions, Über uns, Kontakt | —                |
| `navbar-end`   | CTA-Button                                   | Hamburger-Icon    |

## Navigationsstruktur

- **CX Solutions** → Dropdown mit Placeholder-Items (Item 1, 2, 3)
- **IN Solutions** → Dropdown mit Placeholder-Items (Item 1, 2, 3)
- **Über uns** → einfacher Link (`/about`)
- **Kontakt** → einfacher Link (`/kontakt`)

## Technische Entscheidungen

- **Dropdown-Mechanismus:** DaisyUI `details/summary` — reines CSS, kein JS
- **Mobile-Menü:** DaisyUI `dropdown` in `navbar-end`, öffnet nach unten
- **Submenü-Komponenten:** Separate `.astro`-Dateien, in Navbar und Mobile-Menü importiert
- **Breakpoint:** `lg` (1024px) — unter diesem Wert greift das Mobile-Layout

## Offen / Später

- Logo-Asset ersetzen sobald vorhanden
- Placeholder-Items mit echten Links befüllen
- Aktiven Link-State highlighten
