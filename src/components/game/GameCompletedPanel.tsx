
import { motion } from 'framer-motion';
import Button from '@/components/Button';
import { Player } from '@/types/game';

interface GameCompletedPanelProps {
  players: Player[];
}

const GameCompletedPanel = ({ players }: GameCompletedPanelProps) => {
  return (
    <motion.div 
      key="game-complete"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <div className="glass-panel p-8 text-center">
        <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-6">
          Clasificación Final
        </h2>
        
        <div className="space-y-6 mb-8">
          {players.slice(0, 3).map((player, index) => (
            <div 
              key={player.id} 
              className={`flex items-center p-4 rounded-lg ${
                index === 0 
                  ? 'bg-[#FFD700]/10 border border-[#FFD700]' 
                  : index === 1 
                    ? 'bg-[#C0C0C0]/10 border border-[#C0C0C0]' 
                    : 'bg-[#CD7F32]/10 border border-[#CD7F32]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gloria-purple/10 flex items-center justify-center mr-4">
                <span className={`font-bold ${
                  index === 0 
                    ? 'text-[#FFD700]' 
                    : index === 1 
                      ? 'text-[#C0C0C0]' 
                      : 'text-[#CD7F32]'
                }`}>
                  {index + 1}
                </span>
              </div>
              
              <div className="flex-grow">
                <p className="font-medium text-gloria-purple">{player.name}</p>
                <p className="text-sm text-gray-500">{player.points} puntos</p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-gloria-gold">
                  {index === 0 ? '80€' : index === 1 ? '50€' : '30€'}
                </p>
                <p className="text-xs text-gray-500">Premio</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
          {players.slice(3).map((player) => (
            <div 
              key={player.id} 
              className="flex items-center p-3 rounded-lg border border-gray-200"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <span className="text-gray-500 font-medium">{player.rank}</span>
              </div>
              
              <div className="flex-grow">
                <p className="font-medium text-gloria-purple">{player.name}</p>
              </div>
              
              <div className="text-right">
                <p className="font-medium">{player.points} puntos</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button variant="outline" href="/games">
            Ver más partidas
          </Button>
          <Button variant="secondary" href="/">
            Volver al inicio
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCompletedPanel;
