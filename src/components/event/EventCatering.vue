<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode?: 'create' | 'edit' 
}>()

const seatLimitError = ref('')

const preventInvalidChars = (e: KeyboardEvent) => {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
    e.preventDefault()
    seatLimitError.value = "Seat Limit must be a positive whole number"
  } else {
    seatLimitError.value = ""
  }
}

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
  <section class="bg-[#FFFFFF] p-4 rounded-xl border border-[#CECBF6] shadow-sm">
    <h2 class="text-base font-bold text-[#26215C] mb-4">{{ t.cateringLogistics }}</h2>
    
    <div class="mb-4">
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.seatLimit }}</label>
      <input 
        type="number" 
        min="1"
        step="1"
        @keydown="preventInvalidChars"
        v-model="form.seatLimit" 
        class="w-full sm:max-w-xs border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] focus:ring-2 
        focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" 
        placeholder="e.g. 100" 
      />
      <p v-if="seatLimitError" class="text-red-500 font-bold text-xs mt-1.5">{{ seatLimitError }}</p>
    </div>

    <div class="flex items-center gap-2.5 mb-4 bg-[#EEEDFE]/30 p-3 rounded-xl border border-[#CECBF6] w-full sm:max-w-xs">
      <input type="checkbox" v-model="form.hasCatering" id="hasCatering" class="w-4 h-4 text-[#534AB7] border-[#CECBF6] rounded 
      focus:ring-[#7F77DD] transition-colors cursor-pointer" />
      <label for="hasCatering" class="text-xs font-bold text-[#26215C] cursor-pointer">{{ t.hasCatering }}</label>
    </div>

    <div v-if="form.hasCatering" class="pl-4 space-y-4 border-l-2 border-[#CECBF6] ml-1 mt-2 mb-4">
      <div class="flex items-center gap-2.5">
        <input type="checkbox" v-model="form.isCateringFree" id="isCateringFree" class="w-4 h-4 text-[#534AB7] border-[#CECBF6] rounded 
        focus:ring-[#7F77DD] transition-colors cursor-pointer" />
        <label for="isCateringFree" class="text-xs font-bold text-[#26215C] cursor-pointer">{{ t.isCateringFree }}</label>
      </div>
      
      <div v-if="viewLang === 'en'">
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.cateringEn }}</label>
        <input v-model="form.cateringDescription.en" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="e.g. 
        Buffet Lunch included" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.cateringTh }}</label>
        <input v-model="form.cateringDescription.th" class="w-full border border-[#CECBF6] p-2.5 rounded-xl text-sm bg-[#EEEDFE]/30 
        focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" placeholder="รายละเอียดอาหาร..." />
      </div>
    </div>

    <div v-if="viewLang === 'en'" class="mt-2">
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.remarksEn }}</label>
      <textarea v-model="form.remarks.en" class="w-full border border-[#CECBF6] p-3 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] 
      focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" rows="2" placeholder="e.g. 
      Please bring your student ID"></textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mt-2">
      <label class="block text-xs font-bold text-[#26215C] mb-1.5">{{ t.remarksTh }}</label>
      <textarea v-model="form.remarks.th" class="w-full border border-[#CECBF6] p-3 rounded-xl text-sm bg-[#EEEDFE]/30 focus:bg-[#FFFFFF] 
      focus:ring-2 focus:ring-[#7F77DD] focus:border-transparent transition-all outline-none text-[#26215C]" rows="2" placeholder="หมายเหตุ..."></textarea>
    </div>
  </section>
</template>