<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EventService } from '../services/EventService'
import { useAuthStore } from '../stores/auth'
import type { EventData } from '../types' 
import BottomNav from '../components/BottomNav.vue'
import EventCardList from '../components/EventCardList.vue'

const router = useRouter()
const authStore = useAuthStore()

// --- State Management Engine ---
const allEvents = ref<EventData[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const isOrganizer = computed(() => authStore.currentRole === 'ORGANIZER')

// Dynamic Tabs: Participants don't have Drafts
const tabs = computed(() => 
  isOrganizer.value ? ['Published', 'Draft', 'Completed'] : ['Registered', 'Completed']
)
const activeTab = ref(isOrganizer.value ? 'Published' : 'Registered')

// --- Database Sync Engine ---
const fetchEventsFromDatabase = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    if (isOrganizer.value) {
      // Organizer: Fetch events they created
      const data = await EventService.getCreatedEvents()
      allEvents.value = data
    } else {
      // Participant: Fetch events they registered for
      // Backend returns EventRegistration with a nested 'event' object
      const data: any = await EventService.getRegisteredEvents()
      allEvents.value = data.map((item: any) => item.event ? item.event : item)
    }
    
  } catch (error) {
    console.error('Error fetching event telemetry from database:', error)
    errorMessage.value = 'Failed to sync with local event registry server. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// --- Live Filtering Logic Node ---
const filteredEvents = computed(() => {
  if (activeTab.value === 'Published' || activeTab.value === 'Registered') {
    return allEvents.value.filter(event => event.status === 'PUBLISHED')
  } else if (activeTab.value === 'Draft') {
    return allEvents.value.filter(event => event.status === 'DRAFT')
  } else if (activeTab.value === 'Completed') {
    return allEvents.value.filter(event => event.status === 'COMPLETED')
  }
  return []
})

// Global Lifecycle Hooks Initialization
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  fetchEventsFromDatabase()
})
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4">
    
    <div class="flex justify-between items-center mb-5 relative z-10">
      <div>
        <h1 class="text-[22px] font-['Nunito'] font-black text-transparent bg-clip-text bg-linear-to-r 
        from-purple-600 to-indigo-600 tracking-tight leading-none">
          My Events
        </h1>
        <p class="text-[11px] font-['Lato'] text-gray-400 font-medium mt-1.5 tracking-wide">
          Manage and track your activities
        </p>
      </div>
      
      <!-- Only show Create Event button to Organizers -->
      <button 
        v-if="isOrganizer"
        @click="router.push({ name: 'create-options' })"
        class="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
        text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1.5 
        transition-transform transform active:scale-95 cursor-pointer"
      >
        <svg class="w-3.5 h-3.5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
        </svg>
        Create Event
      </button>
    </div>

    <div class="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4 relative z-10">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 text-center py-1.5 text-[11px] font-bold rounded-lg transition-all"
        :class="activeTab === tab ?
         'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-xs' : 
         'text-gray-500 hover:text-purple-600'"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
      <p class="text-gray-400 text-[11px] mt-3 font-medium">Fetching records from server...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl border 
    border-red-100 text-[11px] font-bold text-center">
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center py-14 bg-white rounded-xl border 
    border-gray-100 shadow-xs relative z-10">
      <div class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2.5">
        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 
          1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 
          006.586 13H4"></path>
        </svg>
      </div>
      <p class="text-[11px] font-bold text-gray-400">No events found matching this tab.</p>
    </div>

    <div v-else class="space-y-3 relative z-10">
      <EventCardList
        v-for="event in filteredEvents" 
        :key="event.id"
        :event="event"
      />
    </div>

    <BottomNav />
  </div>
</template>