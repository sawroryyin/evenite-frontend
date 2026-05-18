<script setup lang="ts">
defineProps<{ form: any; t: any; viewLang: 'en' | 'th' }>()
</script>

<template>
  <section class="bg-white p-5 rounded-xl border shadow-sm">
    <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.cateringLogistics }}</h2>
    
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.seatLimit }}</label>
      <input type="number" v-model="form.seatLimit" class="w-full border p-2 rounded-lg max-w-xs disabled:bg-gray-50" />
    </div>

    <div class="flex items-center gap-2 mb-2">
      <input type="checkbox" v-model="form.hasCatering" id="hasCatering" class="w-4 h-4 text-blue-600 rounded disabled:opacity-70" />
      <label for="hasCatering" class="font-medium text-gray-700">{{ t.hasCatering }}</label>
    </div>

    <div v-if="form.hasCatering" class="pl-6 space-y-4 border-l-2 border-blue-200 ml-2 mt-4 mb-4">
      <div class="flex items-center gap-2 mb-2">
        <input type="checkbox" v-model="form.isCateringFree" id="isCateringFree" class="w-4 h-4 text-blue-600 rounded disabled:opacity-70" />
        <label for="isCateringFree" class="font-medium text-gray-700">{{ t.isCateringFree }}</label>
      </div>
      
      <div v-if="viewLang === 'en'">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.cateringEn }}</label>
        <input v-model="form.cateringDescription.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="e.g. Buffet Lunch included" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.cateringTh }}</label>
        <input v-model="form.cateringDescription.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="รายละเอียดอาหาร..." />
      </div>
    </div>

    <div v-if="viewLang === 'en'" class="mt-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.remarksEn }}</label>
      <textarea v-model="form.remarks.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="2" placeholder="e.g. Please bring your student ID"></textarea>
    </div>
    <div v-if="viewLang === 'th'" class="mt-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.remarksTh }}</label>
      <textarea v-model="form.remarks.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" rows="2" placeholder="หมายเหตุ..."></textarea>
    </div>
  </section>
</template>