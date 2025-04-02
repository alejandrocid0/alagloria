
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface GameControlsProps {
  onRefresh: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onRefresh }) => {
  return (
    <div className="mb-4 flex justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" /> 
        Recargar datos
      </Button>
    </div>
  );
};

export default GameControls;
