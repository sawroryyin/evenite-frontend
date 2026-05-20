<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import type { EventData } from '../types' // Adjust path if needed
import BottomNav from '../components/BottomNav.vue'

// --- State Management Engine ---
const currentRole = ref<'participant' | 'organizer'>('participant')
const allEvents = ref<EventData[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

// Tabs Configuration matching your explicit layout matrix
const participantTabs = ['Registered Events', 'Saved Events', 'Past Events']
const organizerTabs = ['Published Events', 'Draft Events', 'Past Events']

const activeTab = ref('Registered Events')

// Derived tabs tracking list based on role execution layout
const visibleTabs = computed(() => {
  return currentRole.value === 'participant' ? participantTabs : organizerTabs
})

// Toggle role safely and realign default active tabs
const handleRoleSwitch = (role: 'participant' | 'organizer') => {
  currentRole.value = role
  activeTab.value = role === 'participant' ? 'Registered Events' : 'Published Events'
}

// --- Database Sync Engine (Original Axios Operations Restored) ---
const fetchEventsFromDatabase = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // Fetch all events from your NestJS local server endpoint
    const response = await axios.get<EventData[]>('http://localhost:3000/events')
    allEvents.value = response.data
    
  } catch (error) {
    console.error('Error fetching event telemetry from database:', error)
    errorMessage.value = 'Failed to sync with local event registry server. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// --- Live Filtering Logic Node ---
const filteredEvents = computed(() => {
  if (currentRole.value === 'organizer') {
    if (activeTab.value === 'Published Events') {
      return allEvents.value.filter(event => event.status === 'PUBLISHED')
    } else if (activeTab.value === 'Draft Events') {
      return allEvents.value.filter(event => event.status === 'DRAFT')
    } else if (activeTab.value === 'Past Events') {
      return allEvents.value.filter(event => event.status === 'ARCHIVED')
    }
  } else {
    // Participant filter mapping
    if (activeTab.value === 'Registered Events') {
      return allEvents.value.filter(event => event.status === 'PUBLISHED') // Live events participant has registered for
    } else if (activeTab.value === 'Saved Events') {
      return allEvents.value.filter(event => event.status === 'DRAFT' || event.isBookmarked) // Bookmarked items
    } else if (activeTab.value === 'Past Events') {
      return allEvents.value.filter(event => event.status === 'ARCHIVED')
    }
  }
  return []
})

// --- Utility Formatting Blocks ---
const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

// Global Lifecycle Hooks Initialization
onMounted(() => {
  fetchEventsFromDatabase()
})
</script>

<template>
  <div class="pt-4 pb-24 max-w-screen-md mx-auto bg-[#fafafa] min-h-screen font-['Plus_Jakarta_Sans'] px-4">
    
    <div class="flex justify-between items-center mb-5">
      <div>
        <h1 class="text-xl font-['Space_Grotesk'] font-bold text-gray-900 tracking-tight uppercase">
          Workspace
        </h1>
        <p class="text-[11px] text-gray-400 font-medium font-['Lato'] mt-0.5">Manage live database allocations</p>
      </div>
      <div class="inline-flex rounded-xl bg-gray-100 p-1 font-['Lato']">
        <button 
          @click="handleRoleSwitch('participant')"
          class="px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all"
          :class="currentRole === 'participant' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'"
        >
          Participant
        </button>
        <button 
          @click="handleRoleSwitch('organizer')"
          class="px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all"
          :class="currentRole === 'organizer' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'"
        >
          Organizer
        </button>
      </div>
    </div>

    <div class="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4 font-['Lato']">
      <button 
        v-for="tab in visibleTabs" 
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all"
        :class="activeTab === tab ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-500 hover:text-purple-600'"
      >
        {{ tab.split(' ')[0] }} Events </button>
    </div>

    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-purple-600 mx-auto"></div>
      <p class="text-gray-400 font-['Lato'] text-xs mt-3">Fetching records from server pipeline...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-xs font-semibold text-center font-['Lato']">
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center py-14 bg-white rounded-xl border border-gray-100 shadow-xs">
      <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2.5">
        <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
      </div>
      <p class="text-xs font-bold text-gray-400">No active tracking references found matching this catalog query.</p>
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="event in filteredEvents" 
        :key="event.id"
        class="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex justify-between items-center transition-transform active:scale-[0.99.5]"
      >
        <div class="pr-3 truncate">
          <div class="flex items-center gap-2 mb-1">
            <span 
              class="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-2xs"
              :class="[
                event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : '',
                event.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : '',
                // event.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-600' : ''
              ]"
            >
              {{ event.status }}
            </span>
            <span class="text-[10px] text-gray-400 font-semibold font-['Lato']">
              {{ formatDate(event.startAt || event.updatedAt) }}
            </span>
          </div>
          <h3 class="font-bold text-gray-900 text-sm tracking-tight truncate">
            {{ event.title?.en || event.title?.th || 'Untitled Event' }}
          </h3>
        </div>
        
        <button class="bg-[#fafafa] hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-gray-700 border border-gray-200 text-[11px] font-bold py-1.5 px-3 rounded-xl transition-all flex-shrink-0">
          Manage
        </button>
      </div>
    </div>

    <BottomNav />
  </div>
</template>