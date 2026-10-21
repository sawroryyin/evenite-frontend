<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventService } from '../../services/EventService'
import {
  AttendanceService,
  AttendanceErrorCode,
  type AttendanceEvent,
  type AttendanceListItem,
  type AttendeeSnapshot,
  type CheckInResult,
  type ScanOutcome,
  getApiErrorMessage,
  getApiErrorCode,
  getExistingCheckIn,
  toAttendanceRecord,
  getAttendeeName,
  getEventTitle,
  formatEventDate,
  formatClock,
  isValidQrToken,
  CHECK_IN_OPEN_STATUSES
} from '../../services/AttendanceService'
import { useRealtime } from '../../composables/useRealTime'
import ConfirmModal from '../../components/ConfirmModal.vue'
import EventStatusBadge from '../../components/attendance/EventStatusBadge.vue'
import ParticipantCheckInRow from '../../components/attendance/ParticipantCheckInRow.vue'

// lazy-load so the QR decoder is only downloaded when the scanner opens
const QrScannerModal = defineAsyncComponent(() => import('../../components/attendance/QrScannerModal.vue'))

const route = useRoute()
const router = useRouter()
const eventId = route.params.eventId as string

const event = ref<AttendanceEvent | null>(null)
const items = ref<AttendanceListItem[]>([])
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

// ---------- Derived state ----------

const canCheckIn = computed(() => !!event.value && CHECK_IN_OPEN_STATUSES.includes(event.value.status))
const checkedInCount = computed(() => items.value.filter(i => i.attendance).length)
const attendancePercent = computed(() =>
  items.value.length ? Math.round((checkedInCount.value / items.value.length) * 100) : 0
)

const filterCounts = computed<Record<string, number>>(() => ({
  'All': items.value.length,
  'Not yet': items.value.length - checkedInCount.value,
  'Checked in': checkedInCount.value
}))

const visibleItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return items.value
    .filter(i => {
      if (activeFilter.value === 'Checked in') return !!i.attendance
      if (activeFilter.value === 'Not yet') return !i.attendance
      return true
    })
    .filter(i => {
      if (!q) return true
      const s: AttendeeSnapshot = i.participantSnapshot || {}
      return [`${s.firstName ?? ''} ${s.lastName ?? ''}`, s.nickname, s.studentId, s.major]
        .some(v => typeof v === 'string' && v.toLowerCase().includes(q))
    })
    .sort((a, b) => getAttendeeName(a.participantSnapshot).localeCompare(getAttendeeName(b.participantSnapshot)))
})

// ---------- Loading ----------

const loadData = async ({ silent = false, quiet = false } = {}) => {
  if (silent) isRefreshing.value = true
  else isLoading.value = true
  if (!silent) errorMessage.value = ''

  try {
    const [eventData, list] = await Promise.all([
      EventService.getEventById(eventId),
      AttendanceService.getAttendanceList(eventId)
    ])
    event.value = eventData as unknown as AttendanceEvent
    items.value = list.items
  } catch (error) {
    console.error('Failed to load check-in data:', error)
    if (!silent) errorMessage.value = getApiErrorMessage(error, 'Could not load participants for this event.')
    else if (!quiet) showAlert('Error', 'Could not refresh the participant list.', 'red')
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

// background refetch (debounced) when something changed that we can't patch locally
let refreshTimer: ReturnType<typeof setTimeout> | null = null
const scheduleRefresh = () => {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => loadData({ silent: true, quiet: true }), 800)
}

const findItem = (registrationId: string) => items.value.find(i => i.registrationId === registrationId)

const markCheckedIn = (result: CheckInResult) => {
  const item = findItem(result.registrationId)
  if (!item) return scheduleRefresh()
  item.attendance = toAttendanceRecord(result)
  item.ticket.status = 'USED'
}

// ---------- Realtime (other devices / co-organizers) ----------

useRealtime(
  {
    'attendance:checkedIn': (p: any) => {
      if (p.eventId !== eventId) return
      const item = findItem(p.registrationId)
      if (!item) return scheduleRefresh()
      item.attendance = { id: p.attendanceId, method: p.method, checkedInAt: p.checkedInAt }
      item.ticket.status = 'USED'
    },
    'attendance:undone': (p: any) => {
      if (p.eventId !== eventId) return
      const item = findItem(p.registrationId)
      if (!item) return scheduleRefresh()
      item.attendance = null
      item.ticket.status = 'ACTIVE'
    },
    // a participant registered or cancelled -> list changed
    'analytics:changed': (p: any) => {
      if (p.eventId === eventId && p.reason === 'registration') scheduleRefresh()
    }
  },
  scheduleRefresh
)

// ---------- Manual check-in / undo ----------

const setPending = (id: string, on: boolean) => {
  pendingIds.value = on ? [...pendingIds.value, id] : pendingIds.value.filter(x => x !== id)
}

const manualCheckIn = async (item: AttendanceListItem) => {
  setPending(item.registrationId, true)
  const previous = item.attendance
  // optimistic; the toggle stays disabled until the real record arrives
  item.attendance = { id: '', method: 'MANUAL', checkedInAt: new Date().toISOString() }

  try {
    markCheckedIn(await AttendanceService.checkInManually(eventId, item.registrationId))
  } catch (error) {
    const existing = getExistingCheckIn(error)
    if (existing) {
      markCheckedIn(existing)
      showAlert('Already Checked In', `${getAttendeeName(item.participantSnapshot)} was already checked in at ${formatClock(existing.checkedInAt)}.`)
    } else {
      item.attendance = previous
      showAlert('Error', getApiErrorMessage(error, 'Could not check in this participant. Please try again.'), 'red')
    }
  } finally {
    setPending(item.registrationId, false)
  }
}

const undoCheckIn = async (item: AttendanceListItem) => {
  const record = item.attendance
  if (!record?.id) return

  setPending(item.registrationId, true)
  item.attendance = null // optimistic

  try {
    const updated = await AttendanceService.undoCheckIn(eventId, record.id)
    item.attendance = updated.attendance
    item.ticket = updated.ticket
  } catch (error) {
    const code = getApiErrorCode(error)
    if (code === AttendanceErrorCode.ATTENDANCE_NOT_FOUND) {
      // already undone on another device
      item.ticket.status = 'ACTIVE'
    } else {
      item.attendance = record
      showAlert(
        code === AttendanceErrorCode.FEEDBACK_ALREADY_SUBMITTED ? 'Cannot Undo' : 'Error',
        getApiErrorMessage(error, 'Could not undo the check-in. Please try again.'),
        'red'
      )
    }
  } finally {
    setPending(item.registrationId, false)
  }
}

const handleToggle = (item: AttendanceListItem) => {
  if (!canCheckIn.value) {
    return showAlert('Check-In Closed', 'Attendance can only be changed for upcoming or ongoing events.', 'red')
  }

  if (!item.attendance && item.ticket.status !== 'ACTIVE') return // expired / cancelled ticket

  if (item.attendance) {
    confirmState.value = {
      show: true,
      title: 'Undo Check-In',
      description: `Mark ${getAttendeeName(item.participantSnapshot)} as not checked in?`,
      confirmText: 'Undo',
      theme: 'red',
      onConfirm: () => {
        confirmState.value.show = false
        undoCheckIn(item)
      }
    }
  } else {
    manualCheckIn(item)
  }
}

// ---------- QR scan ----------

const openScanner = () => {
  if (!canCheckIn.value) {
    return showAlert('Check-In Closed', 'Scanning is only available for upcoming or ongoing events.', 'red')
  }
  showScanner.value = true
}

const submitScan = async (qrToken: string): Promise<ScanOutcome> => {
  if (!isValidQrToken(qrToken)) {
    return { status: 'error', title: 'Invalid QR Code', message: 'This QR code is not an Evenite ticket.' }
  }

  try {
    const result = await AttendanceService.checkInByQr(eventId, qrToken)
    markCheckedIn(result)
    return {
      status: 'success',
      title: 'Checked In!',
      message: `${getAttendeeName(result.participantSnapshot)} is now checked in.`
    }
  } catch (error: any) {
    if (!error?.response) {
      return { status: 'error', title: 'Network Error', message: 'Could not reach the server. Check your connection.' }
    }

    const existing = getExistingCheckIn(error)
    if (existing) {
      markCheckedIn(existing)
      return {
        status: 'warning',
        title: 'Already Checked In',
        message: `${getAttendeeName(existing.participantSnapshot)} was already checked in at ${formatClock(existing.checkedInAt)}.`
      }
    }

    const message = getApiErrorMessage(error, 'This ticket is not valid for this event.')
    switch (getApiErrorCode(error)) {
      case AttendanceErrorCode.TICKET_NOT_FOUND:
        return { status: 'error', title: 'Invalid Ticket', message: 'This ticket does not belong to this event.' }
      case AttendanceErrorCode.TICKET_CANCELLED:
        return { status: 'error', title: 'Ticket Cancelled', message }
      case AttendanceErrorCode.TICKET_EXPIRED:
        return { status: 'error', title: 'Ticket Expired', message }
      case AttendanceErrorCode.EVENT_NOT_CHECKABLE:
        return { status: 'error', title: 'Check-In Closed', message }
      default:
        return { status: 'error', title: 'Check-In Failed', message }
    }
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

onBeforeUnmount(() => {
  if (refreshTimer) clearTimeout(refreshTimer)
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
      <div class="mb-6 border-b border-[#131B2B]/10 pb-4 flex items-start justify-between gap-3">
        <div class="min-w-0">
            <EventStatusBadge :status="event.status" />
            <h1 class="text-2xl font-['Nunito'] font-black text-[#131B2B] tracking-tight leading-tight mt-2">{{ getEventTitle(event) }}</h1>
            <p class="text-sm font-semibold text-[#131B2B]/70 mt-1.5">{{ formatEventDate(event.startAt) }}</p>
        </div>
        <button
            @click="router.push({ name: 'check-in-analytics', params: { eventId } })"
            aria-label="View analytics"
            class="shrink-0 flex items-center gap-1.5 bg-white border border-[#131B2B]/10 hover:bg-[#131B2B]/5 text-[#131B2B] px-3 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Analytics
        </button>
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
              <span class="text-sm font-bold text-[#131B2B]/60"> / {{ items.length }} checked in</span>
            </p>
          </div>
          <button
            @click="loadData({ silent: true })"
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
      <div v-if="items.length === 0" class="text-center py-16 bg-white rounded-xl border border-[#131B2B]/10 shadow-sm">
        <div class="w-14 h-14 bg-[#131B2B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-[#131B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <p class="text-sm font-bold text-[#131B2B]/70">No participants have registered yet.</p>
      </div>

      <div v-else-if="visibleItems.length === 0" class="text-center py-12 bg-white rounded-xl border border-[#131B2B]/10 shadow-sm">
        <p class="text-sm font-bold text-[#131B2B]/70">No participants match your search.</p>
      </div>

      <div v-else class="space-y-3">
        <ParticipantCheckInRow
          v-for="item in visibleItems"
          :key="item.registrationId"
          :item="item"
          :pending="pendingIds.includes(item.registrationId)"
          :disabled="!canCheckIn"
          @toggle="handleToggle(item)"
        />
      </div>
    </template>

    <!-- Bottom action: scan only -->
    <div v-if="event && !isLoading" class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#131B2B]/10 p-4 flex justify-center shadow-[0_-8px_20px_-5px_rgba(0,0,0,0.05)] z-40">
        <div class="max-w-3xl w-full px-5 md:px-0">
            <button
            @click="openScanner"
            :disabled="!canCheckIn"
            class="w-full bg-[#131B2B] hover:bg-[#131B2B]/80 text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2M4 12h16"></path>
            </svg>
            {{ canCheckIn ? 'Scan Ticket' : 'Check-In Closed' }}
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