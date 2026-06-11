<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import type { EventData } from '../../types' // Adjust path if needed

const router = useRouter()

const draftEvents = ref<EventData[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const fetchDrafts = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // Fetch all events from backend
    const response = await axios.get<EventData[]>('http://localhost:3000/events')
    
    // Filter only the DRAFT events
    draftEvents.value = response.data.filter(event => event.status === 'DRAFT')
    
  } catch (error) {
    console.error('Error fetching drafts:', error)
    errorMessage.value = 'Failed to load saved drafts. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown date'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

onMounted(() => {
  fetchDrafts()
})
</script>

<template>

    
  <div class="p-6 max-w-md mx-auto">

    <button @click="router.push({ name: 'home' })" class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Saved Drafts</h1>
      <button @click="router.push({ name: 'create-options' })" class="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        New Event
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-gray-500 mt-4">Loading drafts...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 text-center">
      {{ errorMessage }}
    </div>

    <!-- Empty State -->
    <div v-else-if="draftEvents.length === 0" class="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
      <p class="text-gray-500">You don't have any saved drafts.</p>
    </div>

    <!-- Data State -->
    <div v-else class="space-y-4">
      <div v-for="draft in draftEvents" :key="draft.id" class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
            <span class="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">DRAFT</span>
            <span class="text-xs text-gray-500">Last updated {{ formatDate(draft.updatedAt) }}</span>
            </div>
            <h3 class="text-lg font-bold text-gray-800">
            {{ draft.title?.en || draft.title?.th || 'Untitled Event' }}
            </h3>
        </div>
        
        <!-- Updated: Only the View Button -->  
        <div class="flex gap-2 w-full sm:w-auto">
            <button @click="router.push({ name: 'event-detail', params: { id: draft.id } })" class="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm shadow transition">
            View
            </button>
        </div>
      </div>
    </div>
  </div>
</template>