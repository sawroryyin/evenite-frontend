import { io, Socket } from 'socket.io-client';
import api from './api';
import type { Message, CreateMessagePayload, SocketErrorPayload } from '../types';

class DiscussionSocketService {
  private socket: Socket | null = null;
  private currentRoomId: string | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private failedAttempts = 0;

  connect(token: string) {
    if (this.socket?.connected) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    
    this.socket = io(`${baseUrl}/discussion`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.setupCoreListeners();
    this.startProactiveRefresh();
  }

  private setupCoreListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.failedAttempts = 0;
      if (this.currentRoomId) {
        this.joinRoom(this.currentRoomId);
      }
    });

    this.socket.on('connect_error', () => {
      this.failedAttempts++;
      if (this.failedAttempts >= 3) {
        console.error('Socket authentication failed repeatedly. Stopping reconnect.');
        this.disconnect();
      }
    });
  }

  private startProactiveRefresh() {
    this.stopProactiveRefresh();
    this.refreshTimer = setInterval(async () => {
      try {
        const response = await api.post('/auth/refresh'); 
        const newToken = response.data.accessToken;
        
        if (this.socket && newToken) {
          this.socket.auth = { token: newToken };
          this.socket.disconnect().connect();
        }
      } catch (error) {
        console.error('Proactive token refresh failed', error);
      }
    }, 14 * 60 * 1000);
  }

  private stopProactiveRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  disconnect() {
    this.stopProactiveRefresh();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentRoomId = null;
  }

  joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.socket?.emit('room:join', { roomId });
  }

  leaveRoom(roomId: string) {
    if (this.currentRoomId === roomId) this.currentRoomId = null;
    this.socket?.emit('room:leave', { roomId });
  }

  sendMessage(roomId: string, dto: CreateMessagePayload) {
    this.socket?.emit('message:send', { roomId, dto });
  }

  sendAnnouncement(roomId: string, dto: { content: string }) {
    this.socket?.emit('announcement:send', { roomId, dto });
  }

  // --- Listeners ---
  onRoomJoined(callback: (data: { roomId: string }) => void) {
    this.socket?.on('room:joined', callback);
  }
  onMessageNew(callback: (message: Message) => void) {
    this.socket?.on('message:new', callback);
  }
  onRoomKicked(callback: (data: { roomId: string }) => void) {
    this.socket?.on('room:kicked', callback);
  }
  onChatListUpdate(callback: (data: { roomId: string; lastMessage: Message; lastSerialNumber: number }) => void) {
    this.socket?.on('chatList:update', callback);
  }
  onChatListRead(callback: (data: { roomId: string; lastReadSerialNumber: number }) => void) {
    this.socket?.on('chatList:read', callback);
  }
  onError(callback: (error: SocketErrorPayload) => void) {
    this.socket?.on('error', callback);
  }

  removeAllListeners() {
    this.socket?.off('room:joined');
    this.socket?.off('message:new');
    this.socket?.off('room:kicked');
    this.socket?.off('chatList:update');
    this.socket?.off('chatList:read');
    this.socket?.off('error');
  }
}

export const discussionSocketService = new DiscussionSocketService();