
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player } from '@/types/liveGame';
import { useAuth } from '@/contexts/AuthContext';

export const useLeaderboard = (gameId: string | undefined) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [myRank, setMyRank] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  
  const loadLeaderboard = useCallback(async () => {
    if (!gameId) return [];
    
    try {
      const { data: leaderboardData, error } = await supabase
        .rpc('get_game_leaderboard', { game_id: gameId });
      
      if (error) throw error;
      
      if (leaderboardData) {
        // Formatear y establecer datos del leaderboard
        const formattedLeaderboard = leaderboardData.map((player: any, index: number) => ({
          id: player.user_id,
          name: player.name,
          points: player.total_points,
          lastAnswer: player.last_answer,
          rank: index + 1,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
        }));
        
        setLeaderboard(formattedLeaderboard);
        
        // Encontrar usuario actual en el leaderboard
        if (user) {
          const myData = formattedLeaderboard.find(player => player.id === user.id);
          if (myData) {
            setMyPoints(myData.points);
            setMyRank(myData.rank);
          }
        }
        
        return formattedLeaderboard;
      }
      
      return [];
    } catch (err) {
      console.error('Error al cargar leaderboard:', err);
      return [];
    }
  }, [gameId, user]);
  
  return {
    leaderboard,
    myRank,
    myPoints,
    loadLeaderboard
  };
};
