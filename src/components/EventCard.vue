<script setup lang="ts">
import { computed } from 'vue'
import type { EventData } from '../types' // Adjust path if necessary

const props = withDefaults(defineProps<{
  event: EventData | any,
  variant?: 'hero' | 'grid' // Accepts the variant prop passed from HomeView
}>(), {
  variant: 'grid'
})

// Safely extract bilingual title
const displayTitle = computed(() => {
  return props.event.title?.en || props.event.title?.th || 'Untitled Event'
})

// Safely extract the first category from the array
const displayCategory = computed(() => {
  const cat = props.event.category
  if (Array.isArray(cat) && cat.length > 0) {
    return cat[0].replace('_', ' ')
  } else if (typeof cat === 'string') {
    return cat.replace('_', ' ')
  }
  return 'EVENT'
})

// Format the ISO date to a readable string
const displayDate = computed(() => {
  if (!props.event.startAt) return 'TBA'
  return new Date(props.event.startAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
})

// Safely extract bilingual location or online status
const displayLocation = computed(() => {
  if (props.event.isOnline) return 'Online Event'
  return props.event.location?.en || props.event.location?.th || 'TBA'
})

// Fallback to a placeholder if no banner URL exists
const displayImage = computed(() => {
  return props.event.bannerUrl || 'https://placehold.co/600x400/e9d5ff/6b21a8?text=Event'
})
</script>

<template>
  <div class="border-none rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col 
  h-full font-['Lato'] ring-1 ring-gray-100">
    
    <img :src="displayImage" :alt="displayTitle" class="w-full aspect-4/3 object-cover" />
    
    <div class="p-3 flex flex-col grow">
      <div class="flex justify-between items-center mb-2 gap-1">
        <span class="text-[8px] font-extrabold text-purple-600 bg-purple-50/80 px-1.5 py-0.5 rounded-md truncate uppercase tracking-widest 
        shrink-0 max-w-[60%] border border-purple-100">
          {{ displayCategory }}
        </span>
        <span class="text-[9px] font-semibold text-gray-400 whitespace-nowrap">{{ displayDate }}</span>
      </div>
      
      <h3 class="font-['Lato'] font-bold text-sm text-gray-900 leading-snug mb-2 line-clamp-2 grow tracking-tight">{{ displayTitle }}</h3>
      
      <div class="flex items-center text-[10px] text-gray-500 gap-1 font-medium mt-auto">
        <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span class="truncate">{{ displayLocation }}</span>
      </div>
    </div>
  </div>
</template>