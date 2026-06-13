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
  <div class="p-4 max-w-md mx-auto font-['Lato'] relative">
    
    <LoadingOverlay v-if="isLoading" message="Generating Event Details..." />

    <button @click="router.back()" class="mb-5 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 
    font-bold text-[11px] transition-colors cursor-pointer uppercase tracking-wide">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" 
        stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>
    
    <div class="mb-4">
      <h1 class="text-[18px] font-black tracking-tight text-[#26215C]">Generate from Prompt</h1>
      <p class="text-[11px] text-[#26215C]/70 font-medium mt-1">Describe your event and AI will draft the details.</p>
    </div>
    
    <textarea 
      v-model="promptText" 
      class="w-full border border-[#CECBF6] p-3 rounded-xl mb-3 focus:ring-1.5 focus:ring-[#7F77DD] 
      focus:border-transparent focus:outline-none text-[12px] bg-[#EEEDFE]/30 placeholder-[#26215C]/40 text-[#26215C] shadow-sm" 
      rows="6"
      placeholder="E.g., We are hosting a Web Development workshop next Friday at CMU Library..."
    ></textarea>
    
    <button 
      @click="handleTextGenerate" 
      :disabled="isLoading"
      class="bg-[#534AB7] hover:bg-[#3C3489] text-[#FFFFFF] px-4 py-2.5 rounded-xl 
      w-full text-[12px] font-bold disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
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