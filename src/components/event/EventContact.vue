<script setup lang="ts">
defineProps<{ 
  form: any; 
  t: any;
  viewMode?: 'create' | 'edit'
}>()
</script>

<template>
  <section class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
    <h2 class="text-base font-bold text-gray-900 mb-4">
      {{ t.contactInfo }} 
      <span class="text-xs font-medium text-gray-400">{{ t.universalSub }}</span>
    </h2>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.contactName }}</label>
        <input v-model="form.contactName" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 
        focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="e.g. John Doe" />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.contactEmail }}</label>
        <input v-model="form.contactEmail" type="email" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm 
        bg-gray-50 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
        placeholder="john@example.com" />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.contactPhone }}</label>
        <input v-model="form.contactPhone" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 
        focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="e.g. +66 123 456 789" />
      </div>
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.lineId }}</label>
        <input v-model="form.contactLineId" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 
        focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="e.g. @eventcontact" />
      </div>
      <div class="sm:col-span-2">
        <label class="block text-xs font-bold text-gray-700 mb-1.5">{{ t.externalUrl }}</label>
        <input v-model="form.externalUrl" class="w-full border border-gray-200 p-2.5 rounded-xl text-sm bg-gray-50 
        focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" placeholder="https://..." />
      </div>
    </div>
  </section>
</template>