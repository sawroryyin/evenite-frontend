<script setup lang="ts">
import { inject } from 'vue'
import { EventService } from '../services/EventService'

const props = defineProps<{ 
  form: any; 
  t: any;
  viewMode?: 'create' | 'edit' 
}>()

const showAlert = inject<((title: string, desc: string, theme?: 'blue'|'red') => void)>('showAlert')

const handleImageUpload = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  
  if (!validTypes.includes(file.type)) {
    if (showAlert) showAlert("Invalid Format", "Unsupported image format", "red")
    return
  }
  if (file.size > 5242880) {
    if (showAlert) showAlert("File Too Large", "File size must not exceed 5MB.", "red")
    return
  }

  try {
    const response = await EventService.uploadBanner(file)
    props.form.bannerUrl = response.bannerUrl
    if (showAlert) showAlert("Success", "Image Uploading Successful", "blue")
  } catch (error) {
    if (showAlert) showAlert("Upload Failed", "Failed to upload banner image.", "red")
  }
}
</script>

<template>
  <section class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm font-['Lato']">
    <h2 class="text-base font-bold text-gray-900 mb-3">
      {{ t.eventBanner }} 
      <span class="text-xs font-medium text-gray-400">{{ t.universalSub }}</span>
    </h2>
    
    <div v-if="form.bannerUrl" class="relative group">
      <img :src="form.bannerUrl" class="w-full h-40 object-cover rounded-xl border border-gray-200" />
      <button 
        type="button" 
        @click="form.bannerUrl = ''" 
        class="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-red-600 
        px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-red-50 transition-colors border border-red-100"
      >
        {{ t.removeImg }}
      </button>
    </div>
    
    <div v-else class="flex flex-col items-center justify-center h-32 border-2 
    border-dashed border-gray-300 rounded-xl hover:bg-purple-50/50 
    hover:border-purple-300 transition-colors relative cursor-pointer bg-gray-50/50">
      <input type="file" @change="handleImageUpload" class="absolute inset-0 w-full h-full 
      opacity-0 cursor-pointer" accept="image/jpeg, image/png, image/webp" />
      <div class="text-gray-500 pointer-events-none flex flex-col items-center px-4 text-center">
         <svg class="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" 
         viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" 
         stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
         <span class="text-xs font-bold">{{ t.uploadBanner }}</span>
         <span class="text-[10px] text-gray-400 mt-1">JPEG, PNG or WEBP (Max 5MB)</span>
      </div>
    </div>
  </section>
</template>