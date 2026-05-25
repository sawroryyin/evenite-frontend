<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventCreationStore } from '../stores/eventCreation'
import { EventService } from '../services/EventService'
import LoadingOverlay from "../components/LoadingOverlay.vue"; // Adjust path as needed

const router = useRouter()
const store = useEventCreationStore()

const promptText = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const validatePrompt = (text: string) => {
  const trimmed = text.trim()
  if (trimmed.length === 0) return "Prompt field can't be empty"
  if (!/[a-zA-Z0-9\u0E00-\u0E7F]/.test(trimmed)) return "Invalid Input"
  return null
}

const handleTextGenerate = async () => {
  const error = validatePrompt(promptText.value)
  if (error) {
    errorMessage.value = error
    return
  }

  errorMessage.value = ''
  isLoading.value = true

  try {
    const generatedData = await EventService.generateFromPrompt(promptText.value)
    console.log('Generated Event Data:', generatedData)
    store.setDraftEvent(generatedData as any)
    router.push({ name: 'create-manual' })
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "There was an error creating an event, try creating manually."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto font-['Lato'] relative">
    
    <LoadingOverlay v-if="isLoading" message="Generating Event Details..." />

    <button @click="router.back()" class="mb-5 text-gray-500 hover:text-gray-800 flex items-center gap-1.5 font-bold text-[11px] transition cursor-pointer uppercase tracking-wide">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>
    
    <div class="mb-4">
      <h1 class="text-[18px] font-black tracking-tight text-gray-900">Generate from Prompt</h1>
      <p class="text-[11px] text-gray-400 font-medium mt-1">Describe your event and AI will draft the details.</p>
    </div>
    
    <textarea 
      v-model="promptText" 
      class="w-full border border-gray-200 p-3 rounded-xl mb-3 focus:ring-1.5 focus:ring-blue-400 focus:border-blue-400 focus:outline-none text-[12px] bg-[#fafafa] placeholder-gray-400 shadow-sm" 
      rows="6"
      placeholder="E.g., We are hosting a Web Development workshop next Friday at CMU Library..."
    ></textarea>
    
    <div v-if="errorMessage" class="mb-3 text-center animate-fade-in border border-red-100 bg-red-50 p-3 rounded-xl">
      <p class="text-red-500 text-[11px] font-bold mb-3">{{ errorMessage }}</p>
      
      <button 
        @click="router.push({ name: 'create-manual' })" 
        class="bg-gray-800 text-white px-4 py-2.5 rounded-lg w-full text-[12px] font-bold hover:bg-gray-700 transition shadow-sm"
      >
        Create Manually Instead
      </button>
    </div>
    
    <button 
      v-else
      @click="handleTextGenerate" 
      :disabled="isLoading"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl w-full text-[12px] font-bold disabled:bg-blue-300 transition shadow-sm cursor-pointer"
    >
      Generate Event
    </button>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>