import api from './api';
import type { 
  DiscussionRoom, 
  GetMessagesQuery, 
  GetRoomsQuery,
  MessagePageDto
} from '../types';

export const DiscussionService = {
  /**
   * Fetches discussion rooms for Organizers (events they created)
   */
  async getCreatedRooms(params?: GetRoomsQuery): Promise<DiscussionRoom[]> {
    const response = await api.get<DiscussionRoom[]>('/discussion-rooms/created-rooms', { params });
    return response.data;
  },

  /**
   * Fetches discussion rooms for Participants (events they joined)
   */
  async getJoinedRooms(params?: GetRoomsQuery): Promise<DiscussionRoom[]> {
    const response = await api.get<DiscussionRoom[]>('/discussion-rooms/joined-rooms', { params });
    return response.data;
  },

  /**
   * Fetches a paginated list of messages for a specific discussion room using cursor pagination.
   */
  async getMessages(roomId: string, params: GetMessagesQuery): Promise<MessagePageDto> {
    const response = await api.get<MessagePageDto>(`/discussion-rooms/${roomId}/messages`, { params });
    return response.data;
  },

  /**
   * Fetches the latest announcements for a specific discussion room.
   */
  async getAnnouncements(roomId: string, params: GetMessagesQuery): Promise<MessagePageDto> {
    const response = await api.get<MessagePageDto>(`/discussion-rooms/${roomId}/announcements`, { params });
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