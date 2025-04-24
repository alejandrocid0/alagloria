import { useState, useCallback, useEffect, useRef } from 'react';
import { gameTimeSync } from '@/services/games/modules/gameTimeSync';

export const useTimeSync = () => {
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [syncInProgress, setSyncInProgress] = useState<boolean>(false);
  const syncAttempts = useRef<number>(0);
  const maxSyncAttempts = 3; // Máximo número de intentos de sincronización
  
  // Sync local time with server time
  const syncWithServer = useCallback(async () => {
    // Evitar múltiples sincronizaciones simultáneas
    if (syncInProgress) return serverTimeOffset;
    
    // Evitar demasiadas sincronizaciones si ya hemos alcanzado el límite de intentos
    if (syncAttempts.current >= maxSyncAttempts) {
      console.log(`[TimeSync] Maximum sync attempts (${maxSyncAttempts}) reached. Using current offset: ${serverTimeOffset}ms`);
      return serverTimeOffset;
    }
    
    // Evitar sincronizaciones demasiado frecuentes (mínimo 15 segundos entre intentos)
    const now = Date.now();
    if (now - lastSyncTime < 15000) {
      console.log(`[TimeSync] Skipping sync, last sync was ${Math.round((now - lastSyncTime)/1000)}s ago`);
      return serverTimeOffset;
    }
    
    try {
      setSyncInProgress(true);
      syncAttempts.current++;
      
      const offset = await gameTimeSync.syncWithServerTime();
      setServerTimeOffset(offset);
      setLastSyncTime(now);
      console.log(`[TimeSync] Synchronized with server. Offset: ${offset}ms (attempt ${syncAttempts.current}/${maxSyncAttempts})`);
      return offset;
    } catch (err) {
      console.error('[TimeSync] Failed to sync with server:', err);
      return serverTimeOffset; // Return existing offset on error
    } finally {
      setSyncInProgress(false);
    }
  }, [serverTimeOffset, syncInProgress, lastSyncTime]);

  // Get current server time (approximated)
  const getServerTime = useCallback(() => {
    const clientTime = Date.now();
    return clientTime + serverTimeOffset;
  }, [serverTimeOffset]);

  // Set up initial sync and periodic re-sync
  useEffect(() => {
    // Initial time sync
    syncWithServer();
    
    // Re-sync with the server much less frequently (5 minutes)
    // Solo si no se alcanzó el límite de intentos
    const timeSyncInterval = setInterval(() => {
      if (syncAttempts.current < maxSyncAttempts) {
        console.log('[TimeSync] Periodic re-synchronization with server');
        syncWithServer();
      }
    }, 300000); // 5 minutes
    
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
