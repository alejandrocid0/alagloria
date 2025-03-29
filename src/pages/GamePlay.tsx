
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import WaitingModeDisplay from '@/components/gameplay/WaitingModeDisplay';
import GamePlayLoading from '@/components/gameplay/GamePlayLoading';
import { useGamePlayRoute } from '@/hooks/gameplay/useGamePlayRoute';
import { useGameParticipants } from '@/hooks/gameplay/useGameParticipants';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GamePlay = () => {
  // Estado para controlar recargas manuales
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get route and authentication data
  const { 
    gameId, 
    user, 
    isLoading: isRouteLoading, 
    isWaitingMode,
    gameInfo,
    isGameActive
  } = useGamePlayRoute();
  
  // Get participants data
  const { 
    playersOnline, 
    isLoading: isParticipantsLoading, 
    error: participantsError,
    reloadParticipants 
  } = useGameParticipants(gameId);
  
  // Manejar la recarga manual de datos
  const handleManualRefresh = () => {
    if (reloadParticipants) {
      reloadParticipants();
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Actualizando datos",
        description: "Recargando información de participantes"
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
  
  // Show loading state
  if (isRouteLoading) {
    return <GamePlayLoading />;
  }
  
  // Only render if user is authenticated
  if (!user) return null;
  
  const isLoading = isRouteLoading || isParticipantsLoading;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {participantsError && (
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
          )}
          
          {isWaitingMode ? (
            // Render waiting room
            <WaitingModeDisplay 
              gameId={gameId}
              gameTitle={gameInfo.title || (gameId ? `Partida #${gameId}` : "Partida")}
              scheduledTime={gameInfo.scheduledTime || new Date().toLocaleDateString()}
              playersOnline={playersOnline}
              timeUntilStart={
                gameInfo.scheduledTime 
                  ? Math.max(0, Math.floor((new Date(gameInfo.scheduledTime).getTime() - new Date().getTime()) / 1000)) 
                  : 300
              }
              isGameActive={isGameActive}
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
