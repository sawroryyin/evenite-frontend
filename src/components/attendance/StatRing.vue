<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  value: number
  total: number | null
  valueLabel: string
  totalLabel: string
  color?: string
}>(), { color: '#131B2B' })

const RADIUS = 50
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const hasTotal = computed(() => props.total !== null && props.total > 0)
const ratio = computed(() => (hasTotal.value ? Math.min(props.value / props.total!, 1) : 0))
const percent = computed(() => (hasTotal.value ? Math.round((props.value / props.total!) * 100) : null))
const dashOffset = computed(() => CIRCUMFERENCE * (1 - ratio.value))
</script>

<template>
  <div class="bg-white p-4 sm:p-5 rounded-2xl border border-[#131B2B]/10 shadow-sm flex flex-col items-center text-center">
    <h3 class="text-xs font-black text-[#131B2B]/70 uppercase tracking-widest mb-4">{{ title }}</h3>

    <div class="relative w-28 h-28 sm:w-32 sm:h-32">
      <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
        <circle cx="60" cy="60" :r="RADIUS" fill="none" stroke="rgba(19, 27, 43, 0.08)" stroke-width="11" />
        <circle
          v-if="ratio > 0"
          cx="60" cy="60" :r="RADIUS" fill="none"
          :stroke="color" stroke-width="11" stroke-linecap="round"
          :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="dashOffset"
          class="ring-progress"
        />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="text-2xl sm:text-3xl font-['Nunito'] font-black text-[#131B2B] leading-none">{{ value }}</span>
        <span class="text-[11px] font-bold text-[#131B2B]/60 mt-1">of {{ total ?? '∞' }}</span>
      </div>
    </div>

    <p class="text-sm font-black text-[#131B2B] mt-3">{{ percent !== null ? `${percent}%` : '—' }}</p>

    <div class="mt-3 w-full space-y-1.5 text-left">
      <div class="flex items-center justify-between gap-2 text-[11px] font-bold text-[#131B2B]/80">
        <span class="flex items-center gap-1.5 min-w-0">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: color }"></span>
          <span class="truncate">{{ valueLabel }}</span>
        </span>
        <span class="text-[#131B2B]">{{ value }}</span>
      </div>
      <div class="flex items-center justify-between gap-2 text-[11px] font-bold text-[#131B2B]/80">
        <span class="flex items-center gap-1.5 min-w-0">
          <span class="w-2 h-2 rounded-full shrink-0 bg-[#131B2B]/15"></span>
          <span class="truncate">{{ totalLabel }}</span>
        </span>
        <span class="text-[#131B2B]">{{ total ?? 'No limit' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ring-progress {
  transition: stroke-dashoffset 0.7s ease-out;
}
</style>