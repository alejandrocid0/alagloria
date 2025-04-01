
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EarlyWaitingStateProps {
  gameId?: string;
}

const EarlyWaitingState: React.FC<EarlyWaitingStateProps> = ({ gameId }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-10 px-4"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-2">
          La partida aún no ha comenzado
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Estás intentando acceder demasiado pronto. La partida comenzará a la hora programada.
        </p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start max-w-md mx-auto mb-8">
        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
        <div className="text-left">
          <p className="text-sm text-gray-700">
            Te recomendamos volver a la sala de espera donde podrás ver la cuenta regresiva 
            para el inicio de la partida.
          </p>
        </div>
      </div>
      
      <Button
        onClick={() => {
          if (gameId) {
            window.location.href = `/game/${gameId}/waiting`;
          }
        }}
        className="bg-gloria-purple hover:bg-gloria-purple/90"
      >
        Ir a la sala de espera
      </Button>
    </motion.div>
  );
};

export default EarlyWaitingState;
