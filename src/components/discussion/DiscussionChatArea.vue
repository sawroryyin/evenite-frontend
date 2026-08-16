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

const showAnnouncementsPopup = ref(false);
const announcementContainer = ref<HTMLElement | null>(null);

// Update your toggleAnnouncements function
const toggleAnnouncements = async () => {
  showAnnouncementsPopup.value = !showAnnouncementsPopup.value;
  if (showAnnouncementsPopup.value) {
    await store.fetchLatestAnnouncements();
    
    // NEW: Wait for the DOM to render the messages, then scroll to the bottom
    await nextTick();
    if (announcementContainer.value) {
      announcementContainer.value.scrollTop = announcementContainer.value.scrollHeight;
    }
  }
};

const handleAnnouncementScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  
  if (target.scrollTop === 0 && store.hasMoreAnnouncements && !store.isFetchingOlderAnnouncements) {
    const previousHeight = target.scrollHeight;
    
    await store.loadOlderAnnouncements();
    await nextTick();
    
    target.scrollTop = target.scrollHeight - previousHeight;
  }
};

const isMyMessage = (sender: any) => {
  if (!sender || !authStore.parsedToken) return false;
  
  const myParticipantId = authStore.parsedToken.participantProfileId;
  const myOrganizerId = authStore.parsedToken.organizerProfileId;

  return sender.id === myParticipantId || sender.id === myOrganizerId;
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

watch(() => store.isLoadingMessages, async (isLoading) => {
  if (!isLoading && store.messages.length > 0) {
    await scrollToDividerOrBottom();
  }
});

watch(() => store.messages.length, async (newLen, oldLen) => {
  if (newLen > oldLen && !store.isFetchingOlder && !store.isLoadingMessages) {
    let isNearBottom = true; 
    if (messageContainer.value) {
      const { scrollHeight, scrollTop, clientHeight } = messageContainer.value;
      isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    }

    await nextTick();

    if (isNearBottom) {
      scrollToBottom('smooth');
    } else {
      showJumpToBottom.value = true;
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

  const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
  if (isNearBottom && store.hasMoreNewer && !store.isFetchingNewer) {
    await store.loadNewerMessages();
  }
};

const handleSendMessage = (payload: { content: string; isAnnouncement: boolean }) => {
  store.sendMessage(payload.content, payload.isAnnouncement);
  scrollToBottom('smooth');
};
</script>

<template>
  <div class="flex flex-col h-full bg-[#F4F4FA] relative">

    <!-- Floating Announcement Button and Pop-up -->
    <div class="absolute top-4 right-4 z-30 flex flex-col items-end">
      <button 
        @click="toggleAnnouncements"
        class="bg-[#FFFFFF] text-[#534AB7] w-10 h-10 rounded-full shadow-md border border-[#CECBF6] flex items-center justify-center hover:bg-[#EEEDFE] transition-colors cursor-pointer"
        title="View Announcements"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
        </svg>
      </button>

      <transition 
        enter-active-class="transition duration-200 ease-out" 
        enter-from-class="opacity-0 scale-95 translate-y-2" 
        enter-to-class="opacity-100 scale-100 translate-y-0" 
        leave-active-class="transition duration-150 ease-in" 
        leave-from-class="opacity-100 scale-100 translate-y-0" 
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div 
          v-if="showAnnouncementsPopup"
          class="mt-2 w-72 max-h-80 bg-[#FFFFFF] rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-[#CECBF6] flex flex-col overflow-hidden"
        >
          <div class="bg-[#534AB7] text-[#FFFFFF] px-4 py-2.5 flex justify-between items-center shrink-0">
            <span class="text-[12px] font-bold uppercase tracking-wider">Latest Announcements</span>
            <button @click="showAnnouncementsPopup = false" class="text-[#FFFFFF]/70 hover:text-[#FFFFFF] transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- UPDATED: Added ref="announcementContainer" -->
          <div 
            ref="announcementContainer"
            class="flex-1 overflow-y-auto p-3 space-y-2.5"
            @scroll="handleAnnouncementScroll"
          >
            <div v-if="store.isLoadingAnnouncements" class="flex justify-center py-4">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#534AB7]"></div>
            </div>

            <div v-else-if="store.latestAnnouncements.length === 0" class="text-center py-4 text-[11px] font-bold text-[#26215C]/50">
              No announcements yet
            </div>

            <template v-else>
              <div v-if="store.isFetchingOlderAnnouncements" class="flex justify-center py-2">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-[#534AB7]"></div>
              </div>

              <div 
                v-for="ann in store.latestAnnouncements" 
                :key="ann.id" 
                class="bg-[#F4F4FA] p-3 rounded-lg border border-[#CECBF6]"
              >
                <div class="flex justify-between items-baseline mb-1.5">
                  <span class="text-[11px] font-bold text-[#26215C] truncate pr-2">{{ ann.sender.name }}</span>
                  <!-- UPDATED: Show Date and Time cleanly -->
                  <span class="text-[9px] font-medium text-[#26215C]/50 shrink-0">
                    {{ new Date(ann.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) }}
                  </span>
                </div>
                <p class="text-[12px] text-[#26215C] whitespace-pre-wrap leading-relaxed">{{ ann.content }}</p>
              </div>
            </template>
          </div>
        </div>
      </transition>
    </div>
    
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
        :is-mine="isMyMessage(msg.sender)" 
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
          class="pointer-events-auto bg-[#534AB7] text-[#FFFFFF] w-10 h-10 rounded-full shadow-md border border-[#3C3489] flex items-center justify-center hover:bg-[#3C3489] cursor-pointer"
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