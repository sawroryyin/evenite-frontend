<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventService } from '../../services/EventService'
import {
  AttendanceService,
  type AttendanceEvent,
  type AttendanceRegistrant,
  type CheckInResult,
  type ScanOutcome,
  getApiErrorMessage,
  getAttendeeName,
  getEventTitle,
  formatEventDate,
  CHECK_IN_OPEN_STATUSES
} from '../../services/AttendanceService'
import ConfirmModal from '../../components/ConfirmModal.vue'
import EventStatusBadge from '../../components/attendance/EventStatusBadge.vue'
import ParticipantCheckInRow from '../../components/attendance/ParticipantCheckInRow.vue'

// lazy-load so the QR decoder is only downloaded when the scanner opens
const QrScannerModal = defineAsyncComponent(() => import('../../components/attendance/QrScannerModal.vue'))

const route = useRoute()
const router = useRouter()
const eventId = route.params.eventId as string

const event = ref<AttendanceEvent | null>(null)
const registrants = ref<AttendanceRegistrant[]>([])
const isLoading = ref(true)
const isRefreshing = ref(false)
const errorMessage = ref('')

const searchQuery = ref('')
const filters = ['All', 'Not yet', 'Checked in'] as const
const activeFilter = ref<(typeof filters)[number]>('All')
const pendingIds = ref<string[]>([])
const showScanner = ref(false)

const alertState = ref({ show: false, title: '', description: '', theme: 'blue' as 'blue' | 'red' })
const confirmState = ref({
  show: false, title: '', description: '', confirmText: '',
  theme: 'blue' as 'blue' | 'red', onConfirm: () => {}
})

const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue') => {
  alertState.value = { show: true, title, description, theme }
}

const canCheckIn = computed(() => !!event.value && CHECK_IN_OPEN_STATUSES.includes(event.value.status))
const confirmedRegistrants = computed(() => registrants.value.filter(r => r.status === 'CONFIRMED'))
const checkedInCount = computed(() => confirmedRegistrants.value.filter(r => r.checkedInAt).length)
const attendancePercent = computed(() =>
  confirmedRegistrants.value.length ? Math.round((checkedInCount.value / confirmedRegistrants.value.length) * 100) : 0
)

const filterCounts = computed<Record<string, number>>(() => ({
  'All': confirmedRegistrants.value.length,
  'Not yet': confirmedRegistrants.value.length - checkedInCount.value,
  'Checked in': checkedInCount.value
}))

const visibleRegistrants = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return confirmedRegistrants.value
    .filter(r => {
      if (activeFilter.value === 'Checked in') return !!r.checkedInAt
      if (activeFilter.value === 'Not yet') return !r.checkedInAt
      return true
    })
    .filter(r => {
      if (!q) return true
      const s = r.participantSnapshot || ({} as any)
      return [`${s.firstName ?? ''} ${s.lastName ?? ''}`, s.nickname, s.studentId, s.major]
        .some(v => v?.toLowerCase().includes(q))
    })
    .sort((a, b) => getAttendeeName(a.participantSnapshot).localeCompare(getAttendeeName(b.participantSnapshot)))
})

const loadData = async (silent = false) => {
  if (silent) isRefreshing.value = true
  else isLoading.value = true
  errorMessage.value = ''

  try {
    const [eventData, registrantData] = await Promise.all([
      EventService.getEventById(eventId),
      AttendanceService.getRegistrants(eventId)
    ])
    event.value = eventData as unknown as AttendanceEvent
    registrants.value = registrantData
  } catch (error) {
    console.error('Failed to load check-in data:', error)
    if (silent) showAlert('Error', 'Could not refresh the participant list.', 'red')
    else errorMessage.value = getApiErrorMessage(error, 'Could not load participants for this event.')
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

const applyCheckInResult = (result: CheckInResult) => {
  const target = registrants.value.find(
    r => r.id === result.registrationId || (!!result.ticketId && r.ticketId === result.ticketId)
  )
  if (target) target.checkedInAt = result.checkedInAt
  else loadData(true)
}

// --- Manual toggle ---

const applyManualCheckIn = async (registrant: AttendanceRegistrant, checkedIn: boolean) => {
  pendingIds.value.push(registrant.id)
  const previous = registrant.checkedInAt
  registrant.checkedInAt = checkedIn ? new Date().toISOString() : null // optimistic

  try {
    const result = await AttendanceService.setCheckIn(eventId, registrant.id, checkedIn)
    registrant.checkedInAt = result.checkedInAt
  } catch (error) {
    registrant.checkedInAt = previous
    showAlert('Error', getApiErrorMessage(error, 'Could not update attendance. Please try again.'), 'red')
  } finally {
    pendingIds.value = pendingIds.value.filter(id => id !== registrant.id)
  }
}

const handleToggle = (registrant: AttendanceRegistrant) => {
  if (!canCheckIn.value) {
    return showAlert('Check-In Closed', 'Attendance can only be changed for upcoming or ongoing events.', 'red')
  }

  if (registrant.checkedInAt) {
    confirmState.value = {
      show: true,
      title: 'Undo Check-In',
      description: `Mark ${getAttendeeName(registrant.participantSnapshot)} as not checked in?`,
      confirmText: 'Undo',
      theme: 'red',
      onConfirm: () => {
        confirmState.value.show = false
        applyManualCheckIn(registrant, false)
      }
    }
  } else {
    applyManualCheckIn(registrant, true)
  }
}

// --- QR scan ---

const openScanner = () => {
  if (!canCheckIn.value) {
    return showAlert('Check-In Closed', 'Scanning is only available for upcoming or ongoing events.', 'red')
  }
  showScanner.value = true
}

const submitScan = async (qrToken: string): Promise<ScanOutcome> => {
  try {
    const result = await AttendanceService.checkInByQr(eventId, qrToken)
    applyCheckInResult(result)
    return {
      status: 'success',
      title: 'Checked In!',
      message: `${getAttendeeName(result.participantSnapshot)} is now checked in.`
    }
  } catch (error: any) {
    if (!error?.response) {
      return { status: 'error', title: 'Network Error', message: 'Could not reach the server. Check your connection.' }
    }
    if (error.response.status === 409) {
      return { status: 'warning', title: 'Already Checked In', message: getApiErrorMessage(error, 'This ticket has already been used.') }
    }
    return { status: 'error', title: 'Invalid Ticket', message: getApiErrorMessage(error, 'This ticket is not valid for this event.') }
  }
}

const goBack = () => {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'check-in' })
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
      <p class="text-[#131B2B]/70 text-sm mt-4 font-bold tracking-widest uppercase">Loading participants...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-5 rounded-xl border border-red-200 text-sm font-bold text-center shadow-sm">
      {{ errorMessage }}
      <button @click="loadData()" class="block mx-auto mt-3 text-xs font-black uppercase tracking-widest underline cursor-pointer">Retry</button>
    </div>

    <template v-else-if="event">
      <div class="mb-6 border-b border-[#131B2B]/10 pb-4">
        <EventStatusBadge :status="event.status" />
        <h1 class="text-2xl font-['Nunito'] font-black text-[#131B2B] tracking-tight leading-tight mt-2">{{ getEventTitle(event) }}</h1>
        <p class="text-sm font-semibold text-[#131B2B]/70 mt-1.5">{{ formatEventDate(event.startAt) }}</p>
      </div>

      <div v-if="!canCheckIn" class="mb-5 bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-4 text-sm font-bold text-[#131B2B]/80">
        Check-in is only available for upcoming or ongoing events. This list is read-only.
      </div>

      <!-- Attendance summary -->
      <div class="bg-white p-5 rounded-2xl border border-[#131B2B]/10 shadow-sm mb-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-xs font-black text-[#131B2B]/70 uppercase tracking-widest">Attendance</h2>
            <p class="mt-1.5">
              <span class="text-3xl font-['Nunito'] font-black text-[#131B2B]">{{ checkedInCount }}</span>
              <span class="text-sm font-bold text-[#131B2B]/60"> / {{ confirmedRegistrants.length }} checked in</span>
            </p>
          </div>
          <button
            @click="loadData(true)"
            :disabled="isRefreshing"
            aria-label="Refresh"
            class="w-9 h-9 rounded-full border border-[#131B2B]/10 bg-white text-[#131B2B]/70 hover:text-[#131B2B] hover:bg-[#131B2B]/5 flex items-center justify-center shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': isRefreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>
        <div class="mt-4 h-2.5 w-full bg-[#131B2B]/10 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" :style="{ width: `${attendancePercent}%` }"></div>
        </div>
        <p class="text-xs font-bold text-[#131B2B]/60 mt-2">{{ attendancePercent }}% of registered participants</p>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-[#131B2B]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search name, nickname or student ID"
          class="w-full text-sm border border-[#131B2B]/10 rounded-3xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#131B2B] bg-white shadow-sm transition-all text-[#131B2B] font-semibold"
        />
      </div>

      <!-- Filters -->
      <div class="flex gap-3 mb-5 overflow-x-auto scrollbar-hide py-1">
        <button
          v-for="f in filters"
          :key="f"
          @click="activeFilter = f"
          class="shrink-0 flex items-center gap-2 py-2.5 px-5 text-sm font-bold rounded-full transition-all tracking-tight cursor-pointer"
          :class="activeFilter === f
            ? 'bg-[#131B2B] text-white shadow-md border border-[#131B2B]'
            : 'bg-white border border-[#131B2B]/20 text-[#131B2B]/70 hover:bg-[#131B2B]/5 hover:text-[#131B2B]'"
        >
          {{ f }}
          <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md" :class="activeFilter === f ? 'bg-white/20' : 'bg-[#131B2B]/5'">
            {{ filterCounts[f] }}
          </span>
        </button>
      </div>

      <!-- List -->
      <div v-if="confirmedRegistrants.length === 0" class="text-center py-16 bg-white rounded-xl border border-[#131B2B]/10 shadow-sm">
        <div class="w-14 h-14 bg-[#131B2B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-[#131B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <p class="text-sm font-bold text-[#131B2B]/70">No participants have registered yet.</p>
      </div>

      <div v-else-if="visibleRegistrants.length === 0" class="text-center py-12 bg-white rounded-xl border border-[#131B2B]/10 shadow-sm">
        <p class="text-sm font-bold text-[#131B2B]/70">No participants match your search.</p>
      </div>

      <div v-else class="space-y-3">
        <ParticipantCheckInRow
          v-for="r in visibleRegistrants"
          :key="r.id"
          :registrant="r"
          :pending="pendingIds.includes(r.id)"
          :disabled="!canCheckIn"
          @toggle="handleToggle(r)"
        />
      </div>
    </template>

    <!-- Bottom actions -->
    <div v-if="event && !isLoading" class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#131B2B]/10 p-4 flex justify-center shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.05)] z-40">
      <div class="max-w-3xl w-full flex justify-center gap-4 px-5 md:px-0">
        <button
          @click="router.push({ name: 'check-in-analytics', params: { eventId } })"
          class="flex-1 sm:w-48 bg-white border border-[#131B2B]/10 hover:bg-[#131B2B]/5 text-[#131B2B] py-3 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Analytics
        </button>
        <button
          @click="openScanner"
          :disabled="!canCheckIn"
          class="flex-1 sm:w-48 bg-[#131B2B] hover:bg-[#131B2B]/80 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M4 12h16"></path>
          </svg>
          Check-In
        </button>
      </div>
    </div>

    <QrScannerModal
      v-if="showScanner && event"
      :event-title="getEventTitle(event)"
      :submit="submitScan"
      @close="showScanner = false"
    />

    <ConfirmModal v-if="alertState.show" :title="alertState.title" :description="alertState.description" :confirmTheme="alertState.theme" confirmText="OK" @confirm="alertState.show = false" />
    <ConfirmModal v-if="confirmState.show" :title="confirmState.title" :description="confirmState.description" :confirmTheme="confirmState.theme" :confirmText="confirmState.confirmText" cancelText="Cancel" @cancel="confirmState.show = false" @confirm="confirmState.onConfirm" />
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>