
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Player } from '@/types/liveGame';
import GameHeader from './waiting-room/GameHeader';
import CountdownDisplay from './waiting-room/CountdownDisplay';
import ActionButtons from './waiting-room/ActionButtons';
import GameTimerProgress from './waiting-room/GameTimerProgress';
import GameInfoCards from './waiting-room/GameInfoCards';
import PlayersListSection from './waiting-room/PlayersListSection';
import ImportantNotice from './waiting-room/ImportantNotice';
import FinalActions from './waiting-room/FinalActions';
import { useCountdown } from './waiting-room/hooks/useCountdown';
import { useGameSubscription } from './waiting-room/hooks/useGameSubscription';

interface WaitingRoomProps {
  gameTitle: string;
  scheduledTime: string;
  playersOnline: Player[];
  timeUntilStart: number; // in seconds
  isGameActive?: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameTitle,
  scheduledTime,
  playersOnline: initialPlayersOnline,
  timeUntilStart,
  isGameActive = false,
}) => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [playersOnline, setPlayersOnline] = useState<Player[]>(initialPlayersOnline);
  
  // Use custom hooks for countdown and game state subscription
  const {
    countdown,
    hasGameStarted,
    showPulse,
    isWithinFiveMinutes,
    formatTimeRemaining,
    setHasGameStarted
  } = useCountdown(timeUntilStart, gameId);
  
  // Set game started state if passed as prop
  React.useEffect(() => {
    if (isGameActive) {
      setHasGameStarted(true);
    }
  }, [isGameActive, setHasGameStarted]);
  
  // Subscribe to game state and player updates
  useGameSubscription(gameId, setHasGameStarted, setPlayersOnline);
  
  // Handle play now button click
  const handlePlayNow = () => {
    if (gameId) {
      navigate(`/game/${gameId}`);
    }
  };
  
  // Determine game status text
  const getGameStatus = () => {
    if (hasGameStarted) return 'En curso';
    return isWithinFiveMinutes ? 'Preparando' : 'Esperando';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {/* Game header with title and scheduled time */}
      <GameHeader 
        gameTitle={gameTitle} 
        scheduledTime={scheduledTime} 
      />
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-gloria-purple">
              {hasGameStarted ? 'Partida en curso' : 'Comienza en'}
            </h3>
            
            <div className="flex items-center">
              {/* Countdown display */}
              <CountdownDisplay 
                countdown={countdown}
                hasGameStarted={hasGameStarted}
                showPulse={showPulse}
                formatTimeRemaining={formatTimeRemaining}
              />
              
              {/* Action buttons for game start */}
              <ActionButtons 
                hasGameStarted={hasGameStarted}
                handlePlayNow={handlePlayNow}
              />
            </div>
          </div>
          
          {/* Timer progress bar */}
          <GameTimerProgress 
            hasGameStarted={hasGameStarted}
            countdown={countdown}
            totalTime={timeUntilStart}
          />
          
          {/* Game info cards */}
          <GameInfoCards 
            playersCount={playersOnline.length}
            gameStatus={getGameStatus()}
          />
        </div>
        
        {/* Players list section */}
        <PlayersListSection playersOnline={playersOnline} />
        
        {/* Important notice */}
        <ImportantNotice hasGameStarted={hasGameStarted} />
        
        {/* Final actions section */}
        <FinalActions 
          hasGameStarted={hasGameStarted}
          isWithinFiveMinutes={isWithinFiveMinutes}
          handlePlayNow={handlePlayNow}
        />
      </div>
    </div>
  );
};

export default WaitingRoom;
