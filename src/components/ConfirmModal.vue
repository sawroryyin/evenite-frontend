<script setup lang="ts">
defineProps<{
  title: string
  description: string
  confirmText: string
  cancelText: string
  confirmTheme?: 'blue' | 'red'
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full animate-fade-in">
      <h3 class="text-xl font-bold mb-2">{{ title }}</h3>
      <p class="text-gray-600 mb-6">{{ description }}</p>
      <div class="flex justify-end gap-3">
        <button @click="emit('cancel')" class="px-4 py-2 bg-gray-100 font-bold rounded-lg hover:bg-gray-200 transition">
          {{ cancelText }}
        </button>
        <button 
          @click="emit('confirm')" 
          :class="confirmTheme === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
          class="px-4 py-2 text-white font-bold rounded-lg transition"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>