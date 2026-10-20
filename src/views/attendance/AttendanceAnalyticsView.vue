<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventService } from '../../services/EventService'
import { FormService } from '../../services/FormService'
import {
  AttendanceService,
  type AttendanceEvent,
  type AttendanceRegistrant,
  getApiErrorMessage,
  getEventTitle,
  formatEventDate
} from '../../services/AttendanceService'
import EventStatusBadge from '../../components/attendance/EventStatusBadge.vue'
import StatRing from '../../components/attendance/StatRing.vue'
import CheckInTimeline from '../../components/attendance/CheckInTimeline.vue'

const route = useRoute()
const router = useRouter()
const eventId = route.params.eventId as string

const event = ref<AttendanceEvent | null>(null)
const registrants = ref<AttendanceRegistrant[]>([])
const forms = ref<{ type: string }[]>([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const errorMessage = ref('')

const loadData = async (silent = false) => {
  if (silent) isRefreshing.value = true
  else isLoading.value = true
  errorMessage.value = ''

  try {
    const [eventData, registrantData, formData] = await Promise.all([
      EventService.getEventById(eventId),
      AttendanceService.getRegistrants(eventId),
      FormService.getFormsByEventId(eventId).catch(() => [])
    ])
    event.value = eventData as unknown as AttendanceEvent
    registrants.value = registrantData
    forms.value = formData ?? []
  } catch (error) {
    console.error('Failed to load analytics:', error)
    errorMessage.value = getApiErrorMessage(error, 'Could not load analytics for this event.')
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

const confirmed = computed(() => registrants.value.filter(r => r.status === 'CONFIRMED'))
const cancelledCount = computed(() => registrants.value.filter(r => r.status === 'CANCELLED').length)
const checkInTimes = computed(() => confirmed.value.filter(r => r.checkedInAt).map(r => r.checkedInAt as string))
const checkedInCount = computed(() => checkInTimes.value.length)
const notCheckedInCount = computed(() => confirmed.value.length - checkedInCount.value)
const isConcluded = computed(() => event.value?.status === 'CONCLUDED')

const seatLimit = computed(() => event.value?.seatLimit ?? null)
const seatsRegistered = computed(() => event.value?.seatsTaken ?? confirmed.value.length)

const quickStats = computed(() => [
  { label: 'Registered', value: confirmed.value.length },
  { label: 'Checked in', value: checkedInCount.value },
  { label: isConcluded.value ? 'No-show' : 'Not yet', value: notCheckedInCount.value },
  { label: 'Cancelled', value: cancelledCount.value }
])

const hasForm = (type: string) => forms.value.some(f => f.type === type)

const openResponses = (type: 'REGISTRATION' | 'FEEDBACK') => {
  if (!hasForm(type)) return
  router.push(`/events/${eventId}/forms/${type}/responses`)
}

const goBack = () => {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'check-in-event', params: { eventId } })
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  loadData()
})
</script>

<template>
  <div class="pt-6 pb-28 max-w-3xl mx-auto min-h-screen font-['Lato'] px-5 relative">
    <button @click="goBack" class="mb-5 text-[#131B2B]/70 hover:text-[#131B2B] flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer py-1 pr-4">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      BACK
    </button>

    <div v-if="isLoading" class="text-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#131B2B] mx-auto"></div>
      <p class="text-[#131B2B]/70 text-sm mt-4 font-bold tracking-widest uppercase">Crunching numbers...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-5 rounded-xl border border-red-200 text-sm font-bold text-center shadow-sm">
      {{ errorMessage }}
      <button @click="loadData()" class="block mx-auto mt-3 text-xs font-black uppercase tracking-widest underline cursor-pointer">Retry</button>
    </div>

    <template v-else-if="event">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-6 border-b border-[#131B2B]/10 pb-4">
        <div class="min-w-0">
          <h1 class="text-2xl font-['Nunito'] font-black text-[#131B2B] tracking-tight leading-none">Event Analytics</h1>
          <p class="text-sm font-bold text-[#131B2B] mt-2.5 truncate">{{ getEventTitle(event) }}</p>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <EventStatusBadge :status="event.status" />
            <span class="text-xs font-semibold text-[#131B2B]/60">{{ formatEventDate(event.startAt) }}</span>
          </div>
        </div>
        <button
          @click="loadData(true)"
          :disabled="isRefreshing"
          aria-label="Refresh"
          class="w-9 h-9 rounded-full border border-[#131B2B]/10 bg-white text-[#131B2B]/70 hover:text-[#131B2B] hover:bg-[#131B2B]/5 flex items-center justify-center shadow-sm transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>

      <!-- Rings -->
      <div class="grid grid-cols-2 gap-3 mb-5 animate-fade-in">
        <StatRing
          title="Seats"
          :value="seatsRegistered"
          :total="seatLimit"
          valueLabel="Registered"
          totalLabel="Total seats"
          color="#131B2B"
        />
        <StatRing
          title="Attendance"
          :value="checkedInCount"
          :total="confirmed.length"
          valueLabel="Checked in"
          totalLabel="Registered"
          color="#10B981"
        />
      </div>

      <!-- Quick stats -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div v-for="stat in quickStats" :key="stat.label" class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-2xl p-4">
          <p class="text-[10px] font-black text-[#131B2B]/60 uppercase tracking-widest">{{ stat.label }}</p>
          <p class="text-2xl font-['Nunito'] font-black text-[#131B2B] mt-1">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Form responses -->
      <div class="bg-white p-5 rounded-2xl border border-[#131B2B]/10 shadow-sm space-y-3 mb-5">
        <h3 class="text-base font-['Nunito'] font-black text-[#131B2B] mb-1">Form Responses</h3>

        <button
          @click="openResponses('REGISTRATION')"
          :disabled="!hasForm('REGISTRATION')"
          class="w-full bg-white hover:bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          {{ hasForm('REGISTRATION') ? 'Registration Responses' : 'No Registration Form' }}
        </button>

        <button
          @click="openResponses('FEEDBACK')"
          :disabled="!hasForm('FEEDBACK')"
          class="w-full bg-white hover:bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
          {{ hasForm('FEEDBACK') ? 'Feedback Responses' : 'No Feedback Form' }}
        </button>
      </div>

      <!-- Timeline -->
      <CheckInTimeline :check-ins="checkInTimes" />
    </template>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>