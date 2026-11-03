<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EventService } from '../../services/EventService'
import {
  type AttendanceEvent,
  getEventTitle,
  formatEventDate,
  CHECK_IN_OPEN_STATUSES
} from '../../services/AttendanceService'
import BottomNav from '../../components/BottomNav.vue'
import EventStatusBadge from '../../components/attendance/EventStatusBadge.vue'

const router = useRouter()

const events = ref<AttendanceEvent[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const tabs = ['All', 'Ongoing', 'Upcoming'] as const
const activeTab = ref<(typeof tabs)[number]>('All')

const fetchEvents = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const data = (await EventService.getCreatedEvents()) as unknown as AttendanceEvent[]
    events.value = data.filter(e => CHECK_IN_OPEN_STATUSES.includes(e.status))
  } catch (error) {
    console.error('Failed to load events for check-in:', error)
    errorMessage.value = 'Could not load your events. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const filteredEvents = computed(() => {
  const list = events.value.filter(e => {
    if (activeTab.value === 'Ongoing') return e.status === 'ONGOING'
    if (activeTab.value === 'Upcoming') return e.status === 'PUBLISHED'
    return true
  })

  // ongoing first, then by start time
  return [...list].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'ONGOING' ? -1 : 1
    const tA = a.startAt ? new Date(a.startAt).getTime() : Infinity
    const tB = b.startAt ? new Date(b.startAt).getTime() : Infinity
    return tA - tB
  })
})

const seatText = (e: AttendanceEvent) =>
  e.seatLimit ? `${e.seatsTaken ?? 0} / ${e.seatLimit} registered` : `${e.seatsTaken ?? 0} registered`

const openEvent = (id: string) => router.push({ name: 'check-in-event', params: { eventId: id } })

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  fetchEvents()
})
</script>

<template>
  <div class="pt-2 pb-28 max-w-3xl mx-auto min-h-screen font-['Lato'] px-5 relative">

    <div class="flex gap-3 mb-6 relative z-10 overflow-x-auto scrollbar-hide py-1">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        class="shrink-0 flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-full transition-all tracking-tight cursor-pointer"
        :class="activeTab === tab
          ? 'bg-[#131B2B] text-white shadow-md border border-[#131B2B]'
          : 'bg-white border border-[#131B2B]/20 text-[#131B2B]/70 hover:bg-[#131B2B]/5 hover:text-[#131B2B]'"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#131B2B] mx-auto"></div>
      <p class="text-[#131B2B]/70 text-sm mt-4 font-bold tracking-widest uppercase">Loading events...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-5 rounded-xl border border-red-200 text-sm font-bold text-center shadow-sm">
      {{ errorMessage }}
      <button @click="fetchEvents" class="block mx-auto mt-3 text-xs font-black uppercase tracking-widest underline cursor-pointer">Retry</button>
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center py-16 bg-white rounded-xl border border-[#131B2B]/10 shadow-sm">
      <div class="w-14 h-14 bg-[#131B2B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-[#131B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M4 12h16"></path>
        </svg>
      </div>
      <p class="text-sm font-bold text-[#131B2B]/70">No published or ongoing events to check in.</p>
    </div>

    <div v-else class="space-y-3">
      <button
        v-for="event in filteredEvents"
        :key="event.id"
        @click="openEvent(event.id)"
        class="w-full text-left bg-white border border-[#131B2B]/10 rounded-2xl shadow-sm p-3 flex gap-3 items-center hover:bg-[#131B2B]/5 transition-colors cursor-pointer active:scale-[0.99]"
      >
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-[#131B2B]/5 border border-[#131B2B]/10 shrink-0 flex items-center justify-center">
          <img v-if="event.bannerUrl" :src="event.bannerUrl" class="w-full h-full object-cover" alt="" />
          <svg v-else class="w-7 h-7 text-[#131B2B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>

        <div class="flex-1 min-w-0">
          <EventStatusBadge :status="event.status" />
          <p class="text-sm font-['Nunito'] font-black text-[#131B2B] mt-1.5 line-clamp-2 leading-snug">{{ getEventTitle(event) }}</p>
          <p class="text-xs font-semibold text-[#131B2B]/60 mt-1">{{ formatEventDate(event.startAt) }}</p>
          <p class="text-xs font-bold text-[#131B2B]/80 mt-0.5">{{ seatText(event) }}</p>
        </div>

        <svg class="w-5 h-5 text-[#131B2B]/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>