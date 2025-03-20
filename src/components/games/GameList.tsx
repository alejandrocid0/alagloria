
import { motion } from 'framer-motion';
import GameCard from '@/components/GameCard';
import { Game } from '@/components/games/types';

interface GameListProps {
  filteredGames: Game[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
}

const GameList = ({ 
  filteredGames,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}: GameListProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  if (filteredGames.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-500">No se encontraron partidas con los filtros actuales.</p>
        <button
          className="mt-4 text-gloria-purple hover:text-gloria-gold transition-colors"
          onClick={() => {
            setSearchTerm('');
            setFilterStatus('all');
          }}
        >
          Eliminar filtros
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredGames.map((game) => (
        <motion.div key={game.id} variants={itemVariants}>
          <GameCard
            id={game.id}
            title={game.title}
            date={game.date}
            participants={game.participants}
            maxParticipants={game.maxParticipants}
            prizePool={game.prizePool}
            image={game.image}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GameList;
