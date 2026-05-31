import axios from 'axios';
import { type Form, FormType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const FormService = {
  async getForm(eventId: string, type: FormType) {
    const response = await axios.get(`${API_URL}/events/${eventId}/forms/${type}`);
    return response.data;
  },

  async createForm(eventId: string, form: Form) {
    const response = await axios.post(`${API_URL}/events/${eventId}/forms`, form);
    return response.data;
  },

  async updateForm(eventId: string, type: FormType, form: Partial<Form>) {
    const response = await axios.patch(`${API_URL}/events/${eventId}/forms/${type}`, form);
    return response.data;
  },

  async getResponses(eventId: string, type: FormType) {
    const response = await axios.get(`${API_URL}/events/${eventId}/forms/${type}/responses`);
    return response.data;
  },

  async getResponsesSummary(eventId: string, type: FormType) {
    const response = await axios.get(`${API_URL}/events/${eventId}/forms/${type}/responses/summary`);
    return response.data;
  }, 
  
    async getFormsByEventId(eventId: string) {
    const response = await axios.get(`${API_URL}/events/${eventId}/forms`);
    return response.data;
}
}