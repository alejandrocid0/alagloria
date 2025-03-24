
import { useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export const useNetworkStatus = (
  isConnected: boolean,
  fetchGameStateData: () => Promise<void>,
  scheduleReconnect: () => void,
  gameId?: string
) => {
  // Event handler for network status changes
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network connection restored');
      fetchGameStateData();
      
      toast({
        title: "Conexión restablecida",
        description: "Te has vuelto a conectar a la partida",
        variant: "default",
      });
    };
    
    const handleOffline = () => {
      console.log('Network connection lost');
      
      toast({
        title: "Conexión perdida",
        description: "Intentando reconectar...",
        variant: "destructive",
      });
      
      scheduleReconnect();
    };
    
    // Listen for browser's online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [gameId, fetchGameStateData, scheduleReconnect]);

  return { isConnected };
};
