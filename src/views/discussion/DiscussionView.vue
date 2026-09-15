<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDiscussionStore } from '../../stores/discussion';
import BottomNav from '../../components/BottomNav.vue';

const router = useRouter();
const store = useDiscussionStore();

const activeTab = ref<'active' | 'archived'>('active');
const filterOptions = ['active', 'archived'] as const;

watch(activeTab, async (newTab) => {
  await store.fetchRooms({ filter: newTab });
}, { immediate: true });

onMounted(async () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  store.initGlobalSocket();
});

const openChat = (roomId: string) => {
  router.push({ name: 'DiscussionDetail', params: { roomId } });
};

const formatTime = (isoString?: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="pt-4 pb-24 max-w-3xl mx-auto bg-[#F4F4FA] min-h-screen font-['Lato'] px-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-5 relative z-10">
      <div>
        <h1 class="text-[22px] font-['Nunito'] font-black text-[#26215C] tracking-tight leading-none">
          Discussions
        </h1>
        <p class="text-[11px] font-['Lato'] text-[#26215C]/70 font-medium mt-1.5 tracking-wide">
          View and manage your event chats
        </p>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="flex w-full bg-[#FFFFFF] rounded-xl shadow-sm border border-[#CECBF6] p-1 mb-4 relative z-10">
      <button
        v-for="filter in filterOptions"
        :key="filter"
        @click="activeTab = filter"
        class="flex-1 text-center py-1.5 px-0.5 text-[9.5px] min-[380px]:text-[10px] sm:text-[11px] font-bold rounded-lg transition-colors tracking-tight whitespace-nowrap capitalize"
        :class="activeTab === filter ?
         'bg-[#534AB7] text-[#FFFFFF] shadow-xs' :
         'text-[#26215C]/70 hover:bg-[#EEEDFE] hover:text-[#3C3489]'"
      >
        {{ filter }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoadingRooms" class="text-center py-16">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#534AB7] mx-auto"></div>
      <p class="text-[#26215C]/70 text-[11px] mt-3 font-medium">Loading chats...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.rooms.length === 0" class="text-center py-14 bg-[#FFFFFF] rounded-xl border border-[#CECBF6] shadow-xs relative z-10">
      <div class="w-10 h-10 bg-[#EEEDFE] rounded-full flex items-center justify-center mx-auto mb-2.5">
        <svg class="w-5 h-5 text-[#534AB7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <p class="text-[11px] font-bold text-[#26215C]/70">No {{ activeTab }} discussions found.</p>
    </div>

    <!-- Chat List -->
    <div v-else class="space-y-3 relative z-10">
      <div 
        v-for="room in store.rooms" 
        :key="room.roomId"
        @click="openChat(room.roomId)"
        class="bg-[#FFFFFF] rounded-xl border border-[#CECBF6] shadow-sm p-4 flex items-center hover:bg-[#F4F4FA] cursor-pointer transition-colors"
      >
        <img 
          v-if="room.event.bannerUrl" 
          :src="room.event.bannerUrl" 
          class="w-12 h-12 rounded-full object-cover mr-4 border border-[#CECBF6]"
          alt="Event banner"
        />
        <div v-else class="w-12 h-12 rounded-full bg-[#EEEDFE] flex items-center justify-center mr-4 border border-[#CECBF6]">
          <span class="text-[#534AB7] font-bold text-lg">{{ room.event.title?.en?.charAt(0) || 'E' }}</span>
        </div>
        
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-baseline mb-1">
            <h3 class="text-[14px] font-bold text-[#26215C] truncate pr-2">{{ room.event.title?.en || 'Unnamed Event' }}</h3>
            <span class="text-[10px] text-[#26215C]/50 font-medium whitespace-nowrap">
              {{ formatTime(room.lastMessage?.createdAt) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-[12px] text-[#26215C]/70 truncate pr-2">
              <span v-if="room.lastMessage?.isAnnouncement" class="text-[#534AB7] font-bold mr-1">📣</span>
              {{ room.lastMessage?.content || 'Tap to start chatting' }}
            </p>
            <span 
              v-if="room.unreadCount > 0" 
              class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
            >
              {{ room.unreadCount }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>