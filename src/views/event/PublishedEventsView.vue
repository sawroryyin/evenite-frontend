<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import type { EventData } from '../../types'
import { useRouter } from 'vue-router'
const router = useRouter()

const publishedEvents = ref<EventData[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const fetchPublishedEvents = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    const response = await axios.get<EventData[]>('http://localhost:3000/events')
  
    publishedEvents.value = response.data.filter(event => event.status === 'PUBLISHED')
    
  } catch (error) {
    console.error('Error fetching published events:', error)
    errorMessage.value = 'Failed to load published events. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'TBA'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

onMounted(() => {
  fetchPublishedEvents()
})
</script>

<template>
  <div class="p-6 max-w-md mx-auto">

    <button @click="router.push({ name: 'home' })" class="mb-6 text-gray-500 hover:text-gray-800 flex 
    items-center gap-2 font-medium transition cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" 
        stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>

    <h1 class="text-2xl font-bold text-gray-800 mb-2">Published Events</h1>
    <p class="text-gray-500 mb-6">Manage your live events, track attendance, and communicate with participants.</p>

    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading your events...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-center">
      {{ errorMessage }}
    </div>

    <div v-else-if="publishedEvents.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
      <p class="text-gray-500">You haven't published any events yet.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="event in publishedEvents" :key="event.id" class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div v-for="event in publishedEvents" :key="event.id" class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">LIVE</span>
                    <span class="text-sm font-medium text-gray-500">{{ formatDate(event.startAt) }}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-800">
                    {{ event.title?.en || event.title?.th || 'Untitled Event' }}
                </h3>
                </div>
                
                <div class="text-left md:text-right">
                <p class="text-3xl font-bold text-blue-600">0 <span class="text-sm font-normal text-gray-500">/ 
                  {{ event.seatLimit || '∞' }}</span></p>
                <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Registered</p>
                </div>
            </div>

            <!-- Updated: Only the View Button -->
            <div class="flex justify-end">
                <button @click="router.push({ name: 'event-detail', params: { id: event.id } })" class="px-6 py-2 
                bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-sm transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
                  </path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                  </path>
                </svg>
                View Details
                </button>
            </div>
          </div>
        </div>
    </div>
  </div>
</template>