
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Player {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
}

interface WinnersPodiumProps {
  topPlayers: Player[];
}

const WinnersPodium: React.FC<WinnersPodiumProps> = ({ topPlayers }) => {
  const { user } = useAuth();
  
  return (
    <div className="relative h-48 flex items-end justify-center gap-4 md:gap-8 mb-6">
      {topPlayers.map((player, index) => {
        const isCurrentUser = player.id === user?.id;
        const height = index === 0 ? "h-full" : index === 1 ? "h-4/5" : "h-3/5";
        const delay = index * 0.2;
        
        return (
          <motion.div
            key={player.id}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.5, type: "spring" }}
            className="relative flex flex-col items-center"
          >
            <div className="absolute -top-10">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full",
                index === 0 ? "bg-gloria-gold" : index === 1 ? "bg-gray-300" : "bg-amber-600"
              )}>
                {index === 0 ? (
                  <Trophy className="w-4 h-4 text-white" />
                ) : (
                  <Medal className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            
            <div className={cn(
              "relative w-20 md:w-24 rounded-t-lg flex items-center justify-center",
              index === 0 ? "bg-gloria-gold/90" : index === 1 ? "bg-gray-300/90" : "bg-amber-600/90",
              height
            )}>
              <span className="absolute top-2 font-bold text-white">
                #{index + 1}
              </span>
              
              <div className="mt-4 flex flex-col items-center">
                <img 
                  src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`}
                  alt={player.name}
                  className={cn(
                    "w-12 h-12 rounded-full border-2",
                    isCurrentUser ? "border-white" : "border-transparent"
                  )}
                />
                
                <div className="px-1 mt-2 pb-2">
                  <div className="text-xs text-white font-medium truncate max-w-[80px]">
                    {isCurrentUser ? "Tú" : player.name}
                  </div>
                  <div className="text-xs text-white/90 font-bold">
                    {player.points}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default WinnersPodium;
