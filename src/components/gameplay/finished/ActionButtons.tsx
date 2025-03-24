
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button';

interface ActionButtonsProps {
  onExit?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onExit }) => {
  const handleExit = () => {
    // Llamar a la función onExit si existe antes de navegar
    if (onExit) {
      onExit();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mt-6">
      <Button
        variant="outline"
        size="lg"
        className="flex-1"
        onClick={handleExit}
        href="/games"
      >
        Ver más partidas
      </Button>
      
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
