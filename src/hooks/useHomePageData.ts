
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
        
        const sortedGames = games.sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const gamesForHomepage = sortedGames.slice(0, 3);
        
        setUpcomingGames(gamesForHomepage);
        
        const totalParticipants = games.reduce((sum, game) => sum + game.participants, 0);
        const totalGames = games.length;
        const totalPrizes = games.reduce((sum, game) => sum + game.prizePool, 0);
        
        setStats({
          users: totalParticipants,
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
