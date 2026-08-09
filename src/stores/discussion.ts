// src/stores/discussion.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DiscussionService } from '../services/DiscussionService';
import { discussionSocketService } from '../services/DiscussionSocketService';
import { useAuthStore } from './auth';
import type { DiscussionRoom, Message, GetRoomsQuery } from '../types';

export const useDiscussionStore = defineStore('discussion', () => {
  const authStore = useAuthStore();

  const rooms = ref<DiscussionRoom[]>([]);
  const activeRoomId = ref<string | null>(null);
  const messages = ref<Message[]>([]);
  
  const oldestCursor = ref<string | null>(null);
  const newestCursor = ref<string | null>(null);
  const hasMoreOlder = ref<boolean>(false);
  const hasMoreNewer = ref<boolean>(false);
  
  const isLoadingRooms = ref<boolean>(false);
  const isLoadingMessages = ref<boolean>(false);
  const isFetchingOlder = ref<boolean>(false);
  const isJoined = ref<boolean>(false); // Tracks if socket joined the room successfully

  const activeRoom = computed(() => rooms.value.find(room => room.roomId === activeRoomId.value));

  // Pinned announcements (derived from current messages state)
  const pinnedAnnouncements = computed(() => {
    return messages.value.filter(m => m.isAnnouncement);
  });

  // Helper to deduplicate and insert messages
  const injectMessages = (newMsgs: Message[], position: 'start' | 'end' | 'replace' = 'replace') => {
    if (position === 'replace') {
      messages.value = newMsgs;
      return;
    }
    
    const existingIds = new Set(messages.value.map(m => m.id));
    const uniqueMsgs = newMsgs.filter(m => !existingIds.has(m.id));
    
    if (position === 'start') {
      messages.value = [...uniqueMsgs, ...messages.value];
    } else {
      messages.value = [...messages.value, ...uniqueMsgs];
    }
  };

  const setActiveRoom = async (roomId: string) => {
    if (activeRoomId.value === roomId) return;
    cleanup();

    activeRoomId.value = roomId;
    isLoadingMessages.value = true;

    try {
      // 1. Fetch initial state
      let page = await DiscussionService.getMessages(roomId, {});

      // FRONTEND FIX FOR BLANK SCREEN:
      // If backend resumed from last-read and found nothing, but gave us the oldestCursor (the read anchor),
      // we immediately fetch 'before' that cursor to populate the history on screen.
      if (page.messages.length === 0 && page.oldestCursor) {
        page = await DiscussionService.getMessages(roomId, {
          cursor: page.oldestCursor,
          direction: 'before',
          limit: 25
        });
      }

      injectMessages(page.messages, 'replace');
      oldestCursor.value = page.oldestCursor;
      newestCursor.value = page.newestCursor;
      hasMoreOlder.value = page.hasMoreOlder;
      hasMoreNewer.value = page.hasMoreNewer;

      await DiscussionService.markRoomAsRead(roomId);
      
      const roomIndex = rooms.value.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) rooms.value[roomIndex].unreadCount = 0;

      // 2. Setup socket
      if (authStore.accessToken) {
        discussionSocketService.connect(authStore.accessToken);
        discussionSocketService.joinRoom(roomId);
        setupSocketListeners();
      }
    } catch (error) {
      console.error('Failed to set active room:', error);
    } finally {
      isLoadingMessages.value = false;
    }
  };

  const loadOlderMessages = async () => {
    if (!activeRoomId.value || !hasMoreOlder.value || isFetchingOlder.value) return;

    isFetchingOlder.value = true;
    try {
      const page = await DiscussionService.getMessages(activeRoomId.value, {
        cursor: oldestCursor.value || undefined,
        direction: 'before',
        limit: 25
      });

      injectMessages(page.messages, 'start');
      oldestCursor.value = page.oldestCursor;
      hasMoreOlder.value = page.hasMoreOlder;
    } finally {
      isFetchingOlder.value = false;
    }
  };

  const sendMessage = (content: string, isAnnouncement: boolean = false) => {
    if (!activeRoomId.value || !isJoined.value) return;
    discussionSocketService.sendMessage(activeRoomId.value, { content, isAnnouncement });
  };

  const setupSocketListeners = () => {
    discussionSocketService.removeAllListeners();

    discussionSocketService.onRoomJoined(() => {
      isJoined.value = true;
    });

    discussionSocketService.onMessageNew((newMessage: Message) => {
      // Do not splice inline if there is a known gap
      if (hasMoreNewer.value) {
        // Ideally, show a "New messages below" prompt to the user, or trigger a fetch.
        // For now, we skip injecting to avoid creating a confusing history gap.
        return; 
      }

      injectMessages([newMessage], 'end');
      
      const roomIndex = rooms.value.findIndex(r => r.roomId === activeRoomId.value);
      if (roomIndex !== -1) rooms.value[roomIndex].lastMessage = newMessage;

      if (activeRoomId.value) {
        DiscussionService.markRoomAsRead(activeRoomId.value).catch(() => {});
      }
    });

    discussionSocketService.onRoomKicked(({ roomId }) => {
      if (activeRoomId.value === roomId) {
        alert('You have been removed from this discussion room.');
        cleanup();
      }
      rooms.value = rooms.value.filter(r => r.roomId !== roomId);
    });

    discussionSocketService.onError((error) => {
      // Branch on code as requested
      switch (error.code) {
        case 'ANNOUNCEMENT_NOT_ALLOWED':
          alert('Only organizers can send announcements.');
          break;
        case 'ROOM_ACCESS_DENIED':
          alert('You do not have access to this room.');
          break;
        case 'ROOM_READ_ONLY':
          alert('This event has concluded. Chat is read-only.');
          break;
        default:
          console.error(`Socket Error [${error.code}]:`, error.message);
      }
    });
  };

  const cleanup = () => {
    if (activeRoomId.value) {
      discussionSocketService.leaveRoom(activeRoomId.value);
    }
    discussionSocketService.removeAllListeners();
    activeRoomId.value = null;
    messages.value = [];
    isJoined.value = false;
  };

  // Add this properly defined action back into your store
  const fetchRooms = async (query?: GetRoomsQuery) => {
    isLoadingRooms.value = true;
    try {
      rooms.value = await DiscussionService.getRoomList(query);
    } catch (error) {
      console.error('Failed to fetch discussion rooms:', error);
    } finally {
      isLoadingRooms.value = false;
    }
  };

  return {
    rooms, activeRoomId, messages, pinnedAnnouncements,
    hasMoreOlder, hasMoreNewer, isLoadingRooms, isLoadingMessages, isFetchingOlder, activeRoom, isJoined,
    fetchRooms, 
    setActiveRoom, loadOlderMessages, sendMessage, cleanup
  };
});