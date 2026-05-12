<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <NavBar />
    <main class="flex-grow max-w-screen-md mx-auto w-full bg-white shadow-sm pb-16 md:pb-0">
      <RouterView />
    </main>
  </div>
</template>