<script setup lang="ts">
defineProps<{ 
  form: any; 
  t: any; 
  viewLang: 'en' | 'th';
  viewMode?: 'create' | 'edit'
}>()
</script>

<template>
  <section class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <h2 class="text-base font-bold text-gray-900 mb-4">{{ t.dateLocation }}</h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.startDate }} <span class="text-red-500">*</span></label>
        <input type="datetime-local" v-model="form.startAt" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.endDate }}</label>
        <input type="datetime-local" v-model="form.endAt" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" />
      </div>
    </div>

    <div class="flex items-center gap-2.5 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
      <input type="checkbox" v-model="form.isOnline" id="isOnline" class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 transition-colors cursor-pointer" />
      <label for="isOnline" class="text-xs font-bold text-gray-700 cursor-pointer">{{ t.isOnline }}</label>
    </div>

    <div v-if="!form.isOnline" class="space-y-4">
      <div v-if="viewLang === 'en'">
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.locationEn }} <span class="text-red-500">*</span></label>
        <input v-model="form.location.en" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="e.g. Main Hall" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.locationTh }} <span class="text-red-500">*</span></label>
        <input v-model="form.location.th" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="สถานที่จัดงาน" />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.mapLink }}</label>
        <input v-model="form.mapLink" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="https://maps.google.com/..." />
      </div>
    </div>
  </section>
</template>