<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import type { EventData } from '../types' // Adjust path if needed
import BottomNav from '../components/BottomNav.vue'
import EventCardList from '../components/EventCardList.vue'

// --- State Management Engine ---
const allEvents = ref<EventData[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

// Simplified Tabs Configuration for Organizer
const tabs = ['Published', 'Draft', 'Completed']
const activeTab = ref('Published')

// --- Database Sync Engine ---
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
  if (activeTab.value === 'Published') {
    return allEvents.value.filter(event => event.status === 'PUBLISHED')
  } else if (activeTab.value === 'Draft') {
    return allEvents.value.filter(event => event.status === 'DRAFT')
  } else if (activeTab.value === 'Completed') {
    return allEvents.value.filter(event => event.status === 'ARCHIVED' || event.status === 'COMPLETED')
  }
  return []
})

// Global Lifecycle Hooks Initialization
onMounted(() => {
  fetchEventsFromDatabase()
})
</script>

<template>
  <div class="pt-4 pb-24 max-w-screen-md mx-auto bg-[#fafafa] min-h-screen font-['Plus_Jakarta_Sans'] px-4">
    
    <!-- Tab Navigation -->
    <div class="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4 font-['Lato']">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 text-center py-2 text-[11px] font-bold rounded-lg transition-all"
        :class="activeTab === tab ? 'bg-purple-600 text-white shadow-xs' : 'text-gray-500 hover:text-purple-600'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-purple-600 mx-auto"></div>
      <p class="text-gray-400 font-['Lato'] text-xs mt-3">Fetching records from server pipeline...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-xs font-semibold text-center font-['Lato']">
      {{ errorMessage }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-14 bg-white rounded-xl border border-gray-100 shadow-xs">
      <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2.5">
        <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
      </div>
      <p class="text-xs font-bold text-gray-400">No active tracking references found matching this catalog query.</p>
    </div>

    <!-- Event List Injection -->
    <div v-else class="space-y-3">
      <EventCardList
        v-for="event in filteredEvents" 
        :key="event.id"
        :event="event"
      />
    </div>

    <BottomNav />
  </div>
</template>