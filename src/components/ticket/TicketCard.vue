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
    default: return 'bg-[#131B2B]/5 text-[#131B2B] border-[#131B2B]/10';
  }
});
</script>

<template>
  <!-- 1. Add 'drop-shadow-sm', 'hover:drop-shadow-md', and 'transition-all' to the outermost wrapper -->
  <div 
    @click="router.push(`/events/${ticket.event.id}/tickets/${ticket.id}`)"
    class="relative cursor-pointer group mb-4 drop-shadow-sm hover:drop-shadow-md transition-all"
  >
    <!-- 2. Remove 'shadow-sm' and 'group-hover:shadow-md' from this inner ticket-mask div -->
    <div class="ticket-mask flex bg-white rounded-2xl overflow-hidden border border-[#131B2B]/10 group-hover:border-[#131B2B]/30 transition-all">
      
      <div class="w-28 sm:w-32 aspect-4/5 shrink-0 relative bg-[#131B2B]/5">
        <img 
          v-if="ticket.event.bannerUrl" 
          :src="ticket.event.bannerUrl" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <svg class="w-8 h-8 text-[#131B2B]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div class="relative flex-1 min-w-0">
        <div class="ticket-divider absolute left-0 top-0 bottom-0"></div>

        <div class="p-4 pl-5 sm:p-5 sm:pl-6 flex flex-col gap-2 h-full justify-between">
          <div>
            <div class="flex items-start justify-between gap-3">
              <h3 class="text-base font-bold text-[#131B2B] line-clamp-2 leading-tight">
                {{ ticket.event.title.en || ticket.event.title.th }}
              </h3>
              <span 
                class="shrink-0 px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md border shadow-sm whitespace-nowrap"
                :class="statusColors"
              >
                {{ ticket.status }}
              </span>
            </div>
            <p class="text-sm text-[#131B2B]/60 mt-2 flex items-center gap-1.5 font-medium">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {{ formattedDate }}
            </p>
          </div>
          <p class="text-xs font-bold text-[#131B2B] mt-3 tracking-wide">View Full Ticket &rarr;</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Creates the transparent cut-out effect */
.ticket-mask {
  /* Default mask position matches w-28 (112px) */
  --notch-pos: 112px; 
  --notch-radius: 10px;

  /* Standard properties (Modern Browsers, Firefox) */
  mask-image: 
    radial-gradient(circle at var(--notch-pos) 0%, transparent var(--notch-radius), black calc(var(--notch-radius) + 0.5px)),
    radial-gradient(circle at var(--notch-pos) 100%, transparent var(--notch-radius), black calc(var(--notch-radius) + 0.5px));
  mask-size: 100% 51%, 100% 51%;
  mask-position: top, bottom;
  mask-repeat: no-repeat;

  /* WebKit prefixed properties (Safari, older Chrome/Edge) */
  -webkit-mask-image: 
    radial-gradient(circle at var(--notch-pos) 0%, transparent var(--notch-radius), black calc(var(--notch-radius) + 0.5px)),
    radial-gradient(circle at var(--notch-pos) 100%, transparent var(--notch-radius), black calc(var(--notch-radius) + 0.5px));
  -webkit-mask-size: 100% 51%, 100% 51%;
  -webkit-mask-position: top, bottom;
  -webkit-mask-repeat: no-repeat;
}

.ticket-divider {
  width: 1px;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(19, 27, 43, 0.1) 0,
    rgba(19, 27, 43, 0.1) 4px,
    transparent 4px,
    transparent 9px
  );
}
</style>