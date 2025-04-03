
import { useState, useCallback, useEffect } from 'react';
import { gameTimeSync } from '@/services/games/modules/gameTimeSync';

export const useTimeSync = () => {
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  
  // Sync local time with server time
  const syncWithServer = useCallback(async () => {
    try {
      const offset = await gameTimeSync.syncWithServerTime();
      setServerTimeOffset(offset);
      setLastSyncTime(Date.now());
      console.log(`[TimeSync] Synchronized with server. Offset: ${offset}ms`);
      return offset;
    } catch (err) {
      console.error('[TimeSync] Failed to sync with server:', err);
      return serverTimeOffset; // Return existing offset on error
    }
  }, [serverTimeOffset]);

  // Get current server time (approximated)
  const getServerTime = useCallback(() => {
    const clientTime = Date.now();
    return clientTime + serverTimeOffset;
  }, [serverTimeOffset]);

  // Set up initial sync and periodic re-sync
  useEffect(() => {
    // Initial time sync
    syncWithServer();
    
    // Re-sync with the server every 2 minutes to maintain accuracy
    const timeSyncInterval = setInterval(() => {
      console.log('[TimeSync] Re-synchronizing clock with server');
      syncWithServer();
    }, 120000); // 2 minutes
    
    return () => {
      clearInterval(timeSyncInterval);
    };
  }, [syncWithServer]);

  return {
    serverTimeOffset,
    syncWithServer,
    getServerTime,
    lastSyncTime
  };
};
