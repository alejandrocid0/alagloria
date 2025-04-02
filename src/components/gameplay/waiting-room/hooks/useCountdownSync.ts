
import { useCallback } from 'react';

export interface UseCountdownSyncResult {
  syncCountdown: (serverCountdown: number) => void;
}

export const useCountdownSync = (
  setCountdown: React.Dispatch<React.SetStateAction<number | null>>
): UseCountdownSyncResult => {
  // Synchronize the countdown with the server
  const syncCountdown = useCallback((serverCountdown: number) => {
    if (serverCountdown > 0) {
      console.log(`[Countdown] Sincronizando contador con servidor: ${serverCountdown}s`);
      setCountdown(serverCountdown);
    }
  }, [setCountdown]);
  
  return { syncCountdown };
};

export default useCountdownSync;
