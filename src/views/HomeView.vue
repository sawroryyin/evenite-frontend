<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EventCard from '../components/EventCard.vue'
import BottomNav from '../components/BottomNav.vue'

const router = useRouter()

// --- Scroll & Carousel Tracking ---
const activeSwipeIndex = ref(1)

// Mock Data
const selectedEvents = ref([
  { id: 1, title: 'AI in Healthcare & Future Tech Seminar', category: 'SEMINAR', date: '22 May 2026', location: 'CMU Auditorium', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60' },
  { id: 2, title: 'The Secret Sauce Business Weekend Isan 2026', category: 'NETWORKING', date: '18 Jul 2026', location: 'KICE Exhibition Center', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60' },
  { id: 3, title: 'Web3 & Blockchain Hackathon Regionals', category: 'HACKATHON', date: '01 Jun 2026', location: 'Library SCB, CMU', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=60' }
])

const upcomingEvents = ref([
  { id: 4, title: 'Google Cloud Cloud-Native Workshop', category: 'WORKSHOP', date: '05 Jun 2026', location: 'Online Streaming', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&auto=format&fit=crop&q=60' },
  { id: 5, title: 'CMU Campus Rock & Music Festival', category: 'FESTIVAL', date: '10 Jun 2026', location: 'Main Stadium', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60' },
  { id: 6, title: 'Software Engineering Career Fair', category: 'CAREER_FAIR', date: '12 Jun 2026', location: 'CAMT Hall', image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&auto=format&fit=crop&q=60' },
  { id: 7, title: 'Lanna Arts & Cultural Field Trip', category: 'TRIP', date: '18 Jun 2026', location: 'Old City Gates', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=500&auto=format&fit=crop&q=60' },
])

const handleScroll = (event: Event) => {
  const container = event.target as HTMLElement
  const width = container.offsetWidth
  const scrollLeft = container.scrollLeft
  activeSwipeIndex.value = Math.round(scrollLeft / (width * 0.78))
}
</script>

<template>
  <div class="pt-2 pb-24 max-w-screen-md mx-auto font-['Plus_Jakarta_Sans'] bg-[#fafafa] min-h-screen overflow-x-hidden relative">

    <div class="mb-6 mt-1 px-4 relative z-10">
      <h1 class="text-[22px] font-['Nunito'] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-purple-600 to-indigo-600 tracking-tight leading-none">
        Discover your next <br /> campus experience ✨
      </h1>
      <p class="text-[11px] font-['Lato'] text-gray-400 font-medium mt-1.5 tracking-wide">
        Explore what's happening around you today.
      </p>
    </div>

    <div class="mb-5 relative z-10">
      <h2 class="text-xs font-['Space_Grotesk'] font-bold mb-2.5 text-gray-900 px-4 tracking-tight uppercase text-purple-900/40">Selected for you</h2>
      
      <div 
        @scroll="handleScroll"
        class="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-2 scrollbar-hide px-8"
      >
        <div 
          v-for="event in selectedEvents" 
          :key="event.id" 
          class="snap-center shrink-0 w-[78vw] max-w-[290px]"
        >
          <EventCard 
            :event="event"
            variant="hero"
            @click="router.push({ name: 'event-details', params: { id: event.id } })"
          />
        </div>
      </div>

      <div class="flex justify-center items-center gap-1.5 mt-2">
        <span 
          v-for="(dot, idx) in selectedEvents" 
          :key="idx"
          :class="[
            'transition-all duration-300 rounded-full',
            activeSwipeIndex === idx ? 'w-2 h-2 bg-purple-600' : 'w-1.5 h-1.5 bg-gray-300'
          ]"
        ></span>
      </div>
    </div>

    <div class="px-4 relative z-10">
      <h2 class="text-xs font-['Space_Grotesk'] font-bold mb-2.5 text-gray-900 tracking-tight uppercase text-purple-900/40">Upcoming Events</h2>
      <div class="grid grid-cols-2 gap-2.5">
        <EventCard 
          v-for="event in upcomingEvents" 
          :key="event.id" 
          :event="event"
          variant="grid"
          @click="router.push({ name: 'event-details', params: { id: event.id } })"
        />
      </div>
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