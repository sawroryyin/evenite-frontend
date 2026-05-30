<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode?: 'create' | 'edit' 
}>()

const seatLimitError = ref('')

// Prevent user from typing decimals, negatives, or letters in the number input
const preventInvalidChars = (e: KeyboardEvent) => {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
    e.preventDefault()
    seatLimitError.value = "Seat Limit must be a positive whole number"
  } else {
    seatLimitError.value = ""
  }
}

// Watcher to catch invalid pasted data
watch(() => props.form.seatLimit, (newVal) => {
  if (newVal === '' || newVal === null || newVal === undefined) {
    seatLimitError.value = ''
    return
  }
  const num = Number(newVal)
  if (!Number.isInteger(num) || num < 1) {
    seatLimitError.value = "Seat Limit must be a positive whole number"
  } else {
    seatLimitError.value = ''
  }
})
</script>

<template>
  <section class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <h2 class="text-base font-bold text-gray-900 mb-4">{{ t.cateringLogistics }}</h2>
    
    <div class="mb-4">
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.seatLimit }}</label>
      <input 
        type="number" 
        min="1"
        step="1"
        @keydown="preventInvalidChars"
        v-model="form.seatLimit" 
        class="w-full sm:max-w-xs border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 
        focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
        placeholder="e.g. 100" 
      />
      <p v-if="seatLimitError" class="text-red-500 font-bold text-xs mt-1.5">{{ seatLimitError }}</p>
    </div>

    <div class="flex items-center gap-2.5 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full sm:max-w-xs">
      <input type="checkbox" v-model="form.hasCatering" id="hasCatering" class="w-4 h-4 text-purple-600 border-gray-300 rounded 
      focus:ring-purple-500 transition-colors cursor-pointer" />
      <label for="hasCatering" class="text-xs font-bold text-gray-700 cursor-pointer">{{ t.hasCatering }}</label>
    </div>

    <div v-if="form.hasCatering" class="pl-4 space-y-4 border-l-2 border-purple-200 ml-1 mt-2 mb-4">
      <div class="flex items-center gap-2.5">
        <input type="checkbox" v-model="form.isCateringFree" id="isCateringFree" class="w-4 h-4 text-purple-600 border-gray-300 rounded 
        focus:ring-purple-500 transition-colors cursor-pointer" />
        <label for="isCateringFree" class="text-xs font-bold text-gray-700 cursor-pointer">{{ t.isCateringFree }}</label>
      </div>
      
      <div v-if="viewLang === 'en'">
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.cateringEn }}</label>
        <input v-model="form.cateringDescription.en" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 
        focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="e.g. 
        Buffet Lunch included" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.cateringTh }}</label>
        <input v-model="form.cateringDescription.th" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 
        focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="รายละเอียดอาหาร..." />
      </div>
    </div>

    <div v-if="viewLang === 'en'" class="mt-2">
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.remarksEn }}</label>
      <textarea v-model="form.remarks.en" class="w-full border border-gray-200 p-3 rounded-xl text-sm bg-gray-50 focus:bg-white 
      focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" rows="2" placeholder="e.g. 
      Please bring your student ID"></textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mt-2">
      <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.remarksTh }}</label>
      <textarea v-model="form.remarks.th" class="w-full border border-gray-200 p-3 rounded-xl text-sm bg-gray-50 focus:bg-white 
      focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" rows="2" placeholder="หมายเหตุ..."></textarea>
    </div>
  </section>
</template>