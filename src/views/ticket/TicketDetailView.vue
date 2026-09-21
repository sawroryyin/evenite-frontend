<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import TicketQRCode from '../../components/ticket/TicketQRCode.vue';
import LoadingOverlay from '../../components/LoadingOverlay.vue';
import ConfirmModal from '../../components/ConfirmModal.vue';
import type { ReturnTicketDetailDto } from '../../types';

const route = useRoute();
const router = useRouter();
const showSuccessModal = ref(false);
const ticketId = route.params.ticketId as string;
const ticket = ref<ReturnTicketDetailDto | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  if (route.query.newRegistration) {
    showSuccessModal.value = true;
    router.replace({ query: undefined });
  }

  try {
    isLoading.value = true;
    const response = await api.get(`/users/me/tickets/${ticketId}`);
    ticket.value = response.data;
  } catch (error) {
    console.error("Failed to load ticket details", error);
  } finally {
    isLoading.value = false;
  }
});

const formattedDateOnly = computed(() => {
  if (!ticket.value?.event.startAt) return 'TBA';
  const date = new Date(ticket.value.event.startAt);
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });
});

const formattedTimeOnly = computed(() => {
  if (!ticket.value?.event.startAt) return 'TBA';
  const date = new Date(ticket.value.event.startAt);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', minute: '2-digit', hour12: true 
  });
});

const goBack = () => {
  if (window.history.state?.back) {
    router.back();
  } 
  else if (ticket.value) {
    router.push('/events'); 
  }
};

const goToEventDetails = () => {
  if (ticket.value) {
    router.push(`/event/${ticket.value.event.id}`);
  }
};

const formattedLocation = computed(() => {
  const locEn = ticket.value?.event.location?.en;
  const locTh = ticket.value?.event.location?.th;
  
  if (locEn) return locEn;
  if (locTh) return locTh;
  
  return 'Online';
});
</script>

<template>
  <div class="pt-6 pb-24 max-w-lg mx-auto min-h-screen font-['Lato'] px-6">
    <LoadingOverlay v-if="isLoading" message="Loading..." />

    <div class="space-y-4 mb-6">
      <button @click="goBack" class="text-[#131B2B]/70 hover:text-[#131B2B] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        BACK
      </button>
    </div>

    <!-- digital ticket -->
    <div v-if="!isLoading && ticket" class="space-y-6">
      <!-- Replaced shadow-lg with drop-shadow-lg to wrap around the transparent holes -->
      <div class="relative w-full flex flex-col drop-shadow-lg">

        <!-- Top: Event Details Section -->
        <!-- Added .ticket-top class for CSS masking -->
        <div class="ticket-top p-6 pb-6 bg-[#131B2B] rounded-t-2xl">
          <!-- Added items-start, gap-4, and moved margins -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <!-- Added flex-1 and break-words to force long titles to wrap -->
            <h2 class="flex-1 wrap-break-word text-2xl sm:text-3xl font-bold text-white leading-tight mb-0">
              {{ ticket.event.title.en || ticket.event.title.th }}
            </h2>
            <!-- Added shrink-0 and removed ml-4 to keep badge firmly in bounds -->
            <span 
              class="shrink-0 mt-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border"
              :class="ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'"
            >
              {{ ticket.status }}
            </span>
          </div>
          
          <div class="flex items-center gap-6 sm:gap-10 mb-2 text-sm text-white pb-1">
            <!-- Date -->
            <p class="flex items-center gap-1.5 whitespace-nowrap">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>{{ formattedDateOnly }}
            </p>
            <!-- Time -->
            <p class="flex items-center gap-1.5 whitespace-nowrap">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>{{ formattedTimeOnly }}
            </p>
          </div>
          
          <!-- Location -->
          <p class="text-sm text-white flex items-start gap-1.5">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span class="leading-tight">{{ formattedLocation }}</span>
          </p>
        </div>

        <div class="relative w-full h-0 z-10">
          <!-- Dashed line updated with left-4 right-4 so it doesn't cross the empty notches -->
          <div class="absolute left-4 right-4 top-0 border-t-2 border-[#131B2B]/10 border-dashed"></div>
        </div>

        <!-- Bottom: QR Code & Participant Snapshot -->
        <!-- Added .ticket-bottom class for CSS masking -->
        <div class="ticket-bottom bg-white rounded-b-2xl overflow-hidden">
          
          <!-- QR Code Section -->
          <div class="pt-10 px-6 pb-8 flex flex-col items-center justify-center border-b border-[#131B2B]/5">
            <p class="text-sm font-bold text-[#131B2B]/50 uppercase tracking-widest mb-4">Present at check-in</p>
            
            <div :class="{'opacity-30': ticket.status !== 'ACTIVE'}">
              <TicketQRCode :token="ticket.qrToken" />
            </div>
          </div>

          <!-- Participant Snapshot Section -->
          <div class="p-6 bg-[#FAFAFA]">
            <h4 class="text-xs font-bold text-[#131B2B] uppercase tracking-widest mb-4">Participant Details</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-[#131B2B]/50 text-xs mb-0.5">Name</p>
                <p class="font-bold text-[#131B2B]">{{ ticket.participantSnapshot.firstName }} {{ ticket.participantSnapshot.lastName || '' }}</p>
              </div>
              <div>
                <p class="text-[#131B2B]/50 text-xs mb-0.5">Student ID</p>
                <p class="font-bold text-[#131B2B]">{{ ticket.participantSnapshot.studentId || 'N/A' }}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
      <button 
        @click="goToEventDetails"
        class="w-full mt-6 bg-white hover:bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm"
      >
        Go to Event Details
      </button>

    </div>
    <ConfirmModal 
      v-if="showSuccessModal"
      title="Registration Successful"
      description="Your digital ticket has been generated."
      confirmTheme="blue"
      confirmText="OK"
      @confirm="showSuccessModal = false"
    />
  </div>
</template>

<style scoped>
/* Bottom-left and Bottom-right transparent cut-outs */
.ticket-top {
  mask-image: 
    radial-gradient(circle at 0% 100%, transparent 12px, black 12.5px), 
    radial-gradient(circle at 100% 100%, transparent 12px, black 12.5px);
  mask-size: 51% 100%;
  mask-repeat: no-repeat;
  mask-position: left, right;
  
  -webkit-mask-image: 
    radial-gradient(circle at 0% 100%, transparent 12px, black 12.5px), 
    radial-gradient(circle at 100% 100%, transparent 12px, black 12.5px);
  -webkit-mask-size: 51% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: left, right;
}

/* Top-left and Top-right transparent cut-outs */
.ticket-bottom {
  mask-image: 
    radial-gradient(circle at 0% 0%, transparent 12px, black 12.5px), 
    radial-gradient(circle at 100% 0%, transparent 12px, black 12.5px);
  mask-size: 51% 100%;
  mask-repeat: no-repeat;
  mask-position: left, right;
  
  -webkit-mask-image: 
    radial-gradient(circle at 0% 0%, transparent 12px, black 12.5px), 
    radial-gradient(circle at 100% 0%, transparent 12px, black 12.5px);
  -webkit-mask-size: 51% 100%;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: left, right;
}
</style>