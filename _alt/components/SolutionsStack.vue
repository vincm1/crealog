<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

interface Group {
  title: string;
  items: string[];
}
interface Case {
  label: string;
  tagline: string;
  href: string;
  accentColor: string;
  icon: string; // single SVG path
  groups: Group[];
}

const cases: Case[] = [
  {
    label: "CX Solutions",
    tagline: "KI-gestützte Automatisierung für modernen Kundenkontakt",
    href: "/cx-solutions",
    accentColor: "#004990",
    icon: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z",
    groups: [
      {
        title: "Bots & AI",
        items: ["Bots", "Voice Bots", "Chat Bots", "Contact Center", "Recording", "AI Tools", "Gen AI"],
      },
      {
        title: "Industries",
        items: ["Telco", "Insurance", "Power Utilities"],
      },
      {
        title: "Use Cases",
        items: ["Use Cases", "Projects", "References"],
      },
    ],
  },
  {
    label: "Telco Solutions",
    tagline: "Carrier-grade Infrastruktur für Telekommunikationsunternehmen",
    href: "/telco-solutions",
    accentColor: "#1d6bbf",
    icon: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 2.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125",
    groups: [
      {
        title: "Service Delivery Platform",
        items: ["Service Delivery Platform", "SIP Application Server", "Media Resource Function", "Service Manager", "SCE (CDG)"],
      },
      {
        title: "Applications",
        items: ["IN & SIP Services", "AI Agent Marketplace", "AI Agent Projects", "NG 112", "Recording", "Contact Center"],
      },
      {
        title: "Interfaces / Mediation",
        items: ["Mediation Devices", "REST API", "AI Connectors", "Telco API", "Provisioning API", "Webservices"],
      },
      {
        title: "References",
        items: ["Swisscom", "Unitel", "Vodafone", "Deutsche Telekom", "A1 Telekom Austria", "Kyivstar"],
      },
    ],
  },
  {
    label: "Professional Services",
    tagline: "Beratung, Integration und Support aus einer Hand",
    href: "/professional-services",
    accentColor: "#0369a1",
    icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
    groups: [
      {
        title: "Consulting & Design",
        items: ["Solution Design", "Anforderungsanalyse", "Proof of Concept", "Architekturberatung"],
      },
      {
        title: "Implementierung",
        items: ["Systemintegration", "Custom Development", "Migration & Rollout", "Projektmanagement"],
      },
      {
        title: "Training & Support",
        items: ["Admin-Schulungen", "Anwender-Workshops", "24/7 Premium-Support", "SLA & Wartung"],
      },
    ],
  },
];

const N = cases.length;

// diagonal peek offsets
const OFF_X = 48;
const OFF_Y = 58;
const SCALE_STEP = 0.05;

// scroll smoothing — active eases toward target each frame (inertia)
const SMOOTH = 0.1;

const zoneEl = ref<HTMLElement | null>(null);
const cardEls = ref<(HTMLElement | null)[]>([]);
const active = ref(0); // animated float 0..N-1 — drives the whole layout
let target = 0; // where the scroll position wants `active` to be

function setCardRef(el: any, i: number) {
  cardEls.value[i] = el as HTMLElement | null;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

function applyTransforms() {
  const a = active.value;
  cardEls.value.forEach((el, i) => {
    if (!el) return;
    const d = i - a;

    if (d >= 0) {
      // current (d≈0) + cards peeking behind, offset down-right
      const x = d * OFF_X;
      const y = d * OFF_Y;
      const s = 1 - d * SCALE_STEP;
      el.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${s})`;
      el.style.opacity = String(clamp(1 - d * 0.08, 0, 1));
      el.style.zIndex = String(100 - Math.round(d * 10));
      el.style.pointerEvents = "auto";
    } else {
      // passed card — slides up and fades away
      const p = -d;
      const y = -p * 150;
      el.style.transform = `translate(-50%, calc(-50% + ${y}px)) scale(1)`;
      el.style.opacity = String(clamp(1 - p * 1.5, 0, 1));
      el.style.zIndex = String(100 - Math.round(p * 10));
      el.style.pointerEvents = "none";
    }
  });
}

// read scroll position → desired `target`
function readScroll() {
  const zone = zoneEl.value;
  if (!zone) return;
  const rect = zone.getBoundingClientRect();
  const scrolled = Math.max(0, -rect.top);
  const scrollable = zone.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return;
  const raw = clamp(scrolled / scrollable, 0, 1);
  target = raw * (N - 1);
}

let raf = 0;
let running = false;

// continuous loop — eases `active` toward `target` for a smooth, weighted glide
function loop() {
  const diff = target - active.value;
  if (Math.abs(diff) < 0.0008) {
    active.value = target;
    applyTransforms();
    running = false;
    return;
  }
  active.value += diff * SMOOTH;
  applyTransforms();
  raf = requestAnimationFrame(loop);
}

function ensureLoop() {
  if (!running) {
    running = true;
    raf = requestAnimationFrame(loop);
  }
}

function onScroll() {
  readScroll();
  ensureLoop();
}

// click a peeking card → smooth-scroll the page so that card becomes active
function scrollToIndex(i: number) {
  const zone = zoneEl.value;
  if (!zone) return;
  const zoneTop = zone.getBoundingClientRect().top + window.scrollY;
  const scrollable = zone.offsetHeight - window.innerHeight;
  const target = zoneTop + (i / (N - 1)) * scrollable;
  window.scrollTo({ top: target, behavior: "smooth" });
}

function onCardClick(e: MouseEvent, i: number) {
  const current = Math.round(active.value);
  if (i !== current) {
    // not the front card → advance to it instead of following any inner link
    e.preventDefault();
    scrollToIndex(i);
  }
  // front card → inner links work normally
}

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  readScroll();
  active.value = target;
  applyTransforms();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", onScroll);
  cancelAnimationFrame(raf);
});
</script>

<template>
  <div class="sol-head">
    <span class="sol-eyebrow">Unsere Lösungen</span>
    <h2 class="sol-title">Alles, was moderner Kundenkontakt braucht</h2>
    <p class="sol-sub">
      Wählen Sie die Lösung, die zu Ihrer Infrastruktur passt — von der
      KI-Schnittstelle bis zum fertigen Contact-Center.
    </p>
  </div>

  <div class="sol-scroll-zone" ref="zoneEl">
    <div class="sol-sticky">
      <article
        v-for="(c, i) in cases"
        :key="i"
        class="sol-card"
        :ref="(el) => setCardRef(el, i)"
        :style="i > 0 ? 'opacity:0' : ''"
        @click="(e) => onCardClick(e, i)"
      >
        <span
          class="sol-card-bar"
          :style="`background: linear-gradient(90deg, ${c.accentColor}, ${c.accentColor}00);`"
        ></span>
        <span
          class="sol-card-glow"
          :style="`background: radial-gradient(circle, ${c.accentColor}1f, transparent 70%);`"
        ></span>
        <span class="sol-card-num" :style="`color: ${c.accentColor};`">0{{ i + 1 }}</span>

        <header class="sol-card-head">
          <span
            class="sol-card-icon"
            :style="`background: linear-gradient(135deg, ${c.accentColor}, ${c.accentColor}b3);`"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
              <path :d="c.icon" />
            </svg>
          </span>
          <div class="sol-card-headtext">
            <h3 class="sol-card-label">{{ c.label }}</h3>
            <p class="sol-card-tag">{{ c.tagline }}</p>
          </div>
        </header>

        <div class="sol-card-div"></div>

        <div class="sol-card-groups" :style="`--cols: ${c.groups.length}`">
          <div class="sol-group" v-for="(g, gi) in c.groups" :key="gi">
            <div class="sol-group-title">
              <span class="sol-group-mark" :style="`background: ${c.accentColor};`"></span>
              {{ g.title }}
            </div>
            <ul class="sol-group-items">
              <li v-for="(item, ii) in g.items" :key="ii">
                <a
                  href="#"
                  class="sol-group-link"
                  :style="`--accent: ${c.accentColor};`"
                  >{{ item }}</a
                >
              </li>
            </ul>
          </div>
        </div>

        <div class="sol-card-footer">
          <a
            :href="c.href"
            class="sol-card-link"
            :style="`color: ${c.accentColor}; background: ${c.accentColor}0f;`"
          >
            Alle {{ c.label }} entdecken
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.sol-head {
  max-width: 640px;
  margin: 0 auto 0.5rem;
  padding: 0 1.5rem;
  text-align: center;
  font-family: "Plus Jakarta Sans", sans-serif;
}
.sol-eyebrow {
  display: inline-block;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  margin-bottom: 1rem;
}
.sol-title {
  font-size: clamp(2rem, 4vw, 2.9rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #09090b;
  margin: 0;
}
.sol-sub {
  margin: 1.1rem auto 0;
  max-width: 480px;
  font-size: 16px;
  line-height: 1.7;
  color: #5b6472;
}

/* scroll-driven stack */
.sol-scroll-zone {
  position: relative;
  height: 280vh;
}
.sol-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  font-family: "Plus Jakarta Sans", sans-serif;
}

/* cards */
.sol-card {
  position: absolute;
  left: 50%;
  top: 44%;
  width: min(94vw, 860px);
  background: #fff;
  border-radius: 28px;
  padding: 2.25rem 2.5rem 2rem;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 28px -8px rgba(15, 23, 42, 0.1),
    0 32px 64px -16px rgba(15, 23, 42, 0.16);
  border: 1px solid rgba(230, 232, 236, 0.9);
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  cursor: pointer;
  overflow: hidden;
  will-change: transform, opacity;
  transform: translate(-50%, -50%);
}

/* gradient accent bar across the top */
.sol-card-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

/* soft accent glow in the top-right corner */
.sol-card-glow {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  pointer-events: none;
}

/* large faint number watermark */
.sol-card-num {
  position: absolute;
  top: 1.75rem;
  right: 2rem;
  font-size: 2.6rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  opacity: 0.12;
  line-height: 1;
  pointer-events: none;
}

.sol-card-head {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.sol-card-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 6px 16px -4px rgba(15, 23, 42, 0.25);
}
.sol-card-icon svg {
  width: 24px;
  height: 24px;
}
.sol-card-label {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0;
}
.sol-card-tag {
  font-size: 13.5px;
  line-height: 1.5;
  color: #5b6472;
  margin: 2px 0 0;
  max-width: 46ch;
}

.sol-card-div {
  height: 1px;
  background: linear-gradient(90deg, #eef1f6, rgba(238, 241, 246, 0));
}

.sol-card-groups {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  gap: 1.1rem 1.5rem;
}
.sol-group-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #0f172a;
  margin-bottom: 0.7rem;
}
.sol-group-mark {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  flex-shrink: 0;
}
.sol-group-items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.sol-group-link {
  display: inline-block;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  text-decoration: none;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}
.sol-group-link:hover {
  color: var(--accent);
  transform: translateX(3px);
}

.sol-card-footer {
  padding-top: 0.35rem;
}
.sol-card-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 13.5px;
  font-weight: 700;
  padding: 0.65rem 1.2rem;
  border-radius: 99px;
  text-decoration: none;
  transition:
    gap 0.2s ease,
    filter 0.2s ease;
}
.sol-card-link svg {
  transition: transform 0.2s ease;
}
.sol-card-link:hover {
  gap: 0.65rem;
  filter: brightness(0.96);
}
.sol-card-link:hover svg {
  transform: translateX(3px);
}

@media (max-width: 720px) {
  .sol-card {
    padding: 1.75rem 1.5rem 1.5rem;
  }
  .sol-card-groups {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
