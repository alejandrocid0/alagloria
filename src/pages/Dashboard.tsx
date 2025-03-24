
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import StatsOverviewCard from '@/components/dashboard/StatsOverviewCard';
import SuccessRatioCard from '@/components/dashboard/SuccessRatioCard';
import SpendingCard from '@/components/dashboard/SpendingCard';
import RecentGamesCard from '@/components/dashboard/RecentGamesCard';
import UserLevelCard from '@/components/dashboard/UserLevelCard';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(true);
  const [gameResults, setGameResults] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalGamesPlayed: 0,
    totalCorrectAnswers: 0,
    totalAnswers: 0,
    totalSpent: 0,
    bestPosition: null,
    gamesPlayed: []
  });

  useEffect(() => {
    // Redireccionar si no está autenticado
    if (!loading && !user) {
      navigate('/login', { state: { redirectTo: '/dashboard' } });
    } else if (!loading && user) {
      fetchGameResults();
    }
  }, [user, loading, navigate]);

  // Establecemos un tiempo máximo de espera para mostrar la página del dashboard
  useEffect(() => {
    // Si después de 2 segundos aún está cargando, mostramos el dashboard de todos modos
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch game results from Supabase
  const fetchGameResults = async () => {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching game results:', error);
        setLocalLoading(false);
        return;
      }

      if (data) {
        console.log('Resultados de juego cargados:', data.length);
        setGameResults(data);
        calculateStats(data);
      }
      
      setLocalLoading(false);
    } catch (error) {
      console.error('Error in fetchGameResults:', error);
      setLocalLoading(false);
    }
  };

  // Calculate user statistics from game results
  const calculateStats = (results: any[]) => {
    const stats = {
      totalGamesPlayed: results.length,
      totalCorrectAnswers: results.reduce((sum, game) => sum + game.correct_answers, 0),
      totalAnswers: results.reduce((sum, game) => sum + game.total_answers, 0),
      totalSpent: results.reduce((sum, game) => sum + Number(game.entry_fee), 0),
      bestPosition: results.length > 0 ? Math.min(...results.map(game => game.position)) : null,
      gamesPlayed: results.map(game => ({
        position: game.position,
        entryFee: Number(game.entry_fee),
      }))
    };

    setUserStats(stats);
  };

  // Format game results for components
  const formattedGameResults = gameResults.map(game => ({
    id: game.id,
    gameTitle: game.game_title,
    date: game.date,
    position: game.position,
    correctAnswers: game.correct_answers,
    totalAnswers: game.total_answers,
    entryFee: Number(game.entry_fee)
  }));

  if (localLoading && loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gloria-purple">Cargando tu perfil...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 bg-gloria-cream bg-opacity-30">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-8">
            {profile?.name ? `Perfil de ${profile.name}` : 'Tu Perfil'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsOverviewCard 
              user={{
                stats: {
                  gamesPlayed: userStats.gamesPlayed,
                  totalSpent: userStats.totalSpent,
                  correctAnswers: userStats.totalCorrectAnswers,
                  totalAnswers: userStats.totalAnswers
                }
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Información del usuario */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4 text-gloria-purple">Información Personal</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{profile?.name || user?.email?.split('@')[0] || 'Usuario'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="font-medium">{user?.email || profile?.email || 'No disponible'}</p>
                </div>
                {profile?.created_at && (
                  <div>
                    <p className="text-sm text-gray-500">Miembro desde</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Ratio de aciertos */}
            <div className="col-span-2">
              <SuccessRatioCard 
                correctAnswers={userStats.totalCorrectAnswers} 
                totalAnswers={userStats.totalAnswers}
                gameHistory={formattedGameResults.map(game => ({
                  id: game.id,
                  correctAnswers: game.correctAnswers,
                  totalAnswers: game.totalAnswers,
                  date: game.date
                }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Gráfico de dinero invertido */}
            <SpendingCard 
              totalSpent={userStats.totalSpent}
              gameHistory={formattedGameResults.map(game => ({
                date: game.date,
                entryFee: game.entryFee
              }))}
            />
            
            {/* Historial de partidas */}
            <RecentGamesCard recentGames={formattedGameResults} />
          </div>
          
          {/* Tarjeta de Niveles (reemplaza a la tarjeta de logros) */}
          <div className="mt-6">
            <UserLevelCard />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
