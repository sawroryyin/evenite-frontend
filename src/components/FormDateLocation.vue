<script setup lang="ts">
defineProps<{ form: any; t: any; viewLang: 'en' | 'th' }>()
</script>

<template>
  <section class="bg-white p-5 rounded-xl border shadow-sm">
    <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.dateLocation }}</h2>
    
    <div class="grid grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.startDate }}</label>
        <input type="datetime-local" v-model="form.startAt" class="w-full border p-2 rounded-lg text-sm disabled:bg-gray-50" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.endDate }}</label>
        <input type="datetime-local" v-model="form.endAt" class="w-full border p-2 rounded-lg text-sm disabled:bg-gray-50" />
      </div>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <input type="checkbox" v-model="form.isOnline" id="isOnline" class="w-4 h-4 text-blue-600 rounded disabled:opacity-70" />
      <label for="isOnline" class="font-medium text-gray-700">{{ t.isOnline }}</label>
    </div>

    <div v-if="!form.isOnline" class="space-y-4">
      <div v-if="viewLang === 'en'">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.locationEn }}</label>
        <input v-model="form.location.en" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="e.g. Main Hall" />
      </div>
      <div v-if="viewLang === 'th'">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.locationTh }}</label>
        <input v-model="form.location.th" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="สถานที่จัดงาน" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.mapLink }}</label>
        <input v-model="form.mapLink" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="https://maps.google.com/..." />
      </div>
    </div>
  </section>
</template>