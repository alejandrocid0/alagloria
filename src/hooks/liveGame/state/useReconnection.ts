
import { useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook to handle reconnection logic for a game
 */
export const useReconnection = (
  isConnected: boolean,
  fetchGameStateData: () => Promise<void>
) => {
  // References for reconnection
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConnectionAttemptRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);

  // Function to handle reconnection attempts with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    const now = Date.now();
    
    // Calculate delay with exponential backoff
    const baseDelay = 1000; // Start with 1 second
    const maxDelay = 30000; // Cap at 30 seconds
    const attemptsCount = reconnectAttemptsRef.current;

    const delay = Math.min(
      baseDelay * Math.pow(1.5, attemptsCount),
      maxDelay
    );
    
    console.log(`Programando reconexión en ${delay}ms (intento ${reconnectAttemptsRef.current + 1})`);
    
    // Schedule reconnection
    reconnectTimerRef.current = setTimeout(() => {
      lastConnectionAttemptRef.current = Date.now();
      reconnectAttemptsRef.current += 1;
      console.log(`Intento de reconexión ${reconnectAttemptsRef.current} después de ${delay}ms`);
      
      // Attempt to fetch data and reestablish subscriptions
      fetchGameStateData();
    }, delay);
  }, [fetchGameStateData]);

  // Handle connection state changes
  const handleConnectionChange = useCallback((isNowConnected: boolean) => {
    if (!isConnected && isNowConnected) {
      // Connection restored
      toast({
        title: "Conexión recuperada",
        description: "Te has vuelto a conectar a la partida",
        variant: "default",
      });
      reconnectAttemptsRef.current = 0;
    } else if (isConnected && !isNowConnected) {
      // Connection lost
      toast({
        title: "Conexión perdida",
        description: "Intentando reconectar...",
        variant: "destructive",
      });
      
      // Schedule reconnection attempt
      scheduleReconnect();
    }
  }, [isConnected, scheduleReconnect]);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  return {
    reconnectAttemptsRef,
    scheduleReconnect,
    handleConnectionChange,
    cleanup
  };
};
