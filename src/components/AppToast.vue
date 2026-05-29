<script setup lang="ts">
import { ref, expose } from 'vue'

const show = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'info'>('success')

const showToast = (msg: string, toastType: 'success' | 'error' | 'info' = 'success') => {
  message.value = msg
  type.value = toastType
  show.value = true
  setTimeout(() => { show.value = false }, 3000)
}

// Expose the method so the parent can call it via template ref
expose({ showToast })
</script>

<template>
  <Transition name="toast">
    <div v-if="show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-bold font-['Lato'] text-white"
         :class="{
           'bg-green-600': type === 'success',
           'bg-red-600': type === 'error',
           'bg-blue-600': type === 'info'
         }">
      <svg v-if="type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      <svg v-if="type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translate(-50%, -20px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>