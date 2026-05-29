<script setup lang="ts">
defineProps<{
  title: string
  description: string
  confirmText: string
  cancelText?: string
  confirmTheme?: 'blue' | 'red'
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 transition-opacity">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full animate-fade-in font-['Lato']">
      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600 mb-6 leading-relaxed">{{ description }}</p>
      <div class="flex justify-end gap-3">
        <button v-if="cancelText" @click="emit('cancel')" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
          {{ cancelText }}
        </button>
        <button 
          @click="emit('confirm')" 
          :class="confirmTheme === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:bg-purple-700'"
          class="px-4 py-2 text-sm text-white font-bold rounded-xl transition-colors shadow-sm"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>