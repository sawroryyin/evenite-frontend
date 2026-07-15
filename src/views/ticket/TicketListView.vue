<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../services/api';
import TicketCard from '../../components/ticket/TicketCard.vue';
import LoadingOverlay from '../../components/LoadingOverlay.vue';
import type { ReturnParticipantTicketListDto } from '../../types.ts';

const tickets = ref<ReturnParticipantTicketListDto[]>([]);
const isLoading = ref(true);

const filterOptions = ['ALL', 'ACTIVE', 'EXPIRED', 'CANCELLED'];
const selectedFilter = ref('ALL');

const fetchTickets = async () => {
  isLoading.value = true;
  try {
    const params = selectedFilter.value !== 'ALL' ? { ticketStatus: selectedFilter.value } : {};
    const response = await api.get('/users/me/tickets', { params }); //
    tickets.value = response.data;
  } catch (error) {
    console.error("Failed to load tickets", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchTickets);

// Refetch tickets whenever the user clicks a new filter
watch(selectedFilter, fetchTickets);
</script>

<template>
  <div class="pt-6 pb-24 max-w-4xl mx-auto bg-[#FFFFFF] min-h-screen font-['Lato'] px-4">
    <LoadingOverlay v-if="isLoading" />

    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#CECBF6] pb-4">
      <h1 class="text-[26px] font-['Nunito'] font-black text-[#26215C] tracking-tight">My Tickets</h1>
      
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button 
          v-for="filter in filterOptions" 
          :key="filter"
          @click="selectedFilter = filter"
          :class="selectedFilter === filter ? 'bg-[#534AB7] text-[#FFFFFF]' : 'bg-[#EEEDFE]/50 text-[#534AB7] hover:bg-[#CECBF6]/50'"
          class="px-4 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer border border-[#CECBF6]"
        >
          {{ filter }}
        </button>
      </div>
    </div>

    <div v-if="!isLoading && tickets.length === 0" class="text-center py-20 bg-[#EEEDFE]/30 rounded-2xl border border-[#CECBF6] border-dashed">
      <p class="text-[#26215C]/60 font-semibold mb-2">You don't have any tickets.</p>
      <p class="text-sm text-[#26215C]/40">Register for events to receive a digital ticket here.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TicketCard 
        v-for="ticket in tickets" 
        :key="ticket.id" 
        :ticket="ticket" 
      />
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>