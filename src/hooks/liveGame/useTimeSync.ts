
import { useState, useCallback, useEffect } from 'react';

export const useTimeSync = () => {
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  
  // Sync local time with server time
  const syncWithServer = useCallback(async () => {
    try {
      const startTime = Date.now();
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const endTime = Date.now();
      const roundTripTime = endTime - startTime;
      
      if (!response.ok) {
        console.error('Time sync failed: Server responded with status', response.status);
        return;
      }
      
      const data = await response.json();
      const serverTime = new Date(data.datetime).getTime();
      const clientTime = Date.now();
      
      // Adjust for round-trip latency (approximation)
      const adjustedOffset = serverTime - (clientTime - Math.floor(roundTripTime / 2));
      setServerTimeOffset(adjustedOffset);
      
      console.log('Time sync complete. Offset:', adjustedOffset, 'ms');
    } catch (err) {
      console.error('Time sync failed:', err);
    }
  }, []);

  // Set up initial sync and periodic re-sync
  useEffect(() => {
    // Initial time sync
    syncWithServer();
    
    // Re-sync with the server every 5 minutes
    const timeSyncInterval = setInterval(() => {
      console.log('[GameState] Re-sincronizando reloj con el servidor');
      syncWithServer();
    }, 300000); // 5 minutes
    
    return () => {
      clearInterval(timeSyncInterval);
    };
  }, [syncWithServer]);

  return {
    serverTimeOffset,
    syncWithServer
  };
};
