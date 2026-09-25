<script setup lang="ts">
import { inject } from 'vue'
import { EventService } from '../../services/EventService'

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
  <section class="bg-white p-5 md:p-6 rounded-2xl border border-[#131B2B]/10 shadow-sm font-['Lato']">
    <h2 class="text-xl font-['Nunito'] font-black text-[#131B2B] mb-4">
      {{ t.eventBanner }} 
      <span class="text-xs font-semibold text-[#131B2B]/50 ml-1 font-['Lato']">{{ t.universalSub }}</span>
    </h2>
    
    <div v-if="form.bannerUrl" class="relative group">
      <img :src="form.bannerUrl" class="w-full h-48 md:h-56 object-cover rounded-xl border border-[#131B2B]/10 shadow-sm" />
      <button 
        type="button" 
        @click="form.bannerUrl = ''" 
        class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-red-50 transition-colors border border-red-100 cursor-pointer"
      >
        {{ t.removeImg }}
      </button>
    </div>
    
    <div v-else class="flex flex-col items-center justify-center h-40 border-2 border-dashed border-[#131B2B]/20 rounded-xl hover:bg-[#131B2B]/5 hover:border-[#131B2B]/30 transition-colors relative cursor-pointer bg-[#131B2B]/5">
      <input type="file" @change="handleImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/jpeg, image/png, image/webp" />
      <div class="text-[#131B2B]/70 pointer-events-none flex flex-col items-center px-4 text-center">
         <svg class="w-8 h-8 mb-2 text-[#131B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
         <span class="text-sm font-bold text-[#131B2B]">{{ t.uploadBanner }}</span>
         <span class="text-xs font-semibold text-[#131B2B]/60 mt-1">JPEG, PNG or WEBP (Max 5MB)</span>
      </div>
    </div>
  </section>
</template>