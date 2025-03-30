
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import WaitingModeDisplay from '@/components/gameplay/waiting-mode';
import GamePlayLoading from '@/components/gameplay/GamePlayLoading';
import { useGamePlayRoute } from '@/hooks/gameplay/useGamePlayRoute';
import { useGameParticipants } from '@/hooks/gameplay/useGameParticipants';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useGameChecker } from '@/hooks/liveGame/state/useGameChecker';

const GamePlay = () => {
  const navigate = useNavigate();
  // Estado para controlar recargas manuales
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get route and authentication data
  const { 
    gameId, 
    user, 
    isLoading: isRouteLoading, 
    isWaitingMode,
    gameInfo,
    isGameActive,
    refreshGameState
  } = useGamePlayRoute();
  
  // Get participants data
  const { 
    playersOnline, 
    isLoading: isParticipantsLoading, 
    error: participantsError,
    reloadParticipants 
  } = useGameParticipants(gameId);
  
  // Inicializar verificador automático de estado
  const { initializeGameChecker, checkGameState } = useGameChecker(gameId);
  
  // Función para manejar redirección cuando el juego cambia a activo
  const handleGameActiveChange = useCallback(() => {
    if (isGameActive && isWaitingMode) {
      console.log('Game has become active! Redirecting to active game...');
      toast({
        title: "¡La partida ha comenzado!",
        description: "Redirigiendo a la partida en vivo...",
      });
      
      // Redirect to game page
      setTimeout(() => {
        navigate(`/game/${gameId}`);
      }, 1000);
    }
  }, [isGameActive, isWaitingMode, gameId, navigate]);
  
  // Observar cambios en el estado del juego para activar redirección
  useEffect(() => {
    handleGameActiveChange();
  }, [isGameActive, handleGameActiveChange]);
  
  // Inicializar verificación de estado al cargar
  useEffect(() => {
    const cleanup = initializeGameChecker();
    
    // Verificar estado inmediatamente y luego cada 15 segundos
    const periodicCheck = setInterval(() => {
      if (!isGameActive && isWaitingMode) {
        refreshGameState();
        checkGameState();
      }
    }, 15000);
    
    return () => {
      cleanup();
      clearInterval(periodicCheck);
    };
  }, [initializeGameChecker, checkGameState, isGameActive, isWaitingMode, refreshGameState]);
  
  // Manejar la recarga manual de datos
  const handleManualRefresh = () => {
    if (reloadParticipants) {
      reloadParticipants();
      refreshGameState();
      checkGameState();
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Actualizando datos",
        description: "Recargando información de la partida"
      });
    }
  };
  
  // Efecto para detectar errores y ofrecer solución
  useEffect(() => {
    if (participantsError) {
      toast({
        title: "Error al cargar participantes",
        description: "Hubo un problema al cargar los datos. Puedes intentar recargar manualmente.",
        variant: "destructive"
      });
    }
  }, [participantsError]);
  
  // Calcular tiempo hasta el inicio de la partida
  const calculateTimeUntilStart = () => {
    if (!gameInfo.scheduledTime) return 300; // 5 minutos por defecto
    
    const currentTime = new Date();
    const scheduledTime = new Date(gameInfo.scheduledTime);
    return Math.max(0, Math.floor((scheduledTime.getTime() - currentTime.getTime()) / 1000));
  };
  
  // Show loading state
  if (isRouteLoading) {
    return <GamePlayLoading />;
  }
  
  // Only render if user is authenticated
  if (!user) return null;
  
  const isLoading = isRouteLoading || isParticipantsLoading;
  const timeUntilStart = calculateTimeUntilStart();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 
              Recargar datos
            </Button>
          </div>
          
          {isWaitingMode ? (
            // Render waiting room
            <WaitingModeDisplay 
              gameId={gameId}
              gameTitle={gameInfo.title || (gameId ? `Partida #${gameId}` : "Partida")}
              scheduledTime={gameInfo.scheduledTime || new Date().toISOString()}
              playersOnline={playersOnline}
              timeUntilStart={timeUntilStart}
              isGameActive={isGameActive}
              onRefresh={handleManualRefresh}
            />
          ) : (
            // Render live game
            <LiveGameRenderer key={`game-${refreshTrigger}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
