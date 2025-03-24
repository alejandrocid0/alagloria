
import { motion } from 'framer-motion';

interface StatsSectionProps {
  stats: {
    users: number;
    games: number;
  };
}

const StatsSection = ({ stats }: StatsSectionProps) => {
  return (
    <section className="py-16 bg-gloria-deepPurple text-white">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="text-4xl md:text-5xl font-serif font-bold text-gloria-gold mb-2">
              {stats.users.toLocaleString()}
            </p>
            <p className="text-lg text-gray-300">Jugadores</p>
          </div>
          
          <div>
            <p className="text-4xl md:text-5xl font-serif font-bold text-gloria-gold mb-2">
              {stats.games.toLocaleString()}
            </p>
            <p className="text-lg text-gray-300">Partidas jugadas</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
