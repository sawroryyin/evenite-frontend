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

const allEvents = ref<EventData[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const isOrganizer = computed(() => authStore.currentRole === 'ORGANIZER')

const tabs = computed(() => {
  if (isOrganizer.value) {
    return ['All', 'Upcoming', 'Ongoing', 'Completed', 'Draft']
  }
  return ['All', 'Upcoming', 'Ongoing', 'Completed']
})

const activeTab = ref('All')

const fetchEventsFromDatabase = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    if (isOrganizer.value) {
      const data = await EventService.getCreatedEvents()
      allEvents.value = data
    } else {
      const data: any = await EventService.getRegisteredEvents()
      const filterCancelledRegEvent = data.map((item: any) => item.event ? item.event : item).filter((item: any) => item.registration.status !== 'CANCELLED') 
      allEvents.value = filterCancelledRegEvent
    }
    
  } catch (error) {
    console.error('Error fetching events from database:', error)
    errorMessage.value = 'Failed to sync with local event registry server. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const filteredEvents = computed(() => {
  let result: EventData[] = []

  if (activeTab.value === 'All') {
    result = [...allEvents.value]
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

  return result.sort((a, b) => {
    const timeA = a.startAt ? new Date(a.startAt).getTime() : Infinity
    const timeB = b.startAt ? new Date(b.startAt).getTime() : Infinity
    
    return timeA - timeB
  })
})

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  fetchEventsFromDatabase()
})
</script>

<template>
  <div class="pt-6 pb-28 max-w-3xl mx-auto min-h-screen font-['Lato'] px-5">
    
    <div class="flex justify-between items-center mb-4 relative z-10">
      <div>
        <h1 class="text-2xl font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          My Events
        </h1>
        <p class="text-sm font-['Lato'] text-[#26215C]/70 font-semibold mt-2 tracking-wide">
          Manage and track your activities
        </p>
      </div>
      
      <button 
        v-if="isOrganizer"
        @click="router.push({ name: 'create-options' })"
        class="bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-2 transition-colors transform active:scale-95 cursor-pointer shrink-0"
      >
        <svg class="w-5 h-5 text-[#EEEDFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
        </svg>
        Create Event
      </button>
    </div>

    <div class="flex w-full bg-[#FFFFFF] rounded-3xl shadow-sm border border-[#CECBF6] p-1.5 mb-6 relative z-10 overflow-x-auto scrollbar-hide">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="activeTab = tab"
        class="flex-1 text-center py-2.5 px-3 text-xs sm:text-sm font-bold rounded-3xl transition-colors tracking-tight whitespace-nowrap cursor-pointer"
        :class="activeTab === tab ?
         'bg-[#534AB7] text-[#FFFFFF] shadow-sm' : 
         'text-[#26215C]/70 hover:bg-[#EEEDFE] hover:text-[#3C3489]'"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#534AB7] mx-auto"></div>
      <p class="text-[#26215C]/70 text-sm mt-4 font-bold tracking-widest uppercase">Fetching records...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-5 rounded-xl border 
    border-red-200 text-sm font-bold text-center shadow-sm">
      {{ errorMessage }}
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center py-16 bg-[#FFFFFF] rounded-xl border 
    border-[#CECBF6] shadow-sm relative z-10">
      <div class="w-14 h-14 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-[#534AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 
          1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 
          006.586 13H4"></path>
        </svg>
      </div>
      <p class="text-sm font-bold text-[#26215C]/70">No events found matching this tab.</p>
    </div>

    <div v-else class="space-y-4 relative z-10">
      <EventCardList
        v-for="event in filteredEvents" 
        :key="event.id"
        :event="event"
      />
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>