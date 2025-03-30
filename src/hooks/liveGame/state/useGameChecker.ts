
import { useCallback, useEffect, useRef } from 'react';
import { fetchGameState } from '../gameStateUtils';
import { toast } from '@/hooks/use-toast';
import { useGamePlayRoute } from '@/hooks/gameplay/useGamePlayRoute';
import { useTimeSync } from '../useTimeSync';
import { useNavigate } from 'react-router-dom';

export const useGameChecker = (gameId: string | undefined) => {
  const navigate = useNavigate();
  const checkerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { syncWithServer, getAdjustedTime } = useTimeSync();
  const { gameInfo } = useGamePlayRoute();
  
  // Function to calculate check frequency based on time until game starts
  const getCheckFrequency = useCallback(() => {
    if (!gameInfo?.scheduledTime) return 15000; // Default: 15 seconds
    
    const now = getAdjustedTime();
    const scheduledTime = new Date(gameInfo.scheduledTime).getTime();
    const timeUntilStart = scheduledTime - now;
    
    if (timeUntilStart <= 60000) return 2000; // 2 seconds when < 1 minute away
    if (timeUntilStart <= 300000) return 5000; // 5 seconds when < 5 minutes away
    if (timeUntilStart <= 900000) return 10000; // 10 seconds when < 15 minutes away
    return 30000; // 30 seconds for games far in the future
  }, [gameInfo?.scheduledTime, getAdjustedTime]);
  
  // Check game state and handle transitions
  const checkGameState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      // Sync time with server before checking
      await syncWithServer();
      
      // Fetch latest game state
      const gameState = await fetchGameState(gameId);
      
      // Handle game state transitions
      if (gameState) {
        // If game has transitioned to active state, redirect to game play
        if (gameState.status === 'question' && window.location.pathname.includes('/waiting')) {
          console.log('Game has started! Redirecting to active game...');
          toast({
            title: "¡La partida ha comenzado!",
            description: "Redirigiendo a la partida en vivo...",
          });
          
          // Short delay to allow toast to be seen
          setTimeout(() => {
            navigate(`/game/${gameId}`);
          }, 1000);
        }
        
        // If game is finished but user is still in game view, show notification
        if (gameState.status === 'finished' && window.location.pathname === `/game/${gameId}`) {
          toast({
            title: "Partida finalizada",
            description: "La partida ha terminado. Puedes ver los resultados.",
          });
        }
      }
    } catch (err) {
      console.error('Error checking game state:', err);
    }
  }, [gameId, syncWithServer, navigate]);
  
  // Initialize game checker with dynamic frequency
  const initializeGameChecker = useCallback(() => {
    if (!gameId) return () => {};
    
    // Clear any existing interval
    if (checkerIntervalRef.current) {
      clearInterval(checkerIntervalRef.current);
    }
    
    // Initial check immediately
    checkGameState();
    
    // Set up adaptive interval for checking
    const setupInterval = () => {
      const frequency = getCheckFrequency();
      console.log(`Setting up game checker interval at ${frequency}ms frequency`);
      
      checkerIntervalRef.current = setInterval(() => {
        checkGameState();
        
        // Adaptively change interval frequency
        const newFrequency = getCheckFrequency();
        if (Math.abs(newFrequency - frequency) > 1000) {
          // If frequency should change, reset the interval
          clearInterval(checkerIntervalRef.current!);
          setupInterval();
        }
      }, frequency);
    };
    
    setupInterval();
    
    // Cleanup function
    return () => {
      if (checkerIntervalRef.current) {
        clearInterval(checkerIntervalRef.current);
      }
    };
  }, [gameId, checkGameState, getCheckFrequency]);
  
  return {
    initializeGameChecker,
    checkGameState
  };
};
