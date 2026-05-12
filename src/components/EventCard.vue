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
  <div class="border rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-md transition cursor-pointer">
    <img :src="event.image" :alt="event.title" class="w-full h-40 object-cover" />
    <div class="p-4">
      <div class="flex justify-between items-start mb-1">
        <span class="text-xs font-bold text-blue-600 uppercase tracking-wide">
          {{ event.category }}
        </span>
        <span class="text-xs text-gray-500">{{ event.date }}</span>
      </div>
      <h3 class="font-bold text-lg leading-tight mb-2">{{ event.title }}</h3>
      <div class="flex items-center text-sm text-gray-600 gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        {{ event.location }}
      </div>
    </div>
  </div>
</template>