<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { ReturnParticipantTicketListDto } from '../../types';

const props = defineProps<{
  ticket: ReturnParticipantTicketListDto;
}>();

const router = useRouter();

const formattedDate = computed(() => {
  if (!props.ticket.event.startAt) return 'TBA';
  const date = new Date(props.ticket.event.startAt);
  return date.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
});

const statusColors = computed(() => {
  switch (props.ticket.status) {
    case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200'; //
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200'; //[cite: 3]
    case 'EXPIRED': return 'bg-gray-100 text-gray-700 border-gray-200'; //[cite: 3]
    default: return 'bg-[#EEEDFE] text-[#534AB7] border-[#CECBF6]';
  }
});
</script>

<template>
  <div 
    @click="router.push(`/events/${ticket.event.id}/tickets/${ticket.id}`)"
    class="flex flex-col bg-[#FFFFFF] rounded-2xl overflow-hidden shadow-sm border border-[#CECBF6] hover:shadow-md hover:border-[#534AB7] transition-all cursor-pointer group"
  >
    <div class="h-32 w-full relative bg-[#EEEDFE]/50 border-b border-[#CECBF6]">
      <img v-if="ticket.event.bannerUrl" :src="ticket.event.bannerUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <span 
        class="absolute top-3 right-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border shadow-sm"
        :class="statusColors"
      >
        {{ ticket.status }}
      </span>
    </div>
    
    <div class="p-4 flex flex-col gap-1.5 flex-1 justify-between">
      <div>
        <h3 class="text-sm font-bold text-[#26215C] line-clamp-2 leading-tight">
          {{ ticket.event.title.en || ticket.event.title.th }}
        </h3>
        <p class="text-xs text-[#26215C]/60 mt-1 flex items-center gap-1">
          <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {{ formattedDate }}
        </p>
      </div>
      <p class="text-[10px] font-bold text-[#534AB7] mt-3">View Full Ticket &rarr;</p>
    </div>
  </div>
</template>