<!-- src/views/discussion/DiscussionDetailView.vue -->
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
  if (window.history.state?.back) {
    router.back();
  } else {
    router.push('/discussion');
  }
};
</script>

<template>
  <!-- 
    FIX: Removed 'fixed inset-0'. 
    Using 'h-[calc(100dvh-4rem)]' to fill the screen while leaving room for your Evenite global header.
  -->
  <div class="max-w-3xl mx-auto bg-[#F4F4FA] flex flex-col h-[calc(100dvh-4rem)] font-['Lato'] relative">
    
    <!-- FIX: 'sticky top-0' keeps this bar at the top of the chat area, below the main header -->
    <header class="shrink-0 sticky top-0 bg-[#FFFFFF] border-b border-[#CECBF6] px-4 py-4 shadow-sm flex items-center z-20">
      <button @click="goBack" class="mr-3 text-[#26215C]/70 hover:text-[#3C3489] flex items-center gap-1.5 text-[11px] font-bold transition-colors cursor-pointer">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      
      <div class="flex-1 min-w-0 flex items-center">
        <h2 class="text-lg font-['Nunito'] font-black text-[#26215C] truncate">
          {{ store.activeRoom?.event.title.en || 'Loading...' }}
        </h2>
        <span 
          v-if="store.activeRoom?.isReadOnly" 
          class="ml-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border bg-red-50 text-red-600 border-red-200 shrink-0"
        >
          Archived
        </span>
      </div>
    </header>

    <!-- Chat Area automatically takes the remaining space -->
    <DiscussionChatArea class="flex-1 min-h-0" />
    
  </div>
</template>