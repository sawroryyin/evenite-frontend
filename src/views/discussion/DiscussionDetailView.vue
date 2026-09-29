<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDiscussionStore } from '../../stores/discussion';
import { useChatViewport } from '../../composables/useChatViewport';
import { sanitizeId } from '../../services/DiscussionService';
import DiscussionChatArea from '../../components/discussion/DiscussionChatArea.vue';

const route = useRoute();
const router = useRouter();
const store = useDiscussionStore();

useChatViewport();

const loadError = ref<string | null>(null);

const findRoom = (roomId: string) =>
  store.rooms.find(r => sanitizeId(r.roomId) === roomId);

const openRoom = async (rawRoomId: string) => {
  loadError.value = null;
  const roomId = sanitizeId(rawRoomId);

  store.initGlobalSocket();

  if (!findRoom(roomId)) {
    await store.fetchRooms({ filter: 'active' });
  }
  if (!findRoom(roomId)) {
    await store.fetchRooms({ filter: 'archived' });
  }
  if (!findRoom(roomId)) {
    loadError.value = 'This discussion room could not be found or you no longer have access.';
    return;
  }

  await store.setActiveRoom(roomId);
};

onMounted(async () => {
  const roomId = route.params.roomId as string;
  if (roomId) await openRoom(roomId);
});

watch(
  () => route.params.roomId,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      store.cleanup();
      await openRoom(newId as string);
    }
  }
);

onBeforeUnmount(() => {
  store.cleanup();
});

const goBack = () => router.push('/discussion');
</script>

<template>
  <div class="chat-screen w-full max-w-3xl mx-auto flex flex-col font-['Lato'] z-40 bg-transparent">
    <header class="shrink-0 bg-transparent pt-2 px-4 pb-3 flex items-center z-20">
      <button @click="goBack" class="mr-3 text-[#131B2B]/70 hover:text-[#131B2B] flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <div class="flex-1 min-w-0 flex items-center">
        <h2 class="text-lg font-['Nunito'] font-black text-[#131B2B] tracking-tight truncate">
          {{ loadError ? 'Discussion' : (store.activeRoom?.event.title?.en || 'Loading...') }}
        </h2>
        <span
          v-if="store.activeRoom?.isReadOnly"
          class="ml-2 px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded border bg-red-50 text-red-600 border-red-200 shrink-0"
        >
          Archived
        </span>
      </div>

      <button
        v-if="store.activeRoom?.event?.id"
        @click="router.push(`/event/${store.activeRoom.event.id}`)"
        class="ml-3 shrink-0 bg-white hover:bg-[#131B2B]/5 text-[#131B2B] border border-[#131B2B]/10 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer uppercase tracking-wider"
      >
        <span>Event Info</span>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </button>
    </header>

    <div v-if="loadError" class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <p class="text-sm font-bold text-[#131B2B]/70">{{ loadError }}</p>
      <button
        @click="goBack"
        class="mt-4 bg-[#131B2B] hover:bg-[#131B2B]/80 text-white py-2.5 px-5 rounded-xl text-sm font-bold transition-all cursor-pointer"
      >
        Back to discussions
      </button>
    </div>

    <DiscussionChatArea v-else class="flex-1 min-h-0" />
  </div>
</template>