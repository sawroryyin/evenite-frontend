<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEventCreationStore } from '../../stores/eventCreation.ts'
import { EventService } from '../../services/EventService.ts'
import LoadingOverlay from "../../components/LoadingOverlay.vue"
import ConfirmModal from '../../components/ConfirmModal.vue'

const router = useRouter()
const store = useEventCreationStore()

const promptText = ref('')
const isLoading = ref(false)

const alertState = ref({
  show: false,
  title: '',
  description: '',
  theme: 'blue' as 'blue' | 'red',
  redirectOnClose: false
})

const showAlert = (title: string, description: string, theme: 'blue' | 'red' = 'blue', redirect = false) => {
  alertState.value = { show: true, title, description, theme, redirectOnClose: redirect }
}

const handleAlertConfirm = () => {
  alertState.value.show = false
  if (alertState.value.redirectOnClose) {
    router.push({ name: 'create-manual' })
  }
}

const validatePrompt = (text: string) => {
  const trimmed = text.trim()
  if (trimmed.length === 0) return "Prompt field can't be empty"
  if (!/[a-zA-Z0-9\u0E00-\u0E7F]/.test(trimmed)) return "Invalid Input"
  return null
}

const handleTextGenerate = async () => {
  const error = validatePrompt(promptText.value)
  if (error) {
    showAlert("Validation Error", error, "red")
    promptText.value = ''
    return
  }

  isLoading.value = true

  try {
    const generatedData = await EventService.generateFromPrompt(promptText.value)
    console.log('Generated Event Data:', generatedData)
    store.setTempEventData(generatedData as any)
    router.push({ name: 'create-manual' })
  } catch (error: any) {
    showAlert("Error", "There was an error in creating an event, try creating manually.", "red", true)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto font-['Lato'] relative bg-transparent min-h-screen">
    
    <LoadingOverlay v-if="isLoading" message="Generating Event Details..." />

    <!-- Updated: text-[11px] to text-sm -->
    <button @click="router.back()" class="mb-5 text-[#131B2B]/70 hover:text-[#131B2B] flex items-center gap-1.5 
    font-bold text-sm transition-colors cursor-pointer uppercase tracking-wide">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" 
        stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>
    
    <div class="mb-4">
      <!-- Updated: text-[18px] to text-xl (20px) -->
      <h1 class="text-xl font-black tracking-tight text-[#131B2B]">Generate from Prompt</h1>
      <!-- Updated: text-[11px] to text-sm -->
      <p class="text-sm text-[#131B2B]/70 font-medium mt-1.5">Describe your event and AI will draft the details.</p>
    </div>
    
    <!-- Updated: text-[12px] to text-base (16px) to prevent iOS auto-zoom, and increased padding to p-4 -->
    <textarea 
      v-model="promptText" 
      class="w-full border border-[#131B2B]/10 p-4 rounded-xl mb-4 focus:ring-1.5 focus:ring-[#131B2B]/30 
      focus:border-transparent focus:outline-none text-base bg-[#131B2B]/5 placeholder-[#131B2B]/40 text-[#131B2B] shadow-inner" 
      rows="6"
      placeholder="E.g., We are hosting a Web Development workshop next Friday at CMU Library..."
    ></textarea>
    
    <!-- Updated: text-[12px] to text-base, and increased padding to py-3.5 for a better touch target -->
    <button 
      @click="handleTextGenerate" 
      :disabled="isLoading"
      class="bg-[#131B2B] hover:bg-[#131B2B]/80 text-white px-4 py-3.5 rounded-xl 
      w-full text-base font-bold disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
    >
      Generate Event
    </button>

    <ConfirmModal 
      v-if="alertState.show"
      :title="alertState.title"
      :description="alertState.description"
      :confirmTheme="alertState.theme"
      confirmText="OK"
      @confirm="handleAlertConfirm"
    />
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