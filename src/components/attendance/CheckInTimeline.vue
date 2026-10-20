<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{ checkIns: string[] }>()

interface Bucket { key: number; label: string; count: number; cumulative: number }

const intervals = [5, 15, 30]
const interval = ref(5)
const MAX_FILLED_BUCKETS = 96

const sortedTimes = computed(() =>
  props.checkIns
    .map(t => new Date(t))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())
)

const spansMultipleDays = computed(() => {
  const t = sortedTimes.value
  return t.length > 1 && t[0].toDateString() !== t[t.length - 1].toDateString()
})

const floorToInterval = (date: Date, minutes: number) => {
  const d = new Date(date)
  d.setSeconds(0, 0)
  d.setMinutes(Math.floor(d.getMinutes() / minutes) * minutes)
  return d
}

const formatLabel = (d: Date) => {
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return spansMultipleDays.value
    ? `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`
    : time
}

const buckets = computed<Bucket[]>(() => {
  const times = sortedTimes.value
  if (!times.length) return []

  const step = interval.value * 60_000
  const counts = new Map<number, number>()
  for (const t of times) {
    const key = floorToInterval(t, interval.value).getTime()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let keys = [...counts.keys()].sort((a, b) => a - b)
  const first = keys[0]
  const last = keys[keys.length - 1]

  // fill empty slots between first and last check-in (if range is reasonable)
  if ((last - first) / step + 1 <= MAX_FILLED_BUCKETS) {
    keys = []
    for (let k = first; k <= last; k += step) keys.push(k)
  }

  let running = 0
  return keys.map(key => {
    const count = counts.get(key) ?? 0
    running += count
    return { key, label: formatLabel(new Date(key)), count, cumulative: running }
  })
})

const maxCount = computed(() => Math.max(1, ...buckets.value.map(b => b.count)))

const peak = computed(() =>
  buckets.value.reduce<Bucket | null>((best, b) => (!best || b.count > best.count ? b : best), null)
)

const firstCheckIn = computed(() => (sortedTimes.value.length ? formatLabel(sortedTimes.value[0]) : '—'))
const lastCheckIn = computed(() =>
  sortedTimes.value.length ? formatLabel(sortedTimes.value[sortedTimes.value.length - 1]) : '—'
)

const barWidth = (count: number) => (count ? `${Math.max((count / maxCount.value) * 100, 6)}%` : '0%')
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-[#131B2B]/10 shadow-sm">
    <div class="flex items-center justify-between gap-3 mb-4">
      <h3 class="text-base font-['Nunito'] font-black text-[#131B2B]">Check-in Timeline</h3>
      <div class="flex bg-[#131B2B]/5 border border-[#131B2B]/10 p-1 rounded-xl shrink-0">
        <button
          v-for="m in intervals"
          :key="m"
          @click="interval = m"
          class="px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase cursor-pointer transition-colors"
          :class="interval === m ? 'bg-[#131B2B] text-white shadow-sm' : 'text-[#131B2B]/70 hover:text-[#131B2B]'"
        >
          {{ m }}m
        </button>
      </div>
    </div>

    <div v-if="buckets.length === 0" class="text-center py-10 bg-[#131B2B]/5 rounded-xl border border-[#131B2B]/10">
      <p class="text-sm font-semibold text-[#131B2B]/50">No check-ins recorded yet.</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-3 gap-2 mb-5">
        <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-3">
          <p class="text-[10px] font-black text-[#131B2B]/60 uppercase tracking-widest">First</p>
          <p class="text-xs font-bold text-[#131B2B] mt-1">{{ firstCheckIn }}</p>
        </div>
        <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-3">
          <p class="text-[10px] font-black text-[#131B2B]/60 uppercase tracking-widest">Peak</p>
          <p class="text-xs font-bold text-[#131B2B] mt-1">{{ peak?.label }}</p>
          <p class="text-[10px] font-semibold text-[#131B2B]/60">{{ peak?.count }} people</p>
        </div>
        <div class="bg-[#131B2B]/5 border border-[#131B2B]/10 rounded-xl p-3">
          <p class="text-[10px] font-black text-[#131B2B]/60 uppercase tracking-widest">Latest</p>
          <p class="text-xs font-bold text-[#131B2B] mt-1">{{ lastCheckIn }}</p>
        </div>
      </div>

      <div class="max-h-80 overflow-y-auto custom-scrollbar pr-1 space-y-2">
        <div v-for="b in buckets" :key="b.key" class="flex items-center gap-3">
          <span
            class="shrink-0 text-xs font-bold text-[#131B2B]/70 text-right tabular-nums"
            :class="spansMultipleDays ? 'w-28' : 'w-16'"
          >
            {{ b.label }}
          </span>
          <div class="flex-1 h-7 bg-[#131B2B]/5 rounded-lg overflow-hidden">
            <div class="h-full rounded-lg bg-[#131B2B] bar" :style="{ width: barWidth(b.count) }"></div>
          </div>
          <div class="w-20 shrink-0 leading-tight">
            <p class="text-xs font-bold text-[#131B2B]">{{ b.count }} {{ b.count === 1 ? 'person' : 'people' }}</p>
            <p class="text-[10px] font-semibold text-[#131B2B]/50">Total {{ b.cumulative }}</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.bar { transition: width 0.5s ease-out; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(19, 27, 43, 0.2); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(19, 27, 43, 0.4); }
</style>