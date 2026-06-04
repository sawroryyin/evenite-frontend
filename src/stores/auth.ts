import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  currentRole: 'ORGANIZER' | 'PARTICIPANT';
  isVerified: boolean;
  universityId: string;
  participantProfileId: string | null;
  organizerProfileId: string | null;
  hasCreatedProfile: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: null as JwtPayload | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    isVerified: (state) => state.user?.isVerified || false,
    hasProfile: (state) => state.user?.hasCreatedProfile || false,
    currentRole: (state) => state.user?.currentRole || 'PARTICIPANT',
  },
  actions: {
    setTokens(access: string, refresh: string) {
      this.accessToken = access;
      this.refreshToken = refresh;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      this.user = jwtDecode<JwtPayload>(access);
    },
    logout() {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }
});