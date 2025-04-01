
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Play, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminControlsProps {
  gameStatus: string;
  onStartGame: () => Promise<void>;
  onAdvanceState: () => Promise<void>;
  onForceState: (state: "waiting" | "question" | "result" | "leaderboard" | "finished") => Promise<void>;
}

const AdminControls: React.FC<AdminControlsProps> = ({
  gameStatus,
  onStartGame,
  onAdvanceState,
  onForceState
}) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium mb-2">Controles de Administrador</h4>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onStartGame}
          disabled={gameStatus !== 'waiting'}
        >
          <Play className="h-4 w-4 mr-1" />
          Iniciar
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={onAdvanceState}
          disabled={gameStatus === 'finished'}
        >
          <FastForward className="h-4 w-4 mr-1" />
          Avanzar
        </Button>
        
        <Separator className="my-2" />
        
        <div className="flex flex-wrap gap-2 w-full">
          {(["waiting", "question", "result", "leaderboard", "finished"] as const).map((state) => (
            <Button 
              key={state}
              variant="ghost" 
              size="sm"
              className={cn(
                "text-xs flex-1",
                gameStatus === state && "bg-gloria-purple/10 text-gloria-purple"
              )}
              onClick={() => onForceState(state)}
            >
              {state}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminControls;
