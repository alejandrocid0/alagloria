
/**
 * Servicio para sincronizar el tiempo del cliente con el servidor
 */
export const gameTimeSync = {
  // Sincronizar el tiempo del cliente con el servidor
  async syncWithServerTime() {
    try {
      const startTime = Date.now();
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const endTime = Date.now();
      
      if (!response.ok) {
        return 0;
      }
      
      const data = await response.json();
      const serverTime = new Date(data.datetime).getTime();
      const clientTime = Date.now();
      const roundTripTime = endTime - startTime;
      
      // Ajustar por la latencia (aproximación)
      return serverTime - (clientTime - Math.floor(roundTripTime / 2));
    } catch (err) {
      console.error('Error al sincronizar con el servidor:', err);
      return 0;
    }
  }
};
