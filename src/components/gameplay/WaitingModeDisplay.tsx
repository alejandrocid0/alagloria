
import { Link } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';

interface WaitingModeDisplayProps {
  gameId: string | undefined;
  gameTitle: string;
  scheduledTime: string;
  playersOnline: any[];
  timeUntilStart: number;
  isGameActive: boolean;
}

const WaitingModeDisplay = ({
  gameId,
  gameTitle,
  scheduledTime,
  playersOnline,
  timeUntilStart,
  isGameActive
}: WaitingModeDisplayProps) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <WaitingRoom 
        gameTitle={gameTitle}
        scheduledTime={scheduledTime}
        playersOnline={playersOnline}
        timeUntilStart={timeUntilStart}
        isGameActive={isGameActive}
      />
    </div>
  );
};

export default WaitingModeDisplay;
