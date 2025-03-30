
import React from 'react';
import { RefreshCw, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionButtonsProps {
  onRefresh: () => void;
  onGoToGame: () => void;
}

const ActionButtons = ({ onRefresh, onGoToGame }: ActionButtonsProps) => {
  return (
    <div className="mt-4">
      <p className="text-sm text-gloria-purple mb-2">
        El juego debería iniciar automáticamente. Si no ocurre, puedes:
      </p>
      <div className="flex justify-center space-x-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Recargar
        </Button>
        <Button 
          variant="default" 
          size="sm" 
          onClick={onGoToGame}
          className="flex items-center"
        >
          <ArrowRightCircle className="w-4 h-4 mr-1" />
          Ir a la partida
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
