import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000',
})

let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  
  if (config.headers) {
    // Smart Token Routing: Use the refresh token ONLY for the refresh endpoint
    if (config.url?.includes('/auth/refresh') && authStore.refreshToken) {
      config.headers.Authorization = `Bearer ${authStore.refreshToken}`
    } 
    // Use the standard access token for all other requests
    else if (authStore.accessToken) {
      config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If there's no config or the error isn't a 401, reject immediately
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    // Ignore 401s on login/register endpoints
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
      return Promise.reject(error)
    }

    // If the refresh request itself fails with a 401, the refresh token is dead. Log out.
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore().logout()   
      return Promise.reject(error)
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    const authStore = useAuthStore()
    
    // Safety check: If we don't have a refresh token at all, force logout
    if (!authStore.refreshToken) {
      authStore.logout()
      return Promise.reject(error)
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await api.post('/auth/refresh')
      
      authStore.setTokens(data.accessToken, authStore.refreshToken as string)
      processQueue(null, data.accessToken)
      
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    } catch (err: any) {
      processQueue(err, null)
      
      // Only log out if the backend explicitly rejected the refresh token.
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        authStore.logout()
      }
      
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default api