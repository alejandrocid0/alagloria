import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';

const Games = () => {
  const [games, setGames] = useState([
    {
      id: '1',
      title: 'Especial Semana Santa 2023',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      participants: 0,
      maxParticipants: 100,
      prizePool: 100,
      image: 'https://images.unsplash.com/photo-1554394985-1b222cdcc912?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      title: 'Trivia La Macarena',
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      participants: 0,
      maxParticipants: 100,
      prizePool: 100,
      image: 'https://images.unsplash.com/photo-1588638261318-9569c316c152?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      title: 'Hermandades Domingo de Ramos',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      participants: 0,
      maxParticipants: 100,
      prizePool: 100,
      image: 'https://images.unsplash.com/photo-1553524790-5872ab69e309?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '4',
      title: 'Curiosidades de la Semana Santa',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      participants: 0,
      maxParticipants: 100,
      prizePool: 100,
      image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '5',
      title: 'Música y Marchas Procesionales',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      participants: 0,
      maxParticipants: 100,
      prizePool: 100,
      image: 'https://images.unsplash.com/photo-1575147834960-bf3a3b2d2c0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '6',
      title: 'Historia de la Semana Santa',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Past game
      participants: 0,
      maxParticipants: 100,
      prizePool: 100,
      image: 'https://images.unsplash.com/photo-1523676060187-f55189a71f5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'full', 'past'

  useEffect(() => {
    const loadGameParticipants = () => {
      const updatedGames = games.map(game => {
        const gameParticipantsKey = `game_${game.id}_participants`;
        const storedParticipants = localStorage.getItem(gameParticipantsKey);
        
        const participants = storedParticipants ? parseInt(storedParticipants, 10) : 0;
        
        return {
          ...game,
          participants
        };
      });
      
      setGames(updatedGames);
    };
    
    loadGameParticipants();
  }, []);

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'upcoming') {
      matchesStatus = game.date > new Date() && game.participants < game.maxParticipants;
    } else if (filterStatus === 'full') {
      matchesStatus = game.date > new Date() && game.participants >= game.maxParticipants;
    } else if (filterStatus === 'past') {
      matchesStatus = game.date < new Date();
    }
    
    return matchesSearch && matchesStatus;
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
      transition: { duration: 0.4 }
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="pt-24 pb-16 bg-white min-h-screen">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gloria-purple mb-4">
              Partidas Disponibles
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Únete a una partida, responde correctamente y compite por premios en tiempo real
            </p>
          </motion.div>
          
          <div className="flex flex-col md:flex-row justify-between items-stretch gap-4 mb-8">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar partidas..."
                className="gloria-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <select
                  className="gloria-input pl-10 pr-10 appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todas las partidas</option>
                  <option value="upcoming">Disponibles</option>
                  <option value="full">Completas</option>
                  <option value="past">Finalizadas</option>
                </select>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {filteredGames.length === 0 ? (
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
      </div>
      
      <Footer />
    </>
  );
};

export default Games;
