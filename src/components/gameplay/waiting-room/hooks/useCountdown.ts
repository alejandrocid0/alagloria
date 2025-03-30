
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useCountdown = (initialTime: number, gameId?: string) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(initialTime);
  const [showPulse, setShowPulse] = useState<boolean>(false);
  const [hasGameStarted, setHasGameStarted] = useState<boolean>(false);
  const [isWithinFiveMinutes, setIsWithinFiveMinutes] = useState<boolean>(countdown <= 300);

  // Format the time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Comenzando...';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle the countdown
  useEffect(() => {
    if (countdown <= 0) {
      // When countdown reaches zero, update state
      setHasGameStarted(true);
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newValue = Math.max(0, prev - 1);
        
        // When we reach 5 minutes (300 seconds), update state
        if (prev > 300 && newValue <= 300) {
          setIsWithinFiveMinutes(true);
          // Optional: show notification
          gameNotifications.fiveMinutesWarning();
        }
        
        // When we reach zero, mark as started
        if (newValue === 0) {
          setHasGameStarted(true);
          gameNotifications.gameStarting();
          
          // Auto-redirect to game after a short delay
          if (gameId) {
            setTimeout(() => {
              navigate(`/game/${gameId}`);
            }, 1500);
          }
        }
        
        return newValue;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, gameId, navigate]);

  // Pulse the countdown when it's getting close
  useEffect(() => {
    if (countdown <= 10 && countdown > 0) {
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
