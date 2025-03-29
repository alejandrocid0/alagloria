
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WaitingRoom from './WaitingRoom';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, ArrowRight } from 'lucide-react';
import { Player } from '@/types/liveGame';
import { gameNotifications } from '@/components/ui/notification-toast';

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
  const [minutesRemaining, setMinutesRemaining] = useState(Math.ceil(timeUntilStart / 60));
  
  // Actualizar los estados cuando cambie timeUntilStart
  useEffect(() => {
    setIsWithinFiveMinutes(timeUntilStart <= 300);
    setMinutesRemaining(Math.ceil(timeUntilStart / 60));
    
    // Mostrar notificación cuando entramos en los 5 minutos previos
    if (timeUntilStart <= 300 && timeUntilStart > 295) {
      gameNotifications.fiveMinutesWarning();
    }
  }, [timeUntilStart]);
  
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center">
      {/* Mensaje para sala de espera estática vs dinámica */}
      {!isWithinFiveMinutes ? (
        <div className="mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
          <p className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" /> 
            Sala de espera estática - La partida comenzará en {minutesRemaining} minutos
          </p>
        </div>
      ) : (
        <div className="mb-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg animate-pulse">
          <p className="text-sm font-medium flex items-center">
            <Clock className="w-4 h-4 mr-2" /> 
            ¡Sala de espera dinámica - La partida comenzará muy pronto!
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
      
      {/* Botón para ir a la partida - Solo visible dentro de los 5 minutos o si la partida está activa */}
      {(isWithinFiveMinutes || isGameActive) && gameId && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            {isGameActive 
              ? "¡La partida ya ha comenzado! Puedes unirte ahora." 
              : "Ya estamos en los minutos previos al inicio. Prepárate para jugar."}
          </p>
          
          <Link to={`/game/${gameId}`}>
            <Button 
              className="gap-2 transition-all hover:scale-105" 
              size="lg"
              variant={isGameActive ? "default" : "outline"}
            >
              {isGameActive ? 'Unirse a la partida en curso' : 'Prepararse para la partida'}
              {isGameActive ? <ArrowRight className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WaitingModeDisplay;
