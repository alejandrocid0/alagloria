
import { useState, useEffect, useCallback } from 'react';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useCountdown = (initialTimeInSeconds: number, gameId?: string) => {
  const [countdown, setCountdown] = useState(initialTimeInSeconds);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  
  // Check if we're within 5 minutes of game start
  const isWithinFiveMinutes = countdown <= 300 && countdown > 0;
  
  // Format time remaining in minutes and seconds
  const formatTimeRemaining = useCallback(() => {
    if (countdown <= 0) return '00:00';
    
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [countdown]);
  
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
    
    // Game starting in 5 seconds
    if (countdown === 5) {
      gameNotifications.gameStarting();
      setShowPulse(true);
    }
  }, [countdown]);
  
  return {
    countdown,
    hasGameStarted,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    setHasGameStarted
  };
};
