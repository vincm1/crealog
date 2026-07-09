<script setup lang="ts">
import { ref } from 'vue';

interface Tab {
  title: string;
  badge?: string;
  headline: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  image?: string;
}

const props = defineProps<{
  tabs: Tab[];
  defaultImage?: string;
  sectionBadge?: string;
  sectionHeadline?: string;
}>();

const activeTab = ref(0);

// Per-tab CSS transform — simulates different dashboard views from same screenshot
const imageTransforms = [
  'scale(1.0) translate(0%, 0%)',       // Tab 0: full overview
  'scale(1.18) translate(-4%, 8%)',     // Tab 1: zoomed into middle section
  'scale(1.12) translate(6%, 3%)',      // Tab 2: shifted right, shows side panel
];

function setTab(i: number) {
  activeTab.value = i;
}
</script>

<template>
  <section class="pt-section">
    <!-- Blue glow behind mockup -->
    <div class="pt-glow" aria-hidden="true" />

    <div class="pt-inner">
      <!-- Section header (badge + headline) -->
      <div v-if="sectionBadge || sectionHeadline" class="pt-section-header">
        <span v-if="sectionBadge" class="pt-section-badge">{{ sectionBadge }}</span>
        <h2 v-if="sectionHeadline" class="pt-section-headline">{{ sectionHeadline }}</h2>
      </div>

      <!-- Tab nav -->
      <div class="pt-nav-wrap">
        <nav class="pt-nav" role="tablist" aria-label="Produktbereiche">
          <button
            v-for="(tab, i) in tabs"
            :key="i"
            role="tab"
            :aria-selected="activeTab === i"
            :class="['pt-tab', { 'pt-tab--active': activeTab === i }]"
            @click="setTab(i)"
          >
            {{ tab.title }}
          </button>
        </nav>
      </div>

      <!-- Content panel -->
      <Transition name="pt-fade" mode="out-in">
        <div :key="activeTab" class="pt-panel" role="tabpanel">
          <p class="pt-desc">{{ tabs[activeTab].description }}</p>
        </div>
      </Transition>

      <!-- Browser mockup -->
      <div class="pt-mockup-wrap">
        <div class="pt-mockup-frame">
          <div class="pt-mockup-bar">
            <span class="pt-dot" style="background:#ff5f57" />
            <span class="pt-dot" style="background:#febc2e" />
            <span class="pt-dot" style="background:#28c840" />
          </div>
          <Transition name="pt-img-fade" mode="out-in">
            <div :key="activeTab" class="pt-mockup-shot">
              <img
                :src="tabs[activeTab].image || defaultImage"
                :alt="tabs[activeTab].headline"
                width="1248"
                height="765"
                loading="lazy"
                decoding="async"
                :style="{ transform: imageTransforms[activeTab] ?? imageTransforms[0], transformOrigin: 'top center', transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)' }"
              />
            </div>
          </Transition>
        </div>
      </div>

      <!-- CTA below mockup -->
      <Transition name="pt-fade" mode="out-in">
        <a :key="activeTab" :href="tabs[activeTab].ctaHref" class="pt-cta">
          {{ tabs[activeTab].ctaText }}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
          </svg>
        </a>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.pt-section {
  font-family: "Poppins", Calibri, sans-serif;
  position: relative;
  overflow: hidden;
  background: #ffffff;
  padding: clamp(5rem, 9vw, 8rem) clamp(1.5rem, 6vw, 4rem) clamp(4rem, 7vw, 6rem);
}

/* Glow — same recipe as hero-glow / SolutionReferences */
.pt-glow {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(1400px, 120%);
  height: 480px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    ellipse 70% 70% at 50% 100%,
    rgba(37, 99, 235, 0.14) 0%,
    rgba(0, 64, 129, 0.08) 42%,
    rgba(56, 168, 255, 0.04) 65%,
    transparent 82%
  );
  filter: blur(40px);
}

.pt-inner {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

/* ── Section header ── */
.pt-section-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 3rem;
  text-align: center;
}

.pt-section-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid rgba(15, 30, 48, 0.10);
  background: #ffffff;
  padding: 0.35rem 0.9rem;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}

.pt-section-headline {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.85rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #18222f;
  max-width: 20ch;
}

/* ── Tab nav ── */
.pt-nav-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 3.5rem;
}

.pt-nav {
  display: inline-flex;
  background: #f1f5f9;
  border-radius: 9999px;
  padding: 5px;
  gap: 4px;
}

.pt-tab {
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  border-radius: 9999px;
  padding: 0.55rem 1.4rem;
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  white-space: nowrap;
}

.pt-tab--active {
  background: #ffffff;
  color: #18222f;
  box-shadow: 0 1px 6px rgba(15, 30, 48, 0.12), 0 0 0 1px rgba(15, 30, 48, 0.04);
}

.pt-tab:not(.pt-tab--active):hover {
  color: #18222f;
}

/* ── Content panel ── */
.pt-panel {
  text-align: center;
  max-width: 720px;
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.pt-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.25);
  background: rgba(37, 99, 235, 0.06);
  border-radius: 9999px;
  padding: 0.28rem 0.85rem;
  margin-bottom: 1.25rem;
}

.pt-headline {
  margin: 0;
  font-size: clamp(2rem, 4vw, 2.85rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: #18222f;
}

.pt-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.75;
  color: #64748b;
  max-width: 68ch;
}

.pt-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2.5rem;
  padding: 0.8rem 1.9rem;
  border-radius: 9999px;
  background: #09090b;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.pt-cta svg {
  transition: transform 0.2s ease;
}
.pt-cta:hover {
  background: #18181b;
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(37, 99, 235, 0.30), 0 4px 12px rgba(9, 9, 11, 0.20);
}
.pt-cta:hover svg {
  transform: translateX(3px);
}

/* ── Browser mockup ── */
.pt-mockup-wrap {
  width: 100%;
  max-width: 1000px;
}

.pt-mockup-frame {
  border-radius: 16px 16px 0 0;
  border: 1px solid rgba(15, 30, 48, 0.10);
  border-bottom: none;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.6) inset,
    0 32px 90px -24px rgba(0, 64, 129, 0.22),
    0 12px 40px rgba(15, 30, 48, 0.10);
  overflow: hidden;
  background: #f8fafc;
}

.pt-mockup-bar {
  height: 38px;
  background: #f1f5f9;
  border-bottom: 1px solid rgba(15, 30, 48, 0.06);
  display: flex;
  align-items: center;
  padding: 0 14px;
  gap: 7px;
}

.pt-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  display: inline-block;
}

.pt-mockup-shot {
  max-height: 460px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 55%, transparent 100%);
}

.pt-mockup-shot img {
  display: block;
  width: 100%;
  height: auto;
}

/* ── Transitions ── */
.pt-fade-enter-active,
.pt-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.pt-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.pt-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.pt-img-fade-enter-active,
.pt-img-fade-leave-active {
  transition: opacity 0.25s ease;
}
.pt-img-fade-enter-from,
.pt-img-fade-leave-to {
  opacity: 0;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .pt-fade-enter-active,
  .pt-fade-leave-active,
  .pt-img-fade-enter-active,
  .pt-img-fade-leave-active {
    transition: none;
  }
  .pt-cta,
  .pt-tab { transition: none; }
  .pt-cta:hover { transform: none; box-shadow: none; }
}
</style>
