
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertCircle, CreditCard } from 'lucide-react';
import Button from '@/components/Button';
import { Game } from '@/components/games/types';

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
  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <h2 className="text-xl font-serif font-bold text-gloria-purple mb-6">
        Unirse a la partida
      </h2>
      
      <div className="mb-8">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <span className="text-gray-600">Precio de inscripción</span>
          <span className="font-semibold">1.00€</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-gray-600">Total a pagar</span>
          <span className="text-xl font-bold text-gloria-purple">1.00€</span>
        </div>
      </div>
      
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
              Una vez realizado el pago, no se podrá solicitar un reembolso. 
              Al participar, aceptas los términos y condiciones del juego.
            </p>
          </div>
        </div>
      </div>
      
      {hasJoined ? (
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          href={`/game/${gameId}`}
        >
          Ya estás inscrito - Ir a la sala
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="lg"
          className="w-full flex items-center justify-center"
          isLoading={isProcessing}
          onClick={handleJoinGame}
          disabled={gameData.participants >= gameData.maxParticipants}
        >
          {!isProcessing && (
            <CreditCard className="mr-2 h-5 w-5" />
          )}
          {gameData.participants >= gameData.maxParticipants 
            ? "Partida completa" 
            : "Pagar 1€ y unirse"}
        </Button>
      )}
      
      <div className="mt-4 text-center">
        <Link to="/games" className="text-sm text-gloria-purple hover:text-gloria-gold transition-colors">
          Cancelar y volver a partidas
        </Link>
      </div>
    </div>
  );
};

export default JoinGameForm;
