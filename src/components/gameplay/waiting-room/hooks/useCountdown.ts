
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimeFormatting } from './useTimeFormatting';
import { useVisualEffects } from './useVisualEffects';
import { useCountdownSync } from './useCountdownSync';

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
  
  // Get formatting function for time display
  const { formatTimeRemaining } = useTimeFormatting();
  
  // Get visual effects state management
  const { showPulse, isWithinFiveMinutes, updateVisualEffects } = useVisualEffects();
  
  // Get countdown synchronization functionality
  const { syncCountdown } = useCountdownSync(setCountdown);
  
  // Effect for managing the countdown timer
  useEffect(() => {
    if (countdown === null || hasGameStarted) return;
    
    // Update visual effects based on current countdown
    updateVisualEffects(countdown);
    
    // Set up the countdown interval
    const intervalId = setInterval(() => {
      setCountdown((currentCount) => {
        if (currentCount === null) return null;
        
        const newCount = currentCount - 1;
        
        // If countdown reaches zero, the game has started
        if (newCount <= 0) {
          setHasGameStarted(true);
          return 0;
        }
        
        // Update visual effects for specific time thresholds
        updateVisualEffects(newCount);
        
        return newCount;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [countdown, hasGameStarted, updateVisualEffects]);
  
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
