
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';

interface WaitingStateProps {
  countdown: number;
  onStartGame: () => void;
}

const WaitingState = ({ countdown, onStartGame }: WaitingStateProps) => {
  return (
    <motion.div 
      key="waiting"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-10"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-2">
          Preparados, listos...
        </h2>
        <p className="text-gray-600">
          La partida comenzará en breve. Prepárate para responder rápido.
        </p>
      </div>
      
      <div className="w-24 h-24 rounded-full bg-gloria-purple flex items-center justify-center mx-auto">
        <span className="text-3xl font-bold text-white">{countdown}</span>
      </div>
      
      <div className="mt-8 max-w-md mx-auto">
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-sm text-gray-700">
              Recuerda que debes responder correctamente y lo más rápido posible para 
              conseguir más puntos. ¡Suerte!
            </p>
          </div>
        </div>
        
        <Button
          variant="primary"
          className="mt-6"
          onClick={onStartGame}
        >
          Empezar ahora
        </Button>
      </div>
    </motion.div>
  );
};

export default WaitingState;
