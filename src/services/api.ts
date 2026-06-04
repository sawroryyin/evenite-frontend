import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Attach access token to requests
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercept 401 responses to refresh the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend expects the refresh token in the Authorization header [cite: 103]
        const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${authStore.refreshToken}` }
        });
        
        authStore.setTokens(data.accessToken, authStore.refreshToken as string);
        processQueue(null, data.accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.logout(); // Force login if refresh fails
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;