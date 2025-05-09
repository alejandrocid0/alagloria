
/**
 * Servicio para sincronizar el tiempo del cliente con el servidor
 */
export const gameTimeSync = {
  // Cache del último offset válido y su timestamp
  lastOffset: 0,
  lastSyncTime: 0,
  // Tiempo de validez del cache (15 minutos)
  cacheValidity: 15 * 60 * 1000,
  
  // Inicializar desde localStorage si está disponible
  initialize() {
    try {
      const cachedData = localStorage.getItem('timeSync');
      if (cachedData) {
        const { offset, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        // Solo usar cache si no ha expirado
        if (now - timestamp < this.cacheValidity) {
          this.lastOffset = offset;
          this.lastSyncTime = timestamp;
          console.log(`[TimeSync] Loaded cached offset: ${this.lastOffset}ms (age: ${Math.round((now - this.lastSyncTime)/1000)}s)`);
          return true;
        } else {
          console.log('[TimeSync] Cached time offset expired, will sync again');
          localStorage.removeItem('timeSync');
        }
      }
    } catch (err) {
      console.warn('[TimeSync] Error loading cached time sync data:', err);
      localStorage.removeItem('timeSync');
    }
    return false;
  },
  
  // Guardar en localStorage
  saveToCache(offset) {
    try {
      const now = Date.now();
      localStorage.setItem('timeSync', JSON.stringify({
        offset,
        timestamp: now
      }));
      console.log(`[TimeSync] Saved offset to cache: ${offset}ms`);
    } catch (err) {
      console.warn('[TimeSync] Error saving time sync data to cache:', err);
    }
  },
  
  // Sincronizar el tiempo del cliente con el servidor
  async syncWithServerTime() {
    try {
      // Intentar cargar desde localStorage primero, si no se ha inicializado ya
      if (this.lastOffset === 0) {
        this.initialize();
      }
      
      // Verificar si tenemos un offset en cache y si es válido aún
      const now = Date.now();
      if (this.lastOffset !== 0 && now - this.lastSyncTime < this.cacheValidity) {
        console.log(`[TimeSync] Using cached offset: ${this.lastOffset}ms (age: ${Math.round((now - this.lastSyncTime)/1000)}s)`);
        return this.lastOffset;
      }
      
      // Si hay demasiados errores, usamos métodos alternativos
      // Intento 1: API externa worldtimeapi.org
      try {
        const offset = await this.syncWithExternalAPI();
        if (offset !== 0) {
          // Guardar en cache
          this.lastOffset = offset;
          this.lastSyncTime = now;
          this.saveToCache(offset);
          return offset;
        }
      } catch (err) {
        console.warn('[TimeSync] External API sync failed:', err);
      }
      
      // Intento 2: Usar la fecha del servidor de Supabase (no implementado aún)
      // En este caso, usamos un offset de 0 como último recurso
      console.log('[TimeSync] All sync methods failed, using zero offset');
      return 0;
    } catch (err) {
      console.error('[TimeSync] Error al sincronizar con el servidor:', err);
      return 0;
    }
  },
  
  // Sincronizar con API externa
  async syncWithExternalAPI() {
    // Límite de intentos reducido a 1 para evitar bloqueos
    const maxSamples = 1;
    const samples = [];
    
    for (let i = 0; i < maxSamples; i++) {
      try {
        const startTime = Date.now();
        const response = await fetch('https://worldtimeapi.org/api/ip', {
          // Agregar headers específicos, cache-control y timeout
          headers: {
            'User-Agent': 'AlaGloriaGame/1.0',
            'Cache-Control': 'no-cache'
          },
          // Usar AbortController para limitar el tiempo de espera
          signal: AbortSignal.timeout(3000) // 3 segundos de timeout
        });
        const endTime = Date.now();
        
        if (!response.ok) {
          console.error(`[TimeSync] Error en muestra de tiempo ${i+1}: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        const serverTime = new Date(data.datetime).getTime();
        const clientTime = Date.now();
        const roundTripTime = endTime - startTime;
        
        // Ajustar por la latencia (aproximación)
        const offset = serverTime - (clientTime - Math.floor(roundTripTime / 2));
        console.log(`[TimeSync] Sample ${i+1}: Offset ${offset}ms, RTT ${roundTripTime}ms`);
        
        samples.push({ offset, roundTripTime });
      } catch (err) {
        console.error(`[TimeSync] Error en muestra ${i+1}:`, err);
      }
    }
    
    if (samples.length === 0) {
      console.error('[TimeSync] No valid time samples obtained');
      return 0;
    }
    
    // Ordenar por menor tiempo de ida y vuelta y usar ese valor
    samples.sort((a, b) => a.roundTripTime - b.roundTripTime);
    const bestSample = samples[0];
    
    console.log(`[TimeSync] Using best sample: Offset ${bestSample.offset}ms, RTT ${bestSample.roundTripTime}ms`);
    return bestSample.offset;
  }
};

// Inicializar al cargar
gameTimeSync.initialize();
