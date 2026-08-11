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
  const isFetchingNewer = ref<boolean>(false);
  const isJoined = ref<boolean>(false);

  const activeRoom = computed(() => rooms.value.find(room => room.roomId === activeRoomId.value));

  const pinnedAnnouncements = computed(() => {
    return messages.value.filter(m => m.isAnnouncement);
  });

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

    // If rooms array is empty (e.g., user hard-refreshed the browser), 
    // fetch the rooms list so our `activeRoom` computed property can find the event data.
    if (rooms.value.length === 0) {
      await fetchRooms();
    }
    activeRoomId.value = roomId;
    isLoadingMessages.value = true;

    try {
      // Capture unread count before fetching and marking as read
      const roomIndex = rooms.value.findIndex(r => r.roomId === roomId);
      const unreadCount = roomIndex !== -1 ? rooms.value[roomIndex].unreadCount : 0;

      let page = await DiscussionService.getMessages(roomId, {});
      let fillerCount = 0;

      // Fill history if the backend returned a small slice of recent messages
      if (page.messages.length < 25 && page.oldestCursor) {
        const fetchLimit = 25 - page.messages.length;
        const olderPage = await DiscussionService.getMessages(roomId, {
          cursor: page.oldestCursor,
          direction: 'before',
          limit: fetchLimit
        });
        fillerCount = olderPage.messages.length;
        page.messages = [...olderPage.messages, ...page.messages];
        page.oldestCursor = olderPage.oldestCursor || page.oldestCursor;
        page.hasMoreOlder = olderPage.hasMoreOlder;
      }

      // INJECT NEW MESSAGE DIVIDER
      // the backend's resume page always puts the last-read message first (before any filler we prepended),
      // so the divider always belongs right after: fillerCount older messages + 1 anchor message
      if (page.messages.length > 0 && unreadCount > 0) {
        const dividerIndex = fillerCount + 1;
        page.messages.splice(dividerIndex, 0, {
          id: 'unread-divider',
          isDivider: true,
          content: 'New Messages',
          createdAt: new Date().toISOString(),
          isAnnouncement: false,
          sender: { name: 'System', role: 'ORGANIZER' as any, imageUrl: '' }
        } as any);
      }

      injectMessages(page.messages, 'replace');
      oldestCursor.value = page.oldestCursor;
      newestCursor.value = page.newestCursor;
      hasMoreOlder.value = page.hasMoreOlder;
      hasMoreNewer.value = page.hasMoreNewer;

      await DiscussionService.markRoomAsRead(roomId);
      
      if (roomIndex !== -1) rooms.value[roomIndex].unreadCount = 0;

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

  const loadNewerMessages = async () => {
    if (!activeRoomId.value || !hasMoreNewer.value || isFetchingNewer.value)
      return;

    isFetchingNewer.value = true;
    try {
      const page = await DiscussionService.getMessages(activeRoomId.value, {
        cursor: newestCursor.value || undefined,
        direction: "after",
        limit: 25,
      });

      injectMessages(page.messages, "end");
      newestCursor.value = page.newestCursor;
      hasMoreNewer.value = page.hasMoreNewer;
    } finally {
      isFetchingNewer.value = false;
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

    discussionSocketService.onMessageNew(async (newMessage: Message) => {
      if (hasMoreNewer.value) {
        await loadNewerMessages();
      }else{
        injectMessages([newMessage], 'end');
      }
      
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

  const fetchRooms = async (query?: GetRoomsQuery) => {
    isLoadingRooms.value = true;
    try {
      if (authStore.currentRole === 'ORGANIZER') {
        rooms.value = await DiscussionService.getCreatedRooms(query);
      } else {
        rooms.value = await DiscussionService.getJoinedRooms(query);
      }
    } catch (error) {
      console.error('Failed to fetch discussion rooms:', error);
    } finally {
      isLoadingRooms.value = false;
    }
  };

  return {
    rooms, activeRoomId, messages, pinnedAnnouncements,
    hasMoreOlder, hasMoreNewer, isLoadingRooms, isLoadingMessages, isFetchingOlder, isFetchingNewer, activeRoom, isJoined,
    fetchRooms, 
    setActiveRoom, loadOlderMessages, loadNewerMessages, sendMessage, cleanup
  };
});