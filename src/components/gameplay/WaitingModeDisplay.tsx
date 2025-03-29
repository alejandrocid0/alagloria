
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import { Button } from '@/components/ui/button';
import { Loader2, Clock } from 'lucide-react';
import { Player } from '@/types/liveGame';

interface WaitingModeDisplayProps {
  gameId: string | undefined;
  gameTitle: string;
  scheduledTime: string;
  playersOnline: Player[];
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
  const [isWithinFiveMinutes, setIsWithinFiveMinutes] = useState(timeUntilStart <= 300);
  
  // Actualizar el estado isWithinFiveMinutes cuando cambie timeUntilStart
  useEffect(() => {
    setIsWithinFiveMinutes(timeUntilStart <= 300);
  }, [timeUntilStart]);
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      {/* Mensaje para sala de espera estática vs dinámica */}
      {!isWithinFiveMinutes ? (
        <div className="mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
          <p className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" /> 
            Sala de espera estática - La partida comenzará en {Math.floor(timeUntilStart / 60)} minutos
          </p>
        </div>
      ) : (
        <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
          <p className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" /> 
            Sala de espera dinámica - ¡La partida comenzará pronto!
          </p>
        </div>
      )}
      
      <WaitingRoom 
        gameTitle={gameTitle}
        scheduledTime={scheduledTime}
        playersOnline={playersOnline}
        timeUntilStart={timeUntilStart}
        isGameActive={isGameActive}
      />
      
      {/* Botón para ir a la partida */}
      {(isWithinFiveMinutes || isGameActive) && gameId && (
        <div className="mt-6">
          <Link to={`/game/${gameId}`}>
            <Button 
              className="gap-2" 
              size="lg"
              variant="default"
            >
              {isGameActive ? 'Unirse a la partida en curso' : 'Prepararse para la partida'}
              {!isGameActive && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WaitingModeDisplay;
