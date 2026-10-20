<script setup lang="ts">
import { computed } from 'vue'
import { type AttendanceRegistrant, getAttendeeName, formatClock } from '../../services/AttendanceService'

const props = defineProps<{
  registrant: AttendanceRegistrant
  pending?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ (e: 'toggle'): void }>()

const snapshot = computed(() => props.registrant.participantSnapshot)
const name = computed(() => getAttendeeName(snapshot.value))
const isCheckedIn = computed(() => !!props.registrant.checkedInAt)

const initials = computed(() => {
  const first = snapshot.value?.firstName?.trim()?.[0] ?? ''
  const last = snapshot.value?.lastName?.trim()?.[0] ?? ''
  return (first + last).toUpperCase() || '?'
})

const subInfo = computed(() =>
  [snapshot.value?.studentId, snapshot.value?.major].filter(Boolean).join(' · ') || 'No student info'
)
</script>

<template>
  <div class="flex items-center gap-3 p-4 bg-white border border-[#131B2B]/10 rounded-2xl shadow-sm transition-colors">
    <div
      class="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 border transition-colors"
      :class="isCheckedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#131B2B]/5 text-[#131B2B] border-[#131B2B]/10'"
    >
      <svg v-if="isCheckedIn" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
      </svg>
      <span v-else>{{ initials }}</span>
    </div>

    <div class="flex-1 min-w-0">
      <p class="text-sm font-bold text-[#131B2B] truncate">
        {{ name }}
        <span v-if="snapshot?.nickname" class="text-[#131B2B]/50 font-semibold">({{ snapshot.nickname }})</span>
      </p>
      <p class="text-xs font-semibold text-[#131B2B]/60 truncate mt-0.5">{{ subInfo }}</p>
      <p v-if="isCheckedIn" class="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">
        Checked in · {{ formatClock(registrant.checkedInAt) }}
      </p>
    </div>

    <button
      type="button"
      role="switch"
      :aria-checked="isCheckedIn"
      :aria-label="`Toggle check-in for ${name}`"
      :disabled="pending || disabled"
      @click="emit('toggle')"
      class="relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      :class="isCheckedIn ? 'bg-[#131B2B]' : 'bg-[#131B2B]/15'"
    >
      <span
        class="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center"
        :class="isCheckedIn ? 'translate-x-5' : 'translate-x-0'"
      >
        <span v-if="pending" class="w-3 h-3 border-2 border-[#131B2B]/20 border-t-[#131B2B] rounded-full animate-spin"></span>
      </span>
    </button>
  </div>
</template>