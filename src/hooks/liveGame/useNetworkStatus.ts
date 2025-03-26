
import { useState, useEffect, useCallback } from 'react';

export const useNetworkStatus = (
  isConnected: boolean,
  onReconnect: () => Promise<void>,
  onScheduleReconnect: () => void,
  gameId?: string
) => {
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  
  // Function to check network status
  const checkNetworkStatus = useCallback(async () => {
    if (!navigator.onLine) {
      setNetworkStatus('offline');
      return false;
    }
    
    try {
      // Try to contact server with a lightweight request
      const response = await fetch('/api/health-check', { 
        method: 'HEAD',
        cache: 'no-store'
      });
      
      if (response.ok) {
        if (networkStatus !== 'online') {
          console.log('[NetworkMonitor] Connection restored');
          setNetworkStatus('online');
          
          // Try to reconnect to game state
          if (gameId) {
            console.log('[NetworkMonitor] Attempting to reconnect to game state');
            setNetworkStatus('reconnecting');
            
            try {
              await onReconnect();
              setNetworkStatus('online');
            } catch (error) {
              console.error('[NetworkMonitor] Failed to reconnect to game state:', error);
              setNetworkStatus('offline');
              onScheduleReconnect();
            }
          }
        }
        return true;
      } else {
        setNetworkStatus('offline');
        return false;
      }
    } catch (error) {
      console.error('[NetworkMonitor] Network check failed:', error);
      setNetworkStatus('offline');
      return false;
    }
  }, [gameId, networkStatus, onReconnect, onScheduleReconnect]);
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('[NetworkMonitor] Browser reports online status');
      checkNetworkStatus();
    };
    
    const handleOffline = () => {
      console.log('[NetworkMonitor] Browser reports offline status');
      setNetworkStatus('offline');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    checkNetworkStatus();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkNetworkStatus]);
  
  // Update reconnect attempts based on connection state
  useEffect(() => {
    if (isConnected) {
      if (reconnectAttempts > 0) {
        setReconnectAttempts(0);
      }
    } else {
      setReconnectAttempts(prev => prev + 1);
    }
  }, [isConnected, reconnectAttempts]);
  
  // Periodic check for network status every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (networkStatus !== 'online' || !isConnected) {
        console.log('[NetworkMonitor] Performing periodic network check');
        checkNetworkStatus();
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [checkNetworkStatus, isConnected, networkStatus]);
  
  return {
    networkStatus,
    reconnectAttempts,
    checkNetworkStatus
  };
};
