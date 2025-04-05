
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface JoinGameFormProps {
  gameData: {
    id: string;
    title: string;
    date: Date;
    participants: number;
    maxParticipants: number;
    prizePool?: number;
    image?: string;
    description?: string | null;
    category?: string;
  };
  formattedDate: string;
  isProcessing: boolean;
  handleJoinGame: () => Promise<void>;
  hasJoined: boolean;
  gameId: string;
}

const JoinGameForm = ({
  gameData,
  formattedDate,
  isProcessing,
  handleJoinGame,
  hasJoined,
  gameId
}: JoinGameFormProps) => {
  const navigate = useNavigate();
  
  const handleEnterGame = () => {
    navigate(`/game/${gameId}/waiting`);
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-serif font-bold text-gray-800 mb-4">
        {hasJoined ? 'Inscripción confirmada' : 'Inscribirse a la partida'}
      </h2>
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Partida:</span> {gameData.title}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Fecha:</span> {formattedDate}
        </p>
        <p className="text-gray-600 text-sm">
          <span className="font-medium">Participantes:</span> {gameData.participants} / {gameData.maxParticipants}
        </p>
      </div>
      
      <div className="mt-6">
        {hasJoined ? (
          <Button
            variant="default"
            size="lg"
            className="w-full bg-gloria-purple hover:bg-gloria-purple/90 text-white"
            onClick={handleEnterGame}
          >
            Entra ahora
          </Button>
        ) : (
          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={handleJoinGame}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Procesando...
              </>
            ) : (
              'Unirse gratis'
            )}
          </Button>
        )}
        
        <p className="text-gray-500 text-xs mt-4 text-center">
          Al inscribirte, aceptas los <a href="#" className="text-gloria-purple hover:underline">términos y condiciones</a>.
        </p>
      </div>
    </div>
  );
};

export default JoinGameForm;
