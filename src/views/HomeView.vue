<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EventService } from '../services/EventService'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import EventCard from '../components/EventCard.vue'
import BottomNav from '../components/BottomNav.vue'
import type { EventData } from '../types' // Adjust path if needed

const router = useRouter()
const authStore = useAuthStore()

// --- State Management ---
const isLoading = ref(true)
const errorMessage = ref('')
const activeSwipeIndex = ref(0)

const selectedEvents = ref<EventData[]>([])
const upcomingEvents = ref<EventData[]>([])

// Scroll tracking for the carousel
const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  const width = container.offsetWidth
  const scrollLeft = container.scrollLeft
  activeSwipeIndex.value = Math.round(scrollLeft / (width * 0.78))
}

const fetchHomeFeed = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    // 1. Fetch all public events (DRAFTS are automatically excluded by backend)
    const publicEvents = await EventService.getPublicEvents()

    // 2. Fetch User Profile to get combined event & personal preferences
    let userPrefs: string[] = []
    if (authStore.currentRole === 'PARTICIPANT') {
      try {
        const profileRes = await api.get('/users/me/participant-profile')
        const prefs = profileRes.data.preferences || {}
        // Combine both personal interests and event categories for a wider matching net
        userPrefs = [...(prefs.event || []), ...(prefs.personal || [])]
      } catch (err) {
        console.warn('Could not load participant profile preferences', err)
      }
    }

    // 3. Filter "Selected for you" based on preferences
    if (userPrefs.length > 0) {
      selectedEvents.value = publicEvents.filter(event => {
        // Backend categories might be an array or a single string depending on Prisma schema
        const eventCategories = Array.isArray(event.category) ? event.category : [event.category]
        // Check if ANY of the event's categories match ANY of the user's preferences
        return eventCategories.some(cat => userPrefs.includes(cat as string))
      })
    } else {
      // Fallback: If no preferences exist at all, just show the 5 most recently created public events
      selectedEvents.value = publicEvents.slice(0, 5)
    }

    // 4. Filter "Upcoming Events" based on date (next 7 days)
    const now = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(now.getDate() + 7)

    upcomingEvents.value = publicEvents.filter(event => {
      if (!event.startAt) return false
      const startDate = new Date(event.startAt)
      return startDate >= now && startDate <= nextWeek
    })

    // Sort upcoming events by soonest starting date
    upcomingEvents.value.sort((a, b) => new Date(a.startAt!).getTime() - new Date(b.startAt!).getTime())

  } catch (error) {
    console.error('Failed to load home view events:', error)
    errorMessage.value = 'Could not load events. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  fetchHomeFeed()
})
</script>

<template>
  <div class="pb-24 max-w-3xl mx-auto font-['Plus_Jakarta_Sans'] bg-[#fafafa] min-h-screen overflow-x-hidden relative">

    <div class="mb-6 pt-4 px-4 relative z-10">
      <h1 class="text-[22px] font-['Nunito'] font-black text-transparent bg-clip-text bg-linear-to-r 
      from-purple-600 to-indigo-600 tracking-tight leading-none">
        Discover your next <br /> campus experience ✨
      </h1>
      <p class="text-[11px] font-['Lato'] text-gray-400 font-medium tracking-wide mt-2">
        Explore what's happening around you today.
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
      <p class="text-gray-400 text-[11px] mt-3 font-medium">Curating your feed...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="px-4">
      <div class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-[11px] font-bold text-center">
        {{ errorMessage }}
      </div>
    </div>

    <template v-else>
      <!-- Selected For You Section -->
      <div class="flex items-center px-4 mb-3">
          <div class="w-1.5 h-4 bg-purple-600 rounded-full mr-2"></div>
          <h2 class="text-sm font-black uppercase tracking-widest">Selected for you</h2>
      </div>
      
      <!-- Empty State for Selected Events -->
      <div v-if="selectedEvents.length === 0" class="px-4 mb-5">
        <div class="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-xs">
          <p class="text-[11px] font-bold text-gray-400">No recommended events right now based on your preferences.</p>
        </div>
      </div>

      <div v-else class="mb-5 relative z-10">
        <div 
          @scroll="handleScroll"
          class="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-2 scrollbar-hide px-8"
        >
          <div 
            v-for="event in selectedEvents" 
            :key="event.id" 
            class="snap-center shrink-0 w-[78vw] max-w-72.5"
          >
            <EventCard 
              :event="event"
              variant="hero"
              @click="router.push({ name: 'event-detail', params: { id: event.id } })"
            />
          </div>
        </div>

        <div class="flex justify-center items-center gap-1.5 mt-2">
          <span 
            v-for="(_, idx) in selectedEvents" 
            :key="idx"
            :class="[
              'transition-all duration-300 rounded-full',
              activeSwipeIndex === idx ? 'w-2 h-2 bg-purple-600' : 'w-1.5 h-1.5 bg-gray-300'
            ]"
          ></span>
        </div>
      </div>

      <!-- Upcoming Events Section -->
      <div class="flex items-center px-4 mb-3 mt-6">
          <div class="w-1.5 h-4 bg-purple-600 rounded-full mr-2"></div>
          <h2 class="text-sm font-black uppercase tracking-widest">Upcoming Events (Next 7 Days)</h2>
      </div>

      <!-- Empty State for Upcoming Events -->
      <div v-if="upcomingEvents.length === 0" class="px-4">
        <div class="bg-white rounded-xl border border-gray-100 p-6 text-center shadow-xs">
          <p class="text-[11px] font-bold text-gray-400">No events happening this week.</p>
        </div>
      </div>

      <div v-else class="px-4 relative z-10">
        <div class="grid grid-cols-2 gap-2.5">
          <EventCard 
            v-for="event in upcomingEvents" 
            :key="event.id" 
            :event="event"
            variant="grid"
            @click="router.push({ name: 'event-detail', params: { id: event.id } })"
          />
        </div>
      </div>
    </template>

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