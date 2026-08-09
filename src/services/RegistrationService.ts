import api from './api';
import type { CreateFormFieldAnswerDto } from '../types'; // Adjust based on your types

export const RegistrationService = {
  // Registers participant, submits answers, and returns a ticket
  async registerForEvent(eventId: string, answers: CreateFormFieldAnswerDto[]) {
    const response = await api.post(`/events/${eventId}/registrations/me`, { answers });
    return response.data;
  },

  async cancelRegistration(eventId: string) {
    const response = await api.delete(`/events/${eventId}/registrations/me`);
    return response.data;
  },

  // Organizer: get list of registrants
  async getRegistrants(eventId: string) {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  // Participant: get ticket for a specific event
  async getTicketByEvent(eventId: string) {
    const response = await api.get(`/events/${eventId}/registrations/me/ticket`);
    return response.data;
  }
};