<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import EventCard from '../components/EventCard.vue' // Adjust path as needed

const router = useRouter()

const mockEvents = ref([
  { id: 1, title: 'Vue.js Advanced Workshop', category: 'Workshop', date: 'Oct 12, 2026', location: 'CMU Library', image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Vue+Workshop' },
  { id: 2, title: 'Startup Networking Night', category: 'Networking', date: 'Oct 15, 2026', location: 'CAMT Hall', image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=Startup+Night' },
  { id: 3, title: 'AI in Education Seminar', category: 'Seminar', date: 'Oct 20, 2026', location: 'Online', image: 'https://placehold.co/600x400/e2e8f0/1e293b?text=AI+Seminar' },
])
</script>

<template>
  <div class="p-4 max-w-screen-md mx-auto">
    <!-- Search and Sort Bar -->
    <div class="flex gap-2 mb-6">
      <div class="relative flex-grow">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input type="text" placeholder="Search events..." class="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:border-blue-500" />
      </div>
      <select class="border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:border-blue-500">
        <option value="">Categories</option>
        <option value="workshop">Workshop</option>
        <option value="seminar">Seminar</option>
      </select>
    </div>

    <!-- Create Event Button -->
    <button @click="router.push({ name: 'create-options' })" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow mb-8 flex justify-center items-center gap-2 transition">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
      Create New Event
    </button>

    <!-- Event Feed -->
    <h2 class="text-xl font-bold mb-4 text-gray-800">Upcoming Events</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Using the reusable component here -->
      <EventCard 
        v-for="event in mockEvents" 
        :key="event.id" 
        :event="event"
        @click="router.push({ name: 'event-details', params: { id: event.id } })"
      />
    </div>
  </div>
</template>