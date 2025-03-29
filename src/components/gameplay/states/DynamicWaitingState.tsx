
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaitingRoom from '../WaitingRoom';

interface DynamicWaitingStateProps {
  gameTitle: string;
  scheduledTime: string;
  leaderboard: any[];
  timeUntilStartInSeconds: number;
  gameStatus: string;
}

const DynamicWaitingState = ({
  gameTitle,
  scheduledTime,
  leaderboard,
  timeUntilStartInSeconds,
  gameStatus
}: DynamicWaitingStateProps) => {
  return (
    <div className="p-4 md:p-6 text-center">
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 inline-flex items-center">
        <CheckCircle2 className="text-green-500 mr-2 h-5 w-5" />
        <p className="text-green-700 font-medium">
          Estás en la sala de espera dinámica
        </p>
      </div>
      
      <WaitingRoom 
        gameTitle={gameTitle} 
        scheduledTime={scheduledTime}
        playersOnline={leaderboard || []}
        timeUntilStart={timeUntilStartInSeconds}
        isGameActive={gameStatus !== 'waiting'}
      />
      
      {gameStatus === 'waiting' && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">
            La partida comenzará automáticamente al llegar la hora programada
          </p>
          <Button 
            disabled 
            className="opacity-70"
            variant="outline"
          >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Esperando inicio...
          </Button>
        </div>
      )}
    </div>
  );
};

export default DynamicWaitingState;
