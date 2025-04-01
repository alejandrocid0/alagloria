
import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface DynamicWaitingStateProps {
  gameTitle: string;
  scheduledTime: string;
  leaderboard: any[];
  timeUntilStartInSeconds: number;
  gameStatus: string;
}

const DynamicWaitingState: React.FC<DynamicWaitingStateProps> = ({
  gameTitle,
  scheduledTime,
  leaderboard,
  timeUntilStartInSeconds,
  gameStatus
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-10 px-4"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-2">
          {gameTitle}
        </h2>
        <p className="text-gray-600">
          La partida comenzará pronto. Hay {leaderboard.length} participantes en la sala.
        </p>
      </div>
      
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gloria-purple flex items-center justify-center mb-4 relative">
          <span className="text-2xl font-bold text-white">{formatTime(timeUntilStartInSeconds)}</span>
          <Clock className="absolute -top-2 -right-2 w-6 h-6 text-white bg-gloria-gold p-1 rounded-full" />
        </div>
        <p className="text-sm text-gray-500">
          La partida comenzará automáticamente cuando termine la cuenta atrás.
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="font-medium text-blue-700 mb-1">Estado: {renderStatusText(gameStatus)}</h3>
          <p className="text-sm text-blue-600">
            Espera mientras se configura la partida. No abandones esta página.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

function renderStatusText(status: string): string {
  switch (status) {
    case 'waiting':
      return 'Esperando el inicio';
    case 'question':
      return 'Pregunta en curso';
    case 'result':
      return 'Mostrando resultados';
    case 'leaderboard':
      return 'Mostrando clasificación';
    case 'finished':
      return 'Partida finalizada';
    default:
      return 'Preparando partida';
  }
}

export default DynamicWaitingState;
