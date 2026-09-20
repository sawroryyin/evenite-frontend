<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../services/api';
import TicketCard from '../../components/ticket/TicketCard.vue';
import type { ReturnParticipantTicketListDto } from '../../types.ts';
import BottomNav from '../../components/BottomNav.vue'

const tickets = ref<ReturnParticipantTicketListDto[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

const filterOptions = ['All', 'Active', 'Expired', 'Cancelled'];
const selectedFilter = ref('All');

const fetchTickets = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const dbFilterStatus = selectedFilter.value.toUpperCase();
    const params = dbFilterStatus !== 'ALL' ? { ticketStatus: dbFilterStatus } : {};
    
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
  <div class="pt-6 pb-28 max-w-3xl mx-auto min-h-screen font-['Lato'] px-5">

    <div class="flex justify-between items-center mb-4 relative z-10">
      <div>
        <h1 class="text-2xl font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          My Tickets
        </h1>
        <p class="text-sm font-['Lato'] text-[#26215C]/70 font-semibold mt-2 tracking-wide">
          View and manage your event tickets
        </p>
      </div>
    </div>

    <div class="flex w-full bg-white rounded-3xl shadow-sm border border-[#131B2B]/10 p-1.5 mb-6 relative z-10">
      <button
        v-for="filter in filterOptions"
        :key="filter"
        @click="selectedFilter = filter"
        class="flex-1 text-center py-2.5 px-1 text-xs sm:text-sm font-bold rounded-3xl transition-colors tracking-tight whitespace-nowrap cursor-pointer"
        :class="selectedFilter === filter ?
        'bg-[#131B2B] text-white shadow-sm' :
        'text-[#131B2B]/70 hover:bg-[#131B2B]/5 hover:text-[#131B2B]'"
      >
        {{ filter }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#534AB7] mx-auto"></div>
      <p class="text-[#26215C]/70 text-sm mt-4 font-bold tracking-widest uppercase">Fetching records...</p>
    </div>

    <div v-else-if="errorMessage" class="bg-red-50 text-red-600 p-5 rounded-xl border
    border-red-200 text-sm font-bold text-center shadow-sm">
      {{ errorMessage }}
    </div>

    <div v-else-if="tickets.length === 0" class="text-center py-16 bg-[#FFFFFF] rounded-3xl border border-[#CECBF6] shadow-sm relative z-10">
      <div class="w-14 h-14 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-[#534AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 010 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 010-4V7a2 2 0 00-2-2H5z"></path>
        </svg>
      </div>
      <p class="text-sm font-bold text-[#26215C]/70">You don't have any tickets yet.</p>
    </div>

    <div v-else class="space-y-4 relative z-10">
      <TicketCard
        v-for="ticket in tickets"
        :key="ticket.id"
        :ticket="ticket"
      />
    </div>

    <BottomNav />
  </div>
</template>