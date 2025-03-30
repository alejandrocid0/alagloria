
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';
import { advanceGameState, startGame } from '@/hooks/liveGame/gameStateUtils';

const useWaitingModeDisplay = (
  gameId: string | undefined, 
  initialTimeUntilStart: number,
  isGameActive: boolean,
  onRefresh?: () => void
) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<number>(initialTimeUntilStart);
  const [isImminentStart, setIsImminentStart] = useState<boolean>(false);
  const [hasNotifiedFiveMin, setHasNotifiedFiveMin] = useState<boolean>(false);
  const [hasNotifiedOneMin, setHasNotifiedOneMin] = useState<boolean>(false);
  const [hasAttemptedStart, setHasAttemptedStart] = useState<boolean>(false);
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Attempt to start the game when countdown reaches zero
  const attemptGameStart = useCallback(async () => {
    if (!gameId || hasAttemptedStart) return;
    
    setHasAttemptedStart(true);
    console.log('Attempting to start game automatically...');
    
    try {
      // Try to start the game using the game state manager
      const startResult = await startGame(gameId);
      
      if (startResult) {
        console.log('Game started successfully!');
        gameNotifications.gameStarting();
      } else {
        console.log('Could not start game, trying with advanceGameState...');
        const advanceResult = await advanceGameState(gameId);
        
        if (advanceResult) {
          console.log('Game advanced to next state successfully!');
          gameNotifications.gameStarting();
        } else {
          console.error('Failed to start game automatically');
        }
      }
    } catch (err) {
      console.error('Error starting game:', err);
    }
  }, [gameId, hasAttemptedStart]);
  
  // Countdown timer
  useEffect(() => {
    // Initialize with the value provided
    setCountdown(initialTimeUntilStart);
    setHasAttemptedStart(false);
    
    // Create an interval that updates the countdown every second
    const intervalId = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - 1;
        
        // If we reach zero or less, clear the interval and try to start the game
        if (newValue <= 0) {
          if (!isGameActive && !hasAttemptedStart) {
            attemptGameStart();
          }
          clearInterval(intervalId);
          return 0;
        }
        
        // Check if we should notify at specific points
        if (newValue === 300 && !hasNotifiedFiveMin) { // 5 minutes
          setHasNotifiedFiveMin(true);
          gameNotifications.fiveMinutesWarning();
        }
        
        if (newValue === 60 && !hasNotifiedOneMin) { // 1 minute
          setHasNotifiedOneMin(true);
          gameNotifications.oneMinuteWarning();
        }
        
        // Check if the game is about to start (less than 10 seconds)
        if (newValue <= 10) {
          setIsImminentStart(true);
          if (newValue === 5) {
            gameNotifications.gameStarting();
          }
        }
        
        return newValue;
      });
    }, 1000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [initialTimeUntilStart, hasNotifiedFiveMin, hasNotifiedOneMin, isGameActive, hasAttemptedStart, attemptGameStart]);
  
  // Monitor game state changes
  useEffect(() => {
    if (isGameActive) {
      toast({
        title: "¡La partida ha comenzado!",
        description: "Redirigiendo a la partida en vivo...",
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        if (gameId) {
          navigate(`/game/${gameId}`);
        }
      }, 1000);
    }
  }, [isGameActive, gameId, navigate]);
  
  // Format the remaining time in readable format
  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return "¡Ahora!";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Handle refresh button click
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  // Handle go to game button click
  const handleGoToGame = useCallback(() => {
    if (gameId) {
      navigate(`/game/${gameId}`);
    }
  }, [gameId, navigate]);
  
  return {
    countdown,
    isImminentStart,
    formatTimeRemaining,
    formatDate,
    handleRefresh,
    handleGoToGame,
  };
};

export default useWaitingModeDisplay;
