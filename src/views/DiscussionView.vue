<script setup lang="ts">
import BottomNav from '../components/BottomNav.vue'

const mockChannels = [
  { id: 1, group: 'AI in Healthcare Seminar Group', snippet: 'Chaiwat: Remember to review the reading materials.', unread: true, timestamp: '14:22' },
  { id: 2, group: 'Web3 & Blockchain Hackathon Support', snippet: 'Saw Rory Yin updated the venue position.', unread: false, timestamp: 'Yesterday' },
  { id: 3, group: 'Google Cloud Cloud-Native Workshop', snippet: 'System: Registration verification code list sent.', unread: false, timestamp: 'May 15' }
]
</script>

<template>
  <div class="pt-4 pb-24 max-w-screen-md mx-auto bg-[#fafafa] min-h-screen font-['Plus_Jakarta_Sans'] px-4">
    <div class="mb-5">
      <h1 class="text-xl font-['Space_Grotesk'] font-bold text-gray-900 tracking-tight uppercase">Discussion Rooms</h1>
      <p class="text-[11px] font-['Lato'] text-gray-400 font-medium tracking-wide mt-0.5">Instant messaging networks for your enrolled events</p>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
      <div 
        v-for="chat in mockChannels" 
        :key="chat.id"
        class="p-4 flex items-center justify-between gap-3 hover:bg-purple-50/20 cursor-pointer transition-colors"
      >
        <div class="flex items-center gap-3 truncate">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-black font-['Space_Grotesk'] text-sm flex-shrink-0 shadow-inner">
            #
          </div>
          <div class="truncate">
            <h3 class="text-sm font-bold text-gray-900 truncate tracking-tight mb-0.5">{{ chat.group }}</h3>
            <p class="text-xs text-gray-400 truncate font-['Lato']" :class="{ 'text-purple-600 font-semibold': chat.unread }">
              {{ chat.snippet }}
            </p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1.5 flex-shrink-0 font-['Lato']">
          <span class="text-[9px] font-semibold text-gray-400">{{ chat.timestamp }}</span>
          <span v-if="chat.unread" class="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>