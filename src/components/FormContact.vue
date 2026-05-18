<script setup lang="ts">
defineProps<{ form: any; t: any }>()
</script>

<template>
  <section class="bg-white p-5 rounded-xl border shadow-sm">
    <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.contactInfo }} <span class="text-sm font-normal text-gray-500">{{ t.universalSub }}</span></h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactName }}</label>
        <input v-model="form.contactName" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactEmail }}</label>
        <input v-model="form.contactEmail" type="email" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.contactPhone }}</label>
        <input v-model="form.contactPhone" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.lineId }}</label>
        <input v-model="form.contactLineId" class="w-full border p-2 rounded-lg disabled:bg-gray-50" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t.externalUrl }}</label>
        <input v-model="form.externalUrl" class="w-full border p-2 rounded-lg disabled:bg-gray-50" placeholder="https://..." />
      </div>
    </div>
  </section>
</template>