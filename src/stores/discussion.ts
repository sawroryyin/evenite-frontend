// src/stores/discussion.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DiscussionService } from '../services/DiscussionService';
import { discussionSocketService } from '../services/DiscussionSocketService';
import { useAuthStore } from './auth'; // Assuming you have an auth store for the JWT
import type { 
  DiscussionRoom, 
  Message, 
  GetRoomsQuery,
  CreateMessagePayload
} from '../types';

export const useDiscussionStore = defineStore('discussion', () => {
  const authStore = useAuthStore();

  // ==========================================
  // STATE
  // ==========================================
  const rooms = ref<DiscussionRoom[]>([]);
  const activeRoomId = ref<string | null>(null);
  const messages = ref<Message[]>([]);
  
  // Pagination State
  const oldestCursor = ref<string | null>(null);
  const hasMoreOlder = ref<boolean>(false);
  
  // Loading States
  const isLoadingRooms = ref<boolean>(false);
  const isLoadingMessages = ref<boolean>(false);
  const isFetchingOlder = ref<boolean>(false);

  // ==========================================
  // GETTERS
  // ==========================================
  const activeRoom = computed(() => 
    rooms.value.find(room => room.roomId === activeRoomId.value)
  );

  // ==========================================
  // ACTIONS (REST API)
  // ==========================================
  
  /**
   * Fetches the list of discussion rooms for the sidebar.
   */
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

  /**
   * Sets the active room, fetches its initial messages, and joins the socket room.
   */
  const setActiveRoom = async (roomId: string) => {
    if (activeRoomId.value === roomId) return;

    // Leave the previous room if there was one
    if (activeRoomId.value) {
      discussionSocketService.leaveRoom(activeRoomId.value);
    }

    activeRoomId.value = roomId;
    messages.value = [];
    isLoadingMessages.value = true;

    try {
      // Fetch initial messages (backend will use lastReadAt if no cursor provided)
      const page = await DiscussionService.getMessages(roomId, {});
      messages.value = page.messages;
      oldestCursor.value = page.oldestCursor;
      hasMoreOlder.value = page.hasMoreOlder;

      // Mark room as read
      await DiscussionService.markRoomAsRead(roomId);
      
      // Update local unread count in the sidebar immediately
      const roomIndex = rooms.value.findIndex(r => r.roomId === roomId);
      if (roomIndex !== -1) {
        rooms.value[roomIndex].unreadCount = 0;
      }

      // Ensure socket is connected and join the new room
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

  /**
   * Fetches older messages using the oldestCursor for infinite scrolling.
   */
  const loadOlderMessages = async () => {
    if (!activeRoomId.value || !hasMoreOlder.value || isFetchingOlder.value) return;

    isFetchingOlder.value = true;
    try {
      const page = await DiscussionService.getMessages(activeRoomId.value, {
        cursor: oldestCursor.value || undefined,
        direction: 'before',
        limit: 25
      });

      // Prepend older messages to the top of the array
      messages.value = [...page.messages, ...messages.value];
      oldestCursor.value = page.oldestCursor;
      hasMoreOlder.value = page.hasMoreOlder;
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      isFetchingOlder.value = false;
    }
  };

  // ==========================================
  // ACTIONS (SOCKET.IO)
  // ==========================================

  /**
   * Emits a new message via WebSockets.
   */
  const sendMessage = (content: string, isAnnouncement: boolean = false) => {
    if (!activeRoomId.value) return;
    
    const payload: CreateMessagePayload = { content, isAnnouncement };
    discussionSocketService.sendMessage(activeRoomId.value, payload);
  };

  /**
   * Registers listeners for incoming socket events.
   */
  const setupSocketListeners = () => {
    // Clear existing listeners to prevent duplicates if this is called multiple times
    discussionSocketService.removeAllListeners();

    // Listen for incoming new messages
    discussionSocketService.onMessageNew((newMessage: Message) => {
      // Append the new message to the chat
      messages.value.push(newMessage);
      
      // Update the "lastMessage" preview in the room list sidebar
      const roomIndex = rooms.value.findIndex(r => r.roomId === activeRoomId.value);
      if (roomIndex !== -1) {
        rooms.value[roomIndex].lastMessage = newMessage;
      }

      // Automatically mark as read if the user is currently viewing this room
      if (activeRoomId.value) {
        DiscussionService.markRoomAsRead(activeRoomId.value).catch(console.error);
      }
    });

    // Handle being kicked (e.g., registration cancelled)
    discussionSocketService.onRoomKicked(({ roomId }) => {
      if (activeRoomId.value === roomId) {
        alert('You have been removed from this discussion room.');
        activeRoomId.value = null;
        messages.value = [];
      }
      // Remove room from the sidebar list
      rooms.value = rooms.value.filter(r => r.roomId !== roomId);
    });

    discussionSocketService.onError((error) => {
      console.error('Socket Error:', error.message);
    });
  };

  /**
   * Cleans up socket connections and state when navigating away from the chat view.
   */
  const cleanup = () => {
    if (activeRoomId.value) {
      discussionSocketService.leaveRoom(activeRoomId.value);
    }
    discussionSocketService.removeAllListeners();
    activeRoomId.value = null;
    messages.value = [];
  };

  return {
    // State
    rooms,
    activeRoomId,
    messages,
    hasMoreOlder,
    isLoadingRooms,
    isLoadingMessages,
    isFetchingOlder,
    activeRoom,
    
    // Actions
    fetchRooms,
    setActiveRoom,
    loadOlderMessages,
    sendMessage,
    cleanup
  };
});