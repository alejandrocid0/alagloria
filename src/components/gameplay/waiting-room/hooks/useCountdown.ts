
import { useState, useEffect, useCallback } from 'react';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useCountdown = (initialTimeInSeconds: number, gameId?: string) => {
  const [countdown, setCountdown] = useState(initialTimeInSeconds);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  
  // Check if we're within 5 minutes of game start
  const isWithinFiveMinutes = countdown <= 300 && countdown > 0;
  
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
    if (countdown === 300) {
      gameNotifications.fiveMinutesWarning();
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }
    
    // 1 minute warning
    if (countdown === 60) {
      gameNotifications.oneMinuteWarning();
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }
    
    // 30 seconds warning
    if (countdown === 30) {
      gameNotifications.info("La partida comienza en 30 segundos");
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }
    
    // 10 seconds warning
    if (countdown === 10) {
      gameNotifications.info("La partida comienza en 10 segundos");
      setShowPulse(true);
    }
    
    // 5 seconds (final countdown)
    if (countdown <= 5 && countdown > 0) {
      gameNotifications.info(`${countdown}...`);
      setShowPulse(true);
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
