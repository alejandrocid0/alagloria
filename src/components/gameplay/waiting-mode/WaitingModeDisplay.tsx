
import React from 'react';
import { motion } from 'framer-motion';
import StatusHeader from './StatusHeader';
import CountdownSection from './CountdownSection';
import ActionButtons from './ActionButtons';
import WaitingRoom from '../WaitingRoom';
import useWaitingModeDisplay from './hooks/useWaitingModeDisplay';
import { advanceGameState } from '@/hooks/liveGame/gameStateUtils';

interface WaitingModeDisplayProps {
  gameId: string | undefined;
  gameTitle: string;
  scheduledTime: string;
  playersOnline: any[];
  timeUntilStart: number;
  isGameActive: boolean;
  onRefresh?: () => void;
}

const WaitingModeDisplay = ({
  gameId,
  gameTitle,
  scheduledTime,
  playersOnline,
  timeUntilStart,
  isGameActive,
  onRefresh
}: WaitingModeDisplayProps) => {
  const {
    countdown,
    isImminentStart,
    formatTimeRemaining,
    formatDate,
    handleRefresh,
    handleGoToGame,
  } = useWaitingModeDisplay(gameId, timeUntilStart, isGameActive, onRefresh);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      {/* Header section with title and metadata */}
      <StatusHeader 
        gameTitle={gameTitle} 
        scheduledTime={scheduledTime} 
        playersCount={playersOnline.length}
        formatDate={formatDate}
      />
      
      {/* Countdown section */}
      <div className="p-6 border-b border-gray-200">
        <CountdownSection 
          countdown={countdown}
          isImminentStart={isImminentStart}
          isGameActive={isGameActive}
          formatTimeRemaining={formatTimeRemaining}
        />
        
        {countdown <= 0 && !isGameActive && (
          <ActionButtons 
            onRefresh={handleRefresh}
            onGoToGame={handleGoToGame}
          />
        )}
      </div>
      
      {/* Waiting room component */}
      <WaitingRoom 
        gameTitle={gameTitle} 
        scheduledTime={scheduledTime}
        playersOnline={playersOnline}
        timeUntilStart={countdown}
        isGameActive={isGameActive}
      />
    </motion.div>
  );
};

export default WaitingModeDisplay;
