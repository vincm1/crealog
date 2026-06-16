<script setup lang="ts">
import { ref } from "vue";

type Tab = "cx" | "tl" | "ps";
const activeTab = ref<Tab>("cx");

interface Solution {
  title: string;
  description: string;
  icon: string;
  href: string;
}

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
