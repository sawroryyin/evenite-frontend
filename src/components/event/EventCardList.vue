<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { EventData } from '../../types'

const props = defineProps<{
  event: EventData | any
}>()

const router = useRouter()

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

// Dynamically extracts the organizer's name
const displayOrganizer = computed(() => {
  return props.event.organizer?.name || props.event.organizerName || 'University Organizer'
})
</script>

<template>
  <div 
    @click="router.push({ name: 'event-detail', params: { id: event.id } })"
    class="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-[#131B2B]/10 flex gap-4 items-center cursor-pointer hover:shadow-md hover:border-[#131B2B]/30 transition-all group active:scale-[0.995] mb-3"
  >
    
    <!-- Left: Event Image -->
    <div class="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-[#131B2B]/5 border border-[#131B2B]/10">
      <img 
        v-if="event.bannerUrl" 
        :src="event.bannerUrl" 
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        alt="Event Banner"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-[#131B2B]/30 font-black text-2xl">{{ event.title?.en?.charAt(0) || 'E' }}</span>
      </div>
    </div>

    <!-- Middle: Event Details -->
    <div class="flex-1 min-w-0 py-1">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 shrink-0">
          {{ statusText }}
        </span>
        <span class="text-[11px] sm:text-xs text-[#131B2B]/70 font-semibold font-['Lato'] truncate">
          {{ formatDate(event.startAt || event.updatedAt) }}
        </span>
      </div>
      
      <h3 class="font-['Nunito'] font-bold text-[#131B2B] text-sm sm:text-base tracking-tight line-clamp-2 mt-0.5">
        {{ event.title?.en || event.title?.th || 'Untitled Event' }}
      </h3>
      
      <!-- Organizer Name added here -->
      <p class="text-[11px] font-bold text-[#131B2B]/50 mt-1 truncate">
        {{ displayOrganizer }}
      </p>
    </div>
    
    <!-- Right: Navigation Indicator -->
    <div class="shrink-0 pr-2 text-[#131B2B]/30 group-hover:text-[#131B2B] transition-colors">
      <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
      </svg>
    </div>
    
  </div>
</template>