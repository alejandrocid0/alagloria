
import { useCallback, useRef } from 'react';
import { LiveGameState } from '@/types/liveGame';

/**
 * Hook to manage auto-advance timers for game state
 */
export const useAutoAdvanceTimer = (
  fetchGameStateData: () => Promise<void>
) => {
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Configurar temporizador para avanzar automáticamente basado en el countdown
  const setupAutoAdvanceTimer = useCallback((state: LiveGameState) => {
    // Limpiar cualquier timer existente
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    
    // Solo configurar si tenemos un estado válido con countdown
    if (state && state.countdown > 0) {
      const timeElapsedSinceUpdate = (Date.now() - new Date(state.updated_at).getTime()) / 1000;
      const remainingTime = Math.max(0, state.countdown - timeElapsedSinceUpdate);
      
      console.log(`Configurando auto-avance para ${state.status} en ${remainingTime.toFixed(1)} segundos`);
      
      if (remainingTime > 0) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          console.log(`Auto-avance para ${state.status} ejecutándose, verificando estado actual`);
          // Verificar el estado actual nuevamente antes de avanzar
          fetchGameStateData();
        }, remainingTime * 1000 + 500); // Añadimos 500ms de margen
      } else {
        // Si el tiempo ya pasó, verificar inmediatamente
        console.log(`El tiempo de ${state.status} ya ha pasado, verificando estado inmediatamente`);
        fetchGameStateData();
      }
    }
  }, [fetchGameStateData]);

  const cleanup = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  return {
    setupAutoAdvanceTimer,
    cleanup
  };
};
