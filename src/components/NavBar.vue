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