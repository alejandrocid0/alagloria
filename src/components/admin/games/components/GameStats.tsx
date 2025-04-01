
import React from 'react';
import { Users, CheckCircle } from 'lucide-react';

interface GameStatsProps {
  playersCount: number;
  answersCount: number;
}

const GameStats: React.FC<GameStatsProps> = ({ playersCount, answersCount }) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <Users className="h-5 w-5 text-gloria-purple" />
        <div>
          <div className="text-sm font-medium">Jugadores</div>
          <div className="text-xl font-bold">{playersCount}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <CheckCircle className="h-5 w-5 text-gloria-purple" />
        <div>
          <div className="text-sm font-medium">Respuestas</div>
          <div className="text-xl font-bold">{answersCount}</div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
