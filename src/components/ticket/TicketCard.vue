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
    case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
    case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
    case 'EXPIRED': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-[#EEEDFE] text-[#534AB7] border-[#CECBF6]';
  }
});
</script>

<template>
  <div 
    @click="router.push(`/events/${ticket.event.id}/tickets/${ticket.id}`)"
    class="relative cursor-pointer group mb-4"
  >
    <!-- Mathematical positioning: w-28 is 112px. left-28 centers it at the start of the divider. -->
    <div class="notch notch-top absolute top-0 left-28 sm:left-32 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full border border-[#CECBF6] z-10"></div>
    <div class="notch notch-bottom absolute bottom-0 left-28 sm:left-32 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full border border-[#CECBF6] z-10"></div>

    <div class="flex bg-[#FFFFFF] rounded-2xl overflow-hidden shadow-sm border border-[#CECBF6] group-hover:shadow-md group-hover:border-[#534AB7] transition-all">
      <div class="w-28 sm:w-32 aspect-2/3 shrink-0 relative bg-[#EEEDFE]/50">
        <img 
          v-if="ticket.event.bannerUrl" 
          :src="ticket.event.bannerUrl" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <svg class="w-8 h-8 text-[#534AB7]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div class="relative flex-1 min-w-0">
        <div class="ticket-divider absolute left-0 top-0 bottom-0"></div>

        <div class="p-4 pl-5 sm:p-5 sm:pl-6 flex flex-col gap-2 h-full justify-between">
          <div>
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-base font-bold text-[#26215C] line-clamp-2 leading-tight">
                {{ ticket.event.title.en || ticket.event.title.th }}
              </h3>
              <span 
                class="shrink-0 px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md border shadow-sm whitespace-nowrap"
                :class="statusColors"
              >
                {{ ticket.status }}
              </span>
            </div>
            <p class="text-sm text-[#26215C]/60 mt-2 flex items-center gap-1.5 font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {{ formattedDate }}
            </p>
          </div>
          <p class="text-xs font-bold text-[#534AB7] mt-3 tracking-wide">View Full Ticket &rarr;</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notch {
  background-color: #F4F4FA;
  border: none;
}

.ticket-divider {
  width: 1px;
  background-image: repeating-linear-gradient(
    to bottom,
    #CECBF6 0,
    #CECBF6 4px,
    transparent 4px,
    transparent 9px
  );
}
</style>