
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseScheduledGamesCheckProps {
  gameId: string | undefined;
  countdown: number | null;
  refreshGameState: () => Promise<any>;
}

export const useScheduledGamesCheck = ({
  gameId,
  countdown,
  refreshGameState
}: UseScheduledGamesCheckProps) => {
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0);

  // Función para verificar partidas programadas (auto-inicio)
  const checkScheduledGames = useCallback(async () => {
    if (!autoCheckEnabled || !gameId) return;
    
    // Evitar verificaciones demasiado frecuentes
    const now = Date.now();
    if (now - lastCheckTime < 3000) { // Mínimo 3 segundos entre verificaciones
      return;
    }
    
    try {
      console.log('[ScheduledCheck] Checking scheduled games');
      setLastCheckTime(now);
      
      await supabase.functions.invoke('check-scheduled-games');
      // La respuesta no es necesaria procesarla ya que el servidor actualizará 
      // los datos y recibiremos los cambios a través de la suscripción
      console.log("[ScheduledCheck] Scheduled games check completed");
      
      // Actualizar estado del juego después de la verificación
      refreshGameState();
    } catch (err) {
      console.error('[ScheduledCheck] Error checking scheduled games:', err);
    }
  }, [autoCheckEnabled, gameId, refreshGameState, lastCheckTime]);

  // Configurar verificación periódica de partidas programadas
  useEffect(() => {
    if (!gameId) return;
    
    // Verificar partidas programadas inmediatamente al cargar
    checkScheduledGames();
    
    // Verificación más frecuente a medida que se acerca la hora de inicio
    let intervalTime = 60000; // 1 minuto por defecto
    
    if (countdown && countdown < 15) {
      intervalTime = 2000; // Cada 2 segundos en los últimos 15 segundos
    } else if (countdown && countdown < 60) {
      intervalTime = 5000; // Cada 5 segundos en el último minuto
    } else if (countdown && countdown < 300) {
      intervalTime = 15000; // Cada 15 segundos en los últimos 5 minutos
    } else if (countdown && countdown < 600) {
      intervalTime = 30000; // Cada 30 segundos en los últimos 10 minutos
    }
    
    console.log(`[ScheduledCheck] Setting up scheduled games check interval: ${intervalTime}ms`);
    const intervalId = setInterval(checkScheduledGames, intervalTime);
    
    return () => {
      clearInterval(intervalId);
      setAutoCheckEnabled(false);
    };
  }, [gameId, checkScheduledGames, countdown]);

  return { checkScheduledGames };
};

export default useScheduledGamesCheck;
