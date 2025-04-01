
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GameStatusDisplayProps {
  status: string;
  currentQuestion: number;
  countdown: number;
}

const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
  status,
  currentQuestion,
  countdown
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Estado:</div>
        <Badge 
          variant="outline" 
          className={cn(
            "font-mono",
            status === 'waiting' && "bg-blue-50 text-blue-600 border-blue-200",
            status === 'question' && "bg-yellow-50 text-yellow-600 border-yellow-200",
            status === 'result' && "bg-purple-50 text-purple-600 border-purple-200",
            status === 'leaderboard' && "bg-green-50 text-green-600 border-green-200",
            status === 'finished' && "bg-gray-50 text-gray-600 border-gray-200"
          )}
        >
          {status.toUpperCase()}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Pregunta:</div>
        <Badge variant="secondary" className="font-mono">
          {currentQuestion ?? 0}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium">Temporizador:</div>
        <Badge variant="outline" className="font-mono">
          {countdown ?? 0}s
        </Badge>
      </div>
    </div>
  );
};

export default GameStatusDisplay;
