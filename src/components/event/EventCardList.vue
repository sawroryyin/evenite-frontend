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

// Converts backend enum status to frontend text
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
  <div class="bg-[#FFFFFF] p-4 rounded-xl shadow-xs border border-[#CECBF6] flex justify-between items-center transition-transform 
  active:scale-[0.995]">
    <div class="pr-3 truncate">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-2xs bg-[#EEEDFE] text-[#3C3489]">
          {{ statusText }}
        </span>
        <span class="text-[10px] text-[#26215C]/70 font-semibold font-['Lato']">
          {{ formatDate(event.startAt || event.updatedAt) }}
        </span>
      </div>
      <h3 class="font-bold text-[#26215C] text-sm tracking-tight truncate">
        {{ event.title?.en || event.title?.th || 'Untitled Event' }}
      </h3>
    </div>
    
    <router-link 
      :to="{ name: 'event-detail', params: { id: event.id } }"
      class="bg-[#FFFFFF] hover:bg-[#EEEDFE] hover:text-[#3C3489] hover:border-[#534AB7] text-[#534AB7] border 
      border-[#CECBF6] text-[11px] font-bold py-1.5 px-3 rounded-xl transition-colors shrink-0"
    >
      View
    </router-link>
  </div>
</template>