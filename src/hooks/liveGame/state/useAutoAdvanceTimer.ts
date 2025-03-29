
import { useCallback, useRef, useEffect } from 'react';
import { LiveGameState } from '@/types/liveGame';

/**
 * Hook to manage auto-advance timers for game state
 */
export const useAutoAdvanceTimer = (
  fetchGameStateData: () => Promise<void>
) => {
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStateRef = useRef<string | null>(null);
  const autoCheckCountRef = useRef<number>(0);

  // Limpieza de los temporizadores
  const cleanup = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  // Efecto para limpiar cuando el componente se desmonte
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  // Configurar temporizador para avanzar automáticamente basado en el countdown
  const setupAutoAdvanceTimer = useCallback((state: LiveGameState) => {
    // Limpiar cualquier timer existente
    cleanup();
    
    // No configurar temporizador si no hay estado o countdown
    if (!state || state.countdown <= 0) {
      return;
    }
    
    // Verificar si el estado ha cambiado desde la última vez
    const stateChanged = lastStateRef.current !== state.status;
    lastStateRef.current = state.status;
    
    if (stateChanged) {
      autoCheckCountRef.current = 0; // Reiniciar contador de verificaciones
    }

    // Calcular tiempo transcurrido desde la última actualización
    const timeElapsedSinceUpdate = (Date.now() - new Date(state.updated_at).getTime()) / 1000;
    const remainingTime = Math.max(0, state.countdown - timeElapsedSinceUpdate);
    
    console.log(`[AutoAdvanceTimer] Estado: ${state.status}, tiempo restante: ${remainingTime.toFixed(1)}s`);
    
    // Solo configurar temporizadores automáticos para ciertos estados
    // "waiting" y "question" pueden avanzar automáticamente por tiempo
    // "result" y "leaderboard" NO deberían avanzar automáticamente
    if (state.status === 'waiting' || state.status === 'question') {
      if (remainingTime > 0) {
        console.log(`[AutoAdvanceTimer] Configurando verificación para ${state.status} en ${remainingTime.toFixed(1)}s`);
        
        autoAdvanceTimerRef.current = setTimeout(() => {
          console.log(`[AutoAdvanceTimer] Verificando estado actual después de ${remainingTime.toFixed(1)}s`);
          autoCheckCountRef.current += 1;
          
          // Verificar el estado actual
          fetchGameStateData().catch(err => {
            console.error('[AutoAdvanceTimer] Error al verificar estado:', err);
          });
        }, remainingTime * 1000 + 500); // Añadimos 500ms de margen
      } else {
        // Si el tiempo ya pasó pero seguimos en el mismo estado, verificar inmediatamente
        console.log(`[AutoAdvanceTimer] El tiempo para ${state.status} ya ha pasado, verificando estado`);
        
        // Limitar el número de verificaciones consecutivas para evitar bucles
        if (autoCheckCountRef.current < 3) {
          autoCheckCountRef.current += 1;
          fetchGameStateData().catch(err => {
            console.error('[AutoAdvanceTimer] Error al verificar estado inmediatamente:', err);
          });
        } else {
          console.log('[AutoAdvanceTimer] Demasiadas verificaciones consecutivas, deteniendo para evitar bucles');
          autoCheckCountRef.current = 0;
        }
      }
    } else {
      // Para estados que no deberían avanzar automáticamente, sólo log
      console.log(`[AutoAdvanceTimer] Estado ${state.status} no requiere auto-avance por tiempo`);
    }
  }, [fetchGameStateData, cleanup]);

  return {
    setupAutoAdvanceTimer,
    cleanup
  };
};
