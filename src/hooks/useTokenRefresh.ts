import { useEffect } from 'react';
import { checkAndRefreshToken } from '../utils/api';

/**
 * Hook to automatically check and refresh tokens before they expire
 * Runs every 60 seconds when component is mounted
 */
export const useTokenRefresh = () => {
  useEffect(() => {
    // Only run if we have tokens (user is authenticated)
    const accessToken = localStorage.getItem('dikafood_access_token');
    const refreshToken = localStorage.getItem('dikafood_refresh_token');
    
    if (!accessToken || !refreshToken) {
      console.log('🔐 No tokens found, skipping token refresh setup');
      return;
    }
    
    console.log('🔄 Setting up automatic token refresh...');
    
    // Check tokens immediately on mount
    checkAndRefreshToken();
    
    // Set up interval to check every 60 seconds
    const interval = setInterval(() => {
      checkAndRefreshToken();
    }, 60 * 1000); // 60 seconds
    
    // Cleanup interval on unmount
    return () => {
      console.log('🔄 Cleaning up token refresh timer');
      clearInterval(interval);
    };
  }, []);
}; 