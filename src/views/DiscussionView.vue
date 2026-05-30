<script setup lang="ts">
import BottomNav from '../components/BottomNav.vue'

const mockChannels = [
  { id: 1, group: 'AI in Healthcare Seminar Group', snippet: 'Chaiwat: Remember to review the reading materials.', unread: true, timestamp: '14:22' },
  { id: 2, group: 'Web3 & Blockchain Hackathon Support', snippet: 'Saw Rory Yin updated the venue position.', unread: false, timestamp: 'Yesterday' },
  { id: 3, group: 'Google Cloud Cloud-Native Workshop', snippet: 'System: Registration verification code list sent.', unread: false, timestamp: 'May 15' }
]
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#fafafa] min-h-screen font-['Lato'] px-4">
    
    <div class="mb-5 relative z-10">
      <h1 class="text-[22px] font-['Nunito'] font-black text-transparent bg-clip-text bg-linear-to-r from-purple-600 
      to-indigo-600 tracking-tight leading-none">
        Discussion Rooms
      </h1>
      <p class="text-[11px] font-['Lato'] text-gray-400 font-medium tracking-wide">
        Instant messaging networks for your enrolled events
      </p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden relative z-10">
      <div 
        v-for="chat in mockChannels" 
        :key="chat.id"
        class="p-3.5 flex items-center justify-between gap-3 hover:bg-purple-50/20 cursor-pointer transition-colors"
      >
        <div class="flex items-center gap-3 truncate">
          <div class="w-9 h-9 rounded-lg bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center 
          text-purple-600 font-black text-[13px] shrink-0 shadow-inner">
            #
          </div>
          <div class="truncate">
            <h3 class="text-[13px] font-bold text-gray-900 truncate tracking-tight mb-0.5">{{ chat.group }}</h3>
            <p class="text-[11px] text-gray-400 truncate" :class="{ 'text-purple-600 font-bold': chat.unread }">
              {{ chat.snippet }}
            </p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0">
          <span class="text-[9px] font-semibold text-gray-400">{{ chat.timestamp }}</span>
          <span v-if="chat.unread" class="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>