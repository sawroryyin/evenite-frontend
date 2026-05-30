import axios from 'axios';
import type { GeneratedEventDto, TranslateBilingualFieldsDto, EventData, SaveDraftDto } from '../types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export const EventService = {
  async generateFromPrompt(prompt: string): Promise<GeneratedEventDto> {
    const response = await apiClient.post<GeneratedEventDto>('/events/generate/prompt', { prompt: prompt });
    return response.data;
  },

  async generateFromImage(file: File): Promise<GeneratedEventDto> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<GeneratedEventDto>('/events/generate/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async translateFields(dto: TranslateBilingualFieldsDto): Promise<TranslateBilingualFieldsDto> {
    const response = await apiClient.post<TranslateBilingualFieldsDto>('/events/translate', dto);
    return response.data;
  },

  async uploadBanner(file: File): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await apiClient.post<{ bannerUrl: string }>('/events/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async saveAsDraft(dto: SaveDraftDto): Promise<EventData> {
    const response = await apiClient.post<EventData>('/events/save-draft', dto);
    return response.data;
  },

  async publish(dto: EventData): Promise<EventData> {
    const response = await apiClient.post<EventData>('/events/publish', dto);
    return response.data;
  },

  async getEventById(id: string): Promise<EventData> {
    const response = await apiClient.get<EventData>(`/events/${id}`);
    return response.data;
  },

  async getAllEvents(): Promise<EventData[]> {
    const response = await apiClient.get<EventData[]>('/events');
    return response.data;
  }
};