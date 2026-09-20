<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDiscussionStore } from '../stores/discussion'
import api from '../services/api' 

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const discussionStore = useDiscussionStore()

const globalUnreadTracker = ref<Record<string, number>>({})

onMounted(async () => {
  if (discussionStore.rooms.length === 0) {
    discussionStore.fetchRooms({ filter: 'active' });
  }

  try {
    const [activeRes, archivedRes] = await Promise.all([
      api.get('/discussions/rooms', { params: { filter: 'active' } }),
      api.get('/discussions/rooms', { params: { filter: 'archived' } })
    ]);
    
    const allRooms = [...activeRes.data, ...archivedRes.data];
    
    allRooms.forEach((room: any) => {
      globalUnreadTracker.value[room.roomId] = room.unreadCount || 0;
    });
  } catch (error) {
    console.warn('Could not load global unread counts', error);
  }
})

watch(() => discussionStore.rooms, (newRooms) => {
  newRooms.forEach(room => {
    globalUnreadTracker.value[room.roomId] = room.unreadCount || 0;
  });
}, { deep: true, immediate: true })

const totalUnreadCount = computed(() => {
  return Object.values(globalUnreadTracker.value).reduce((total, count) => total + count, 0);
})

const navItems = [
  { name: 'home', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'event-list', label: 'My Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'my-tickets', label: 'My Tickets', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 010 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 010-4V7a2 2 0 00-2-2H5z' },
  { name: 'discussion', label: 'Discuss', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  { name: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

const filteredNavItems = computed(() => {
  if (authStore.currentRole === 'ORGANIZER') {
    return navItems.filter(item => item.name !== 'home' && item.name !== 'my-tickets')
  }
  return navItems
})
</script>

<template>
  <div class="fixed bottom-5 left-4 right-4 z-50 max-w-3xl mx-auto font-['Lato']">
    <nav 
      class="flex items-center justify-between rounded-[28px] border border-[#CECBF6] bg-white/95 p-1.5 shadow-[0_14px_35px_rgba(23,35,59,0.13)] backdrop-blur-md"
    >
      <button 
        v-for="item in filteredNavItems" 
        :key="item.name"
        @click="router.push({ name: item.name })"
        class="flex flex-1 items-center justify-center rounded-3xl h-14 transition-all duration-300 cursor-pointer active:scale-95"
        :class="route.name === item.name ? 'bg-[#131B2B] text-white shadow-md' : 'text-[#26215C]/50 hover:text-[#F26E22] hover:bg-[#F26E22]/10'"
      >
        <div class="relative flex items-center justify-center">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
          </svg>
          
          <span 
            v-if="item.name === 'discussion' && totalUnreadCount > 0"
            class="absolute -top-1 -right-1.5 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white shadow-sm"
          ></span>
        </div>
      </button>
    </nav>
  </div>
</template>