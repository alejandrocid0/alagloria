
/**
 * Servicio para sincronizar el tiempo del cliente con el servidor
 */
export const gameTimeSync = {
  // Sincronizar el tiempo del cliente con el servidor
  async syncWithServerTime() {
    try {
      const samples = [];
      
      // Tomar 3 muestras para mayor precisión
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        const response = await fetch('https://worldtimeapi.org/api/ip');
        const endTime = Date.now();
        
        if (!response.ok) {
          console.error(`Error en muestra de tiempo ${i+1}: ${response.status}`);
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
    } catch (err) {
      console.error('[TimeSync] Error al sincronizar con el servidor:', err);
      return 0;
    }
  }
};
