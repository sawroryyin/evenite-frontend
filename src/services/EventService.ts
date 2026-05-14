import axios from 'axios';
import type { GeneratedEventDto, TranslateBilingualFieldsDto, EventData } from '../types';

// Assuming AxiosClient is configured with baseURL in your actual project
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

export const EventService = {
  // C-001
  async generateFromPrompt(prompt: string): Promise<GeneratedEventDto> {
    const response = await apiClient.post<GeneratedEventDto>('/events/generate/prompt', { prompt: prompt });
    return response.data;
  },

  // C-002
  async generateFromImage(file: File): Promise<GeneratedEventDto> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<GeneratedEventDto>('/events/generate/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // C-003
  async translateFields(dto: TranslateBilingualFieldsDto): Promise<TranslateBilingualFieldsDto> {
    const response = await apiClient.post<TranslateBilingualFieldsDto>('/events/translate', dto);
    return response.data;
  },

  // C-004
  async uploadBanner(file: File): Promise<{ bannerUrl: string }> {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await apiClient.post<{ bannerUrl: string }>('/events/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // C-005
  async saveAsDraft(dto: Partial<EventData>): Promise<EventData> {
    const response = await apiClient.post<EventData>('/events/save-draft', dto);
    return response.data;
  },

  // C-006
  async publish(dto: EventData): Promise<EventData> {
    const response = await apiClient.post<EventData>('/events/publish', dto);
    return response.data;
  }
};