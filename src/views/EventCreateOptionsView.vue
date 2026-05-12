<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="p-6 max-w-md mx-auto">

    <button @click="router.back()" class="mb-6 text-gray-500 hover:text-gray-800 flex items-center gap-2 font-medium transition cursor-pointer">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>

    <h1 class="text-2xl font-bold text-center mb-2">Create an Event</h1>
    <p class="text-gray-500 text-center mb-8">How would you like to build your event?</p>

    <div class="space-y-4">
      <!-- Option 1: Prompt -->
      <div @click="router.push({ name: 'create-prompt' })" class="border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition shadow-sm">
        <div class="bg-blue-100 text-blue-600 p-3 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </div>
        <div>
          <h3 class="font-bold text-lg text-gray-800">Generate from Prompt</h3>
          <p class="text-sm text-gray-500">Type a description and let AI fill the details.</p>
        </div>
      </div>

      <!-- Option 2: Image Upload -->
      <div @click="router.push({ name: 'create-image' })" class="border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition shadow-sm">
        <div class="bg-purple-100 text-purple-600 p-3 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div>
          <h3 class="font-bold text-lg text-gray-800">Generate from Image</h3>
          <p class="text-sm text-gray-500">Upload a poster or screenshot to extract data.</p>
        </div>
      </div>

      <!-- Option 3: Manual -->
      <div @click="router.push({ name: 'create-detail' })" class="border border-gray-200 rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-gray-500 hover:bg-gray-100 transition shadow-sm">
        <div class="bg-gray-200 text-gray-600 p-3 rounded-lg">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </div>
        <div>
          <h3 class="font-bold text-lg text-gray-800">Create Manually</h3>
          <p class="text-sm text-gray-500">Start from a blank form and fill it yourself.</p>
        </div>
      </div>
    </div>
  </div>
</template>