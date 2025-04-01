
import { useState, useCallback } from 'react';

export const useConnectionStatus = (onReconnect: () => Promise<void>) => {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const scheduleReconnect = useCallback(() => {
    setReconnectAttempts(prev => {
      const attempts = prev + 1;
      const delay = Math.min(30000, Math.pow(2, attempts) * 1000); // Backoff exponencial con máx 30s
      
      setTimeout(onReconnect, delay);
      return attempts;
    });
  }, [onReconnect]);

  return {
    isConnected,
    setIsConnected,
    reconnectAttempts,
    setReconnectAttempts,
    scheduleReconnect
  };
};
