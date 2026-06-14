<script setup lang="ts">
import BottomNav from '../components/BottomNav.vue'

const mockChannels = [
  { id: 1, group: 'AI in Healthcare Seminar Group', snippet: 'Chaiwat: Remember to review the reading materials.', unread: true, timestamp: '14:22' },
  { id: 2, group: 'Web3 & Blockchain Hackathon Support', snippet: 'Saw Rory Yin updated the venue position.', unread: false, timestamp: 'Yesterday' },
  { id: 3, group: 'Google Cloud Cloud-Native Workshop', snippet: 'System: Registration verification code list sent.', unread: false, timestamp: 'May 15' }
]
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    
    <div class="mb-5 relative z-10">
      <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
        Discussion Rooms
      </h1>
      <p class="text-[11px] font-['Lato'] text-[#26215C]/60 font-medium tracking-wide mt-1.5">
        Instant messaging networks for your enrolled events
      </p>
    </div>

    <div class="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#CECBF6] divide-y divide-[#CECBF6]/50 overflow-hidden relative z-10">
      <div 
        v-for="chat in mockChannels" 
        :key="chat.id"
        class="p-4 flex items-center justify-between gap-3 hover:bg-[#EEEDFE]/30 cursor-pointer transition-colors"
      >
        <div class="flex items-center gap-3 truncate">
          <div class="w-10 h-10 rounded-xl bg-[#EEEDFE] flex items-center justify-center 
          text-[#534AB7] font-black text-[14px] shrink-0 border border-[#CECBF6]/50">
            #
          </div>
          <div class="truncate">
            <h3 class="text-[14px] font-bold text-[#26215C] truncate tracking-tight mb-0.5">{{ chat.group }}</h3>
            <p class="text-[12px] text-[#26215C]/60 truncate" :class="{ 'text-[#534AB7] font-bold': chat.unread }">
              {{ chat.snippet }}
            </p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <span class="text-[10px] font-bold text-[#26215C]/40 uppercase tracking-wider">{{ chat.timestamp }}</span>
          <span v-if="chat.unread" class="w-2.5 h-2.5 rounded-full bg-[#534AB7] animate-pulse"></span>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>