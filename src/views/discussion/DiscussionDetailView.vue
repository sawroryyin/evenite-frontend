<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDiscussionStore } from '../../stores/discussion';
import DiscussionChatArea from '../../components/discussion/DiscussionChatArea.vue';

const route = useRoute();
const router = useRouter();
const store = useDiscussionStore();

onMounted(async () => {
  const roomId = route.params.roomId as string;
  if (roomId) {
    await store.setActiveRoom(roomId);
  }
});

onBeforeUnmount(() => {
  store.cleanup();
});

const goBack = () => {
  router.push('/discussion');
};
</script>

<template>
  <div class="max-w-3xl mx-auto bg-[#F4F4FA] flex flex-col h-[calc(100dvh-4rem)] font-['Lato'] relative">
      <header class="shrink-0 sticky top-0 bg-[#FFFFFF] border-b border-[#CECBF6] px-4 py-4 shadow-sm flex items-center z-20">
      <button @click="goBack" class="mr-3 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <div class="flex-1 min-w-0 flex items-center">
        <h2 class="text-lg font-['Nunito'] font-black text-[#26215C] truncate">
          {{ store.activeRoom?.event.title?.en || 'Loading...' }}
        </h2>
        <span 
          v-if="store.activeRoom?.isReadOnly" 
          class="ml-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border bg-red-50 text-red-600 border-red-200 shrink-0"
        >
          Archived
        </span>
      </div>

      <!-- "Go to event" Button -->
      <button 
        v-if="store.activeRoom?.event?.id"
        @click="router.push(`/event/${store.activeRoom.event.id}`)"
        class="ml-3 shrink-0 bg-[#EEEDFE] hover:bg-[#CECBF6] text-[#534AB7] hover:text-[#3C3489] border border-[#CECBF6] px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer uppercase tracking-wider"
      >
        <span>Event Info</span>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </button>
    </header>

    <DiscussionChatArea class="flex-1 min-h-0" />
    
  </div>
</template>