
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameList from '@/components/games/GameList';
import GamesFilter from '@/components/games/GamesFilter';
import { fetchGamesFromSupabase } from '@/components/games/gamesUtils';
import LoadingState from '@/components/gameplay/LoadingState';
import ErrorState from '@/components/gameplay/ErrorState';
import { Game } from '@/components/games/types';

const GamesPage = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'upcoming', 'full', 'past'
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formattedGames = await fetchGamesFromSupabase();
      setGames(formattedGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('No se pudieron cargar las partidas. Por favor, inténtalo de nuevo más tarde.');
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
    
    const matchesCategory = filterCategory === 'all' || game.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

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
              Únete a una partida, responde correctamente y demuestra tus conocimientos sobre Semana Santa
            </p>
          </motion.div>
          
          <GamesFilter 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
          
          <GameList 
            filteredGames={filteredGames} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
          />
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default GamesPage;
