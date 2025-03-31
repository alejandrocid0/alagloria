
import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '@/types/game';
import { useAuth } from '@/contexts/AuthContext';
import WaitingRoom from '../WaitingRoom';
import useWaitingModeDisplay from './hooks/useWaitingModeDisplay';
import { formatDate } from '@/lib/utils/dateFormat';

interface WaitingModeDisplayProps {
  gameId: string | undefined;
  gameTitle: string;
  scheduledTime: string;
  playersOnline: Player[];
  timeUntilStart: number;
  isGameActive: boolean;
  onRefresh?: () => void;
}

const WaitingModeDisplay: React.FC<WaitingModeDisplayProps> = ({
  gameId,
  gameTitle,
  scheduledTime,
  playersOnline,
  timeUntilStart,
  isGameActive,
  onRefresh
}) => {
  const { user } = useAuth();
  
  // Usar el hook con toda la lógica de la sala de espera
  const {
    countdown,
    isImminentStart,
    formatTimeRemaining,
    handleRefresh,
    handleGoToGame,
  } = useWaitingModeDisplay(gameId, timeUntilStart, isGameActive, onRefresh);
  
  // Calcular si estamos en modo espera cercano (menos de 5 minutos)
  const isNearStartTime = countdown <= 300;
  
  // Obtener el nombre formateado de la fecha
  const formattedDate = formatDate(scheduledTime);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      {isNearStartTime ? (
        // Mostrar la sala de espera tipo Kahoot cuando faltan menos de 5 minutos
        <WaitingRoom
          gameTitle={gameTitle}
          scheduledTime={scheduledTime}
          playersOnline={playersOnline}
          timeUntilStart={countdown}
          isGameActive={isGameActive}
        />
      ) : (
        // Mostrar la pantalla de información de la partida cuando falta más tiempo
        <div className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-2">
              {gameTitle}
            </h2>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-lg mb-3 text-center">Información de la partida</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm font-medium text-gray-600">Participantes</p>
                <p className="text-xl font-bold text-gloria-purple">{playersOnline.length}</p>
              </div>
              
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm font-medium text-gray-600">Tiempo para comenzar</p>
                <p className="text-xl font-bold text-gloria-purple">{formatTimeRemaining(countdown)}</p>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              <p>La sala de espera se habilitará 5 minutos antes del inicio</p>
              <p className="mt-1">Revisa tu conexión a internet antes de la partida</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-amber-800 mb-2">Nota importante</h3>
            <p className="text-sm text-amber-700">
              Ya estás inscrito en esta partida. Regresa 5 minutos antes de la hora de inicio para entrar en la sala de espera.
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleRefresh}
              className="bg-gray-100 text-gloria-purple font-medium px-4 py-2 rounded-lg mr-3 hover:bg-gray-200 transition-colors"
            >
              Refrescar datos
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WaitingModeDisplay;
