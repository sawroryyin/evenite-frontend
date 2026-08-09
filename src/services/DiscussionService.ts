import api from './api';
import type { 
  DiscussionRoom, 
  MessagePage, 
  GetMessagesQuery, 
  GetRoomsQuery 
} from '../types';

export const DiscussionService = {
  /**
   * Fetches the list of discussion rooms for the currently authenticated user.
   */
  async getRoomList(params?: GetRoomsQuery): Promise<DiscussionRoom[]> {
    const response = await api.get<DiscussionRoom[]>('/discussion-rooms', { params });
    return response.data;
  },

  /**
   * Fetches a paginated list of messages for a specific discussion room.
   */
  async getMessages(roomId: string, params: GetMessagesQuery): Promise<MessagePage> {
    const response = await api.get<MessagePage>(`/discussion-rooms/${roomId}/messages`, { params });
    return response.data;
  },

  /**
   * Marks a specific discussion room as read for the current user.
   */
  async markRoomAsRead(roomId: string): Promise<{ roomId: string; lastReadAt: string }> {
    const response = await api.patch<{ roomId: string; lastReadAt: string }>(`/discussion-rooms/${roomId}/read`);
    return response.data;
  }
};