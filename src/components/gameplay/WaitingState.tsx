
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '@/components/Button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WaitingStateProps {
  countdown: number;
  onStartGame?: () => void;
  gameId?: string;
}

const WaitingState = ({ countdown, onStartGame, gameId }: WaitingStateProps) => {
  const [localCountdown, setLocalCountdown] = useState(countdown);

  useEffect(() => {
    setLocalCountdown(countdown);
  }, [countdown]);

  const handleManualStart = async () => {
    if (!gameId) {
      if (onStartGame) onStartGame();
      return;
    }
    
    try {
      // Llamar a la edge function para avanzar el estado del juego
      const { data, error } = await supabase.functions.invoke('advance-game-state', {
        body: { gameId }
      });
      
      if (error) {
        console.error('Error starting game manually:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida manualmente",
          variant: "destructive"
        });
      } else if (data?.success) {
        console.log('Game started manually:', data);
        // Si existe onStartGame, llamarlo también (para implementaciones adicionales)
        if (onStartGame) onStartGame();
      }
    } catch (err) {
      console.error('Unexpected error starting game:', err);
    }
  };

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
        <span className="text-3xl font-bold text-white">{localCountdown}</span>
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
          onClick={handleManualStart}
        >
          Empezar ahora
        </Button>
      </div>
    </motion.div>
  );
};

export default WaitingState;
