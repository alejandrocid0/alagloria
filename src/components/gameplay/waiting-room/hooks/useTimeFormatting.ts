
import { useCallback } from 'react';

export interface UseTimeFormattingResult {
  formatTimeRemaining: (seconds: number | null) => string;
}

export const useTimeFormatting = (): UseTimeFormattingResult => {
  // Format the time remaining for display
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
  
  return { formatTimeRemaining };
};

export default useTimeFormatting;
