<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status?: string | null }>()

const config = computed(() => {
  switch (props.status) {
    case 'ONGOING':
      return { label: 'Ongoing', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' }
    case 'PUBLISHED':
      return { label: 'Upcoming', cls: 'bg-[#131B2B]/5 text-[#131B2B] border-[#131B2B]/10', dot: 'bg-[#131B2B]' }
    case 'CONCLUDED':
      return { label: 'Completed', cls: 'bg-[#131B2B]/5 text-[#131B2B]/60 border-[#131B2B]/10', dot: 'bg-[#131B2B]/40' }
    case 'CANCELLED':
      return { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' }
    case 'DRAFT':
      return { label: 'Draft', cls: 'bg-white text-[#131B2B]/60 border-[#131B2B]/10', dot: 'bg-[#131B2B]/30' }
    default:
      return { label: props.status || 'Unknown', cls: 'bg-white text-[#131B2B]/60 border-[#131B2B]/10', dot: 'bg-[#131B2B]/30' }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm"
    :class="config.cls"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="config.dot"></span>
    {{ config.label }}
  </span>
</template>