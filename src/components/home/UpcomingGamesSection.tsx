
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button';
import GameCard from '@/components/GameCard';
import { Game } from '@/components/games/types';

interface UpcomingGamesSectionProps {
  upcomingGames: Game[];
  loading: boolean;
}

const UpcomingGamesSection = ({ upcomingGames, loading }: UpcomingGamesSectionProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gloria-purple mb-3">Próximas partidas</h2>
            <p className="text-lg text-gray-600">
              No te pierdas las partidas que tenemos preparadas
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-4 md:mt-0"
          >
            <Button 
              variant="outline" 
              href="/games"
            >
              Ver todas las partidas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {loading ? (
            Array(3).fill(0).map((_, index) => (
              <motion.div key={`skeleton-${index}`} variants={itemVariants}>
                <div className="glass-panel animate-pulse h-96">
                  <div className="h-40 bg-gloria-purple/20"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gloria-purple/10 rounded-md w-3/4"></div>
                    <div className="h-4 bg-gloria-purple/10 rounded-md w-1/2"></div>
                    <div className="h-4 bg-gloria-purple/10 rounded-md w-1/3"></div>
                    <div className="h-4 bg-gloria-purple/10 rounded-md w-2/3"></div>
                    <div className="h-8 bg-gloria-purple/10 rounded-md"></div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : upcomingGames.length > 0 ? (
            upcomingGames.map((game) => (
              <motion.div key={game.id} variants={itemVariants}>
                <GameCard {...game} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-xl text-gray-500">No hay partidas programadas en este momento.</p>
              <Button 
                variant="primary" 
                href="/admin/games"
                className="mt-6"
              >
                Crear una partida
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default UpcomingGamesSection;
