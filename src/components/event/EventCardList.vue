<script setup lang="ts">
import { computed } from 'vue'
import type { EventData } from '../../types'

const props = defineProps<{
  event: EventData
}>()

const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

const statusText = computed(() => {
  switch (props.event.status) {
    case 'ONGOING':
      return 'Ongoing'
    case 'PUBLISHED':
      return 'Upcoming'
    case 'CONCLUDED':
      return 'Completed'
    case 'DRAFT':
      return 'Draft'
    default:
      return props.event.status || 'Unknown'
  }
})
</script>

<template>
  <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-[#131B2B]/10 flex justify-between items-center transition-transform active:scale-[0.995]">
    
    <div class="pr-3 truncate">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm bg-[#131B2B]/5 text-[#131B2B]">
          {{ statusText }}
        </span>
        <span class="text-xs text-[#131B2B]/70 font-semibold font-['Lato']">
          {{ formatDate(event.startAt || event.updatedAt) }}
        </span>
      </div>
      
      <h3 class="font-['Nunito'] font-bold text-[#131B2B] text-base tracking-tight truncate mt-0.5">
        {{ event.title?.en || event.title?.th || 'Untitled Event' }}
      </h3>
    </div>
    
    <router-link 
      :to="{ name: 'event-detail', params: { id: event.id } }"
      class="bg-white hover:bg-[#131B2B]/5 hover:text-[#131B2B]/80 hover:border-[#131B2B]/30 text-[#131B2B] border border-[#131B2B]/10 text-xs font-bold py-2 px-4 rounded-xl transition-colors shrink-0"
    >
      View
    </router-link>
    
  </div>
</template>