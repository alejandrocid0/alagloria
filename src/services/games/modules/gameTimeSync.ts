
// Si no existe este archivo, lo creamos:

import { supabase } from '@/integrations/supabase/client';

const SERVER_TIME_CACHE_KEY = 'server_time_offset';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos

/**
 * Servicio para sincronizar el tiempo con el servidor
 */
export const gameTimeSync = {
  /**
   * Obtener la diferencia de tiempo entre cliente y servidor
   */
  async syncWithServerTime(): Promise<number> {
    // Intentar usar offset en caché primero
    const cachedOffset = this.getCachedTimeOffset();
    if (cachedOffset !== null) {
      console.log(`[TimeSync] Usando offset en caché: ${cachedOffset}ms`);
      return cachedOffset;
    }
    
    try {
      console.log('[TimeSync] Sincronizando tiempo con servidor...');
      // Registrar tiempo antes de la solicitud
      const clientStartTime = Date.now();
      
      // Llamar al servidor para obtener tiempo
      const { data, error } = await supabase.rpc('get_server_time');
      
      if (error) {
        console.error('[TimeSync] Error al obtener tiempo del servidor:', error);
        return 0;
      }
      
      // Registrar tiempo después de la solicitud
      const clientEndTime = Date.now();
      
      // Estimar tiempo de ida y vuelta y tiempo del servidor
      const roundTripTime = clientEndTime - clientStartTime;
      const estimatedOneWayLatency = roundTripTime / 2;
      
      if (data && data.server_time) {
        // Convertir tiempo del servidor a epoch milliseconds
        const serverTimeMs = new Date(data.server_time).getTime();
        
        // Ajustar por latencia estimada
        const adjustedServerTime = serverTimeMs + estimatedOneWayLatency;
        
        // Calcular diferencia entre cliente y servidor
        const offset = adjustedServerTime - clientEndTime;
        
        console.log(`[TimeSync] Tiempo servidor: ${new Date(serverTimeMs).toISOString()}, Latencia: ~${estimatedOneWayLatency}ms, Offset calculado: ${offset}ms`);
        
        // Guardar en caché
        this.cacheTimeOffset(offset);
        
        return offset;
      }
      
      return 0;
    } catch (err) {
      console.error('[TimeSync] Error inesperado al sincronizar tiempo:', err);
      return 0;
    }
  },
  
  /**
   * Obtener el tiempo del servidor actual (estimado)
   */
  getServerTime(): Date {
    const offset = this.getCachedTimeOffset() || 0;
    return new Date(Date.now() + offset);
  },
  
  /**
   * Guardar offset de tiempo en caché
   */
  cacheTimeOffset(offset: number): void {
    try {
      const cacheData = {
        offset,
        timestamp: Date.now()
      };
      localStorage.setItem(SERVER_TIME_CACHE_KEY, JSON.stringify(cacheData));
      console.log(`[TimeSync] Offset de tiempo guardado en caché: ${offset}ms`);
    } catch (e) {
      console.warn('[TimeSync] No se pudo guardar offset en localStorage:', e);
    }
  },
  
  /**
   * Obtener offset de tiempo desde caché
   */
  getCachedTimeOffset(): number | null {
    try {
      const cachedData = localStorage.getItem(SERVER_TIME_CACHE_KEY);
      if (!cachedData) return null;
      
      const { offset, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      
      // Verificar si el caché ha expirado
      if (now - timestamp > CACHE_TTL) {
        console.log('[TimeSync] Caché de tiempo expirado');
        return null;
      }
      
      return offset;
    } catch (e) {
      console.warn('[TimeSync] Error leyendo caché de tiempo:', e);
      return null;
    }
  }
};
