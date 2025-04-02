
import { useState, useEffect, useCallback } from 'react';

export const useCountdown = (initialSeconds: number, gameId: string | undefined) => {
  const [countdown, setCountdown] = useState<number | null>(initialSeconds > 0 ? initialSeconds : null);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isWithinFiveMinutes, setIsWithinFiveMinutes] = useState(false);
  
  // Función para sincronizar el contador con el servidor
  const syncCountdown = useCallback((serverCountdown: number) => {
    if (serverCountdown > 0) {
      console.log(`[Countdown] Sincronizando contador con servidor: ${serverCountdown}s`);
      setCountdown(serverCountdown);
    }
  }, []);
  
  // Effect para manejar el contador
  useEffect(() => {
    if (countdown === null || hasGameStarted) return;
    
    // Comprobar si estamos en los últimos 5 minutos
    setIsWithinFiveMinutes(countdown <= 300);
    
    // Configurar el intervalo del contador
    const intervalId = setInterval(() => {
      setCountdown((currentCount) => {
        if (currentCount === null) return null;
        
        const newCount = currentCount - 1;
        
        // Si llegamos a 0, la partida comienza
        if (newCount <= 0) {
          setHasGameStarted(true);
          return 0;
        }
        
        // Efectos especiales en puntos específicos
        if (newCount === 300) { // 5 minutos
          setShowPulse(true);
          setTimeout(() => setShowPulse(false), 3000);
        } else if (newCount === 60) { // 1 minuto
          setShowPulse(true);
          setTimeout(() => setShowPulse(false), 3000);
        } else if (newCount <= 10) { // Últimos 10 segundos
          setShowPulse(true);
        } else {
          setShowPulse(false);
        }
        
        return newCount;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [countdown, hasGameStarted]);
  
  // Formatear el tiempo restante para mostrar
  const formatTimeRemaining = useCallback((seconds: number | null): string => {
    if (seconds === null) return "--:--";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }, []);
  
  return {
    countdown,
    hasGameStarted,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    setHasGameStarted,
    syncCountdown
  };
};

export default useCountdown;
