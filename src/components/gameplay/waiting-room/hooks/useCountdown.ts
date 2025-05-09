
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimeFormatting } from './useTimeFormatting';
import { useVisualEffects } from './useVisualEffects';
import { useTimeSync } from '@/hooks/liveGame/useTimeSync';

export interface UseCountdownProps {
  initialSeconds: number;
  gameId: string | undefined;
}

export interface UseCountdownResult {
  countdown: number | null;
  hasGameStarted: boolean;
  showPulse: boolean;
  isWithinFiveMinutes: boolean;
  formatTimeRemaining: (seconds: number | null) => string;
  setHasGameStarted: (value: boolean) => void;
  syncCountdown: (serverCountdown: number) => void;
}

export const useCountdown = (
  initialSeconds: number,
  gameId: string | undefined
): UseCountdownResult => {
  // Core countdown state
  const [countdown, setCountdown] = useState<number | null>(
    initialSeconds > 0 ? initialSeconds : null
  );
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);
  
  // Get time synchronization utilities
  const { getServerTime, syncWithServer } = useTimeSync();
  
  // Get formatting function for time display
  const { formatTimeRemaining } = useTimeFormatting();
  
  // Get visual effects state management
  const { showPulse, isWithinFiveMinutes, updateVisualEffects } = useVisualEffects();
  
  // Sync timestamp when countdown or other critical values change
  useEffect(() => {
    if (countdown === null || hasGameStarted) return;
    
    // Set the target timestamp based on the synchronized server time
    const serverNow = getServerTime();
    const serverTimeInMs = serverNow.getTime();
    const endTimeInMs = serverTimeInMs + (countdown * 1000);
    setTargetTimestamp(endTimeInMs);
    
    console.log(`[Countdown] Target end time set to ${new Date(endTimeInMs).toISOString()} (${countdown}s from now)`);
  }, [countdown, hasGameStarted, getServerTime]);
  
  // Sync countdown with server time
  const syncCountdown = useCallback((serverCountdown: number) => {
    if (serverCountdown > 0) {
      console.log(`[Countdown] Synchronizing countdown with server: ${serverCountdown}s`);
      setCountdown(serverCountdown);
      
      // Re-sync time with server to ensure accuracy
      syncWithServer().then(() => {
        const serverNow = getServerTime();
        const serverTimeInMs = serverNow.getTime();
        const endTimeInMs = serverTimeInMs + (serverCountdown * 1000);
        setTargetTimestamp(endTimeInMs);
        console.log(`[Countdown] Updated target time to ${new Date(endTimeInMs).toISOString()}`);
      });
    } else if (serverCountdown === 0) {
      // If countdown reaches zero from server, trigger game start
      setCountdown(0);
      setHasGameStarted(true);
    }
  }, [getServerTime, syncWithServer]);
  
  // Effect for managing the countdown timer based on target timestamp
  useEffect(() => {
    if (targetTimestamp === null || hasGameStarted) return;
    
    const calculateTimeRemaining = () => {
      const serverNow = getServerTime();
      const serverTimeInMs = serverNow.getTime();
      const msRemaining = Math.max(0, targetTimestamp - serverTimeInMs);
      const secondsRemaining = Math.ceil(msRemaining / 1000);
      
      // Only update countdown if it's changed to avoid unnecessary renders
      setCountdown(prev => {
        if (prev !== secondsRemaining) {
          // Update visual effects based on current countdown
          updateVisualEffects(secondsRemaining);
          
          // If countdown reaches zero, the game has started
          if (secondsRemaining <= 0) {
            setHasGameStarted(true);
            return 0;
          }
          
          return secondsRemaining;
        }
        return prev;
      });
    };
    
    // Calculate immediately then set up interval
    calculateTimeRemaining();
    
    // Use a high-precision interval to keep countdown accurate
    const intervalId = setInterval(calculateTimeRemaining, 250);
    
    return () => clearInterval(intervalId);
  }, [targetTimestamp, hasGameStarted, getServerTime, updateVisualEffects]);
  
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
