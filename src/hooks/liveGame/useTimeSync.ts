
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useTimeSync = () => {
  const [clientTimeOffset, setClientTimeOffset] = useState<number>(0);
  const [lastSyncAt, setLastSyncAt] = useState<number>(0);
  const [syncAttempts, setSyncAttempts] = useState<number>(0);
  
  // Function to synchronize client time with server time
  const syncWithServer = useCallback(async () => {
    try {
      // Record the time before making the request
      const startTime = Date.now();
      
      // Call the server time function
      const { data, error } = await supabase.functions.invoke('get-server-time');
      
      if (error) {
        console.error('Error syncing time with server:', error);
        return false;
      }
      
      // Record the time after getting the response
      const endTime = Date.now();
      
      // Calculate latency (round trip / 2)
      const latency = Math.floor((endTime - startTime) / 2);
      
      // Calculate offset (server time + latency) - client time
      const serverTime = new Date(data.timestamp).getTime();
      const adjustedServerTime = serverTime + latency;
      const offset = adjustedServerTime - endTime;
      
      console.log(`[TimeSync] Server time: ${new Date(serverTime).toISOString()}`);
      console.log(`[TimeSync] Client time: ${new Date(endTime).toISOString()}`);
      console.log(`[TimeSync] Latency: ${latency}ms`);
      console.log(`[TimeSync] Offset: ${offset}ms`);
      
      // Update state
      setClientTimeOffset(offset);
      setLastSyncAt(Date.now());
      setSyncAttempts(prev => prev + 1);
      
      return true;
    } catch (err) {
      console.error('Unexpected error during time sync:', err);
      setSyncAttempts(prev => prev + 1);
      return false;
    }
  }, []);
  
  // Re-sync every 5 minutes to ensure accuracy
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('[TimeSync] Performing periodic time sync');
      syncWithServer();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [syncWithServer]);
  
  // Function to get current time adjusted by the offset
  const getAdjustedTime = useCallback(() => {
    return Date.now() + clientTimeOffset;
  }, [clientTimeOffset]);
  
  return {
    clientTimeOffset,
    syncWithServer,
    getAdjustedTime,
    lastSyncAt,
    syncAttempts
  };
};
