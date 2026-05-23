<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const feedItems = [
  { id: 1, title: 'Event Update Notification', details: 'The venue for "Web3 Regionals Hackathon" has changed to Library SCB Floor 3.', elapsed: '15 mins ago', type: 'update' },
  { id: 2, title: 'Form Verification Match', details: 'Chaiwat confirmed your registration attendance request for AI Seminar.', elapsed: '2 hours ago', type: 'approval' }
]
</script>

<template>
  <div class="pt-4 pb-12 max-w-screen-md mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4">
    
    <div class="flex items-center gap-2 mb-4">
      <button @click="router.back()" class="p-1 text-gray-400 hover:text-purple-600 transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <h1 class="text-[22px] font-['Nunito'] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-purple-600 to-indigo-600 tracking-tight leading-none">Notifications</h1>
    </div>

    <div class="space-y-2.5">
      <div 
        v-for="item in feedItems" 
        :key="item.id" 
        class="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex gap-3"
      >
        <div 
          class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs"
          :class="item.type === 'update' ? 'bg-purple-50 text-purple-600' : 'bg-indigo-50 text-indigo-600'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-[13px] font-bold text-gray-900 tracking-tight">{{ item.title }}</h2>
          <p class="text-[11px] text-gray-500 font-medium mt-0.5 leading-snug">{{ item.details }}</p>
          <span class="text-[9px] font-bold text-gray-400 uppercase mt-1.5 block tracking-wider">{{ item.elapsed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>