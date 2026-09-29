<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

const showNavActions = computed(() => !route.meta.hideNavActions)

const goHome = () => {
  // On auth pages the logo shouldn't send users into the app
  if (showNavActions.value) router.push({ name: 'home' })
}
</script>

<template>
  <header class="sticky top-0 px-5 py-4 flex justify-between items-center z-60 font-sans header-mask">
    <div
      class="flex items-center drop-shadow-sm transition-transform"
      :class="showNavActions ? 'cursor-pointer hover:scale-105' : ''"
      @click="goHome"
    >
      <img src="../assets/evenite_logo.png" alt="Evenite Logo" class="h-10 object-contain rounded-md" />
    </div>

    <nav v-if="showNavActions" class="flex items-center gap-5">
      <button
        @click="router.push({ name: 'notifications' })"
        class="relative p-2.5 bg-white border border-[#131B2B]/5 rounded-xl shadow-sm hover:bg-[#131B2B]/5 transition focus:outline-none cursor-pointer">
        <svg class="w-6 h-6 text-[#131B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0
            00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0
            .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
          </path>
        </svg>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.header-mask {
  /* Clips the fixed ::before layer to just the header's area.
     (clip-path clips fixed children; overflow: hidden would not) */
  clip-path: inset(0);
}

.header-mask::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100lvh;
  background-color: var(--app-bg-color);
  background-image: var(--app-bg-gradient);
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: -1;
}
</style>