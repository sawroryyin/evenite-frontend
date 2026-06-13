<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EventService } from '../../services/EventService.ts'
import { useAuthStore } from '../../stores/auth.ts'
import type { EventData } from '../../types.ts' 
import BottomNav from '../../components/BottomNav.vue'
import EventCardList from '../../components/event/EventCardList.vue'

const router = useRouter()
const authStore = useAuthStore()

// --- State Management Engine ---
const allEvents = ref<EventData[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const isOrganizer = computed(() => authStore.currentRole === 'ORGANIZER')

// Dynamic Tabs: Explicitly sets 5 tabs for Organizer, 4 for Participant
const tabs = computed(() => {
  if (isOrganizer.value) {
    return ['All', 'Upcoming', 'Ongoing', 'Completed', 'Draft']
  }
  return ['All', 'Upcoming', 'Ongoing', 'Completed']
})

const activeTab = ref('All')

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
      const data: any = await EventService.getRegisteredEvents()
      allEvents.value = data.map((item: any) => item.event ? item.event : item)
    }
    
  } catch (error) {
    console.error('Error fetching events from database:', error)
    errorMessage.value = 'Failed to sync with local event registry server. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// --- Live Filtering & Sorting Logic ---
const filteredEvents = computed(() => {
  let result: EventData[] = []

  // 1. Filter based on active tab
  if (activeTab.value === 'All') {
    result = [...allEvents.value] // Create a shallow copy so we don't mutate the original array
  } else {
    switch (activeTab.value) {
      case 'Upcoming':
        result = allEvents.value.filter(event => event.status === 'PUBLISHED')
        break
      case 'Ongoing':
        result = allEvents.value.filter(event => event.status === 'ONGOING')
        break
      case 'Completed':
        result = allEvents.value.filter(event => event.status === 'CONCLUDED')
        break
      case 'Draft':
        result = allEvents.value.filter(event => event.status === 'DRAFT')
        break
      default:
        result = []
    }
  }

  // 2. Sort from nearest to farthest (chronological order)
  return result.sort((a, b) => {
    // If an event doesn't have a startAt date (e.g., a draft), push it to the bottom by using Infinity
    const timeA = a.startAt ? new Date(a.startAt).getTime() : Infinity
    const timeB = b.startAt ? new Date(b.startAt).getTime() : Infinity
    
    return timeA - timeB
  })
})

// Global Lifecycle Hooks Initialization
onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  fetchEventsFromDatabase()
})
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    
    <div class="flex justify-between items-center mb-5 relative z-10">
      <div>
        <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          My Events
        </h1>
        <p class="text-[11px] font-['Lato'] text-[#26215C]/70 font-medium mt-1.5 tracking-wide">
          Manage and track your activities
        </p>
      </div>
      
      <button 
        v-if="isOrganizer"
        @click="router.push({ name: 'create-options' })"
        class="bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors transform active:scale-95 cursor-pointer shrink-0"
      >
        <svg class="w-3.5 h-3.5 text-[#EEEDFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
        </svg>
        Create Event
      </button>
    </div>

    <div class="flex w-full bg-[#FFFFFF] rounded-xl shadow-sm border border-[#CECBF6] p-1 mb-4 relative z-10">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 text-center py-1.5 px-0.5 text-[9.5px] min-[380px]:text-[10px] sm:text-[11px] font-bold rounded-lg transition-colors tracking-tight whitespace-nowrap"
        :class="activeTab === tab ?
         'bg-[#534AB7] text-[#FFFFFF] shadow-xs' : 
         'text-[#26215C]/70 hover:bg-[#EEEDFE] hover:text-[#3C3489]'"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#534AB7] mx-auto"></div>
      <p class="text-[#26215C]/70 text-[11px] mt-3 font-medium">Fetching records from server...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl border 
    border-red-100 text-[11px] font-bold text-center">
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center py-14 bg-[#FFFFFF] rounded-xl border 
    border-[#CECBF6] shadow-xs relative z-10">
      <div class="w-10 h-10 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-2.5">
        <svg class="w-5 h-5 text-[#534AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 
          1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 
          006.586 13H4"></path>
        </svg>
      </div>
      <p class="text-[11px] font-bold text-[#26215C]/70">No events found matching this tab.</p>
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