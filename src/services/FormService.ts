import api from './api';
import { type Form, FormType } from '../types';

export const FormService = {
  async getForm(eventId: string, type: FormType) {
    const response = await api.get(`/events/${eventId}/forms/${type}`);
    return response.data;
  },

  async createForm(eventId: string, form: Form) {
    const response = await api.post(`/events/${eventId}/forms/${form.type}`, form);
    return response.data;
  },

  async updateForm(eventId: string, type: FormType, form: Partial<Form>) {
    const response = await api.patch(`/events/${eventId}/forms/${type}`, form);
    return response.data;
  },

  async getResponses(eventId: string, type: FormType) {
    const response = await api.get(`/events/${eventId}/forms/${type}/responses`);
    return response.data;
  },

  async getResponsesSummary(eventId: string, type: FormType) {
    const response = await api.get(`/events/${eventId}/forms/${type}/responses/summary`);
    return response.data;
  }, 

  async submitResponse(eventId: string, type: FormType, payload: any) {
    const response = await api.post(`/events/${eventId}/forms/${type}/responses`, payload);
    return response.data;
  },
  
  async getFormsByEventId(eventId: string) {
    const response = await api.get(`/events/${eventId}/forms`);
    return response.data;
  }
};