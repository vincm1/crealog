# Theme Variants (Classic & Elegant) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create two standalone index page variants — `/index-classic` (Blue/Orange) and `/index-elegant` (Blue/White) — by duplicating themed component copies, leaving the existing site untouched.

**Architecture:** Each variant lives in `src/components/themes/{classic,elegant}/`. Pages import themed components directly — no shared state, no CSS variable wiring, full isolation. Components shared as-is: Navbar, Layout, Company, Testimonials (V1), TestimonialCard.

**Tech Stack:** Astro 6, Vue 3, Tailwind CSS (arbitrary values), pnpm

---

## Color Reference

| Token | Classic (B) | Elegant (C) |
|---|---|---|
| Dark section bg | `#0f2548` | `#f8faff` |
| Accent | `#ff6600` | `#004990` |
| CTA button bg | `#ff6600` | `#004990` |
| CTA button text | `white` | `white` |
| Tab active bg | `#ff6600` | `#004990` |
| Tab active text | `white` | `white` |
| Accent text on dark | `#ff8533` | — (n/a, no dark sections) |
| Headline accent span | `#ff6600` | `#1d6bbf` |
| Body text (light sections) | `gray-900` | `#0a1628` |
| Muted text (light sections) | `gray-500` | `#6b7280` |
| Muted text on dark sections | `rgba(255,255,255,0.5)` | `#6b7280` |
| Section divider/border | `rgba(255,255,255,0.08)` | `#e2e8f0` |
| Card bg (dark) | `rgba(255,255,255,0.04)` | `white` |
| Footer bg | `#0f2548` | `#f1f5fb` |
| Footer text | `white/55` | `#4b5563` |

---

## File Map

**Create:**
- `src/components/themes/classic/HeroClassic.astro`
- `src/components/themes/classic/SolutionsClassic.astro`
- `src/components/themes/classic/SolutionsTabsClassic.vue`
- `src/components/themes/classic/TestimonialsV2Classic.astro`
- `src/components/themes/classic/TestimonialCardV2Classic.astro`
- `src/components/themes/classic/FooterClassic.astro`
- `src/pages/index-classic.astro`
- `src/components/themes/elegant/HeroElegant.astro`
- `src/components/themes/elegant/SolutionsElegant.astro`
- `src/components/themes/elegant/SolutionsTabsElegant.vue`
- `src/components/themes/elegant/TestimonialsV2Elegant.astro`
- `src/components/themes/elegant/TestimonialCardV2Elegant.astro`
- `src/components/themes/elegant/FooterElegant.astro`
- `src/pages/index-elegant.astro`

**Modify:** nothing — existing files untouched.

---

### Task 1: Hero — Classic

**Files:**
- Create: `src/components/themes/classic/HeroClassic.astro`

- [ ] **Step 1: Create HeroClassic.astro**

```astro
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .hero-root { font-family: 'Plus Jakarta Sans', sans-serif; }
  .wave-bar { animation: wavePulse 1.6s ease-in-out infinite; transform-origin: bottom; }
  .wave-bar:nth-child(1) { animation-delay: 0.00s; height: 40%; }
  .wave-bar:nth-child(2) { animation-delay: 0.15s; height: 80%; }
  .wave-bar:nth-child(3) { animation-delay: 0.30s; height: 100%; }
  .wave-bar:nth-child(4) { animation-delay: 0.10s; height: 60%; }
  .wave-bar:nth-child(5) { animation-delay: 0.25s; height: 90%; }
  .wave-bar:nth-child(6) { animation-delay: 0.05s; height: 50%; }
  .wave-bar:nth-child(7) { animation-delay: 0.20s; height: 70%; }
  @keyframes wavePulse {
    0%, 100% { transform: scaleY(0.25); opacity: 0.35; }
    50%       { transform: scaleY(1);    opacity: 1;    }
  }
  .fade-up { opacity: 0; animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
  .fade-up:nth-child(1) { animation-delay: 0.10s; }
  .fade-up:nth-child(2) { animation-delay: 0.28s; }
  .fade-up:nth-child(3) { animation-delay: 0.44s; }
  .fade-up:nth-child(4) { animation-delay: 0.58s; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .cta-primary { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .cta-primary:hover {
    box-shadow: 0 0 28px rgba(255,102,0,0.45);
    transform: translateY(-1px);
  }
</style>

<section class="hero-root relative min-h-screen lg:h-screen bg-[#0f2548] overflow-hidden flex items-center">
  <div class="absolute right-0 top-0 w-[58%] h-full pointer-events-none">
    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url(/hero_graphic.png);"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-[#0f2548] via-[#0f2548]/55 to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-[#0f2548]/50 via-transparent to-[#0f2548]/60"></div>
  </div>
  <div class="absolute inset-0 opacity-[0.03]" style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>');"></div>
  <div class="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-20 py-24">
    <div class="max-w-[520px] flex flex-col gap-7 lg:gap-10">
      <div class="fade-up flex items-center gap-3">
        <div class="flex items-end gap-[3px] h-[16px]">
          <div class="wave-bar w-[3px] bg-[#ff8533] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#ff8533] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#ff8533] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#ff8533] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#ff8533] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#ff8533] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#ff8533] rounded-full"></div>
        </div>
        <span class="text-[#ff8533] text-[11px] font-semibold uppercase tracking-[0.28em]">
          AI-Powered Voice Solutions
        </span>
      </div>
      <h1 class="fade-up text-[2rem] md:text-[2.25rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-bold leading-[1.05] tracking-[-0.025em] text-white">
        Die Zukunft des<br />
        <span class="text-[#ff6600]">Kundenkontakts</span>
      </h1>
      <p class="fade-up text-[15px] text-white/50 leading-relaxed max-w-[380px] font-normal">
        Intelligente Sprachlösungen, die Kundengespräche automatisieren —
        schneller, skalierbarer und natürlicher als je zuvor.
      </p>
      <div class="fade-up flex items-center gap-7">
        <a href="/kontakt" class="cta-primary px-8 py-[13px] bg-[#ff6600] text-white font-semibold text-sm rounded-full">
          Jetzt starten
        </a>
        <a href="/loesungen" class="group flex items-center gap-2 text-white/45 hover:text-white text-sm font-medium transition-colors duration-200">
          Lösungen ansehen
          <span class="text-[#ff8533] group-hover:translate-x-1 transition-transform duration-200">→</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/themes/classic/HeroClassic.astro
git commit -m "feat: add Classic hero component (blue/orange)"
```

---

### Task 2: Hero — Elegant

**Files:**
- Create: `src/components/themes/elegant/HeroElegant.astro`

- [ ] **Step 1: Create HeroElegant.astro**

```astro
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .hero-root { font-family: 'Plus Jakarta Sans', sans-serif; }
  .wave-bar { animation: wavePulse 1.6s ease-in-out infinite; transform-origin: bottom; }
  .wave-bar:nth-child(1) { animation-delay: 0.00s; height: 40%; }
  .wave-bar:nth-child(2) { animation-delay: 0.15s; height: 80%; }
  .wave-bar:nth-child(3) { animation-delay: 0.30s; height: 100%; }
  .wave-bar:nth-child(4) { animation-delay: 0.10s; height: 60%; }
  .wave-bar:nth-child(5) { animation-delay: 0.25s; height: 90%; }
  .wave-bar:nth-child(6) { animation-delay: 0.05s; height: 50%; }
  .wave-bar:nth-child(7) { animation-delay: 0.20s; height: 70%; }
  @keyframes wavePulse {
    0%, 100% { transform: scaleY(0.25); opacity: 0.35; }
    50%       { transform: scaleY(1);    opacity: 1;    }
  }
  .fade-up { opacity: 0; animation: fadeUp 0.75s cubic-bezier(0.22,1,0.36,1) forwards; }
  .fade-up:nth-child(1) { animation-delay: 0.10s; }
  .fade-up:nth-child(2) { animation-delay: 0.28s; }
  .fade-up:nth-child(3) { animation-delay: 0.44s; }
  .fade-up:nth-child(4) { animation-delay: 0.58s; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  .cta-primary { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .cta-primary:hover {
    box-shadow: 0 0 28px rgba(0,73,144,0.3);
    transform: translateY(-1px);
  }
</style>

<section class="hero-root relative min-h-screen lg:h-screen bg-white overflow-hidden flex items-center border-b border-[#e8ecf4]">
  <div class="absolute right-0 top-0 w-[58%] h-full pointer-events-none">
    <div class="absolute inset-0 bg-cover bg-center opacity-15" style="background-image: url(/hero_graphic.png);"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
  </div>
  <!-- Subtle blue radial glow bottom-right -->
  <div class="pointer-events-none absolute bottom-0 right-0 w-[600px] h-[500px]" style="background: radial-gradient(ellipse at bottom right, rgba(0,73,144,0.06) 0%, transparent 70%);"></div>
  <div class="relative z-20 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-20 py-24">
    <div class="max-w-[520px] flex flex-col gap-7 lg:gap-10">
      <div class="fade-up flex items-center gap-3">
        <div class="flex items-end gap-[3px] h-[16px]">
          <div class="wave-bar w-[3px] bg-[#004990] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#004990] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#004990] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#004990] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#004990] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#004990] rounded-full"></div>
          <div class="wave-bar w-[3px] bg-[#004990] rounded-full"></div>
        </div>
        <span class="text-[#004990] text-[11px] font-semibold uppercase tracking-[0.28em]">
          AI-Powered Voice Solutions
        </span>
      </div>
      <h1 class="fade-up text-[2rem] md:text-[2.25rem] lg:text-[2.5rem] xl:text-[3rem] 2xl:text-[3.5rem] font-bold leading-[1.05] tracking-[-0.025em] text-[#0a1628]">
        Die Zukunft des<br />
        <span class="text-[#1d6bbf]">Kundenkontakts</span>
      </h1>
      <p class="fade-up text-[15px] text-[#6b7280] leading-relaxed max-w-[380px] font-normal">
        Intelligente Sprachlösungen, die Kundengespräche automatisieren —
        schneller, skalierbarer und natürlicher als je zuvor.
      </p>
      <div class="fade-up flex items-center gap-7">
        <a href="/kontakt" class="cta-primary px-8 py-[13px] bg-[#004990] text-white font-semibold text-sm rounded-full">
          Jetzt starten
        </a>
        <a href="/loesungen" class="group flex items-center gap-2 text-[#6b7280] hover:text-[#0a1628] text-sm font-medium transition-colors duration-200">
          Lösungen ansehen
          <span class="text-[#004990] group-hover:translate-x-1 transition-transform duration-200">→</span>
        </a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/themes/elegant/HeroElegant.astro
git commit -m "feat: add Elegant hero component (blue/white)"
```

---

### Task 3: Solutions — Classic

**Files:**
- Create: `src/components/themes/classic/SolutionsClassic.astro`
- Create: `src/components/themes/classic/SolutionsTabsClassic.vue`

- [ ] **Step 1: Create SolutionsClassic.astro**

```astro
---
import SolutionsTabsClassic from "./SolutionsTabsClassic.vue";
---

<section class="relative bg-[#0f2548] py-24 overflow-hidden">
  <div class="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
  <div class="max-w-7xl mx-auto px-6 lg:px-10">
    <div class="flex flex-col gap-5 mb-14">
      <div class="flex items-center gap-3">
        <div class="h-px w-8 bg-[#ff6600]"></div>
        <span class="text-[#ff8533] text-[11px] font-semibold uppercase tracking-[0.28em]">Unsere Lösungen</span>
      </div>
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <h2 class="text-[2rem] lg:text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-white max-w-[480px]">
          Alles, was moderner<br />
          <span class="text-[#ff6600]">Kundenkontakt braucht</span>
        </h2>
        <p class="text-[14px] text-white/35 leading-relaxed max-w-[340px] lg:text-right">
          Wählen Sie die Lösungsgruppe, die zu Ihrer Infrastruktur passt —
          von der KI-Schnittstelle bis zum fertigen Contact-Center.
        </p>
      </div>
    </div>
    <SolutionsTabsClassic client:visible />
  </div>
</section>
```

- [ ] **Step 2: Create SolutionsTabsClassic.vue**

Copy `src/components/SolutionsTabs.vue` and apply these color changes in `<style scoped>`:

```vue
<script setup lang="ts">
import { ref } from "vue";
type Tab = "cx" | "in" | "tl" | "ps";
const activeTab = ref<Tab>("cx");
interface Solution { title: string; description: string; icon: string; href: string; }
const cxSolutions: Solution[] = [
  { title: "AI Voice Agent", description: "Vollautomatisierte Sprachassistenten, die Kundenanfragen rund um die Uhr lösen — ohne Wartezeit, ohne Eskalation.", icon: "microphone", href: "#" },
  { title: "Chat Assistant", description: "KI-gestützte Chat-Bots für Web, WhatsApp und Teams — kontextsensitiv und nahtlos in Ihr CRM integriert.", icon: "chat", href: "#" },
  { title: "Speech Analytics", description: "Analysieren Sie 100 % Ihrer Gespräche automatisch auf Qualität, Kundenstimmung und Compliance-Verstöße.", icon: "chart", href: "#" },
  { title: "Omnichannel-Routing", description: "Intelligentes Routing über alle Kanäle — Telefon, Chat, E-Mail — immer zur richtigen Person zur richtigen Zeit.", icon: "routing", href: "#" },
];
const telcoSolutions: Solution[] = [
  { title: "SIP Trunking", description: "Hochverfügbare SIP-Trunk-Anbindung für Ihr Contact Center — skalierbar, redundant und carrier-grade.", icon: "phone", href: "#" },
  { title: "Nummerntransfer & DID", description: "Portierung und Verwaltung von Rufnummernblöcken europaweit — mit Self-Service-Portal und Echtzeit-Monitoring.", icon: "hash", href: "#" },
  { title: "Fraud Detection", description: "KI-basierte Echtzeiterkennung von Telefonbetrug — schützt Ihr Netz vor Toll-Fraud und Spoofing-Angriffen.", icon: "shield", href: "#" },
  { title: "Network Analytics", description: "Vollständige Sichtbarkeit über Ihr Sprachnetz: Qualitäts-KPIs, CDR-Auswertung und Kapazitätsplanung.", icon: "signal", href: "#" },
];
const professionalServices: Solution[] = [
  { title: "Consulting & Design", description: "Von der Anforderungsanalyse bis zum fertigen Solution Design — wir begleiten Sie durch jede Projektphase.", icon: "lightbulb", href: "#" },
  { title: "Systemintegration", description: "Nahtlose Anbindung an SAP, Salesforce, Genesys und bestehende CRM-Systeme — inklusive Custom-Konnektoren.", icon: "wrench", href: "#" },
  { title: "Training & Workshops", description: "Admin- und Anwenderschulungen on-site oder remote — zertifiziert und praxisnah für Ihr Team.", icon: "academic", href: "#" },
  { title: "Support & SLA", description: "24/7 Premium-Support, proaktives Monitoring und flexible SLA-Pakete — damit Ihr Betrieb nie stillsteht.", icon: "lifering", href: "#" },
];
const solutions = { cx: cxSolutions, tl: telcoSolutions, ps: professionalServices };
</script>

<template>
  <div class="solutions-root">
    <div class="flex justify-center mb-12">
      <div class="tab-switcher">
        <button class="tab-btn" :class="{ active: activeTab === 'cx' }" @click="activeTab = 'cx'">CX Solutions</button>
        <button class="tab-btn" :class="{ active: activeTab === 'tl' }" @click="activeTab = 'tl'">Telco Solutions</button>
        <button class="tab-btn" :class="{ active: activeTab === 'ps' }" @click="activeTab = 'ps'">Professional Services</button>
      </div>
    </div>
    <Transition name="tab-fade" mode="out-in">
      <div :key="activeTab" class="cards-grid">
        <a v-for="(s, i) in solutions[activeTab]" :key="s.title" :href="s.href" class="solution-card" :style="`animation-delay: ${i * 0.08}s`">
          <div class="card-icon">
            <svg v-if="s.icon === 'microphone'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"/></svg>
            <svg v-if="s.icon === 'chat'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/></svg>
            <svg v-if="s.icon === 'chart'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
            <svg v-if="s.icon === 'routing'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg>
            <svg v-if="s.icon === 'phone'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>
            <svg v-if="s.icon === 'hash'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5"/></svg>
            <svg v-if="s.icon === 'shield'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
            <svg v-if="s.icon === 'signal'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg>
            <svg v-if="s.icon === 'lightbulb'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/></svg>
            <svg v-if="s.icon === 'wrench'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/></svg>
            <svg v-if="s.icon === 'academic'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>
            <svg v-if="s.icon === 'lifering'" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.978 1.07 1.396 1.671M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.76 7.307l-4.138 3.448m4.138-3.448a9.027 9.027 0 011.306 1.652c.51.51.978 1.07 1.396 1.671M4.33 7.307l4.138 3.448M4.33 7.307a9.027 9.027 0 00-1.306 1.652 9.028 9.028 0 00-.653 1.761m1.96-3.413l3.448 4.138m-3.448-4.138a9.014 9.014 0 000 9.424m3.448-5.276l-4.138 3.448m4.138-3.448a9.028 9.028 0 011.761-.653M7.478 19.67l3.448-4.138m-3.448 4.138a9.027 9.027 0 001.652 1.306 9.028 9.028 0 001.761.653m-3.413-1.96l4.138-3.448m-4.138 3.448a9.014 9.014 0 009.424 0m-5.276-3.448l3.448 4.138m-3.448-4.138a9.028 9.028 0 00-.653 1.761m3.413-1.96l4.138 3.448m-4.138-3.448a9.027 9.027 0 001.652-1.306 9.027 9.027 0 001.306-1.652m-2.958 2.958l4.138-3.448"/></svg>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ s.title }}</h3>
            <p class="card-desc">{{ s.description }}</p>
          </div>
          <div class="card-arrow">→</div>
        </a>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.solutions-root { font-family: "Plus Jakarta Sans", sans-serif; }
.tab-switcher {
  display: inline-flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9999px; padding: 5px;
}
.tab-btn {
  position: relative; padding: 10px 28px; border-radius: 9999px;
  font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.45);
  background: transparent; border: none; cursor: pointer;
  transition: color 0.2s ease; letter-spacing: 0.01em;
}
.tab-btn.active { color: white; background: #ff6600; }
.cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (min-width: 1024px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }
.solution-card {
  display: flex; flex-direction: column; gap: 16px; padding: 24px;
  border-radius: 16px; border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04); text-decoration: none;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  opacity: 0; animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; cursor: pointer;
}
.solution-card:hover { border-color: rgba(255,102,0,0.4); background: rgba(255,255,255,0.07); transform: translateY(-3px); }
.solution-card:hover .card-arrow { color: #ff6600; transform: translateX(4px); }
.card-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(255,102,0,0.15); color: #ff8533; flex-shrink: 0; }
.card-icon svg { width: 20px; height: 20px; }
.card-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.card-title { font-size: 14.5px; font-weight: 700; color: #fff; line-height: 1.2; }
.card-desc { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.65; }
.card-arrow { font-size: 16px; color: rgba(255,255,255,0.2); transition: color 0.2s ease, transform 0.2s ease; align-self: flex-end; }
.tab-fade-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.tab-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tab-fade-enter-from { opacity: 0; transform: translateY(10px); }
.tab-fade-leave-to { opacity: 0; transform: translateY(-6px); }
@keyframes cardIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/classic/SolutionsClassic.astro src/components/themes/classic/SolutionsTabsClassic.vue
git commit -m "feat: add Classic solutions section (blue/orange)"
```

---

### Task 4: Solutions — Elegant

**Files:**
- Create: `src/components/themes/elegant/SolutionsElegant.astro`
- Create: `src/components/themes/elegant/SolutionsTabsElegant.vue`

- [ ] **Step 1: Create SolutionsElegant.astro**

```astro
---
import SolutionsTabsElegant from "./SolutionsTabsElegant.vue";
---

<section class="relative bg-[#f8faff] py-24 overflow-hidden">
  <div class="pointer-events-none absolute top-0 left-0 right-0 h-px bg-[#e2e8f0]"></div>
  <div class="max-w-7xl mx-auto px-6 lg:px-10">
    <div class="flex flex-col gap-5 mb-14">
      <div class="flex items-center gap-3">
        <div class="h-px w-8 bg-[#004990]"></div>
        <span class="text-[#004990] text-[11px] font-semibold uppercase tracking-[0.28em]">Unsere Lösungen</span>
      </div>
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <h2 class="text-[2rem] lg:text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-[#0a1628] max-w-[480px]">
          Alles, was moderner<br />
          <span class="text-[#1d6bbf]">Kundenkontakt braucht</span>
        </h2>
        <p class="text-[14px] text-[#6b7280] leading-relaxed max-w-[340px] lg:text-right">
          Wählen Sie die Lösungsgruppe, die zu Ihrer Infrastruktur passt —
          von der KI-Schnittstelle bis zum fertigen Contact-Center.
        </p>
      </div>
    </div>
    <SolutionsTabsElegant client:visible />
  </div>
</section>
```

- [ ] **Step 2: Create SolutionsTabsElegant.vue** — same script as Classic but with light theme styles:

Same `<script setup>` and `<template>` as `SolutionsTabsClassic.vue`. Only `<style scoped>` changes:

```vue
<!-- Same <script setup> and <template> as SolutionsTabsClassic.vue — only styles differ -->
<style scoped>
.solutions-root { font-family: "Plus Jakarta Sans", sans-serif; }
.tab-switcher {
  display: inline-flex; align-items: center; gap: 4px;
  background: white; border: 1px solid #e2e8f0;
  border-radius: 9999px; padding: 5px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.tab-btn {
  position: relative; padding: 10px 28px; border-radius: 9999px;
  font-size: 13.5px; font-weight: 600; color: #6b7280;
  background: transparent; border: none; cursor: pointer;
  transition: color 0.2s ease; letter-spacing: 0.01em;
}
.tab-btn.active { color: white; background: #004990; }
.cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (min-width: 1024px) { .cards-grid { grid-template-columns: repeat(4, 1fr); } }
.solution-card {
  display: flex; flex-direction: column; gap: 16px; padding: 24px;
  border-radius: 16px; border: 1px solid #e2e8f0;
  background: white; text-decoration: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  opacity: 0; animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards; cursor: pointer;
}
.solution-card:hover { border-color: #004990; box-shadow: 0 4px 16px rgba(0,73,144,0.1); transform: translateY(-3px); }
.solution-card:hover .card-arrow { color: #004990; transform: translateX(4px); }
.card-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; background: rgba(0,73,144,0.08); color: #004990; flex-shrink: 0; }
.card-icon svg { width: 20px; height: 20px; }
.card-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.card-title { font-size: 14.5px; font-weight: 700; color: #0a1628; line-height: 1.2; }
.card-desc { font-size: 13px; color: #6b7280; line-height: 1.65; }
.card-arrow { font-size: 16px; color: #cbd5e1; transition: color 0.2s ease, transform 0.2s ease; align-self: flex-end; }
.tab-fade-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.tab-fade-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tab-fade-enter-from { opacity: 0; transform: translateY(10px); }
.tab-fade-leave-to { opacity: 0; transform: translateY(-6px); }
@keyframes cardIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/elegant/SolutionsElegant.astro src/components/themes/elegant/SolutionsTabsElegant.vue
git commit -m "feat: add Elegant solutions section (blue/white)"
```

---

### Task 5: TestimonialsV2 — Classic

**Files:**
- Create: `src/components/themes/classic/TestimonialCardV2Classic.astro`
- Create: `src/components/themes/classic/TestimonialsV2Classic.astro`

- [ ] **Step 1: Create TestimonialCardV2Classic.astro**

Same as `TestimonialCardV2.astro` but replace all `rgb(252,176,64)` / `[rgb(252,176,64)]` with `#ff6600` / `[#ff6600]`:

```astro
---
interface Props {
  quote: string; name: string; title: string; company: string;
  initials: string; avatarColor?: string; rating?: number;
  variant?: "featured" | "compact"; index?: number;
}
const { quote, name, title, company, initials, avatarColor = "#004990", rating = 5, variant = "compact", index = 0 } = Astro.props;
---

{variant === "featured" && (
  <article class="testimonial-featured relative flex gap-7 lg:gap-10" style={`animation-delay: 0.1s`}>
    <div class="w-[3px] flex-shrink-0 rounded-full bg-[#ff6600] self-stretch"></div>
    <div class="flex flex-col gap-5 min-w-0">
      <span class="font-serif text-[100px] leading-none text-[#ff6600] opacity-20 select-none -mb-8 block" aria-hidden="true">"</span>
      <blockquote class="text-[19px] lg:text-[22px] leading-[1.65] text-white font-light">{quote}</blockquote>
      <div class="flex items-center gap-4 pt-5 border-t border-white/10">
        <div class="w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0" style={`background: ${avatarColor};`}>{initials}</div>
        <div class="flex flex-col gap-0.5">
          <span class="text-white text-[14px] font-semibold">{name}</span>
          <span class="text-white/40 text-[11px] uppercase tracking-[0.18em]">{title} · {company}</span>
        </div>
        <div class="ml-auto flex gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg class={`w-3.5 h-3.5 ${i < rating ? "text-[#ff6600]" : "text-white/15"}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>
      </div>
    </div>
  </article>
)}

{variant === "compact" && (
  <article class="testimonial-compact flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06]" style={`animation-delay: ${0.25 + index * 0.1}s`}>
    <blockquote class="text-[13.5px] leading-relaxed text-white/60 flex-1">"{quote}"</blockquote>
    <div class="h-px bg-white/[0.07]"></div>
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={`background: ${avatarColor};`}>{initials}</div>
      <div class="flex flex-col gap-0.5 min-w-0">
        <span class="text-white/85 text-[12.5px] font-semibold truncate">{name}</span>
        <span class="text-white/35 text-[11px] truncate">{title} · {company}</span>
      </div>
      <div class="ml-auto flex gap-0.5 flex-shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg class={`w-3 h-3 ${i < rating ? "text-[#ff6600]" : "text-white/15"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
    </div>
  </article>
)}

<style>
  .testimonial-featured { opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
  .testimonial-compact { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
```

- [ ] **Step 2: Create TestimonialsV2Classic.astro**

Same structure as `TestimonialsV2.astro` but with `#0f2548` bg, `#ff6600`/`#ff8533` accents, and import `TestimonialCardV2Classic`:

```astro
---
import TestimonialCardV2Classic from "./TestimonialCardV2Classic.astro";
const featured = {
  quote: "Durch den CreaLog AI Voice Agent konnten wir unsere First Call Resolution um 34 % steigern — bei gleichzeitig deutlich reduzierten Bearbeitungszeiten. Was uns besonders überzeugt hat: Die Lösung war binnen sechs Wochen produktiv. Kein anderer Anbieter hat das geschafft.",
  name: "Anna Vogel", title: "Head of Customer Experience", company: "Deutsche Telekom", initials: "AV", avatarColor: "#004990", rating: 5,
};
const compact = [
  { quote: "Die Spracherkennung ist beeindruckend präzise — auch bei komplexen Fachbegriffen. Unsere Agenten konzentrieren sich jetzt auf die wirklich anspruchsvollen Fälle.", name: "Markus Richter", title: "CTO", company: "R+V Versicherung", initials: "MR", avatarColor: "#1a5c2e", rating: 5 },
  { quote: "On-Premise, DSGVO-konform, made in Germany — genau das, was wir für unsere Compliance-Anforderungen brauchen. CreaLog hat keine Kompromisse gemacht.", name: "Sandra Kühn", title: "VP Operations", company: "DZ BANK", initials: "SK", avatarColor: "#7c3d0f", rating: 5 },
  { quote: "Seit dem Rollout haben wir 40 % weniger Anrufe im First-Level — der Voice Agent löst Standardanfragen vollautomatisch. ROI nach vier Monaten erreicht.", name: "Thomas Berger", title: "Leiter Kundenservice", company: "Stadtwerke München", initials: "TB", avatarColor: "#5b21b6", rating: 5 },
];
---

<section class="relative bg-[#0f2548] py-24 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
  <div class="pointer-events-none absolute inset-0 opacity-[0.025]" style="background-image:url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/></svg>');"></div>
  <div class="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[400px]" style="background: radial-gradient(ellipse at bottom left, rgba(255,102,0,0.08) 0%, transparent 70%);"></div>
  <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <div class="h-px w-8 bg-[#ff6600]"></div>
          <span class="text-[#ff8533] text-[11px] font-semibold uppercase tracking-[0.28em]">Kundenstimmen</span>
        </div>
        <h2 class="text-[2rem] lg:text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-white max-w-[440px]">
          Was führende<br /><span class="text-[#ff6600]">Unternehmen sagen</span>
        </h2>
      </div>
      <div class="flex items-center gap-8 lg:gap-10">
        <div class="flex flex-col gap-1">
          <span class="text-[1.75rem] font-bold text-white tracking-tight">200+</span>
          <span class="text-[11px] uppercase tracking-[0.16em] text-white/35">Unternehmenskunden</span>
        </div>
        <div class="w-px h-10 bg-white/10"></div>
        <div class="flex flex-col gap-1">
          <span class="text-[1.75rem] font-bold text-white tracking-tight">4.9<span class="text-[#ff8533] text-[1.1rem]">★</span></span>
          <span class="text-[11px] uppercase tracking-[0.16em] text-white/35">Ø Bewertung</span>
        </div>
        <div class="w-px h-10 bg-white/10"></div>
        <div class="flex flex-col gap-1">
          <span class="text-[1.75rem] font-bold text-white tracking-tight">98%</span>
          <span class="text-[11px] uppercase tracking-[0.16em] text-white/35">Verlängerungsrate</span>
        </div>
      </div>
    </div>
    <div class="mb-8"><TestimonialCardV2Classic {...featured} variant="featured" /></div>
    <div class="h-px w-full bg-white/[0.07] mb-8"></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {compact.map((t, i) => <TestimonialCardV2Classic {...t} variant="compact" index={i} />)}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/classic/TestimonialCardV2Classic.astro src/components/themes/classic/TestimonialsV2Classic.astro
git commit -m "feat: add Classic testimonials V2 (blue/orange)"
```

---

### Task 6: TestimonialsV2 — Elegant

**Files:**
- Create: `src/components/themes/elegant/TestimonialCardV2Elegant.astro`
- Create: `src/components/themes/elegant/TestimonialsV2Elegant.astro`

- [ ] **Step 1: Create TestimonialCardV2Elegant.astro**

Light-themed variant — dark text on white/light-blue cards:

```astro
---
interface Props {
  quote: string; name: string; title: string; company: string;
  initials: string; avatarColor?: string; rating?: number;
  variant?: "featured" | "compact"; index?: number;
}
const { quote, name, title, company, initials, avatarColor = "#004990", rating = 5, variant = "compact", index = 0 } = Astro.props;
---

{variant === "featured" && (
  <article class="testimonial-featured relative flex gap-7 lg:gap-10" style={`animation-delay: 0.1s`}>
    <div class="w-[3px] flex-shrink-0 rounded-full bg-[#004990] self-stretch"></div>
    <div class="flex flex-col gap-5 min-w-0">
      <span class="font-serif text-[100px] leading-none text-[#004990] opacity-10 select-none -mb-8 block" aria-hidden="true">"</span>
      <blockquote class="text-[19px] lg:text-[22px] leading-[1.65] text-[#0a1628] font-light">{quote}</blockquote>
      <div class="flex items-center gap-4 pt-5 border-t border-[#e2e8f0]">
        <div class="w-11 h-11 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0" style={`background: ${avatarColor};`}>{initials}</div>
        <div class="flex flex-col gap-0.5">
          <span class="text-[#0a1628] text-[14px] font-semibold">{name}</span>
          <span class="text-[#6b7280] text-[11px] uppercase tracking-[0.18em]">{title} · {company}</span>
        </div>
        <div class="ml-auto flex gap-0.5 flex-shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg class={`w-3.5 h-3.5 ${i < rating ? "text-[#004990]" : "text-[#e2e8f0]"}`} viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>
      </div>
    </div>
  </article>
)}

{variant === "compact" && (
  <article class="testimonial-compact flex flex-col gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 transition-all duration-300 hover:border-[#004990]/30 hover:shadow-md" style={`animation-delay: ${0.25 + index * 0.1}s`}>
    <blockquote class="text-[13.5px] leading-relaxed text-[#4b5563] flex-1">"{quote}"</blockquote>
    <div class="h-px bg-[#e2e8f0]"></div>
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0" style={`background: ${avatarColor};`}>{initials}</div>
      <div class="flex flex-col gap-0.5 min-w-0">
        <span class="text-[#0a1628] text-[12.5px] font-semibold truncate">{name}</span>
        <span class="text-[#9ca3af] text-[11px] truncate">{title} · {company}</span>
      </div>
      <div class="ml-auto flex gap-0.5 flex-shrink-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg class={`w-3 h-3 ${i < rating ? "text-[#004990]" : "text-[#e2e8f0]"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
        ))}
      </div>
    </div>
  </article>
)}

<style>
  .testimonial-featured { opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
  .testimonial-compact { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
</style>
```

- [ ] **Step 2: Create TestimonialsV2Elegant.astro**

```astro
---
import TestimonialCardV2Elegant from "./TestimonialCardV2Elegant.astro";
const featured = {
  quote: "Durch den CreaLog AI Voice Agent konnten wir unsere First Call Resolution um 34 % steigern — bei gleichzeitig deutlich reduzierten Bearbeitungszeiten. Was uns besonders überzeugt hat: Die Lösung war binnen sechs Wochen produktiv. Kein anderer Anbieter hat das geschafft.",
  name: "Anna Vogel", title: "Head of Customer Experience", company: "Deutsche Telekom", initials: "AV", avatarColor: "#004990", rating: 5,
};
const compact = [
  { quote: "Die Spracherkennung ist beeindruckend präzise — auch bei komplexen Fachbegriffen. Unsere Agenten konzentrieren sich jetzt auf die wirklich anspruchsvollen Fälle.", name: "Markus Richter", title: "CTO", company: "R+V Versicherung", initials: "MR", avatarColor: "#1a5c2e", rating: 5 },
  { quote: "On-Premise, DSGVO-konform, made in Germany — genau das, was wir für unsere Compliance-Anforderungen brauchen. CreaLog hat keine Kompromisse gemacht.", name: "Sandra Kühn", title: "VP Operations", company: "DZ BANK", initials: "SK", avatarColor: "#7c3d0f", rating: 5 },
  { quote: "Seit dem Rollout haben wir 40 % weniger Anrufe im First-Level — der Voice Agent löst Standardanfragen vollautomatisch. ROI nach vier Monaten erreicht.", name: "Thomas Berger", title: "Leiter Kundenservice", company: "Stadtwerke München", initials: "TB", avatarColor: "#5b21b6", rating: 5 },
];
---

<section class="relative bg-white py-24 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
  <div class="pointer-events-none absolute top-0 left-0 right-0 h-px bg-[#e2e8f0]"></div>
  <div class="pointer-events-none absolute bottom-0 right-0 w-[600px] h-[500px]" style="background: radial-gradient(ellipse at bottom right, rgba(0,73,144,0.04) 0%, transparent 70%);"></div>
  <div class="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <div class="h-px w-8 bg-[#004990]"></div>
          <span class="text-[#004990] text-[11px] font-semibold uppercase tracking-[0.28em]">Kundenstimmen</span>
        </div>
        <h2 class="text-[2rem] lg:text-[2.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-[#0a1628] max-w-[440px]">
          Was führende<br /><span class="text-[#1d6bbf]">Unternehmen sagen</span>
        </h2>
      </div>
      <div class="flex items-center gap-8 lg:gap-10">
        <div class="flex flex-col gap-1">
          <span class="text-[1.75rem] font-bold text-[#0a1628] tracking-tight">200+</span>
          <span class="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Unternehmenskunden</span>
        </div>
        <div class="w-px h-10 bg-[#e2e8f0]"></div>
        <div class="flex flex-col gap-1">
          <span class="text-[1.75rem] font-bold text-[#0a1628] tracking-tight">4.9<span class="text-[#004990] text-[1.1rem]">★</span></span>
          <span class="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Ø Bewertung</span>
        </div>
        <div class="w-px h-10 bg-[#e2e8f0]"></div>
        <div class="flex flex-col gap-1">
          <span class="text-[1.75rem] font-bold text-[#0a1628] tracking-tight">98%</span>
          <span class="text-[11px] uppercase tracking-[0.16em] text-[#9ca3af]">Verlängerungsrate</span>
        </div>
      </div>
    </div>
    <div class="mb-8"><TestimonialCardV2Elegant {...featured} variant="featured" /></div>
    <div class="h-px w-full bg-[#e2e8f0] mb-8"></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      {compact.map((t, i) => <TestimonialCardV2Elegant {...t} variant="compact" index={i} />)}
    </div>
  </div>
</section>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/elegant/TestimonialCardV2Elegant.astro src/components/themes/elegant/TestimonialsV2Elegant.astro
git commit -m "feat: add Elegant testimonials V2 (blue/white)"
```

---

### Task 7: Footer — Classic & Elegant

**Files:**
- Create: `src/components/themes/classic/FooterClassic.astro`
- Create: `src/components/themes/elegant/FooterElegant.astro`

- [ ] **Step 1: Create FooterClassic.astro** — same as Footer.astro, bg `#0f2548`:

```astro
<footer class="bg-[#0f2548] border-t border-white/10 font-['Plus_Jakarta_Sans',sans-serif]">
  <div class="max-w-7xl mx-auto px-6 lg:px-10 py-14">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-10">
      <div class="col-span-2 lg:col-span-1 flex flex-col gap-4">
        <a href="/"><img src="/crealog_logo.png" alt="CreaLog" class="h-8 w-auto brightness-0 invert" /></a>
        <p class="text-[13px] text-white/40 leading-relaxed max-w-[200px]">KI-gestützte Sprachlösungen für modernen Kundenkontakt.</p>
        <p class="text-[12px] text-white/25 mt-auto">© 2025 CreaLog GmbH</p>
      </div>
      <nav class="flex flex-col gap-3">
        <h6 class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Lösungen</h6>
        <a href="/cx-solutions" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">CX Solutions</a>
        <a href="/in-solutions" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">IN Solutions</a>
      </nav>
      <nav class="flex flex-col gap-3">
        <h6 class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Unternehmen</h6>
        <a href="/about" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">Über uns</a>
        <a href="/kontakt" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">Kontakt</a>
        <a href="/blog" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">Blog</a>
      </nav>
      <nav class="flex flex-col gap-3">
        <h6 class="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">Rechtliches</h6>
        <a href="/datenschutz" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">Datenschutz</a>
        <a href="/impressum" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">Impressum</a>
        <a href="/cookies" class="text-[13px] text-white/55 hover:text-white transition-colors duration-150">Cookie-Richtlinie</a>
      </nav>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Create FooterElegant.astro** — light theme:

```astro
<footer class="bg-[#f1f5fb] border-t border-[#dce5f0] font-['Plus_Jakarta_Sans',sans-serif]">
  <div class="max-w-7xl mx-auto px-6 lg:px-10 py-14">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-10">
      <div class="col-span-2 lg:col-span-1 flex flex-col gap-4">
        <a href="/"><img src="/crealog_logo.png" alt="CreaLog" class="h-8 w-auto" /></a>
        <p class="text-[13px] text-[#6b7280] leading-relaxed max-w-[200px]">KI-gestützte Sprachlösungen für modernen Kundenkontakt.</p>
        <p class="text-[12px] text-[#9ca3af] mt-auto">© 2025 CreaLog GmbH</p>
      </div>
      <nav class="flex flex-col gap-3">
        <h6 class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">Lösungen</h6>
        <a href="/cx-solutions" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">CX Solutions</a>
        <a href="/in-solutions" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">IN Solutions</a>
      </nav>
      <nav class="flex flex-col gap-3">
        <h6 class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">Unternehmen</h6>
        <a href="/about" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">Über uns</a>
        <a href="/kontakt" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">Kontakt</a>
        <a href="/blog" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">Blog</a>
      </nav>
      <nav class="flex flex-col gap-3">
        <h6 class="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9ca3af]">Rechtliches</h6>
        <a href="/datenschutz" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">Datenschutz</a>
        <a href="/impressum" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">Impressum</a>
        <a href="/cookies" class="text-[13px] text-[#4b5563] hover:text-[#004990] transition-colors duration-150">Cookie-Richtlinie</a>
      </nav>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/themes/classic/FooterClassic.astro src/components/themes/elegant/FooterElegant.astro
git commit -m "feat: add Classic and Elegant footer variants"
```

---

### Task 8: Index Pages

**Files:**
- Create: `src/pages/index-classic.astro`
- Create: `src/pages/index-elegant.astro`

- [ ] **Step 1: Create index-classic.astro**

```astro
---
import Layout from "../layouts/Layout.astro";
import HeroClassic from "../components/themes/classic/HeroClassic.astro";
import Company from "../components/Company.astro";
import SolutionsClassic from "../components/themes/classic/SolutionsClassic.astro";
import Testimonials from "../components/Testimonials.astro";
import TestimonialsV2Classic from "../components/themes/classic/TestimonialsV2Classic.astro";
import FooterClassic from "../components/themes/classic/FooterClassic.astro";
---

<Layout footer={false}>
  <HeroClassic />
  <Company />
  <SolutionsClassic />
  <Testimonials />
  <TestimonialsV2Classic />
  <FooterClassic />
</Layout>
```

**Note:** `Layout.astro` currently hard-codes `<Footer />`. We need to either:
- (a) Accept a `footer` prop to suppress the built-in footer, OR
- (b) Simply not use `Layout.astro` and inline the shell

Use approach (b) — inline shell — to avoid touching Layout.astro:

```astro
---
import "../assets/app.css";
import Navbar from "../components/Navbar/Navbar.astro";
import HeroClassic from "../components/themes/classic/HeroClassic.astro";
import Company from "../components/Company.astro";
import SolutionsClassic from "../components/themes/classic/SolutionsClassic.astro";
import Testimonials from "../components/Testimonials.astro";
import TestimonialsV2Classic from "../components/themes/classic/TestimonialsV2Classic.astro";
import FooterClassic from "../components/themes/classic/FooterClassic.astro";
---

<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <title>AI-driven Platform for Enterprises & Telcos | CreaLog — Classic</title>
  </head>
  <body>
    <Navbar />
    <HeroClassic />
    <Company />
    <SolutionsClassic />
    <Testimonials />
    <TestimonialsV2Classic />
    <FooterClassic />
  </body>
</html>

<style>
  html, body { margin: 0; width: 100%; height: 100%; }
</style>
```

- [ ] **Step 2: Create index-elegant.astro** — same shell pattern, Elegant components:

```astro
---
import "../assets/app.css";
import Navbar from "../components/Navbar/Navbar.astro";
import HeroElegant from "../components/themes/elegant/HeroElegant.astro";
import Company from "../components/Company.astro";
import SolutionsElegant from "../components/themes/elegant/SolutionsElegant.astro";
import Testimonials from "../components/Testimonials.astro";
import TestimonialsV2Elegant from "../components/themes/elegant/TestimonialsV2Elegant.astro";
import FooterElegant from "../components/themes/elegant/FooterElegant.astro";
---

<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <title>AI-driven Platform for Enterprises & Telcos | CreaLog — Elegant</title>
  </head>
  <body>
    <Navbar />
    <HeroElegant />
    <Company />
    <SolutionsElegant />
    <Testimonials />
    <TestimonialsV2Elegant />
    <FooterElegant />
  </body>
</html>

<style>
  html, body { margin: 0; width: 100%; height: 100%; }
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/index-classic.astro src/pages/index-elegant.astro
git commit -m "feat: add Classic and Elegant index pages"
```

---

### Task 9: Visual Verification

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

- [ ] **Step 2: Check all three pages** — open in browser:
  - `http://localhost:4321/` — Original (dark/amber) unchanged
  - `http://localhost:4321/index-classic` — Blue/Orange
  - `http://localhost:4321/index-elegant` — Blue/White

- [ ] **Step 3: Verify per page:**
  - Hero renders with correct background and accent color
  - Solutions tabs switch correctly, active tab has correct color
  - TestimonialsV2 has correct background and star colors
  - Footer has correct theme
  - No layout regressions on the original `/` route

- [ ] **Step 4: Final commit if any fix-ups needed**

```bash
git add -p
git commit -m "fix: theme variant visual adjustments"
```
