import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'

// 1. Import the socket service
import { discussionSocketService } from '../services/DiscussionSocketService'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
    parsedToken: (state): any => {
      if (!state.accessToken) return null
      try {
        return jwtDecode(state.accessToken)
      } catch {
        return null
      }
    },
    hasParticipantProfile(): boolean {
      return this.parsedToken?.participantProfileId !== null
    },
    hasOrganizerProfile(): boolean {
      return this.parsedToken?.organizerProfileId !== null
    },
    currentRole(): string | null {
      return this.parsedToken?.currentRole || null
    }
  },
  actions: {
    setTokens(access: string, refresh: string) {
      this.accessToken = access
      this.refreshToken = refresh
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      // 2. Establish/reconnect the socket with the new user's token upon login
      discussionSocketService.connect(access)
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // 3. Sever the socket connection immediately upon logout
      discussionSocketService.disconnect()

      window.location.href = '/login'
    }
  }
})