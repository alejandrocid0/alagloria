
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para sincronizar el tiempo del cliente con el servidor
 * y calcular la diferencia (offset) para ajustes precisos
 */
export const useTimeSync = () => {
  const [clientTimeOffset, setClientTimeOffset] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const syncAttemptsRef = useRef(0);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Función para obtener el tiempo del servidor
  const getServerTime = useCallback(async (): Promise<number | null> => {
    try {
      const startTime = Date.now();
      
      // Usar una función edge para obtener el tiempo del servidor
      const { data, error } = await supabase.functions.invoke('get-server-time');
      
      if (error) {
        console.error('Error obteniendo tiempo del servidor:', error);
        return null;
      }
      
      // El tiempo que tomó la ida y vuelta
      const roundTripTime = Date.now() - startTime;
      
      if (!data?.serverTime) {
        console.error('No se recibió tiempo del servidor');
        return null;
      }
      
      // Compensar por el tiempo de ida (aproximadamente la mitad del roundtrip)
      const serverTime = data.serverTime + Math.floor(roundTripTime / 2);
      return serverTime;
    } catch (err) {
      console.error('Error inesperado al sincronizar tiempo:', err);
      return null;
    }
  }, []);

  // Sincronizar con el servidor
  const syncWithServer = useCallback(async () => {
    const serverTime = await getServerTime();
    
    if (serverTime) {
      const clientTime = Date.now();
      const offset = serverTime - clientTime;
      
      // Actualizar el offset y el último tiempo de sincronización
      setClientTimeOffset(offset);
      setLastSyncTime(clientTime);
      syncAttemptsRef.current = 0;
      
      console.log(`Tiempo sincronizado. Offset: ${offset}ms`);
      return true;
    } else {
      // Si falló la sincronización, incrementar contador de intentos
      syncAttemptsRef.current += 1;
      console.warn(`Falló la sincronización de tiempo (intento ${syncAttemptsRef.current})`);
      return false;
    }
  }, [getServerTime]);

  // Obtener el tiempo del servidor ajustado
  const getAdjustedTime = useCallback(() => {
    return Date.now() + clientTimeOffset;
  }, [clientTimeOffset]);

  // Configurar sincronización periódica
  useEffect(() => {
    // Sincronizar al inicio
    syncWithServer();
    
    // Programar sincronización periódica (cada 5 minutos)
    syncIntervalRef.current = setInterval(() => {
      console.log('Ejecutando sincronización periódica de tiempo');
      syncWithServer();
    }, 5 * 60 * 1000); // 5 minutos
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [syncWithServer]);

  return {
    clientTimeOffset,
    lastSyncTime,
    syncWithServer,
    getAdjustedTime
  };
};

export default useTimeSync;
