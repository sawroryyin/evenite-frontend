<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <!-- Fixed z-[60] and kept py-4 padding intact -->
  <header class="sticky top-0 px-5 py-4 flex justify-between items-center z-60 font-sans header-mask">
    <div class="cursor-pointer flex items-center drop-shadow-sm transition-transform hover:scale-105" @click="router.push({ name: 'home' })">
      <img src="../assets/evenite_logo.png" alt="Evenite Logo" class="h-10 object-contain rounded-md" />
    </div>
    
    <nav class="flex items-center gap-5">
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
  background-color: hsl(40, 100%, 99%);
  background-image: radial-gradient(circle at 90% 8%, #ffe6b8 0 13%, transparent 31%), 
                    radial-gradient(circle at 4% 34%, #d9f5ea 0 14%, transparent 34%);
  background-attachment: fixed;
}

/* Creates an invisible 2px extension of the fixed background to cover the rendering gap */
.header-mask::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: inherit;
  background-attachment: fixed;
  z-index: -1;
}
</style>