import api from './api';
import type { GeneratedEventDto, TranslateBilingualFieldsDto, EventData, SaveDraftDto } from '../types';

export const EventService = {
  async generateFromPrompt(prompt: string): Promise<GeneratedEventDto> {
    const response = await api.post<GeneratedEventDto>('/events/generate/prompt', { prompt: prompt });
    return response.data;
  },

  async generateFromImage(file: File): Promise<GeneratedEventDto> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post<GeneratedEventDto>('/events/generate/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async translateFields(dto: TranslateBilingualFieldsDto): Promise<TranslateBilingualFieldsDto> {
    const response = await api.post<TranslateBilingualFieldsDto>('/events/translate', dto);
    return response.data;
  },

  async uploadBanner(file: File): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await api.post<{ bannerUrl: string }>('/events/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async saveAsDraft(dto: SaveDraftDto): Promise<EventData> {
    const response = await api.post<EventData>('/events/save-draft', dto);
    return response.data;
  },

  async publish(dto: EventData): Promise<EventData> {
    const response = await api.post<EventData>('/events/publish', dto);
    return response.data;
  },

  async getEventById(id: string): Promise<EventData> {
    const response = await api.get<EventData>(`/events/${id}`);
    return response.data;
  },

  async getAllEvents(): Promise<EventData[]> {
    const response = await api.get<EventData[]>('/events');
    return response.data;
  }
};