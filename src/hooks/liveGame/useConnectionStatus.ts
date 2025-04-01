
import { useState, useCallback } from 'react';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useConnectionStatus = (onReconnect: () => Promise<void>) => {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    setReconnectAttempts(prev => {
      const attempts = prev + 1;
      const delay = Math.min(30000, Math.pow(2, attempts) * 1000); // Exponential backoff with 30s max
      
      console.log(`[GameState] Scheduling reconnect attempt ${attempts} in ${delay}ms`);
      setTimeout(onReconnect, delay);
      
      return attempts;
    });
  }, [onReconnect]);

  // Handle connection state changes
  const updateConnectionState = useCallback((isConnected: boolean) => {
    const wasConnected = isConnected;
    setIsConnected(isConnected);
    
    if (!wasConnected && isConnected) {
      gameNotifications.connectSuccess();
      setReconnectAttempts(0);
    } else if (wasConnected && !isConnected) {
      gameNotifications.connectionLost();
    }
  }, []);

  return {
    isConnected,
    reconnectAttempts,
    setIsConnected: updateConnectionState,
    setReconnectAttempts,
    scheduleReconnect
  };
};
