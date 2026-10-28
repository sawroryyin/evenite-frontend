<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EventService } from '../../services/EventService'
import {
  type AttendanceEvent,
  getEventTitle,
  formatEventDate
} from '../../services/AttendanceService'
import {
  AnalyticsService,
  type AnalyticsRange,
  type EventAnalytics,
  formatPercent
} from '../../services/AnalyticService'
import { useRealtime } from '../../composables/useRealTime'
import EventStatusBadge from '../../components/attendance/EventStatusBadge.vue'
import StatRing from '../../components/attendance/StatRing.vue'
import CheckInTimeline from '../../components/attendance/CheckInTimeline.vue'
import FormFieldStatsCard from '../../components/attendance/FormFieldStatsCard.vue'

type FormTab = 'REGISTRATION' | 'FEEDBACK'

const route = useRoute()
const router = useRouter()
const eventId = route.params.eventId as string

const event = ref<AttendanceEvent | null>(null)
const analytics = ref<EventAnalytics | null>(null)
const range = ref<AnalyticsRange>('24h')

const isLoading = ref(true)
const isRefreshing = ref(false)
const isRangeLoading = ref(false)
const errorMessage = ref('')

// UC-028 I3 / network
const loadErrorMessage = (error: any) =>
  !error?.response
    ? 'Could not reach the server. Check your connection.'
    : 'Could not load analytics for this event.'

const loadAll = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [eventData, analyticsData] = await Promise.all([
      EventService.getEventById(eventId),
      AnalyticsService.getEventAnalytics(eventId, range.value)
    ])
    event.value = eventData as unknown as AttendanceEvent
    analytics.value = analyticsData
  } catch (error) {
    console.error('Failed to load analytics:', error)
    errorMessage.value = loadErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

// refetch analytics only (event header doesn't change)
let requestId = 0
const refreshAnalytics = async (mode: 'manual' | 'range' | 'background' = 'manual') => {
  const id = ++requestId
  if (mode === 'manual') isRefreshing.value = true
  if (mode === 'range') isRangeLoading.value = true
  try {
    const data = await AnalyticsService.getEventAnalytics(eventId, range.value)
    if (id === requestId) analytics.value = data // ignore out-of-order responses
  } catch (error) {
    console.error('Failed to refresh analytics:', error)
    // SRS-162: show the error state with Retry for user-triggered retrievals;
    // background (realtime) refreshes stay silent
    if (id === requestId && mode !== 'background') {
      errorMessage.value = loadErrorMessage(error)
    }
  } finally {
    if (id === requestId) {
      isRefreshing.value = false
      isRangeLoading.value = false
    }
  }
}

const changeRange = (value: AnalyticsRange) => {
  if (value === range.value) return
  range.value = value
  refreshAnalytics('range')
}

// ---------- Realtime: the server only nudges, we refetch (debounced) ----------

let nudgeTimer: ReturnType<typeof setTimeout> | null = null
const scheduleRefresh = () => {
  if (nudgeTimer) clearTimeout(nudgeTimer)
  nudgeTimer = setTimeout(() => refreshAnalytics('background'), 1000)
}

useRealtime(
  {
    'analytics:changed': (p: any) => {
      if (p.eventId === eventId) scheduleRefresh()
    }
  },
  scheduleRefresh
)

// ---------- Derived ----------

const overview = computed(() => analytics.value?.overview)
const isConcluded = computed(() => event.value?.status === 'CONCLUDED')

const quickStats = computed(() => {
  const o = overview.value
  if (!o) return []
  return [
    { label: 'Registered', value: o.registered },
    { label: 'Checked in', value: o.checkedIn },
    { label: isConcluded.value ? 'No-show' : 'Not yet', value: o.notCheckedIn },
    { label: 'Cancelled', value: o.cancelled }
  ]
})

const methods = computed(() => analytics.value?.checkInMethods ?? { QR_SCAN: 0, MANUAL: 0 })
const methodTotal = computed(() => methods.value.QR_SCAN + methods.value.MANUAL)
const qrShare = computed(() => (methodTotal.value ? (methods.value.QR_SCAN / methodTotal.value) * 100 : 0))

// ---------- Forms ----------

const registrationFields = computed(() => analytics.value?.registrationAnswers ?? [])
const hasRegistrationForm = computed(() => registrationFields.value.length > 0)
const feedback = computed(() => analytics.value?.feedback ?? null)

// every CONFIRMED registration submitted the registration form
const registrationResponses = computed(() => overview.value?.registered ?? 0)

const formTab = ref<FormTab>('REGISTRATION')
const formTabs = computed(() => [
  { value: 'REGISTRATION' as const, label: 'Registration', available: hasRegistrationForm.value },
  { value: 'FEEDBACK' as const, label: 'Feedback', available: !!feedback.value }
])

const activeFields = computed(() =>
  formTab.value === 'REGISTRATION' ? registrationFields.value : feedback.value?.fields ?? []
)
const activeResponses = computed(() =>
  formTab.value === 'REGISTRATION' ? registrationResponses.value : feedback.value?.responses ?? 0
)
const activeAvailable = computed(() =>
  formTab.value === 'REGISTRATION' ? hasRegistrationForm.value : !!feedback.value
)

const openResponses = (type: FormTab) => {
  if (type === 'REGISTRATION' && !hasRegistrationForm.value) return
  if (type === 'FEEDBACK' && !feedback.value) return
  router.push(`/events/${eventId}/forms/${type}/responses`)
}

const goBack = () => {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'check-in' })
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  loadAll()
})

onBeforeUnmount(() => {
  if (nudgeTimer) clearTimeout(nudgeTimer)
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
      <button @click="loadAll()" class="block mx-auto mt-3 text-xs font-black uppercase tracking-widest underline cursor-pointer">Retry</button>
    </div>

    <template v-else-if="event && analytics && overview">
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
          @click="refreshAnalytics('manual')"
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
          :value="overview.registered"
          :total="overview.seatLimit"
          valueLabel="Registered"
          totalLabel="Total seats"
          color="#131B2B"
        />
        <StatRing
          title="Attendance"
          :value="overview.checkedIn"
          :total="overview.registered"
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

      <!-- Timeline -->
      <div class="mb-5">
        <CheckInTimeline
          :check-in-timeline="analytics.checkInTimeline"
          :registration-timeline="analytics.registrationTimeline"
          :range="range"
          :time-zone="analytics.timeZone"
          :generated-at="analytics.generatedAt"
          :loading="isRangeLoading"
          @update:range="changeRange"
        />
      </div>

      <!-- Check-in methods -->
      <div class="bg-white p-5 rounded-2xl border border-[#131B2B]/10 shadow-sm mb-5">
        <h3 class="text-base font-['Nunito'] font-black text-[#131B2B] mb-3">Check-in Method</h3>
        <div v-if="methodTotal === 0" class="text-sm font-semibold text-[#131B2B]/50">No check-ins recorded yet.</div>
        <template v-else>
          <div class="h-2.5 w-full bg-[#131B2B]/10 rounded-full overflow-hidden flex">
            <div class="h-full bg-[#131B2B] transition-all duration-500" :style="{ width: `${qrShare}%` }"></div>
            <div class="h-full bg-[#F26E22] transition-all duration-500" :style="{ width: `${100 - qrShare}%` }"></div>
          </div>
          <div class="flex justify-between mt-2.5 text-xs font-bold text-[#131B2B]">
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#131B2B]"></span>QR scan · {{ methods.QR_SCAN }}</span>
            <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#F26E22]"></span>Manual · {{ methods.MANUAL }}</span>
          </div>
        </template>
      </div>

      <!-- Form responses -->
      <div class="bg-white p-5 rounded-2xl border border-[#131B2B]/10 shadow-sm">
        <h3 class="text-base font-['Nunito'] font-black text-[#131B2B] mb-3">Form Responses</h3>

                <!-- Overview -->
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="min-w-0 bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-2.5 sm:p-3">
            <p class="text-[9px] sm:text-[10px] font-black text-[#131B2B]/60 uppercase tracking-wider truncate">Registration</p>
            <p class="text-lg font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">
              {{ hasRegistrationForm ? registrationResponses : '—' }}
            </p>
          </div>
          <div class="min-w-0 bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-2.5 sm:p-3">
            <p class="text-[9px] sm:text-[10px] font-black text-[#131B2B]/60 uppercase tracking-wider truncate">Feedback</p>
            <p class="text-lg font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">
              {{ feedback ? feedback.responses : '—' }}
            </p>
          </div>
          <div class="min-w-0 bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-2.5 sm:p-3">
            <p class="text-[9px] sm:text-[10px] font-black text-[#131B2B]/60 uppercase tracking-wider truncate">Fb. rate</p>
            <p class="text-lg font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">{{ formatPercent(feedback?.responseRate) }}</p>
            <p class="text-[10px] font-semibold text-[#131B2B]/60 leading-tight">of checked-in</p>
          </div>
        </div>

        <!-- Form tabs -->
        <div class="flex bg-[#131B2B]/5 border border-[#131B2B]/10 p-1 rounded-xl mb-4">
          <button
            v-for="t in formTabs"
            :key="t.value"
            @click="formTab = t.value"
            class="flex-1 py-2 rounded-lg text-xs font-black tracking-wide cursor-pointer transition-colors"
            :class="formTab === t.value ? 'bg-[#131B2B] text-white shadow-sm' : 'text-[#131B2B]/70 hover:text-[#131B2B]'"
          >
            {{ t.label }}
          </button>
        </div>

        <!-- Per-question stats -->
        <div v-if="!activeAvailable" class="text-center py-8 bg-[#131B2B]/5 rounded-xl border border-[#131B2B]/10 text-sm font-semibold text-[#131B2B]/50">
          {{ formTab === 'REGISTRATION' ? 'No Registration Form' : 'No Feedback Form' }}
        </div>
        <div v-else-if="activeResponses === 0" class="text-center py-8 bg-[#131B2B]/5 rounded-xl border border-[#131B2B]/10 text-sm font-semibold text-[#131B2B]/50">
          No responses yet.
        </div>
        <div v-else class="space-y-3">
          <FormFieldStatsCard
            v-for="(field, i) in activeFields"
            :key="field.fieldId"
            :field="field"
            :index="i"
            :responses="activeResponses"
          />
        </div>

        <!-- Navigation to full responses (UC-007) -->
        <div class="mt-4 space-y-3">
          <button
            @click="openResponses('REGISTRATION')"
            :disabled="!hasRegistrationForm"
            class="w-full bg-white hover:bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {{ hasRegistrationForm ? 'Registration Responses' : 'No Registration Form' }}
          </button>

          <button
            @click="openResponses('FEEDBACK')"
            :disabled="!feedback"
            class="w-full bg-white hover:bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            {{ feedback ? 'Feedback Responses' : 'No Feedback Form' }}
          </button>
        </div>
      </div>
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