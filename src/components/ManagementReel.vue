<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Person {
  name: string;
  position: string;
  quote: string;
  image: string;
}

const CELL = 121.33;
const GAP = 8;
const STEP = 3 * (CELL + GAP);
const EXIT_MS = 240;
const SLIDE_MS = 800;
const CHAR_STAGGER = 6;
const EASE = "cubic-bezier(0.65,0,0.35,1)";

const DEFAULT_PEOPLE: Person[] = [
  {
    name: "Michael Kloos",
    position: "Geschäftsführer",
    quote: "Seit fast drei Jahrzehnten gestalten wir die Zukunft des Kundenkontakts — mit Technologie, die Menschen in den Mittelpunkt stellt.",
    image: "/management/michael_kloos.jpg",
  },
  {
    name: "Bernd Plannerer",
    position: "Geschäftsführer",
    quote: "Unsere Stärke liegt in der Verbindung von tiefer Technologieexpertise und echtem Verständnis für die Bedürfnisse unserer Kunden.",
    image: "/management/bernd_plannerer.png",
  },
];

const props = defineProps<{ people?: Person[] }>();

const people = computed(() =>
  props.people && props.people.length > 0 ? props.people : DEFAULT_PEOPLE
);

const count = computed(() => people.value.length);
const centerIdx = computed(() => (count.value - 1) / 2);

const index = ref(0);
const displayIndex = ref(0);
const exiting = ref(false);
const isMounted = ref(false);
const animating = ref(false);
const timers: number[] = [];

const middleY = computed(() => (centerIdx.value - index.value) * STEP);
const sideY = computed(() => -middleY.value);

const middleItems = computed(() => {
  const items: Array<{ type: "cell" } | { type: "featured"; i: number }> = [];
  for (let i = 0; i < 3; i++) items.push({ type: "cell" });
  people.value.forEach((_, i) => {
    items.push({ type: "featured", i });
    if (i < count.value - 1) items.push({ type: "cell" }, { type: "cell" });
  });
  for (let i = 0; i < 3; i++) items.push({ type: "cell" });
  return items;
});

const sideCellCount = computed(() => 4 + 2 * count.value);

function colStyle(y: number) {
  return {
    transform: `translateY(${y}px)`,
    transition: isMounted.value ? `transform ${SLIDE_MS}ms ${EASE}` : "none",
  };
}

function paginate(dir: 1 | -1) {
  if (animating.value) return;
  const next = index.value + dir;
  if (next < 0 || next >= count.value) return;
  animating.value = true;
  index.value = next;
  exiting.value = true;
  timers.push(window.setTimeout(() => { displayIndex.value = next; exiting.value = false; }, EXIT_MS));
  timers.push(window.setTimeout(() => { animating.value = false; }, SLIDE_MS));
}

function makeWords(text: string, startIdx: number) {
  let idx = startIdx;
  return text.split(" ").map((word, wi, arr) => {
    const chars = Array.from(word).map((ch) => ({ ch, delay: (idx++) * CHAR_STAGGER }));
    if (wi < arr.length - 1) idx++;
    return { chars, space: wi < arr.length - 1 };
  });
}

const currentQuoteWords = computed(() => makeWords(people.value[displayIndex.value].quote, 0));
const currentAuthorWords = computed(() =>
  makeWords(people.value[displayIndex.value].name, people.value[displayIndex.value].quote.length + 6)
);

onMounted(() => {
  requestAnimationFrame(() => requestAnimationFrame(() => { isMounted.value = true; }));
});
onUnmounted(() => timers.forEach(clearTimeout));
</script>

<template>
  <div class="mgmt-reel">
    <!-- Reel -->
    <div class="reel-mask">
      <div class="reel-cols">
        <!-- Left col -->
        <div class="reel-col" :style="colStyle(sideY)">
          <div v-for="i in sideCellCount" :key="i" class="reel-cell" />
        </div>
        <!-- Middle col -->
        <div class="reel-col" :style="colStyle(middleY)">
          <template v-for="(item, i) in middleItems" :key="i">
            <div v-if="item.type === 'cell'" class="reel-cell" />
            <div v-else class="reel-featured">
              <img
                :src="people[item.i].image"
                :alt="people[item.i].name"
                class="reel-photo"
                loading="lazy"
              />
              <div class="reel-desat" aria-hidden="true" />
              <div class="reel-sheen" aria-hidden="true" />
            </div>
          </template>
        </div>
        <!-- Right col -->
        <div class="reel-col" :style="colStyle(sideY)">
          <div v-for="i in sideCellCount" :key="i" class="reel-cell" />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="reel-content">
      <svg class="reel-quote-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.58 17.32C3.55 16.23 3 15 3 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18zm10 0C13.55 16.23 13 15 13 13.01c0-3.5 2.46-6.64 6.03-8.19l.9 1.38c-3.34 1.8-4 4.15-4.25 5.62.54-.28 1.24-.38 1.93-.31 1.8.17 3.23 1.65 3.23 3.49a3.5 3.5 0 0 1-3.5 3.5c-1.07 0-2.1-.49-2.75-1.18z"/>
      </svg>

      <div class="reel-stage" aria-live="polite">
        <!-- invisible sizer -->
        <div class="reel-sizer" aria-hidden="true">
          <p class="reel-text">{{ people[displayIndex].quote }}</p>
          <div class="reel-meta">
            <p class="reel-author">{{ people[displayIndex].name }}</p>
            <p class="reel-position">{{ people[displayIndex].position }}</p>
          </div>
        </div>
        <!-- animated layer -->
        <div
          :key="displayIndex"
          class="reel-animated"
          :class="{ 'scroll-reel-exit': exiting }"
        >
          <p class="reel-text">
            <template v-for="(word, wi) in currentQuoteWords" :key="wi">
              <span class="inline-block whitespace-nowrap">
                <span
                  v-for="(c, ci) in word.chars"
                  :key="ci"
                  class="scroll-reel-char"
                  :style="{ animationDelay: `${c.delay}ms` }"
                >{{ c.ch }}</span>
              </span>{{ word.space ? ' ' : '' }}
            </template>
          </p>
          <div class="reel-meta">
            <p class="reel-author">
              <template v-for="(word, wi) in currentAuthorWords" :key="wi">
                <span class="inline-block whitespace-nowrap">
                  <span
                    v-for="(c, ci) in word.chars"
                    :key="ci"
                    class="scroll-reel-char"
                    :style="{ animationDelay: `${c.delay}ms` }"
                  >{{ c.ch }}</span>
                </span>{{ word.space ? ' ' : '' }}
              </template>
            </p>
            <p class="reel-position">{{ people[displayIndex].position }}</p>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <div class="reel-nav">
        <button
          type="button"
          :disabled="index === 0"
          aria-label="Vorherige Person"
          class="reel-btn"
          @click="paginate(-1)"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.5 2.5 3.5 6l4 3.5"/>
          </svg>
        </button>
        <button
          type="button"
          :disabled="index === count.value - 1"
          aria-label="Nächste Person"
          class="reel-btn"
          @click="paginate(1)"
        >
          <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m4.5 2.5 4 3.5-4 3.5"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mgmt-reel {
  font-family: "Plus Jakarta Sans", sans-serif;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 860px;
  margin: 0 auto;
  background: #09090b;
  border-radius: 1.5rem;
  overflow: hidden;
}

@media (min-width: 768px) {
  .mgmt-reel { flex-direction: row; min-height: 320px; }
}

/* ── Reel ── */
.reel-mask {
  position: relative;
  height: 224px;
  flex-shrink: 0;
  overflow: hidden;
  -webkit-mask-image:
    linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%),
    linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  mask-image:
    linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%),
    linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

@media (min-width: 768px) {
  .reel-mask { width: 380px; height: auto; }
}

.reel-cols {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.reel-col {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 8px;
  will-change: transform;
}

.reel-cell {
  flex-shrink: 0;
  width: 121.33px;
  height: 121.33px;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.06);
  background: linear-gradient(to bottom, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  filter: blur(1px);
}

.reel-featured {
  position: relative;
  flex-shrink: 0;
  width: 121.33px;
  height: 121.33px;
  border-radius: 0.75rem;
  overflow: hidden;
  background: #1d4ed8;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.12),
    0 8px 32px -8px rgba(29,78,216,0.5),
    0 32px 64px -16px rgba(0,0,0,0.5);
}

.reel-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}

.reel-desat {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 2;
  background: white;
  mix-blend-mode: saturation;
  opacity: 0.1;
}

.reel-sheen {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 3;
  filter: blur(6px);
  mix-blend-mode: overlay;
  opacity: 0.25;
  background: linear-gradient(
    220.99deg,
    rgba(29,78,216,0) 32%,
    rgb(29,78,216) 41%,
    rgb(99,147,255) 47%,
    rgba(59,130,246,0.57) 54%,
    rgba(59,130,246,0) 65%
  );
}

/* ── Content ── */
.reel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2rem 2.5rem;
  gap: 1.25rem;
}

.reel-quote-icon {
  display: block;
  width: 40px;
  height: 40px;
  color: rgba(29,78,216,0.5);
  flex-shrink: 0;
}

.reel-stage {
  position: relative;
  width: 100%;
  max-width: 390px;
  overflow: hidden;
}

.reel-sizer {
  visibility: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  min-height: 130px;
}

.reel-animated {
  position: absolute;
  inset-inline: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  will-change: transform, opacity;
}

.reel-text {
  margin: 0;
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: rgba(255,255,255,0.85);
}

.reel-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.reel-author {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.reel-position {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.35);
  letter-spacing: 0.06em;
}

/* ── Nav ── */
.reel-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reel-btn {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), opacity 0.2s;
  padding: 0;
}
.reel-btn svg { width: 12px; height: 12px; }
.reel-btn:hover:not(:disabled) { transform: scale(1.1); color: #fff; }
.reel-btn:active:not(:disabled) { transform: scale(0.94); }
.reel-btn:disabled { opacity: 0.3; cursor: default; }
</style>
