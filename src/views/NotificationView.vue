<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

const feedItems = [
  { id: 1, title: 'Event Update Notification', details: 'The venue for "Web3 Regionals Hackathon" has changed to Library SCB Floor 3.', 
  elapsed: '15 mins ago', type: 'update' },
  { id: 2, title: 'Form Verification Match', details: 'Chaiwat confirmed your registration attendance request for AI Seminar.', 
  elapsed: '2 hours ago', type: 'approval' }
]
</script>

<template>
  <div class="pt-4 pb-12 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    
    <button @click="router.back()" class="mb-5 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 font-bold 
    text-[11px] transition-colors cursor-pointer uppercase tracking-wide">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" 
        stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back
    </button>

    <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none mb-6">
      Notifications
    </h1>

    <div class="space-y-3">
      <div 
        v-for="item in feedItems" 
        :key="item.id" 
        class="bg-[#FFFFFF] p-4 rounded-2xl border border-[#CECBF6] shadow-sm flex gap-3"
      >
        <div 
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-[#CECBF6]/50"
          :class="item.type === 'update' ? 'bg-[#EEEDFE] text-[#534AB7]' : 'bg-[#EEEDFE]/50 text-[#3C3489]'"
        >
          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-[14px] font-bold text-[#26215C] tracking-tight">{{ item.title }}</h2>
          <p class="text-[12px] text-[#26215C]/70 font-medium mt-1 leading-snug">{{ item.details }}</p>
          <span class="text-[10px] font-bold text-[#26215C]/40 uppercase mt-2 block tracking-widest">{{ item.elapsed }}</span>
        </div>
      </div>
    </div>
  </div>
</template>