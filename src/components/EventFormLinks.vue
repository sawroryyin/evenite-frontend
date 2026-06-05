<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FormService } from '../services/FormService'

const props = defineProps<{
  eventId?: string;
}>()

const router = useRouter()

const registrationExists = ref(false)
const feedbackExists = ref(false)
const isLoading = ref(true)

const checkFormStatuses = async () => {
  isLoading.value = true;
  
  if (!props.eventId || props.eventId === 'new') {
    registrationExists.value = false;
    feedbackExists.value = false;
    isLoading.value = false;
    return; 
  }

  try {
    const forms = await FormService.getFormsByEventId(props.eventId);
    
    registrationExists.value = forms.some((form: any) => form.type === 'REGISTRATION');
    feedbackExists.value = forms.some((form: any) => form.type === 'FEEDBACK');
    
  } catch (error) {
    console.error('Failed to fetch event forms:', error);
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.eventId, () => {
  checkFormStatuses()
}, { immediate: true })

const navigateToForm = (formType: 'REGISTRATION' | 'FEEDBACK') => {
  if (!props.eventId) return;
  
  router.push({
    path: `/events/${props.eventId}/forms/${formType}`
  });
}
</script>

<template>
  <section class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <h2 class="text-base font-bold text-gray-900 mb-4">Event Forms</h2>
    
    <div v-if="!eventId" class="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
      <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Please save this event as a draft first to create and manage forms.</span>
    </div>

    <div v-else class="flex flex-col sm:flex-row gap-3">
      <button 
        type="button" 
        @click="navigateToForm('REGISTRATION')" 
        class="relative flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 py-3 rounded-xl font-bold text-sm transition-all flex flex-col justify-center items-center gap-1"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Registration Form
        </div>
        <span v-if="!isLoading" :class="registrationExists ? 'text-green-600 bg-green-100' : 'text-gray-500 bg-gray-200'" class="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
          {{ registrationExists ? 'Created' : 'Not Created' }}
        </span>
      </button>
      
      <button 
        type="button" 
        @click="navigateToForm('FEEDBACK')" 
        class="relative flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-3 rounded-xl font-bold text-sm transition-all flex flex-col justify-center items-center gap-1"
      >
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          Feedback Form
        </div>
        <span v-if="!isLoading" :class="feedbackExists ? 'text-green-600 bg-green-100' : 'text-gray-500 bg-gray-200'" class="text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
          {{ feedbackExists ? 'Created' : 'Not Created' }}
        </span>
      </button>
    </div>
  </section>
</template>