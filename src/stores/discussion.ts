import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DiscussionService } from '../services/DiscussionService';
import { discussionSocketService } from '../services/DiscussionSocketService';
import { useAuthStore } from './auth';

import type { 
  DiscussionRoom as BaseDiscussionRoom, 
  Message as BaseMessage, 
  GetRoomsQuery 
} from '../types';

export type UiMessage = BaseMessage & {
  serialNumber?: number;
};

export type UiDiscussionRoom = BaseDiscussionRoom & {
  lastReadSerialNumber?: number;
};

export const useDiscussionStore = defineStore('discussion', () => {
  const authStore = useAuthStore();

  const rooms = ref<UiDiscussionRoom[]>([]);
  const activeRoomId = ref<string | null>(null);
  const messages = ref<UiMessage[]>([]);

  const latestAnnouncements = ref<UiMessage[]>([]);
  const isLoadingAnnouncements = ref<boolean>(false);
  
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

  // Initialize global connection and listeners for the chat list (independent of active room)
  const initGlobalSocket = () => {
    if (!authStore.accessToken) return;
    discussionSocketService.connect(authStore.accessToken);

    // Register global chat list payload listeners so updates arrive dynamically on login/switch
    discussionSocketService.onChatListUpdate((payload) => {
      const room = rooms.value.find(r => r.roomId === payload.roomId);
      if (room) {
        room.lastMessage = payload.lastMessage as UiMessage;
        // Client-side unread calculation via serial numbers
        room.unreadCount = Math.max(0, payload.lastSerialNumber - (room.lastReadSerialNumber || 0));
      }
    });

    discussionSocketService.onChatListRead((payload) => {
      const room = rooms.value.find(r => r.roomId === payload.roomId);
      if (room) {
        room.lastReadSerialNumber = payload.lastReadSerialNumber;
        room.unreadCount = 0;
      }
    });
  };

  const fetchLatestAnnouncements = async () => {
    if (!activeRoomId.value) return;
    isLoadingAnnouncements.value = true;
    try {
      const results = await DiscussionService.getAnnouncements(activeRoomId.value);
      latestAnnouncements.value = (results as UiMessage[]).sort((a, b) => 
        (a.serialNumber || 0) - (b.serialNumber || 0)
      );
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      isLoadingAnnouncements.value = false;
    }
  };

  const injectMessages = (newMsgs: UiMessage[], position: 'start' | 'end' | 'replace' = 'replace') => {
    let updated: UiMessage[] = [];
    if (position === 'replace') {
      updated = newMsgs;
    } else {
      const existingIds = new Set(messages.value.map(m => m.id));
      const uniqueMsgs = newMsgs.filter(m => !existingIds.has(m.id));
      
      if (position === 'start') {
        updated = [...uniqueMsgs, ...messages.value];
      } else {
        updated = [...messages.value, ...uniqueMsgs];
      }
    }
    messages.value = updated.sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));
  };

  const setActiveRoom = async (roomId: string) => {
    if (activeRoomId.value === roomId) return;
    
    if (rooms.value.length === 0) {
      await fetchRooms();
    }
    activeRoomId.value = roomId;
    isLoadingMessages.value = true;

    try {
      const roomIndex = rooms.value.findIndex(r => r.roomId === roomId);
      const unreadCount = roomIndex !== -1 ? rooms.value[roomIndex].unreadCount : 0;

      let page = await DiscussionService.getMessages(roomId, {});
      let fetchedMessages: UiMessage[] = page.messages as UiMessage[];

      if (fetchedMessages.length === 0 && page.oldestCursor) {
        const roomRecord = rooms.value.find(r => r.roomId === roomId);
        if (roomRecord?.lastMessage && roomRecord.lastMessage.id === page.oldestCursor) {
          fetchedMessages.push({ ...roomRecord.lastMessage } as UiMessage);
        }
      }

      if (unreadCount > 0 && page.oldestCursor) {
        // Dynamically calculate limit to ensure all unread messages are fetched
        const fetchLimit = Math.max(15, unreadCount); 
        
        const olderPage = await DiscussionService.getMessages(roomId, {
          cursor: page.oldestCursor,
          direction: 'before',
          limit: fetchLimit 
        });
        fetchedMessages = [...(olderPage.messages as UiMessage[]), ...fetchedMessages];
        page.oldestCursor = olderPage.oldestCursor || page.oldestCursor;
        page.hasMoreOlder = olderPage.hasMoreOlder;
      }
      else if (fetchedMessages.length < 25 && page.oldestCursor) {
        const fetchLimit = 25 - fetchedMessages.length;
        const olderPage = await DiscussionService.getMessages(roomId, {
          cursor: page.oldestCursor,
          direction: 'before',
          limit: fetchLimit
        });
        fetchedMessages = [...(olderPage.messages as UiMessage[]), ...fetchedMessages];
        page.oldestCursor = olderPage.oldestCursor || page.oldestCursor;
        page.hasMoreOlder = olderPage.hasMoreOlder;
      }

      fetchedMessages.sort((a, b) => (a.serialNumber || 0) - (b.serialNumber || 0));

      if (fetchedMessages.length > 0 && unreadCount > 0) {
        const roomRecord = rooms.value.find(r => r.roomId === roomId);
        const lastRead = roomRecord?.lastReadSerialNumber || 0;
        
        // Find the exact index of the first message that is strictly greater than the last read serial number
        let dividerIndex = fetchedMessages.findIndex(m => (m.serialNumber || 0) > lastRead);
        
        if (dividerIndex === -1) {
          dividerIndex = Math.max(0, fetchedMessages.length - unreadCount);
        }

        const baseSerial = fetchedMessages[dividerIndex]?.serialNumber || 0;
        
        fetchedMessages.splice(dividerIndex, 0, {
          id: 'unread-divider',
          isDivider: true,
          content: 'New Messages',
          createdAt: fetchedMessages[dividerIndex]?.createdAt || new Date().toISOString(),
          serialNumber: baseSerial - 0.1, 
          isAnnouncement: false,
          sender: { name: 'System', role: 'ORGANIZER', imageUrl: '' }
        } as unknown as UiMessage);
      }

      injectMessages(fetchedMessages, 'replace');
      oldestCursor.value = page.oldestCursor;
      newestCursor.value = page.newestCursor;
      hasMoreOlder.value = page.hasMoreOlder;
      hasMoreNewer.value = page.hasMoreNewer;

      // Inside setActiveRoom, right after injectMessages(fetchedMessages, 'replace');
      if (page.hasMoreNewer) {
        await loadNewerMessages();
      }

      if (authStore.accessToken) {
        initGlobalSocket();
        setupRoomSocketListeners();
        discussionSocketService.joinRoom(roomId);
      }
    } catch (error) {
      console.error('Failed to set active room:', error);
    } finally {
      isLoadingMessages.value = false;
    }
  };

  let readStatusDebounce: ReturnType<typeof setTimeout>;
  const markAsReadAsDisplayed = (messageId: string, serialNumber: number) => {
    if (!activeRoomId.value) return;
    const room = rooms.value.find(r => r.roomId === activeRoomId.value);
    
    if (room && serialNumber > (room.lastReadSerialNumber || 0)) {
      room.lastReadSerialNumber = serialNumber;
      room.unreadCount = Math.max(0, room.unreadCount - 1);

      clearTimeout(readStatusDebounce);
      readStatusDebounce = setTimeout(async () => {
        if (activeRoomId.value) {
          try {
            const readStatus = await DiscussionService.markRoomAsRead(activeRoomId.value, messageId);
            if (room) {
              room.lastReadSerialNumber = readStatus.lastReadSerialNumber;
              room.unreadCount = 0;
            }
          } catch (e) {
            console.error('Failed to mark read', e);
          }
        }
      }, 300); 
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
      injectMessages(page.messages as UiMessage[], 'start');
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
      injectMessages(page.messages as UiMessage[], "end");
      newestCursor.value = page.newestCursor;
      hasMoreNewer.value = page.hasMoreNewer;
    } finally {
      isFetchingNewer.value = false;
    }
  };

  const sendMessage = (content: string, isAnnouncement: boolean = false) => {
    if (!activeRoomId.value || !isJoined.value) return;
    if (isAnnouncement) {
      discussionSocketService.sendAnnouncement(activeRoomId.value, { content });
    } else {
      discussionSocketService.sendMessage(activeRoomId.value, { content, isAnnouncement: false });
    }
  };

  const setupRoomSocketListeners = () => {
    discussionSocketService.onRoomJoined(() => {
      isJoined.value = true;
    });

    discussionSocketService.onMessageNew(async (newMessage: BaseMessage) => {
      const uiMessage = newMessage as UiMessage;
      if (hasMoreNewer.value) {
        await loadNewerMessages();
      } else {
        injectMessages([uiMessage], 'end');
      }
      
      const roomIndex = rooms.value.findIndex(r => r.roomId === activeRoomId.value);
      if (roomIndex !== -1) rooms.value[roomIndex].lastMessage = uiMessage;

      const sender = uiMessage.sender as any; 
      const isMine = sender?.id === authStore.parsedToken?.participantProfileId || sender?.id === authStore.parsedToken?.organizerProfileId;
      
      if (isMine && uiMessage.serialNumber) {
        markAsReadAsDisplayed(uiMessage.id, uiMessage.serialNumber);
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
    activeRoomId.value = null;
    messages.value = [];
    latestAnnouncements.value = [];
    isJoined.value = false;
    clearTimeout(readStatusDebounce);
  };

  const fetchRooms = async (query?: GetRoomsQuery) => {
    isLoadingRooms.value = true;
    try {
      if (authStore.currentRole === 'ORGANIZER') {
        const result = await DiscussionService.getCreatedRooms(query);
        rooms.value = result as UiDiscussionRoom[];
      } else {
        const result = await DiscussionService.getJoinedRooms(query);
        rooms.value = result as UiDiscussionRoom[];
      }
      // Initialize global socket listeners as soon as rooms load successfully on login/switch
      initGlobalSocket();
    } catch (error) {
      console.error('Failed to fetch discussion rooms:', error);
    } finally {
      isLoadingRooms.value = false;
    }
  };

  return {
    rooms, 
    activeRoomId, 
    messages, 
    latestAnnouncements, 
    isLoadingAnnouncements, 
    hasMoreOlder, 
    hasMoreNewer, 
    isLoadingRooms, 
    isLoadingMessages, 
    isFetchingOlder, 
    isFetchingNewer, 
    activeRoom, 
    isJoined,
    fetchRooms, 
    fetchLatestAnnouncements, 
    setActiveRoom, 
    loadOlderMessages, 
    loadNewerMessages, 
    sendMessage, 
    cleanup,
    markAsReadAsDisplayed,
    initGlobalSocket
  };
});