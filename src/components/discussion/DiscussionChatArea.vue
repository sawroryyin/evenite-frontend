<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useDiscussionStore } from '../../stores/discussion';
import { useAuthStore } from '../../stores/auth';
import DiscussionMessage from './DiscussionMessage.vue';
import DiscussionInput from './DiscussionInput.vue';

const store = useDiscussionStore();
const authStore = useAuthStore();
const messageContainer = ref<HTMLElement | null>(null);
const showJumpToBottom = ref(false);

const isMyMessage = (messageName: string) => {
  if (!messageName || !authStore.parsedToken) return false;
  
  const msgName = messageName.toLowerCase().trim();
  const possibleNames = [
    authStore.parsedToken.name,
    authStore.parsedToken.nickname,
    authStore.parsedToken.firstName,
    authStore.parsedToken.lastName
  ].filter(Boolean).map(n => String(n).toLowerCase().trim());
  
  return possibleNames.some(name => 
    msgName === name || msgName.includes(name) || name.includes(msgName)
  );
};

const isOrganizer = computed(() => {
   return authStore.currentRole === 'ORGANIZER';
});

const processedMessages = computed(() => {
  return store.messages.map((msg, index) => {
    if (msg.isDivider) return { ...msg, hideHeader: false };
    if (index === 0) return { ...msg, hideHeader: false };

    const prevMsg = store.messages[index - 1];
    if (prevMsg.isDivider) return { ...msg, hideHeader: false };

    const isSameSender = msg.sender.name === prevMsg.sender.name && msg.sender.role === prevMsg.sender.role;
    const currentMsgTime = new Date(msg.createdAt).getTime();
    const prevMsgTime = new Date(prevMsg.createdAt).getTime();
    const isWithin5Mins = (currentMsgTime - prevMsgTime) < 5 * 60 * 1000;

    const hideHeader = isSameSender && isWithin5Mins && !msg.isAnnouncement;

    return { ...msg, hideHeader };
  });
});

const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
  if (messageContainer.value) {
    messageContainer.value.scrollTo({
      top: messageContainer.value.scrollHeight,
      behavior
    });
    showJumpToBottom.value = false;
  }
};

const scrollToDividerOrBottom = async () => {
  await nextTick();
  const divider = document.getElementById('unread-divider');
  if (divider && messageContainer.value) {
    divider.scrollIntoView({ behavior: 'auto', block: 'center' });
  } else {
    scrollToBottom('auto');
  }
};

// Initial scroll logic after messages finish loading
watch(() => store.isLoadingMessages, async (isLoading) => {
  if (!isLoading && store.messages.length > 0) {
    await scrollToDividerOrBottom();
  }
});

// Watch for new messages arriving live
watch(() => store.messages.length, async (newLen, oldLen) => {
  if (newLen > oldLen && !store.isFetchingOlder && !store.isLoadingMessages) {
    await nextTick();
    // Only auto-scroll if the user is already near the bottom
    if (!showJumpToBottom.value) {
      scrollToBottom('smooth');
    }
  }
});

const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  
  showJumpToBottom.value = target.scrollHeight - target.scrollTop - target.clientHeight > 150;

  if (target.scrollTop === 0 && store.hasMoreOlder && !store.isFetchingOlder) {
    const previousHeight = target.scrollHeight;
    await store.loadOlderMessages();
    await nextTick();
    target.scrollTop = target.scrollHeight - previousHeight;
  }
};

const handleSendMessage = (payload: { content: string; isAnnouncement: boolean }) => {
  store.sendMessage(payload.content, payload.isAnnouncement);
  scrollToBottom('smooth');
};
</script>

<template>
  <div class="flex flex-col h-full bg-[#F4F4FA] relative">
    
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
        :is-mine="isMyMessage(msg.sender?.name || '')"
      />
    </div>

    <div class="absolute bottom-28 left-0 w-full flex justify-center pointer-events-none z-10">
      <transition 
        enter-active-class="transition duration-200 ease-out" 
        enter-from-class="opacity-0 translate-y-2" 
        enter-to-class="opacity-100 translate-y-0" 
        leave-active-class="transition duration-150 ease-in" 
        leave-from-class="opacity-100 translate-y-0" 
        leave-to-class="opacity-0 translate-y-2"
      >
        <button 
          v-if="showJumpToBottom"
          @click="scrollToBottom('smooth')"
          class="pointer-events-auto bg-[#534AB7] text-[#FFFFFF] w-10 h-10 rounded-full shadow-md border border-[#3C3489] flex items-center justify-center hover:bg-[#3C3489]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </button>
      </transition>
    </div>

    <div class="shrink-0 bg-[#FFFFFF] border-t border-[#CECBF6] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] relative z-20">
      <DiscussionInput 
        v-if="store.activeRoom"
        :disabled="store.activeRoom.isReadOnly"
        :is-organizer="isOrganizer"
        @send="handleSendMessage"
      />
    </div>

  </div>
</template>