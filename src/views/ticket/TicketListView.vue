<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../services/api';
import TicketCard from '../../components/ticket/TicketCard.vue';
import type { ReturnParticipantTicketListDto } from '../../types.ts';
import BottomNav from '../../components/BottomNav.vue'

const tickets = ref<ReturnParticipantTicketListDto[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

const filterOptions = ['ALL', 'ACTIVE', 'EXPIRED', 'CANCELLED'];
const selectedFilter = ref('ALL');

const fetchTickets = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    const params = selectedFilter.value !== 'ALL' ? { ticketStatus: selectedFilter.value } : {};
    const response = await api.get('/users/me/tickets', { params });
    tickets.value = response.data;
  } catch (error) {
    console.error('Failed to load tickets', error);
    errorMessage.value = 'Failed to sync with local ticket registry server. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
  fetchTickets()
});

// Refetch tickets whenever the user clicks a new filter
watch(selectedFilter, fetchTickets);
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">

    <div class="flex justify-between items-center mb-5 relative z-10">
      <div>
        <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          My Tickets
        </h1>
        <p class="text-[11px] font-['Lato'] text-[#26215C]/70 font-medium mt-1.5 tracking-wide">
          View and manage your event tickets
        </p>
      </div>
    </div>

    <div class="flex w-full bg-[#FFFFFF] rounded-xl shadow-sm border border-[#CECBF6] p-1 mb-4 relative z-10">
      <button
        v-for="filter in filterOptions"
        :key="filter"
        @click="selectedFilter = filter"
        class="flex-1 text-center py-1.5 px-0.5 text-[9.5px] min-[380px]:text-[10px] sm:text-[11px] font-bold rounded-lg transition-colors tracking-tight whitespace-nowrap"
        :class="selectedFilter === filter ?
         'bg-[#534AB7] text-[#FFFFFF] shadow-xs' :
         'text-[#26215C]/70 hover:bg-[#EEEDFE] hover:text-[#3C3489]'"
      >
        {{ filter }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-16">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#534AB7] mx-auto"></div>
      <p class="text-[#26215C]/70 text-[11px] mt-3 font-medium">Fetching records from server...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-4 rounded-xl border
    border-red-100 text-[11px] font-bold text-center">
      {{ errorMessage }}
    </div>

    <div v-else-if="tickets.length === 0" class="text-center py-14 bg-[#FFFFFF] rounded-xl border
    border-[#CECBF6] shadow-xs relative z-10">
      <div class="w-10 h-10 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-2.5">
        <svg class="w-5 h-5 text-[#534AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v3a2 2 0 010 4v3a2 2 0 002 2h2m6-14h2a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2h-2M9 5v14M9 9h.01M9 15h.01"></path>
        </svg>
      </div>
      <p class="text-[11px] font-bold text-[#26215C]/70">You don't have any tickets yet.</p>
    </div>

    <div v-else class="space-y-3 relative z-10">
      <TicketCard
        v-for="ticket in tickets"
        :key="ticket.id"
        :ticket="ticket"
      />
    </div>

    <BottomNav />
  </div>
</template>