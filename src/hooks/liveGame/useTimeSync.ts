
import { useState, useEffect, useCallback } from 'react';
import { gameTimeSync } from '@/services/games/modules/gameTimeSync';

/**
 * Hook para gestionar la sincronización de tiempo con el servidor
 */
export const useTimeSync = () => {
  const [offset, setOffset] = useState<number>(0);
  const [lastSync, setLastSync] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
  // Función para sincronizar con el servidor
  const syncWithServer = useCallback(async () => {
    // Evitar múltiples sincronizaciones simultáneas
    if (isSyncing) return;
    
    // Limitar frecuencia de sincronizaciones
    const now = Date.now();
    if (now - lastSync < 60000 && offset !== 0) { // 1 minuto entre sincronizaciones
      return;
    }
    
    try {
      setIsSyncing(true);
      const newOffset = await gameTimeSync.syncWithServerTime();
      setOffset(newOffset);
      setLastSync(Date.now());
    } finally {
      setIsSyncing(false);
    }
  }, [offset, lastSync, isSyncing]);
  
  // Obtener tiempo del servidor (ajustado con el offset)
  const getServerTime = useCallback(() => {
    return new Date(Date.now() + offset);
  }, [offset]);
  
  // Calcular tiempo restante hasta una fecha específica, usando tiempo del servidor
  const getTimeRemainingUntil = useCallback((targetDate: Date): number => {
    const serverNow = getServerTime();
    return Math.max(0, targetDate.getTime() - serverNow.getTime());
  }, [getServerTime]);
  
  // Sincronizar cuando se monta el componente
  useEffect(() => {
    // Intentar usar offset en caché primero
    const cachedOffset = gameTimeSync.getCachedTimeOffset();
    if (cachedOffset !== null) {
      setOffset(cachedOffset);
    }
    
    syncWithServer();
  }, [syncWithServer]);

  return {
    offset,
    isSyncing,
    syncWithServer,
    getServerTime,
    getTimeRemainingUntil
  };
};
