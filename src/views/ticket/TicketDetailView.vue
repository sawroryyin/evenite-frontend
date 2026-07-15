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
    const response = await api.get(`/users/me/tickets/${ticketId}`); //[cite: 4]
    ticket.value = response.data;
  } catch (error) {
    console.error("Failed to load ticket details", error);
  } finally {
    isLoading.value = false;
  }
});

const formattedDate = computed(() => {
  if (!ticket.value?.event.startAt) return 'TBA';
  const date = new Date(ticket.value.event.startAt);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
});
</script>

<template>
  <div class="pt-6 pb-24 max-w-lg mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    <LoadingOverlay v-if="isLoading" />

    <div v-if="!isLoading && ticket" class="space-y-6">
      <button @click="router.back()" class="text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        BACK
      </button>

      <!-- The Digital Ticket Container -->
      <div class="bg-[#FFFFFF] border border-[#CECBF6] rounded-3xl shadow-lg overflow-hidden flex flex-col relative">
        
        <!-- Banner Section -->
        <div class="h-32 w-full bg-[#EEEDFE]">
          <img v-if="ticket.event.bannerUrl" :src="ticket.event.bannerUrl" class="w-full h-full object-cover opacity-90" />
        </div>

        <!-- Event Details Section -->
        <div class="p-6 pb-2 border-b-2 border-dashed border-[#CECBF6]">
          <span 
            class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border mb-2 inline-block shadow-sm"
            :class="ticket.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'"
          >
            {{ ticket.status }}
          </span>
          <h2 class="text-xl font-bold text-[#26215C] leading-tight mb-2">
            {{ ticket.event.title.en || ticket.event.title.th }}
          </h2>
          <p class="text-xs text-[#26215C]/80 flex items-center gap-1 mb-1">
            <svg class="w-4 h-4 shrink-0 text-[#7F77DD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {{ formattedDate }}
          </p>
          <p class="text-xs text-[#26215C]/80 flex items-center gap-1">
            <svg class="w-4 h-4 shrink-0 text-[#7F77DD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
            {{ ticket.event.location.en || ticket.event.location.th }}
          </p>
        </div>

        <!-- QR Code Section -->
        <div class="p-6 flex flex-col items-center justify-center bg-[#F9F9FF]">
          <p class="text-[10px] font-bold text-[#26215C]/50 uppercase tracking-widest mb-4">Present at check-in</p>
          
          <div :class="{'opacity-30': ticket.status !== 'ACTIVE'}">
            <!-- Render QR using the reusable component -->
            <TicketQRCode :token="ticket.qrToken" />
          </div>
          
          <p v-if="ticket.status !== 'ACTIVE'" class="text-sm font-bold text-red-500 mt-4">
            Ticket is {{ ticket.status.toLowerCase() }}
          </p>
        </div>

        <!-- Participant Snapshot Section -->
        <div class="p-4 bg-[#EEEDFE]/30 border-t border-[#CECBF6]">
          <h4 class="text-[10px] font-bold text-[#534AB7] uppercase tracking-widest mb-2">Participant Details</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
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

        <!-- Scalloped edges for ticket visual effect -->
        <div class="absolute -left-3 top-48 w-6 h-6 bg-[#FFFFFF] rounded-full"></div>
        <div class="absolute -right-3 top-48 w-6 h-6 bg-[#FFFFFF] rounded-full"></div>
      </div>

      <button 
        @click="router.push(`/event/${ticket.event.id}`)"
        class="w-full bg-[#EEEDFE] hover:bg-[#CECBF6] text-[#534AB7] border border-[#CECBF6] py-3.5 rounded-xl font-bold text-sm transition-all"
      >
        Go to Event Details
      </button>

    </div>
  </div>
</template>