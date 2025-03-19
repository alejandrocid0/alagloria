
import { motion } from 'framer-motion';
import { Player } from '@/types/game';

interface LeaderboardPanelProps {
  players: Player[];
  countdown: number | null;
}

const LeaderboardPanel = ({ players, countdown }: LeaderboardPanelProps) => {
  return (
    <motion.div 
      key="leaderboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <div className="glass-panel p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-serif font-semibold text-gloria-purple">
            Clasificación
          </h2>
          
          {countdown !== null && (
            <div className="px-4 py-2 bg-gloria-purple text-white rounded-full text-sm">
              Siguiente pregunta en {countdown}s
            </div>
          )}
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {players.map((player) => (
            <div 
              key={player.id} 
              className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                player.id === '1' ? 'bg-gloria-purple/10 border border-gloria-purple' : 'border border-gray-200'
              } ${
                player.lastAnswer === 'correct' 
                  ? 'relative after:absolute after:right-0 after:top-0 after:bg-green-500 after:w-1 after:h-full after:rounded-r-lg'
                  : player.lastAnswer === 'incorrect' 
                    ? 'relative after:absolute after:right-0 after:top-0 after:bg-red-500 after:w-1 after:h-full after:rounded-r-lg'
                    : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gloria-purple/10 flex items-center justify-center mr-3">
                <span className={`${
                  player.rank === 1 
                    ? 'text-gloria-gold font-bold' 
                    : player.rank === 2 
                      ? 'text-gray-500 font-bold' 
                      : player.rank === 3 
                        ? 'text-[#CD7F32] font-bold' 
                        : 'text-gray-600'
                }`}>
                  {player.rank}
                </span>
              </div>
              
              <div className="flex-grow">
                <p className={`font-medium ${player.id === '1' ? 'text-gloria-purple' : 'text-gray-700'}`}>
                  {player.name}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-medium">{player.score} puntos</p>
                {player.lastAnswer && (
                  <p className={`text-xs ${
                    player.lastAnswer === 'correct' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {player.lastAnswer === 'correct' ? '+puntos' : 'sin puntos'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardPanel;
