<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '../../types';

interface MessageWithHeaderFlag extends Message {
  hideHeader?: boolean;
}

const props = defineProps<{
  message: MessageWithHeaderFlag;
  isMine: boolean;
  hideHeader?: boolean;
}>();

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const bubbleClass = computed(() => {
  if (props.message.isAnnouncement) return 'bg-[#26215C] text-[#FFFFFF] shadow-sm border border-[#26215C]';
  if (props.isMine) return 'bg-[#534AB7] text-[#FFFFFF] shadow-sm border border-[#534AB7]';
  return 'bg-[#FFFFFF] text-[#26215C] shadow-sm border border-[#CECBF6]';
});
</script>

<template>
  <div v-if="message.isDivider" :id="message.id" class="flex w-full items-center justify-center my-4 py-1">
    <div class="h-px bg-[#534AB7]/30 flex-1"></div>
    <span class="px-3 text-[10px] font-bold text-[#534AB7] tracking-widest uppercase bg-[#F4F4FA]">
      {{ message.content }}
    </span>
    <div class="h-px bg-[#534AB7]/30 flex-1"></div>
  </div>

  <div v-else class="flex w-full items-end" :class="isMine ? 'justify-end' : 'justify-start'">
    <div v-if="!isMine" class="w-7 mr-2 shrink-0">
      <img 
        v-if="!hideHeader"
        :src="message.sender.imageUrl || 'https://ui-avatars.com/api/?name=' + message.sender.name + '&background=EEEDFE&color=534AB7'" 
        alt="Avatar" 
        class="w-7 h-7 rounded-full object-cover border border-[#CECBF6]"
      />
    </div>
    
    <div class="flex flex-col max-w-[78%]" :class="isMine ? 'items-end' : 'items-start'">
      <div 
        v-if="!hideHeader" 
        class="flex items-baseline mb-1 gap-1.5 px-1" 
        :class="isMine ? 'flex-row-reverse' : 'flex-row'"
      >
        <span v-if="!isMine" class="text-[10px] font-bold text-[#26215C]/80 tracking-wide">
          {{ message.sender.name }}
          <span v-if="message.sender.role === 'ORGANIZER'" class="text-[#534AB7] ml-0.5">(Organizer)</span>
        </span>
        <span class="text-[9px] font-medium text-[#26215C]/40">{{ formatTime(message.createdAt) }}</span>
      </div>
      
      <div 
        class="px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed" 
        :class="[
          bubbleClass, 
          isMine 
            ? (hideHeader ? 'rounded-r-md' : 'rounded-tr-xs') 
            : (hideHeader ? 'rounded-l-md' : 'rounded-tl-xs')
        ]"
      >
        <div v-if="message.isAnnouncement" class="text-[9px] font-bold uppercase tracking-widest text-[#CECBF6] mb-1 flex items-center">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>
          Announcement
        </div>
        <p class="whitespace-pre-wrap wrap-break-word">{{ message.content }}</p>
      </div>
    </div>
  </div>
</template>