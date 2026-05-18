<script setup lang="ts">
import { ref } from 'vue'
import { EventService } from '../services/EventService'

const props = defineProps<{ form: any; t: any; viewMode: string }>()
const imageError = ref('')

const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  imageError.value = ''
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  if (!validTypes.includes(file.type)) {
    imageError.value = "Unsupported image format"
    return
  }
  if (file.size > 5242880) {
    imageError.value = "File size must not exceed 5MB."
    return
  }

  try {
    const response = await EventService.uploadBanner(file)
    props.form.bannerUrl = response.bannerUrl
  } catch (error) {
    imageError.value = "Failed to upload banner image."
  }
}
</script>

<template>
  <section class="bg-white p-5 rounded-xl border shadow-sm">
    <h2 class="text-lg font-bold text-gray-800 mb-4">{{ t.eventBanner }} <span class="text-sm font-normal text-gray-500">{{ t.universalSub }}</span></h2>
    <div v-if="form.bannerUrl" class="relative">
      <img :src="form.bannerUrl" class="w-full h-48 object-cover rounded-lg border" />
      <button type="button" v-if="viewMode !== 'preview'" @click="form.bannerUrl = ''" class="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs shadow hover:bg-red-700">{{ t.removeImg }}</button>
    </div>
    <div v-else class="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition relative" :class="viewMode === 'preview' ? 'opacity-50' : 'cursor-pointer'">
      <input type="file" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" :disabled="viewMode === 'preview'" accept="image/jpeg, image/png, image/webp" />
      <div class="text-gray-500 pointer-events-none flex flex-col items-center">
         <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
         <span>{{ t.uploadBanner }}</span>
      </div>
    </div>
    <span v-if="imageError" class="text-red-500 text-sm mt-2 block">{{ imageError }}</span>
  </section>
</template>