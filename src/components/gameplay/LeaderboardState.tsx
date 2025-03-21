
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Player } from '@/types/liveGame';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardStateProps {
  ranking: Player[];
}

const LeaderboardState = ({ ranking }: LeaderboardStateProps) => {
  const { user } = useAuth();
  
  return (
    <motion.div 
      key="leaderboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center py-6"
    >
      <h2 className="text-xl md:text-2xl font-serif font-semibold text-gloria-purple mb-6">
        Tabla de Clasificación
      </h2>
      
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 py-2 px-4">
          <div className="col-span-1 text-left font-medium text-gray-500 text-sm">#</div>
          <div className="col-span-7 text-left font-medium text-gray-500 text-sm">Jugador</div>
          <div className="col-span-4 text-right font-medium text-gray-500 text-sm">Puntos</div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {ranking.slice(0, 10).map((player, index) => {
            const isCurrentUser = player.user_id === user?.id;
            
            return (
              <motion.div 
                key={player.user_id}
                className={cn(
                  "grid grid-cols-12 py-3 px-4 items-center",
                  isCurrentUser ? "bg-gloria-purple/10" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                )}
                initial={{ backgroundColor: index < 3 ? "rgba(234, 179, 8, 0.2)" : "" }}
                animate={{ 
                  backgroundColor: isCurrentUser ? "rgba(93, 56, 145, 0.1)" : 
                                  index < 3 ? "rgba(234, 179, 8, 0.1)" : "" 
                }}
                transition={{ duration: 0.5 }}
              >
                <div className="col-span-1 font-semibold text-gray-700">
                  {player.rank}
                </div>
                <div className="col-span-7 flex items-center">
                  <img 
                    src={player.avatar} 
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
                  {player.total_points.toLocaleString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        Siguiente pregunta en 5 segundos...
      </div>
    </motion.div>
  );
};

export default LeaderboardState;
