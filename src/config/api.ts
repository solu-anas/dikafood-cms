/**
 * Centralized API Configuration
 * Single source of truth for API endpoints and environment settings
 */

// Environment detection
const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// API Base URLs for different environments
const API_BASE_URLS = {
  development: "http://localhost:3000",
  production: "https://api.dikafood.com",
} as const;

// Get current environment's API base URL
export const getApiBaseUrl = (): string => {
  // Allow override via environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  if (isProduction) {
    return API_BASE_URLS.production;
  }
  
  return API_BASE_URLS.development;
};

// Export the current API base URL
export const API_BASE_URL = getApiBaseUrl();

// API Configuration object
export const apiConfig = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-App-Type": "DikaFood-CMS",
  },
  timeout: 30000, // 30 seconds timeout
} as const;

// Environment info for debugging
export const environmentInfo = {
  isDevelopment,
  isProduction,
  currentEnvironment: isProduction ? 'production' : 'development',
  apiBaseUrl: API_BASE_URL,
} as const;

// Log environment info in development
if (isDevelopment) {
  console.log('🔧 API Configuration:', environmentInfo);
} 