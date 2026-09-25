<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
    <NavBar />
    <main class="grow max-w-3xl mx-auto w-full md:pb-0">
      <RouterView />
    </main>
  </div>
</template>