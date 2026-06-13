# Landing Page Redesign — CreaLog

**Datum:** 2026-06-13  
**Status:** Approved  
**Ziel:** Modernere, zielgruppenspezifische Landing Page für Telcos & Enterprises mit klarer Content-Struktur und mehreren gleichwertigen CTAs.

---

## 1. Kontext

Die aktuelle `index.astro` hat bereits: Navbar, Hero, Company/About, Solutions (Tabs), Testimonials (Karten), Footer.

**Fehlend vs. crealog.com:** Use Cases nach Segment, Kontakt/CTA-Sektion.

**Visueller Referenzpunkt:** [Arcade Software](https://www.arcade.software) — zentrierter Seitenfluss, großzügiger Weißraum, Testimonials als große zentrierte Quote.

---

## 2. Finale Seitenstruktur

```
Navbar
Hero (bestehend, Texte angepasst)
About/Stats (bestehend, Texte angepasst)
Use Cases (NEU)
Solutions (bestehend, unverändert)
Testimonials (bestehend, Layout geändert)
CTA-Sektion (NEU)
Footer (bestehend)
```

**Sprache:** Deutsch als Standard, Englisch per LangToggler-Toggle (bereits im Code vorhanden).

---

## 3. Sektionen im Detail

### 3.1 Navbar
Keine Änderungen. CX Solutions / Telco Solutions / Professional Services / Über uns / Kontakt / Blog.

---

### 3.2 Hero

**Beibehaltung:** Zentriertes Layout, Wave-Animation, Customer Logos (Telekom, Swisscom, A1) im unteren Bereich.

**Textänderungen:**

| Element | Alt | Neu |
|---|---|---|
| Badge | *AI-Powered Voice Solutions* | *KI-Plattform für Telcos & Enterprises* |
| H1 | *Die Zukunft des Kundenkontakts* | unverändert |
| Subtitle | *Intelligente Sprachlösungen, die Kundengespräche automatisieren — schneller, skalierbarer und natürlicher als je zuvor.* | *CreaLog automatisiert, analysiert und verbessert Kundengespräche — on-premise, cloud oder hybrid. DSGVO-konform. Made in Germany.* |
| CTA | 1× *Jetzt starten* | 3 gleichwertige CTAs: **Demo anfragen** · **Lösungen entdecken** · **Kontakt aufnehmen** |

---

### 3.3 About/Stats

**Textänderungen:**

| Element | Alt | Neu |
|---|---|---|
| Stat 4 | *München* | *98% Kundenzufriedenheit* (aus Testimonials-Daten) |
| H2 | *Sprachkommunikation neu gedacht. Seit 1996.* | *Der verlässliche Partner für Sprachkommunikation im Telco-Umfeld* |
| Absatz 1 | allgemeine Unternehmensbeschreibung | *CreaLog entwickelt seit 1996 KI-gestützte Sprachlösungen für Telekommunikationsunternehmen und deren Enterprise-Kunden. Unsere Plattformen laufen in den Netzen führender Carrier Europas.* |
| Absatz 2 | unverändert | on-premise / cloud / hybrid + DSGVO-konform + Made in Germany |

**Layout:** Section-Heading zentriert (Arcade-Stil).

---

### 3.4 Use Cases (NEU)

**Layout-Ansatz:** Section-Heading zentriert, darunter 3 Karten im Grid (1 Spalte mobil, 3 Spalten desktop).

**Heading:**
- Label: *Anwendungsfälle*
- H2: *Gebaut für Telcos und Enterprises*
- Subtext: *Von der Carrier-Infrastruktur bis zum KI-Kundenservice — CreaLog passt sich Ihrer Infrastruktur an.*

**3 Karten:**

| Karte | Segment | Pain Point | CreaLog-Lösung |
|---|---|---|---|
| 1 | **Telcos & Carrier** | Netzqualität, Fraud, Rufnummernmanagement im Carrier-Betrieb | SIP Trunking, Fraud Detection, Network Analytics & Nummerntransfer |
| 2 | **Contact Center & Kundenservice** | Zu viele Anrufe, zu wenig Agenten, keine Qualitätskontrolle | AI Voice Agent, Omnichannel-Routing, Speech Analytics |
| 3 | **Enterprises & Mittelstand** | CRM-Integration, Compliance, skalierbare Automatisierung | Systemintegration mit SAP/Salesforce, DSGVO-konforme Aufzeichnung, Custom-Konnektoren |

**Implementierung:** Neues `.astro`-Component `src/components/UseCases.astro`.

---

### 3.5 Solutions

Keine Änderungen. Bestehende `SolutionsElegant.astro` + `SolutionsTabsElegant.vue` (Tabs: CX / Telco / Professional Services, je 4 Karten).

**Layout:** Section-Heading zentriert (Arcade-Stil) — kleines Update in `SolutionsElegant.astro`.

---

### 3.6 Testimonials

**Layout-Änderung:** Von Karten-Grid auf **1 große zentrierte Quote** (Arcade-Stil).

- Sterne-Rating oben (G2 oder intern)
- Großes Zitat in der Mitte (z.B. das Deutsche Telekom-Zitat)
- Unterschrift + Name + Titel + Unternehmen darunter
- Optional: Pfeil-Navigation für weitere Quotes

**Stats** (200+, 4.9, 98%) bleiben als Zeile über oder unter der Quote erhalten.

**Implementierung:** `TestimonialsV2Elegant.astro` anpassen oder neues Component.

---

### 3.7 CTA-Sektion (NEU)

**Layout:** Zentriert, viel Weißraum (Arcade-Stil). Dunkler Hintergrund (`#0a1628` — das Navy des bestehenden Designs) für klare Abgrenzung vom Footer.

**Texte:**
- H2: *Bereit, Ihren Kundenkontakt zu transformieren?*
- Subtext: *Sprechen Sie mit einem unserer Experten — oder erkunden Sie die Lösungen selbst.*

**3 CTA-Karten nebeneinander:**

| Karte | Typ | Titel | Text | Button |
|---|---|---|---|---|
| 1 | Primary | Demo anfragen | *Wir zeigen Ihnen live, wie CreaLog in Ihrer Infrastruktur funktioniert.* | Demo buchen → |
| 2 | Secondary | Lösungen entdecken | *Alle CX- und Telco-Produkte im Überblick — mit technischen Details.* | Zu den Lösungen → |
| 3 | Secondary | Kontakt aufnehmen | *Direkter Draht zu unserem Sales-Team — ohne Umwege, ohne Warteschleife.* | Schreiben Sie uns → |

**Implementierung:** Neues `.astro`-Component `src/components/CTASection.astro`.

---

### 3.8 Footer
Keine Änderungen. Bestehende `FooterElegant.astro`.

---

## 4. Neue Komponenten

| Component | Typ | Beschreibung |
|---|---|---|
| `src/components/UseCases.astro` | neu | 3-Karten Use-Case-Sektion |
| `src/components/CTASection.astro` | neu | 3-CTA-Abschlusssektion |

## 5. Geänderte Komponenten

| Component | Änderung |
|---|---|
| `src/components/Hero.astro` | Badge-Text, Subtitle, CTA-Gruppe (3 CTAs) |
| `src/components/Company.astro` | Stat 4, H2, Absatz 1, Heading zentriert |
| `src/components/themes/elegant/SolutionsElegant.astro` | Section-Heading zentriert |
| `src/components/themes/elegant/TestimonialsV2Elegant.astro` | Layout: Karten → zentrierte große Quote |
| `src/pages/index.astro` | Neue Imports: UseCases, CTASection |

---

## 6. Nicht im Scope

- Blog / News / Events-Sektion (bewusst weggelassen)
- Neue Unterseiten
- Backend / Kontaktformular-Logik
- Animationen / visuelle Überarbeitung (separater Task)
