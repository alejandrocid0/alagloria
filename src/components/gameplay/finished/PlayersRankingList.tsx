
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Player {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
}

interface PlayersRankingListProps {
  players: Player[];
  startPosition?: number;
}

const PlayersRankingList: React.FC<PlayersRankingListProps> = ({ 
  players, 
  startPosition = 4 
}) => {
  const { user } = useAuth();
  
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-12 bg-gray-100 py-2 px-4">
        <div className="col-span-1 text-left font-medium text-gray-500 text-sm">#</div>
        <div className="col-span-7 text-left font-medium text-gray-500 text-sm">Jugador</div>
        <div className="col-span-4 text-right font-medium text-gray-500 text-sm">Puntos</div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {players.map((player, index) => {
          const position = index + startPosition;
          const isCurrentUser = player.id === user?.id;
          
          return (
            <motion.div 
              key={player.id}
              className={cn(
                "grid grid-cols-12 py-3 px-4 items-center",
                isCurrentUser ? "bg-gloria-purple/10" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
            >
              <div className="col-span-1 font-semibold text-gray-700">
                {position}
              </div>
              <div className="col-span-7 flex items-center">
                <img 
                  src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`}
                  alt={player.name} 
                  className="w-8 h-8 rounded-full mr-3" 
                />
                <span className={cn(
                  "font-medium",
                  isCurrentUser ? "text-gloria-purple" : "text-gray-800"
                )}>
                  {isCurrentUser ? "Tú" : player.name}
                </span>
              </div>
              <div className="col-span-4 text-right font-semibold text-gray-800">
                {player.points.toLocaleString()}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayersRankingList;
