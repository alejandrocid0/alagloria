
import { useState, useCallback } from 'react';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useConnectionStatus = (onReconnect: () => Promise<void>) => {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [notificationCooldown, setNotificationCooldown] = useState(false);
  
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

  // Handle connection state changes with debounce to prevent notification spam
  const updateConnectionState = useCallback((isConnected: boolean) => {
    setIsConnected(isConnected);
    
    // Only show notifications if we're not in cooldown period
    if (!notificationCooldown) {
      if (!isConnected) {
        gameNotifications.connectionLost();
        setNotificationCooldown(true);
        // Set a cooldown period of 30 seconds for connection notifications
        setTimeout(() => setNotificationCooldown(false), 30000);
      } else if (reconnectAttempts > 0) {
        // Only show reconnection success if there was at least one previous attempt
        gameNotifications.connectSuccess();
        setReconnectAttempts(0);
        setNotificationCooldown(true);
        // Set a cooldown period of 30 seconds for connection notifications
        setTimeout(() => setNotificationCooldown(false), 30000);
      }
    }
  }, [reconnectAttempts, notificationCooldown]);

  return {
    isConnected,
    reconnectAttempts,
    setIsConnected: updateConnectionState,
    setReconnectAttempts,
    scheduleReconnect
  };
};
