
import { useState, useCallback } from 'react';

export interface UseVisualEffectsResult {
  showPulse: boolean;
  isWithinFiveMinutes: boolean;
  updateVisualEffects: (countdown: number) => void;
}

export const useVisualEffects = (): UseVisualEffectsResult => {
  const [showPulse, setShowPulse] = useState(false);
  const [isWithinFiveMinutes, setIsWithinFiveMinutes] = useState(false);
  
  // Update visual effects based on current countdown
  const updateVisualEffects = useCallback((countdown: number) => {
    // Check if we're in the last 5 minutes
    setIsWithinFiveMinutes(countdown <= 300);
    
    // Set pulse effect at specific times
    if (countdown === 300) { // 5 minutes
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
    } else if (countdown === 60) { // 1 minute
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
    } else if (countdown <= 10) { // Last 10 seconds
      setShowPulse(true);
    } else {
      setShowPulse(false);
    }
  }, []);
  
  return {
    showPulse,
    isWithinFiveMinutes,
    updateVisualEffects
  };
};

export default useVisualEffects;
