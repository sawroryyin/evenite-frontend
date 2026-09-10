<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../services/api';
import TicketQRCode from '../../components/ticket/TicketQRCode.vue';
import LoadingOverlay from '../../components/LoadingOverlay.vue';
import type { ReturnTicketDetailDto } from '../../types';

const route = useRoute();
const router = useRouter();

const ticketId = route.params.ticketId as string;
const ticket = ref<ReturnTicketDetailDto | null>(null);
const isLoading = ref(true);

onMounted(async () => {
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
  <div class="pt-6 pb-24 max-w-lg mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-6">
    <LoadingOverlay v-if="isLoading" message="Loading..." />

    <div class="space-y-4 mb-6">
      <!-- Update: Bind to goBack -->
      <button @click="goBack" class="text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        BACK
      </button>
    </div>

    <!-- digital ticket -->
    <div v-if="!isLoading && ticket" class="space-y-6">
      <div class="relative w-full flex flex-col shadow-lg rounded-2xl">

        <!-- Top: Event Details Section -->
        <div class="p-6 pb-6 bg-[#534AB7] rounded-t-2xl border border-[#CECBF6] border-b-0">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-3xl font-bold text-[#FFFFFF] leading-tight mb-2">
              {{ ticket.event.title.en || ticket.event.title.th }}
            </h2>
            <span 
              class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border mb-2 inline-block shrink-0 ml-4"
              :class="ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'"
            >
              {{ ticket.status }}
            </span>
          </div>
          
          <div class="flex items-center gap-18 mb-1 text-m text-[#FFFFFF] pb-1">
            <!-- Date -->
            <p class="flex items-center gap-1">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>{{ formattedDateOnly }}
            </p>
            <!-- Time -->
            <p class="flex items-center gap-1">
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>{{ formattedTimeOnly }}
            </p>
          </div>
          
          <!-- Location -->
          <p class="text-m text-[#FFFFFF] flex items-start gap-1.5">
            <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span class="leading-tight">{{ formattedLocation }}</span>
          </p>
        </div>

        <div class="relative w-full h-0 z-10">
          <!-- Dashed line -->
          <div class="absolute left-0 right-0 top-0 border-t-2 border-[#CECBF6] border-dashed"></div>
          
          <!-- Left and Right Notches (positioned perfectly on the line via -top-3) -->
          <div class="absolute -left-3 -top-3 w-6 h-6 bg-[#FFFFFF] rounded-full"></div>
          <div class="absolute -right-3 -top-3 w-6 h-6 bg-[#FFFFFF] rounded-full"></div>
        </div>

        <!-- Bottom: QR Code & Participant Snapshot -->
        <div class="bg-[#F4EbFF] rounded-b-2xl border border-[#CECBF6] border-t-0 overflow-hidden">
          
          <!-- QR Code Section -->
          <div class="pt-12 px-6 pb-12 flex flex-col items-center justify-center">
            <p class="text-m font-bold text-[#26215C]/50 uppercase tracking-widest mb-4">Present at check-in</p>
            
            <div :class="{'opacity-30': ticket.status !== 'ACTIVE'}">
              <TicketQRCode :token="ticket.qrToken" />
            </div>
          </div>

          <!-- Participant Snapshot Section -->
          <div class="p-6">
            <h4 class="text-m font-bold text-[#26215C] uppercase tracking-widest mb-4">Participant Details</h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-[#26215C]/50">Name</p>
                <p class="font-bold text-[#26215C]">{{ ticket.participantSnapshot.firstName }} {{ ticket.participantSnapshot.lastName || '' }}</p>
              </div>
              <div>
                <p class="text-[#26215C]/50">Student ID</p>
                <p class="font-bold text-[#26215C]">{{ ticket.participantSnapshot.studentId || 'N/A' }}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
      <button 
        @click="goToEventDetails"
        class="w-full mt-6 bg-[#EEEDFE] hover:bg-[#CECBF6] text-[#534AB7] border border-[#CECBF6] py-3.5 rounded-xl font-bold text-sm transition-all"
      >
        Go to Event Details
      </button>

    </div>
  </div>
</template>