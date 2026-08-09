<!-- src/components/discussion/DiscussionChatArea.vue -->
<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useDiscussionStore } from '../../stores/discussion';
import { useAuthStore } from '../../stores/auth';
import DiscussionMessage from './DiscussionMessage.vue';
import DiscussionInput from './DiscussionInput.vue';

const store = useDiscussionStore();
const authStore = useAuthStore();
const messageContainer = ref<HTMLElement | null>(null);

// FIX: Forgiving fuzzy-match logic to guarantee your messages align to the right.
const isMyMessage = (messageName: string) => {
  if (!messageName || !authStore.parsedToken) return false;
  
  // Convert backend message name to lowercase for safe comparison
  const msgName = messageName.toLowerCase().trim();
  
  // Gather all possible names from the JWT token and convert them to lowercase
  const possibleNames = [
    authStore.parsedToken.name,
    authStore.parsedToken.nickname,
    authStore.parsedToken.firstName,
    authStore.parsedToken.lastName
  ]
    .filter(Boolean)
    .map(n => String(n).toLowerCase().trim());
  
  // If the backend name matches or is included in your token names, it returns true (Right side)
  return possibleNames.some(name => 
    msgName === name || msgName.includes(name) || name.includes(msgName)
  );
};

const isOrganizer = computed(() => {
   return authStore.currentRole === 'ORGANIZER';
});

const processedMessages = computed(() => {
  return store.messages.map((msg, index) => {
    if (index === 0) return { ...msg, hideHeader: false };

    const prevMsg = store.messages[index - 1];
    const isSameSender = msg.sender.name === prevMsg.sender.name && msg.sender.role === prevMsg.sender.role;
    
    const currentMsgTime = new Date(msg.createdAt).getTime();
    const prevMsgTime = new Date(prevMsg.createdAt).getTime();
    const isWithin5Mins = (currentMsgTime - prevMsgTime) < 5 * 60 * 1000;

    const hideHeader = isSameSender && isWithin5Mins && !msg.isAnnouncement;

    return { ...msg, hideHeader };
  });
});

const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

watch(() => store.messages.length, async (newLen, oldLen) => {
  if (newLen > oldLen && !store.isFetchingOlder) {
    await nextTick();
    scrollToBottom();
  }
});

const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  if (target.scrollTop === 0 && store.hasMoreOlder && !store.isFetchingOlder) {
    const previousHeight = target.scrollHeight;
    await store.loadOlderMessages();
    await nextTick();
    target.scrollTop = target.scrollHeight - previousHeight;
  }
};

const handleSendMessage = (payload: { content: string; isAnnouncement: boolean }) => {
  store.sendMessage(payload.content, payload.isAnnouncement);
};
</script>

<template>
  <div class="flex flex-col h-full bg-[#F4F4FA]">
    
    <!-- Messages Scroll Area -->
    <div 
      ref="messageContainer"
      @scroll="handleScroll"
      class="flex-1 overflow-y-auto p-4 space-y-1.5"
    >
      <div v-if="store.isLoadingMessages" class="flex justify-center p-4">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#534AB7]"></div>
      </div>
      
      <div v-if="store.isFetchingOlder" class="flex justify-center p-2">
        <span class="text-[10px] font-bold text-[#534AB7] bg-white px-3 py-1 rounded-full shadow-sm border border-[#CECBF6] tracking-wider">
          Loading older messages...
        </span>
      </div>

      <div v-if="!store.isLoadingMessages && store.messages.length === 0" class="flex flex-col items-center justify-center h-full text-[#26215C]/40">
        <svg class="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <p class="text-[12px] font-bold">No messages yet</p>
      </div>

      <DiscussionMessage 
        v-for="msg in processedMessages" 
        :key="msg.id"
        :message="msg"
        :hide-header="msg.hideHeader"
        :is-mine="isMyMessage(msg.sender.name)"
      />
    </div>

    <!-- Fixed Input Space anchored at the bottom -->
    <div class="shrink-0 bg-[#FFFFFF] border-t border-[#CECBF6] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
      <DiscussionInput 
        v-if="store.activeRoom"
        :disabled="store.activeRoom.isReadOnly"
        :is-organizer="isOrganizer"
        @send="handleSendMessage"
      />
    </div>

  </div>
</template>