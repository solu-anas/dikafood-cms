import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiConfig } from '../config/api';
import { safeNotificationError } from './notify';
import { getErrorMessage } from './error';

// Create a shared axios instance
const api = axios.create(apiConfig);

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dikafood_access_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Global error handler with silent refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const is401 = error.response?.status === 401;
    const isLoginOrRefresh = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');
    if (is401 && !isLoginOrRefresh && !window.location.pathname.includes('/login')) {
      // Try silent refresh
      const refreshToken = localStorage.getItem('dikafood_refresh_token');
      console.log('🔐 Got 401 error, checking for refresh token...', { hasRefreshToken: !!refreshToken });
      if (refreshToken && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue requests while refreshing
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              resolve(api(originalRequest));
            });
          });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          console.log('🔄 Attempting silent token refresh...');
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const newAccessToken = res.data?.data?.tokens?.accessToken;
          const newRefreshToken = res.data?.data?.tokens?.refreshToken;
          if (newAccessToken) {
            console.log('✅ Silent refresh successful, updating tokens...');
            localStorage.setItem('dikafood_access_token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('dikafood_refresh_token', newRefreshToken);
            }
            api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            onRefreshed(newAccessToken);
            isRefreshing = false;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            return api(originalRequest);
          } else {
            console.log('❌ Silent refresh failed: No access token in response');
          }
        } catch (refreshError) {
          console.log('❌ Silent refresh failed:', refreshError);
          isRefreshing = false;
          refreshSubscribers = [];
          // Remove tokens and redirect to login
          localStorage.removeItem('dikafood_access_token');
          localStorage.removeItem('dikafood_refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        localStorage.removeItem('dikafood_access_token');
        localStorage.removeItem('dikafood_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    // Show notification for other errors
    const message = getErrorMessage(error);
    safeNotificationError({
      message: 'API Error',
      description: message,
    });
    return Promise.reject(error);
  }
);

// Helper function to check if token is about to expire
function isTokenExpiring(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiration = expirationTime - currentTime;
    
    // Return true if token expires within 2 minutes
    return timeUntilExpiration < 2 * 60 * 1000;
  } catch (error) {
    console.warn('Failed to parse token expiration:', error);
    return false;
  }
}

// Proactive token refresh function
export async function checkAndRefreshToken(): Promise<void> {
  const accessToken = localStorage.getItem('dikafood_access_token');
  const refreshToken = localStorage.getItem('dikafood_refresh_token');
  
  if (!accessToken || !refreshToken) {
    return;
  }
  
  if (isTokenExpiring(accessToken)) {
    console.log('🔄 Token is about to expire, proactively refreshing...');
    try {
      const res = await axios.post('/api/auth/refresh', { refreshToken });
      const newAccessToken = res.data?.data?.tokens?.accessToken;
      const newRefreshToken = res.data?.data?.tokens?.refreshToken;
      
      if (newAccessToken) {
        localStorage.setItem('dikafood_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('dikafood_refresh_token', newRefreshToken);
        }
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        console.log('✅ Proactive token refresh successful');
      }
    } catch (error) {
      console.warn('⚠️ Proactive token refresh failed:', error);
    }
  }
}

// Generic helpers
export async function apiGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await api.get(url, config);
  return response.data;
}

export async function apiPost<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await api.post(url, data, config);
  return response.data;
}

export async function apiPut<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await api.put(url, data, config);
  return response.data;
}

export async function apiDelete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response: AxiosResponse<T> = await api.delete(url, config);
  return response.data;
}

// Helper to get product image URL from backend
export async function getProductImageUrlById(imageId: string): Promise<string> {
  if (!imageId) throw new Error('No image id provided');
  // If imageId is a full URL, extract the last segment (the key)
  let cleanId = imageId;
  if (/^https?:\/\//.test(imageId)) {
    cleanId = imageId.split('/').pop() || imageId;
  } else {
    cleanId = imageId.replace(/^\/api\/files\/product-images\//, '').replace(/^\//, '');
  }
  const { url } = await apiGet<{ url: string }>(`/api/files/product-images/url/${cleanId}`);
  // If the url is relative, prepend the API base URL
  if (url.startsWith('/')) {
    let base = api.defaults.baseURL || 'http://localhost:3000/api';
    base = base.replace(/\/api$/, '');
    return `${base}${url}`;
  }
  return url;
}

// Debug helper for testing token refresh (can be called from browser console)
export function debugTokens() {
  const accessToken = localStorage.getItem('dikafood_access_token');
  const refreshToken = localStorage.getItem('dikafood_refresh_token');
  
  console.log('🔍 Token Debug Info:');
  console.log('Access Token:', accessToken ? 'Present' : 'Missing');
  console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
  
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = new Date(payload.exp * 1000);
      const currentTime = new Date();
      const timeUntilExpiration = expirationTime.getTime() - currentTime.getTime();
      
      console.log('Access Token Expires:', expirationTime.toLocaleString());
      console.log('Time Until Expiration:', Math.round(timeUntilExpiration / 1000 / 60), 'minutes');
      console.log('Is Expiring Soon:', timeUntilExpiration < 2 * 60 * 1000);
    } catch (error) {
      console.warn('Failed to parse access token:', error);
    }
  }
}

// Make it available globally for debugging
(window as any).debugTokens = debugTokens;
(window as any).checkAndRefreshToken = checkAndRefreshToken;

export default api;