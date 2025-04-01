
import { useState, useEffect, useCallback } from 'react';
import { gameNotifications } from '@/components/ui/notification-toast';

// Definir los umbrales importantes para las notificaciones
const THRESHOLDS = {
  FIVE_MINUTES: 300,
  ONE_MINUTE: 60,
  THIRTY_SECONDS: 30,
  TEN_SECONDS: 10,
  COUNTDOWN_START: 5
};

export const useCountdown = (initialTimeInSeconds: number, gameId?: string) => {
  const [countdown, setCountdown] = useState(initialTimeInSeconds);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  
  // Check if we're within 5 minutes of game start
  const isWithinFiveMinutes = countdown <= THRESHOLDS.FIVE_MINUTES && countdown > 0;
  
  // Format time remaining in minutes and seconds
  const formatTimeRemaining = useCallback((seconds: number = countdown) => {
    if (seconds <= 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [countdown]);
  
  // Synchronize countdown with server time
  const syncCountdown = useCallback((serverCountdown: number) => {
    if (serverCountdown !== countdown && !hasGameStarted) {
      console.log(`Syncing countdown from ${countdown} to ${serverCountdown}`);
      setCountdown(serverCountdown);
    }
  }, [countdown, hasGameStarted]);
  
  // Activate pulse effect temporarily
  const activatePulseEffect = (duration: number = 2000) => {
    setShowPulse(true);
    if (duration > 0) {
      setTimeout(() => setShowPulse(false), duration);
    }
  };
  
  // Countdown effect
  useEffect(() => {
    if (hasGameStarted || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setHasGameStarted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, hasGameStarted]);
  
  // Effects for specific time thresholds
  useEffect(() => {
    // 5 minute warning
    if (countdown === THRESHOLDS.FIVE_MINUTES) {
      gameNotifications.fiveMinutesWarning();
      activatePulseEffect();
    }
    
    // 1 minute warning
    if (countdown === THRESHOLDS.ONE_MINUTE) {
      gameNotifications.oneMinuteWarning();
      activatePulseEffect();
    }
    
    // 30 seconds warning
    if (countdown === THRESHOLDS.THIRTY_SECONDS) {
      gameNotifications.info("La partida comienza en 30 segundos");
      activatePulseEffect();
    }
    
    // 10 seconds warning
    if (countdown === THRESHOLDS.TEN_SECONDS) {
      gameNotifications.info("La partida comienza en 10 segundos");
      activatePulseEffect(0); // No auto-hide
    }
    
    // 5 seconds (final countdown)
    if (countdown <= THRESHOLDS.COUNTDOWN_START && countdown > 0) {
      gameNotifications.info(`${countdown}...`);
      activatePulseEffect(0); // No auto-hide
    }
    
    // Game starting now
    if (countdown === 0 && !hasGameStarted) {
      gameNotifications.gameStarting();
      setShowPulse(false);
      setHasGameStarted(true);
    }
  }, [countdown, hasGameStarted]);
  
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
