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
  <div class="pt-6 pb-28 max-w-3xl mx-auto min-h-screen font-['Lato'] px-5 relative">
    
    <!-- Header -->
    <div class="flex justify-between items-center mb-4 relative z-10">
      <div>
        <h1 class="text-2xl font-['Nunito'] font-black text-[#131B2B] tracking-tight leading-none">
          Discussions
        </h1>
        <p class="text-sm font-['Lato'] text-[#131B2B]/70 font-semibold mt-2.5 tracking-wide">
          View and manage your event chats
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-6 relative z-10 overflow-x-auto scrollbar-hide py-1">
      <button
        v-for="filter in filterOptions"
        :key="filter"
        @click="activeTab = filter"
        class="shrink-0 flex items-center gap-2 py-2.5 px-6 text-sm font-bold rounded-full transition-all tracking-tight whitespace-nowrap capitalize cursor-pointer"
        :class="activeTab === filter ?
        'bg-[#131B2B] text-white shadow-md border border-[#131B2B]' :
        'bg-white border border-[#131B2B]/20 text-[#131B2B]/70 hover:bg-[#131B2B]/5 hover:text-[#131B2B]'"
      >
        {{ filter }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="store.isLoadingRooms" class="text-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#131B2B] mx-auto"></div>
      <p class="text-[#131B2B]/70 text-sm mt-4 font-bold tracking-widest uppercase">Loading chats...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.rooms.length === 0" class="text-center py-16 bg-[#FFFFFF] rounded-2xl border border-[#131B2B]/20 shadow-sm relative z-10 mt-6">
      <div class="w-14 h-14 bg-[#131B2B]/5 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-7 h-7 text-[#131B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <p class="text-sm font-bold text-[#131B2B]/70">No {{ activeTab }} discussions found.</p>
    </div>

    <!-- Chat List -->
    <div v-else class="space-y-3 relative z-10">
      <div 
        v-for="room in store.rooms" 
        :key="room.roomId"
        @click="openChat(room.roomId)"
        class="bg-[#FFFFFF] rounded-2xl border border-[#131B2B]/20 shadow-sm p-4 md:p-5 flex items-center hover:border-[#131B2B] hover:shadow-md cursor-pointer transition-all active:scale-[0.995]"
      >
        <!-- Banner/Avatar -->
        <img 
          v-if="room.event.bannerUrl" 
          :src="room.event.bannerUrl" 
          class="w-14 h-14 rounded-full object-cover mr-4 border border-[#131B2B]/20"
          alt="Event banner"
        />
        <div v-else class="w-14 h-14 rounded-full bg-[#131B2B]/5 flex items-center justify-center mr-4 border border-[#131B2B]/20">
          <span class="text-[#131B2B] font-black text-xl">{{ room.event.title?.en?.charAt(0) || 'E' }}</span>
        </div>
        
        <!-- Details -->
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-baseline mb-1">
            <h3 class="text-base font-['Nunito'] font-black text-[#131B2B] truncate pr-3">{{ room.event.title?.en || 'Unnamed Event' }}</h3>
            <span class="text-[11px] text-[#131B2B]/50 font-bold whitespace-nowrap">
              {{ formatTime(room.lastMessage?.createdAt) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <p class="text-sm text-[#131B2B]/70 truncate pr-3 font-semibold">
              <span v-if="room.lastMessage?.isAnnouncement" class="text-[#131B2B] font-bold mr-1">📣</span>
              {{ room.lastMessage?.content || 'Tap to start chatting' }}
            </p>
            <span 
              v-if="room.unreadCount > 0" 
              class="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-lg shadow-sm"
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