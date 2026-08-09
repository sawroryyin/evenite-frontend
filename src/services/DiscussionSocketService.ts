import { io, Socket } from 'socket.io-client';
import type { Message, CreateMessagePayload, SocketErrorPayload } from '../types';

class DiscussionSocketService {
  private socket: Socket | null = null;

  /**
   * Initializes the socket connection to the /discussion namespace.
   * 
   * @param token - The user's JWT access token.
   */
  connect(token: string) {
    // Prevent multiple connections
    if (this.socket?.connected) {
      return;
    }

    // Replace VITE_API_BASE_URL with your actual env variable for the backend URL.
    // Ensure it does not end with a trailing slash before appending '/discussion'.
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    
    this.socket = io(`${baseUrl}/discussion`, {
      auth: {
        token: token, // This maps perfectly to your backend's extractTokenFromHandshake
      },
      // Optional: Forces WebSockets immediately instead of long-polling first
      transports: ['websocket'], 
    });

    this.socket.on('connect', () => {
      console.log('Connected to Discussion Socket:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Discussion Socket:', reason);
    });
  }

  /**
   * Disconnects the socket. Call this when the user logs out.
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // ==========================================
  // WRAPPER METHODS (EMITTERS)
  // ==========================================

  joinRoom(roomId: string) {
    this.socket?.emit('room:join', { roomId });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('room:leave', { roomId });
  }

  sendMessage(roomId: string, dto: CreateMessagePayload) {
    this.socket?.emit('message:send', { roomId, dto });
  }

  // ==========================================
  // LISTENER REGISTRATION METHODS
  // ==========================================

  onRoomJoined(callback: (data: { roomId: string }) => void) {
    this.socket?.on('room:joined', callback);
  }

  onMessageNew(callback: (message: Message) => void) {
    this.socket?.on('message:new', callback);
  }

  onRoomKicked(callback: (data: { roomId: string }) => void) {
    this.socket?.on('room:kicked', callback);
  }

  onError(callback: (error: SocketErrorPayload) => void) {
    this.socket?.on('error', callback);
  }

  /**
   * Removes all event listeners. 
   * Crucial to call this when your chat component unmounts to prevent memory leaks 
   * and duplicate event triggering.
   */
  removeAllListeners() {
    this.socket?.off('room:joined');
    this.socket?.off('message:new');
    this.socket?.off('room:kicked');
    this.socket?.off('error');
  }
}

// Export a single instance to be used across the application
export const discussionSocketService = new DiscussionSocketService();