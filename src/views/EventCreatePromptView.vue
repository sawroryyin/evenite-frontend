<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventCreationStore } from '../stores/eventCreation'
import { EventService } from '../services/EventService'

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
    store.setDraftEvent(generatedData as any)
    router.push({ name: 'create-detail' })
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "There was an error in creating an event, try creating manually."
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-md mx-auto">
    <button @click="router.back()" class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>
    <div class="flex items-center gap-2 mb-6">
      <h1 class="text-2xl font-bold">Generate from Prompt</h1>
    </div>
    
    <textarea 
      v-model="promptText" 
      class="w-full border border-gray-300 p-3 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
      rows="6"
      placeholder="E.g., We are hosting a Web Development workshop next Friday at CMU Library..."
    ></textarea>
    
    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 text-center animate-fade-in">
      <p class="text-red-500 text-sm mb-3">{{ errorMessage }}</p>
      
      <!-- Pop-up Manual Button (SRS-006) -->
      <button 
        @click="router.push({ name: 'create-detail' })" 
        class="bg-gray-800 text-white px-4 py-2 rounded-lg w-full font-bold hover:bg-gray-700 transition shadow"
      >
        Create Manually Instead
      </button>
    </div>
    
    <button 
      v-else
      @click="handleTextGenerate" 
      :disabled="isLoading"
      class="bg-blue-600 text-white px-4 py-3 rounded-lg w-full font-bold disabled:bg-gray-400 transition shadow"
    >
      {{ isLoading ? 'Generating AI Form...' : 'Generate Event' }}
    </button>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>