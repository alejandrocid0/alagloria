
import Navbar from '@/components/Navbar';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import WaitingModeDisplay from '@/components/gameplay/WaitingModeDisplay';
import GamePlayLoading from '@/components/gameplay/GamePlayLoading';
import { useGamePlayRoute } from '@/hooks/gameplay/useGamePlayRoute';
import { useGameParticipants } from '@/hooks/gameplay/useGameParticipants';

const GamePlay = () => {
  // Get route and authentication data
  const { 
    gameId, 
    user, 
    isLoading, 
    isWaitingMode,
    gameInfo,
    isGameActive
  } = useGamePlayRoute();
  
  // Get participants data
  const { playersOnline } = useGameParticipants(gameId);
  
  // Show loading state
  if (isLoading) {
    return <GamePlayLoading />;
  }
  
  // Only render if user is authenticated
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
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
            <LiveGameRenderer />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
