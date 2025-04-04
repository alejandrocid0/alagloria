
import { useState, useEffect } from 'react';
import { fetchGamesFromSupabase } from '@/components/games/gamesUtils';
import { Game } from '@/components/games/types';
import { supabase } from '@/integrations/supabase/client';

export const useHomePageData = () => {
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    games: 0,
    prizes: 0
  });

  useEffect(() => {
    const loadGames = async () => {
      setLoading(true);
      try {
        const games = await fetchGamesFromSupabase();
        
        // Filtrar solo las partidas disponibles (fecha futura y no completas)
        const availableGames = games.filter(game => 
          game.date > new Date() && 
          (game.participants || 0) < (game.maxParticipants || 100)
        );
        
        // Ordenar por fecha más cercana primero
        const sortedGames = availableGames.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const gamesForHomepage = sortedGames.slice(0, 3);
        
        setUpcomingGames(gamesForHomepage);
        
        // Obtener el conteo de usuarios ÚNICOS
        const { count: uniqueUsersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (usersError) {
          console.error("Error obteniendo el conteo de usuarios:", usersError);
        }
        
        const totalGames = games.length;
        const totalPrizes = games.reduce((sum, game) => sum + game.prizePool, 0);
        
        setStats({
          users: uniqueUsersCount || 0,
          games: totalGames,
          prizes: totalPrizes
        });
      } catch (error) {
        console.error("Error loading games:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadGames();
    
    const channel = supabase
      .channel('public:games')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'games'
        }, 
        () => {
          console.log('Games table changed, reloading data...');
          loadGames();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants'
        }, 
        () => {
          console.log('Game participants changed, reloading data...');
          loadGames();
        }
      )
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles'
        }, 
        () => {
          console.log('Profiles changed, reloading data...');
          loadGames();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    upcomingGames,
    loading,
    stats
  };
};
