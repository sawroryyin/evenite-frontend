import api from './api';

export const UserService = {
  // --- General User ---
  async getCurrentUserProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async switchProfile(targetRole: string) {
    const response = await api.patch('/users/me/switch-profile', { targetRole });
    return response.data;
  },

  // --- Participant Profile ---
  async getParticipantProfile() {
    const response = await api.get('/users/me/participant-profile');
    return response.data;
  },

  async createParticipantProfile(profileData: any) {
    const response = await api.post('/users/me/participant-profile', profileData);
    return response.data;
  },

  async updateParticipantProfile(profileData: any) {
    const response = await api.patch('/users/me/participant-profile', profileData);
    return response.data;
  },

  async uploadParticipantImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/me/participant-profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // This is the endpoint we need for the condition check!
  async getCurrentUserRegisteredEvents(status?: string) {
    const response = await api.get('/users/me/registered-events', {
      params: { status }
    });
    return response.data;
  },

  async getCurrentUserTickets(ticketStatus?: string) {
    const response = await api.get('/users/me/tickets', {
      params: { ticketStatus }
    });
    return response.data;
  },

  async getCurrentUserTicketById(ticketId: string) {
    const response = await api.get(`/users/me/tickets/${ticketId}`);
    return response.data;
  },

  // --- Organizer Profile ---
  async getOrganizerProfile() {
    const response = await api.get('/users/me/organizer-profile');
    return response.data;
  },

  async createOrganizerProfile(profileData: any) {
    const response = await api.post('/users/me/organizer-profile', profileData);
    return response.data;
  },

  async updateOrganizerProfile(profileData: any) {
    const response = await api.patch('/users/me/organizer-profile', profileData);
    return response.data;
  },

  async uploadOrganizerImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/users/me/organizer-profile/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getCurrentUserCreatedEvents(status?: string) {
    const response = await api.get('/users/me/created-events', {
      params: { status }
    });
    return response.data;
  }
};