<script setup lang="ts">
import { computed } from 'vue'
import type { EventData } from '../types' // Adjust path if needed

const props = defineProps<{
  event: EventData
}>()

// --- Utility Formatting ---
const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

// --- Dynamic Styling ---
const statusStyles = computed(() => {
  if (props.event.status === 'PUBLISHED') return 'bg-green-100 text-green-800'
  if (props.event.status === 'DRAFT') return 'bg-yellow-100 text-yellow-800'
  return 'bg-gray-100 text-gray-600' // Matches 'ARCHIVED' or 'COMPLETED'
})
</script>

<template>
  <div class="bg-white p-4 rounded-xl shadow-xs border border-gray-100 flex justify-between items-center transition-transform active:scale-[0.995]">
    <div class="pr-3 truncate">
      <div class="flex items-center gap-2 mb-1">
        <span 
          class="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-2xs"
          :class="statusStyles"
        >
          {{ event.status }}
        </span>
        <span class="text-[10px] text-gray-400 font-semibold font-['Lato']">
          {{ formatDate(event.startAt || event.updatedAt) }}
        </span>
      </div>
      <h3 class="font-bold text-gray-900 text-sm tracking-tight truncate">
        {{ event.title?.en || event.title?.th || 'Untitled Event' }}
      </h3>
    </div>
    
    <!-- Vue Router Link to Event Detail View -->
    <router-link 
      :to="{ name: 'event-detail', params: { id: event.id } }"
      class="bg-[#fafafa] hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-gray-700 border border-gray-200 text-[11px] font-bold py-1.5 px-3 rounded-xl transition-all flex-shrink-0"
    >
      View
    </router-link>
  </div>
</template>