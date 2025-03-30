
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle } from 'lucide-react';
import Button from '@/components/Button';
import { Game } from '@/components/games/types';
import { calculateTimeValues } from '@/components/gameplay/utils/timeCalculations';

interface JoinGameFormProps {
  gameData: Game;
  formattedDate: string;
  isProcessing: boolean;
  handleJoinGame: () => void;
  hasJoined: boolean;
  gameId: string;
}

const JoinGameForm: React.FC<JoinGameFormProps> = ({
  gameData,
  formattedDate,
  isProcessing,
  handleJoinGame,
  hasJoined,
  gameId
}) => {
  // Calcular si estamos a menos de 5 minutos del inicio de la partida
  const isNearGameStart = () => {
    const { isWithinFiveMinutes } = calculateTimeValues(gameData.date);
    return isWithinFiveMinutes;
  };

  // Determinar qué botón mostrar
  const renderButton = () => {
    if (!hasJoined) {
      return (
        <Button
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center"
          isLoading={isProcessing}
          onClick={handleJoinGame}
          disabled={gameData.participants >= gameData.maxParticipants}
        >
          {gameData.participants >= gameData.maxParticipants 
            ? "Partida completa" 
            : "Unirse gratis"}
        </Button>
      );
    }
    
    if (isNearGameStart()) {
      return (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          href={`/game/${gameId}`}
        >
          Jugar ahora
        </Button>
      );
    }
    
    return (
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        href={`/game/${gameId}/waiting`}
      >
        Entrar a la sala
      </Button>
    );
  };

  // Depuración para ver los cambios en las props
  useEffect(() => {
    console.log('JoinGameForm rendered with hasJoined:', hasJoined);
  }, [hasJoined]);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h2 className="text-xl font-serif font-bold text-gloria-purple mb-6">
        {hasJoined ? "Información de la partida" : "Unirse a la partida"}
      </h2>
      
      <div className="mb-8">
        <div className="bg-gloria-cream/20 rounded-lg p-4 flex items-start">
          <Clock className="h-5 w-5 text-gloria-purple mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-gloria-purple mb-1">Fecha de la partida</h3>
            <p className="text-sm text-gray-600">{formattedDate}</p>
            <p className="text-xs text-gray-500 mt-1">Recuerda conectarte 5 minutos antes del inicio.</p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800 mb-1">Información importante</h3>
            <p className="text-sm text-yellow-700">
              Al participar, aceptas los términos y condiciones del juego.
            </p>
          </div>
        </div>
      </div>
      
      {renderButton()}
      
      <div className="mt-4 text-center">
        <Link to="/games" className="text-sm text-gloria-purple hover:text-gloria-gold transition-colors">
          {hasJoined ? "Ver más partidas" : "Cancelar y volver a partidas"}
        </Link>
      </div>
    </div>
  );
};

export default JoinGameForm;
