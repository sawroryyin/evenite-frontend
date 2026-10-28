<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AnalyticsRange, AnalyticsTimeline } from '../../services/AnalyticService'

// Column chart for the backend's analytics timelines.
// The backend already decides the window:
//   timelineEnd = min(now, event end)   (event end = endAt, or startAt + 24h when endAt is empty)
// For 'all', the backend picks hourly buckets when the activity spans <= 48h, otherwise daily.

const props = defineProps<{
  checkInTimeline: AnalyticsTimeline
  registrationTimeline: AnalyticsTimeline
  range: AnalyticsRange
  timeZone: string
  generatedAt: string
  loading?: boolean
}>()

const emit = defineEmits<{ (e: 'update:range', value: AnalyticsRange): void }>()

const ranges: { value: AnalyticsRange; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: 'all', label: 'All' }
]

const metrics = [
  { value: 'registration', label: 'Registrations' },
  { value: 'checkIn', label: 'Check-ins' }
] as const
const metric = ref<(typeof metrics)[number]['value']>('registration')

const timeline = computed(() =>
  metric.value === 'checkIn' ? props.checkInTimeline : props.registrationTimeline
)
const points = computed(() => timeline.value?.points ?? [])
const isHourly = computed(() => timeline.value?.bucket === '1h')

// ---------- Formatting (in the analytics time zone, e.g. Asia/Bangkok) ----------

const fmt = computed(() => {
  const timeZone = props.timeZone || undefined
  return {
    hour: new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    hourShort: new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', hourCycle: 'h23' }),
    day: new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'short' }),
    dayShort: new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric' }),
    weekday: new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', day: 'numeric', month: 'short' }),
    full: new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  }
})

const HOUR_MS = 60 * 60 * 1000

const bucketLabel = (iso: string) => {
  const d = new Date(iso)
  if (!isHourly.value) return fmt.value.weekday.format(d)
  const end = new Date(d.getTime() + HOUR_MS)
  return `${fmt.value.day.format(d)}, ${fmt.value.hour.format(d)}–${fmt.value.hour.format(end)}`
}

const axisLabel = (iso: string) => {
  const d = new Date(iso)
  if (isHourly.value) return fmt.value.hourShort.format(d)
  // few daily columns -> "23 Oct", many -> "23"
  return points.value.length <= 10 ? fmt.value.day.format(d) : fmt.value.dayShort.format(d)
}

const peakLabel = (iso: string) =>
  isHourly.value ? fmt.value.hour.format(new Date(iso)) : fmt.value.day.format(new Date(iso))

// aim for ~6 labels whatever the range (24h, 7d, 30d or a variable-length 'all')
const labelStep = computed(() => {
  const n = points.value.length
  if (n <= 8) return 1
  return Math.ceil(n / 6)
})
const showAxisLabel = (i: number) => (points.value.length - 1 - i) % labelStep.value === 0

// ---------- Stats ----------

const maxCount = computed(() => Math.max(1, ...points.value.map(p => p.count)))
const totalInRange = computed(() => points.value.reduce((sum, p) => sum + p.count, 0))
const overallTotal = computed(() => points.value[points.value.length - 1]?.cumulative ?? 0)

const peak = computed(() =>
  points.value.reduce<(typeof points.value)[number] | null>(
    (best, p) => (p.count > 0 && (!best || p.count > best.count) ? p : best),
    null
  )
)

const hasEnded = computed(() => {
  const end = new Date(timeline.value?.timelineEnd ?? 0).getTime()
  return end < new Date(props.generatedAt).getTime() - 1000
})

const windowCaption = computed(() => {
  const end = timeline.value?.timelineEnd
  if (!end) return ''
  return hasEnded.value
    ? `Up to event end · ${fmt.value.full.format(new Date(end))}`
    : `Up to now · ${fmt.value.full.format(new Date(end))}`
})

const unit = computed(() => (metric.value === 'checkIn' ? 'check-in' : 'registration'))
const plural = (n: number) => `${n} ${unit.value}${n === 1 ? '' : 's'}`

// UC-028 D9: empty columns + "No check-ins in this period."
const emptyMessage = computed(() =>
  metric.value === 'checkIn' ? 'No check-ins in this period.' : 'No registrations in this period.'
)

// ---------- Selection ----------

// remembered by bucketStart (not index) so background refreshes never move it
const selectedKey = ref<string | null>(null)

const toggleSelect = (bucketStart: string) => {
  selectedKey.value = selectedKey.value === bucketStart ? null : bucketStart
}

watch([metric, () => props.range, points], () => {
  if (selectedKey.value && !points.value.some(p => p.bucketStart === selectedKey.value)) {
    selectedKey.value = null
  }
})

const selectedPoint = computed(() =>
  selectedKey.value ? points.value.find(p => p.bucketStart === selectedKey.value) ?? null : null
)
const selected = computed(() => selectedPoint.value ?? points.value[points.value.length - 1] ?? null)
const isSelected = (bucketStart: string) => selectedKey.value === bucketStart

const barHeight = (count: number) => (count ? `${Math.max((count / maxCount.value) * 100, 4)}%` : '0%')
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-[#131B2B]/10 shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 mb-3">
      <h3 class="text-base font-['Nunito'] font-black text-[#131B2B]">Timeline</h3>
      <div class="flex bg-[#131B2B]/5 border border-[#131B2B]/10 p-1 rounded-xl shrink-0">
        <button
          v-for="r in ranges"
          :key="r.value"
          @click="emit('update:range', r.value)"
          :disabled="loading"
          class="px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase cursor-pointer transition-colors disabled:cursor-wait"
          :class="range === r.value ? 'bg-[#131B2B] text-white shadow-sm' : 'text-[#131B2B]/70 hover:text-[#131B2B]'"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Metric toggle -->
    <div class="flex gap-2 mb-4">
      <button
        v-for="m in metrics"
        :key="m.value"
        @click="metric = m.value"
        class="py-1.5 px-3.5 text-xs font-bold rounded-full transition-all cursor-pointer"
        :class="metric === m.value
          ? 'bg-[#131B2B] text-white border border-[#131B2B]'
          : 'bg-white border border-[#131B2B]/20 text-[#131B2B]/70 hover:bg-[#131B2B]/5'"
      >
        {{ m.label }}
      </button>
    </div>

    <div class="transition-opacity" :class="{ 'opacity-50 pointer-events-none': loading }">
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-3">
          <p class="text-[10px] font-black text-[#131B2B]/60 uppercase tracking-widest">In range</p>
          <p class="text-lg font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">{{ totalInRange }}</p>
        </div>
        <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-3 min-w-0">
          <p class="text-[10px] font-black text-[#131B2B]/60 uppercase tracking-widest">Peak</p>
          <template v-if="peak">
            <p class="text-lg font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">{{ peak.count }}</p>
            <p class="text-[10px] font-semibold text-[#131B2B]/60 truncate">{{ peakLabel(peak.bucketStart) }}</p>
          </template>
          <p v-else class="text-lg font-['Nunito'] font-black text-[#131B2B]/40 leading-tight mt-0.5">—</p>
        </div>
        <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-3">
          <p class="text-[10px] font-black text-[#131B2B]/60 uppercase tracking-widest">Total</p>
          <p class="text-lg font-['Nunito'] font-black text-[#131B2B] leading-tight mt-0.5">{{ overallTotal }}</p>
        </div>
      </div>

      <!-- 'all' with no activity at all: the backend returns no points -->
      <div v-if="points.length === 0" class="text-center py-10 bg-[#131B2B]/5 rounded-xl border border-[#131B2B]/10">
        <p class="text-sm font-semibold text-[#131B2B]/50">{{ emptyMessage }}</p>
      </div>

      <template v-else>
        <!-- Selected bucket detail -->
        <div class="flex items-baseline justify-between gap-3 mb-2 min-h-[2.25rem]">
          <div v-if="selected" class="min-w-0">
            <p class="text-xs font-bold text-[#131B2B] truncate">
              {{ bucketLabel(selected.bucketStart) }}
              <span v-if="!selectedPoint" class="text-[#131B2B]/40 font-semibold">· latest</span>
            </p>
            <p class="text-[10px] font-semibold text-[#131B2B]/60">
              Running total {{ selected.cumulative }}
              <span v-if="selectedPoint"> · tap again to clear</span>
            </p>
          </div>
          <p v-if="selected" class="text-sm font-black text-[#131B2B] shrink-0">{{ plural(selected.count) }}</p>
        </div>

        <!-- Columns -->
        <div class="relative h-40 flex items-end gap-[2px] border-b border-[#131B2B]/15">
          <!-- empty columns are still drawn; the message sits on top -->
          <div v-if="totalInRange === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p class="text-sm font-semibold text-[#131B2B]/50 bg-white/80 px-3 py-1 rounded-lg">{{ emptyMessage }}</p>
          </div>
          <button
            v-for="p in points"
            :key="p.bucketStart"
            type="button"
            @click="toggleSelect(p.bucketStart)"
            :aria-pressed="isSelected(p.bucketStart)"
            :aria-label="`${bucketLabel(p.bucketStart)}: ${plural(p.count)}`"
            class="flex-1 h-full flex items-end cursor-pointer group"
          >
            <div
              class="w-full rounded-t-[3px] bar"
              :class="isSelected(p.bucketStart) ? 'bg-[#F26E22]' : 'bg-[#131B2B] group-hover:bg-[#131B2B]/70'"
              :style="{ height: barHeight(p.count) }"
            ></div>
          </button>
        </div>

        <!-- X axis -->
        <div class="flex gap-[2px] mt-1.5">
          <div v-for="(p, i) in points" :key="p.bucketStart" class="flex-1 relative h-4">
            <span
              v-if="showAxisLabel(i)"
              class="absolute left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#131B2B]/50 whitespace-nowrap tabular-nums"
            >
              {{ axisLabel(p.bucketStart) }}
            </span>
          </div>
        </div>

        <p class="text-[10px] font-semibold text-[#131B2B]/50 mt-3">
          {{ windowCaption }} · {{ isHourly ? 'hourly' : 'daily' }} ({{ timeZone }})
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bar { transition: height 0.4s ease-out; }
</style>