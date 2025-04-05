
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Game } from '@/components/games/types';

interface SuccessMessageProps {
  gameData: Game;
  formattedDate: string;
  gameId: string;
}

const SuccessMessage = ({ gameData, formattedDate, gameId }: SuccessMessageProps) => {
  const navigate = useNavigate();
  
  const handleEnterGame = () => {
    navigate(`/game/${gameId}/waiting`);
  };
  
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-3">
          ¡Inscripción Completada!
        </h2>
        
        <p className="text-gray-600">
          Te has unido correctamente a la partida.
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Partida:</span> {gameData.title}
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Fecha:</span> {formattedDate}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">Participantes:</span> {gameData.participants} / {gameData.maxParticipants}
        </p>
      </div>
      
      <div className="text-center">
        <Button
          variant="default"
          size="lg"
          className="bg-gloria-purple hover:bg-gloria-purple/90 text-white px-8"
          onClick={handleEnterGame}
        >
          Entra ahora
        </Button>
        
        <p className="mt-4 text-sm text-gray-500">
          También podrás acceder a la partida desde la sección de "Partidas".
        </p>
      </div>
    </div>
  );
};

export default SuccessMessage;
