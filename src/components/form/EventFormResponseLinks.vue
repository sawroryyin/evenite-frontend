<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{ 
  eventId: string; 
  availableForms?: any[]; 
}>()

// Check if specific forms exist
const hasRegistration = computed(() => props.availableForms?.some(f => f.type === 'REGISTRATION'))
const hasFeedback = computed(() => props.availableForms?.some(f => f.type === 'FEEDBACK'))

// Navigation handler for organizers to view responses
const navigateToResponses = (type: string) => {
  router.push(`/events/${props.eventId}/forms/${type}/responses`) 
}
</script>

<template>
  <section v-if="hasRegistration || hasFeedback" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <h2 class="text-base font-bold text-gray-900 mb-4">Participant Responses</h2>

    <div class="flex flex-col sm:flex-row gap-3">
      <button 
        v-if="hasRegistration"
        type="button" 
        @click="navigateToResponses('REGISTRATION')" 
        class="relative flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-3 rounded-xl font-bold text-sm transition-all flex flex-col justify-center items-center gap-1"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Registration Responses
        </div>
        <span class="text-purple-600 bg-purple-100 border border-purple-200 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
          View Data
        </span>
      </button>
      
      <button 
        v-if="hasFeedback"
        type="button" 
        @click="navigateToResponses('FEEDBACK')" 
        class="relative flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-3 rounded-xl font-bold text-sm transition-all flex flex-col justify-center items-center gap-1"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          Feedback Responses
        </div>
        <span class="text-indigo-600 bg-indigo-100 border border-indigo-200 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider mt-1">
          View Data
        </span>
      </button>
    </div>
  </section>
</template>