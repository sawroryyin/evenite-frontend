<script setup lang="ts">
interface Event {
  id: number
  title: string
  category: string
  date: string
  location: string
  image: string
}

defineProps<{
  event: Event
}>()
</script>

<template>
  <div class="border-none rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full font-['Plus_Jakarta_Sans'] ring-1 ring-gray-100">
    
    <!-- Changed to aspect-[4/3] to scale perfectly in both swipe and grid layouts -->
    <img :src="event.image" :alt="event.title" class="w-full aspect-4/3 object-cover" />
    
    <div class="p-3 flex flex-col flex-grow">
      <!-- Category and Date Row -->
      <div class="flex justify-between items-center mb-2 gap-1">
        <span class="text-[8px] font-extrabold text-purple-600 bg-purple-50/80 px-1.5 py-0.5 rounded-md truncate uppercase tracking-widest flex-shrink-0 max-w-[60%] border border-purple-100">
          {{ event.category.replace('_', ' ') }}
        </span>
        <span class="text-[9px] font-semibold text-gray-400 whitespace-nowrap">{{ event.date }}</span>
      </div>
      
      <!-- Title uses Space Grotesk -->
      <h3 class="font-['Space_Grotesk'] font-bold text-sm text-gray-900 leading-snug mb-2 line-clamp-2 flex-grow tracking-tight">{{ event.title }}</h3>
      
      <!-- Location -->
      <div class="flex items-center text-[10px] text-gray-500 gap-1 font-medium mt-auto">
        <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        <span class="truncate">{{ event.location }}</span>
      </div>
    </div>
  </div>
</template>