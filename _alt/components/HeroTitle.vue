<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const words = [
  "Kundenkontakts",
  "Kundenservices",
  "Vertriebs",
  "Contact Centers",
  "Supports",
];

const currentIndex = ref(0);
let timer: number;

onMounted(() => {
  timer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % words.length;
  }, 2800);
});

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <Transition name="word" mode="out-in">
    <span :key="currentIndex">{{ words[currentIndex] }}</span>
  </Transition>
</template>

<style scoped>
.word-enter-active {
  transition:
    opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
}
.word-leave-active {
  transition:
    opacity 0.45s ease-in,
    transform 0.45s ease-in;
}
.word-enter-from {
  opacity: 0;
  transform: translateY(0.35em);
}
.word-leave-to {
  opacity: 0;
  transform: translateY(-0.25em);
}
</style>
