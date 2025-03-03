
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';

const Games = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  
  // Dummy games data
  const allGames = [
    {
      id: '1',
      title: 'Especial Semana Santa 2023',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      participants: 84,
      maxParticipants: 200,
      prizePool: 160,
      image: 'https://images.unsplash.com/photo-1554394985-1b222cdcc912?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      title: 'Trivia La Macarena',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      participants: 150,
      maxParticipants: 150,
      prizePool: 120,
      image: 'https://images.unsplash.com/photo-1588638261318-9569c316c152?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      title: 'Hermandades Domingo de Ramos',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      participants: 35,
      maxParticipants: 100,
      prizePool: 80,
      image: 'https://images.unsplash.com/photo-1553524790-5872ab69e309?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '4',
      title: 'Historia de La Esperanza de Triana',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      participants: 12,
      maxParticipants: 100,
      prizePool: 80,
      image: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '5',
      title: 'Grandes Misterios Sevillanos',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      participants: 100,
      maxParticipants: 100,
      prizePool: 80,
      image: 'https://images.unsplash.com/photo-1583248369069-9d91f1640fe6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '6',
      title: 'Iconografía Mariana',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      participants: 75,
      maxParticipants: 100,
      prizePool: 80,
      image: 'https://images.unsplash.com/photo-1541331192910-7c850afa9118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ];
  
  // Filter games based on upcoming/past and search term
  const filteredGames = allGames.filter(game => {
    // Apply date filter
    if (filter === 'upcoming' && game.date < new Date()) {
      return false;
    }
    if (filter === 'past' && game.date > new Date()) {
      return false;
    }
    
    // Apply search filter
    if (searchTerm && !game.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
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
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };
  
  return (
    <>
      <Navbar />
      
      <section className="pt-32 pb-20 bg-gradient-to-b from-gloria-cream to-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gloria-purple mb-4">
              Partidas Disponibles
            </h1>
            <p className="text-lg text-gray-600">
              Encuentra la partida perfecta para ti y demuestra tu conocimiento sobre la Semana Santa sevillana
            </p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-stretch gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative flex-grow md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar partidas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="gloria-input w-full pl-10 focus:ring-gloria-purple"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="text-gloria-purple" size={20} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="gloria-input focus:ring-gloria-purple"
              >
                <option value="all">Todas las partidas</option>
                <option value="upcoming">Próximas partidas</option>
                <option value="past">Partidas pasadas</option>
              </select>
            </div>
          </motion.div>
          
          {filteredGames.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-2">
                No se encontraron partidas
              </h3>
              <p className="text-gray-600">
                No hay partidas disponibles con los filtros actuales. Prueba con otros criterios.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredGames.map((game) => (
                <motion.div key={game.id} variants={itemVariants}>
                  <GameCard {...game} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Games;
