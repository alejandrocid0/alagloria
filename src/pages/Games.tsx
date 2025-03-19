
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard, { GameCardProps } from '@/components/GameCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import LoadingState from '@/components/gameplay/LoadingState';
import ErrorState from '@/components/gameplay/ErrorState';

interface Game {
  id: string;
  title: string;
  date: Date;
  description: string | null;
  participants: number; // Changed from optional to required
  maxParticipants: number; // Changed from optional to required
  prizePool: number; // Changed from optional to required
  image: string | undefined;
}

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'full', 'past'

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: gamesData, error } = await supabase
        .from('games')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      if (!gamesData || gamesData.length === 0) {
        setGames([]);
        return;
      }

      const formattedGames = gamesData.map(game => ({
        id: game.id,
        title: game.title,
        date: new Date(game.date),
        description: game.description,
        participants: Math.floor(Math.random() * 50), // Ensure this is always provided
        maxParticipants: 100, // Ensure this is always provided
        prizePool: 100, // Ensure this is always provided
        image: game.image_url || undefined
      }));

      setGames(formattedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('No se pudieron cargar las partidas. Por favor, inténtalo de nuevo más tarde.');
      toast({
        title: "Error al cargar partidas",
        description: "No se pudieron cargar las partidas. Por favor, inténtalo de nuevo más tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'upcoming') {
      matchesStatus = game.date > new Date() && (game.participants || 0) < (game.maxParticipants || 100);
    } else if (filterStatus === 'full') {
      matchesStatus = game.date > new Date() && (game.participants || 0) >= (game.maxParticipants || 100);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-24 pb-16 bg-white min-h-screen">
          <div className="container mx-auto px-4 max-w-7xl flex justify-center items-center">
            <LoadingState />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="pt-24 pb-16 bg-white min-h-screen">
          <div className="container mx-auto px-4 max-w-7xl flex justify-center items-center">
            <ErrorState errorMessage={error} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Games;
