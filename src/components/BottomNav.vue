<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { name: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'event-list', label: 'My Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'discussion', label: 'Discuss', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { name: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

const filteredNavItems = computed(() => {
  if (authStore.currentRole === 'ORGANIZER') {
    return navItems.filter(item => item.name !== 'home')
  }
  return navItems
})
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe z-50 
  shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] font-['Lato']">
    <div class="flex justify-around items-center h-14 max-w-3xl mx-auto px-2">
      <button 
        v-for="item in filteredNavItems" 
        :key="item.name"
        @click="router.push({ name: item.name })"
        class="flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors duration-200"
        :class="route.name === item.name ? 'text-purple-600' : 'text-gray-400 hover:text-purple-400'"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
        </svg>
        <span class="text-[9px] font-bold">{{ item.label }}</span>
      </button>
    </div>
  </nav>
</template>