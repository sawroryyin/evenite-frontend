<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <header class="bg-blue-800 text-white pl-4 pr-4 p-2 flex justify-between items-center sticky top-0 z-10 shadow-md">
    <div class="font-bold text-xss tracking-wide cursor-pointer" @click="router.push({ name: 'home' })">
      Evenite
    </div>
    
    <nav class="flex items-center gap-4">
      <!-- Profile Icon -->
      <button class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 transition border border-blue-400 focus:outline-none focus:ring-2 focus:ring-white">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </button>
    </nav>
  </header>
</template>