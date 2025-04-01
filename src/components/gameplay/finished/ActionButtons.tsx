
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button';

interface ActionButtonsProps {
  onExit?: () => void;
  onViewResults?: () => void;
  onPlayAgain?: () => void;
  resultsSaved?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onExit,
  onViewResults,
  onPlayAgain,
  resultsSaved = false
}) => {
  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  // Determinar qué botones mostrar según las propiedades recibidas
  const showResultsButton = !!onViewResults;
  const showPlayAgainButton = !!onPlayAgain;

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-6">
      {/* Botón para ver más partidas */}
      <Button
        variant="outline"
        size="lg"
        className="flex-1"
        onClick={handleExit}
        href="/games"
      >
        Ver más partidas
      </Button>
      
      {/* Botón condicional para ver resultados */}
      {showResultsButton && (
        <Button
          variant="outline" 
          size="lg"
          className="flex-1"
          onClick={onViewResults}
          disabled={!resultsSaved}
        >
          {resultsSaved ? 'Ver resultados' : 'Guardando resultados...'}
        </Button>
      )}
      
      {/* Botón condicional para jugar de nuevo */}
      {showPlayAgainButton && (
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onPlayAgain}
        >
          Jugar de nuevo
        </Button>
      )}
      
      {/* Botón para ver historial */}
      <Button
        variant="primary"
        size="lg"
        className="flex-1 flex items-center justify-center"
        onClick={handleExit}
        href="/dashboard"
      >
        Mi historial
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
};

export default ActionButtons;
