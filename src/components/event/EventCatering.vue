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
  <section class="bg-white p-5 md:p-6 rounded-2xl border border-[#131B2B]/10 shadow-sm">
    <h2 class="text-xl font-['Nunito'] font-black text-[#131B2B] mb-5">{{ t.cateringLogistics }}</h2>
    
    <div class="mb-5">
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.seatLimit }}</label>
      <input 
        type="number" 
        min="1"
        step="1"
        @keydown="preventInvalidChars"
        v-model="form.seatLimit" 
        class="w-full sm:max-w-xs border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B] font-semibold" 
        placeholder="e.g. 100" 
      />
      <p v-if="seatLimitError" class="text-red-500 font-bold text-xs mt-2">{{ seatLimitError }}</p>
    </div>

    <div class="flex items-center gap-3 mb-5 bg-[#131B2B]/5 p-4 rounded-xl border border-[#131B2B]/10 w-full sm:max-w-xs cursor-pointer">
      <input type="checkbox" v-model="form.hasCatering" id="hasCatering" class="w-5 h-5 text-[#131B2B] border-[#131B2B]/25 rounded focus:ring-[#131B2B]/30 transition-colors cursor-pointer" />
      <label for="hasCatering" class="text-sm font-bold text-[#131B2B] cursor-pointer flex-1">{{ t.hasCatering }}</label>
    </div>

    <div v-if="form.hasCatering" class="pl-5 space-y-5 border-l-2 border-[#131B2B]/15 ml-2 mt-3 mb-5">
      <div class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" v-model="form.isCateringFree" id="isCateringFree" class="w-5 h-5 text-[#131B2B] border-[#131B2B]/25 rounded focus:ring-[#131B2B]/30 transition-colors cursor-pointer" />
        <label for="isCateringFree" class="text-sm font-bold text-[#131B2B] cursor-pointer">{{ t.isCateringFree }}</label>
      </div>
      
      <div v-if="viewLang === 'en'">
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.cateringEn }}</label>
        <input v-model="form.cateringDescription.en" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="e.g. Buffet Lunch included" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.cateringTh }}</label>
        <input v-model="form.cateringDescription.th" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" placeholder="รายละเอียดอาหาร..." />
      </div>
    </div>

    <div v-if="viewLang === 'en'" class="mt-4">
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.remarksEn }}</label>
      <textarea v-model="form.remarks.en" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" rows="3" placeholder="e.g. Please bring your student ID"></textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mt-4">
      <label class="block text-sm font-bold text-[#131B2B] mb-2">{{ t.remarksTh }}</label>
      <textarea v-model="form.remarks.th" class="w-full border border-[#131B2B]/10 p-3.5 rounded-xl text-base bg-[#131B2B]/5 focus:bg-white focus:ring-2 focus:ring-[#131B2B]/30 focus:border-transparent transition-all outline-none text-[#131B2B]" rows="3" placeholder="หมายเหตุ..."></textarea>
    </div>
  </section>
</template>