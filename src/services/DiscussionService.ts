import api from './api';
import type { 
  DiscussionRoom, 
  GetMessagesQuery, 
  GetRoomsQuery,
  MessagePageDto,
  Message
} from '../types';

// Front-end sanitizer to fix lingering non-hex UUIDs (g->7, h->8) from cached browser state
const sanitizeId = (id: string): string => {
  if (!id) return id;
  return id.replace(/^g/, '7').replace(/^h/, '8');
};

export const DiscussionService = {
  async getCreatedRooms(params?: GetRoomsQuery): Promise<DiscussionRoom[]> {
    const response = await api.get<DiscussionRoom[]>('/discussion-rooms/created-rooms', { params });
    return response.data.map(room => ({ ...room, roomId: sanitizeId(room.roomId) }));
  },

  async getJoinedRooms(params?: GetRoomsQuery): Promise<DiscussionRoom[]> {
    const response = await api.get<DiscussionRoom[]>('/discussion-rooms/joined-rooms', { params });
    return response.data.map(room => ({ ...room, roomId: sanitizeId(room.roomId) }));
  },

  async getMessages(roomId: string, params: GetMessagesQuery): Promise<MessagePageDto> {
    const safeId = sanitizeId(roomId);
    const cacheBuster = { ...params, _t: Date.now() };
    const response = await api.get<MessagePageDto>(`/discussion-rooms/${safeId}/messages`, { params: cacheBuster });
    if (response.data.messages) {
      response.data.messages = response.data.messages.map(m => ({ ...m, id: sanitizeId(m.id) }));
    }
    return response.data;
  },

  async getAnnouncements(roomId: string): Promise<Message[]> {
    const safeId = sanitizeId(roomId);
    const response = await api.get<Message[]>(`/discussion-rooms/${safeId}/announcements`);
    return response.data.map(m => ({ ...m, id: sanitizeId(m.id) }));
  },

  async markRoomAsRead(roomId: string, lastReadMessageId?: string): Promise<{ roomId: string; lastReadMessageId: string | null; lastReadSerialNumber: number }> {
    const safeRoomId = sanitizeId(roomId);
    const safeMsgId = lastReadMessageId ? sanitizeId(lastReadMessageId) : undefined;
    const response = await api.patch<{ roomId: string; lastReadMessageId: string | null; lastReadSerialNumber: number }>(`/discussion-rooms/${safeRoomId}/read`, { lastReadMessageId: safeMsgId });
    return response.data;
  }
};