
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

interface GameInfo {
  id?: string;
  title: string;
  scheduledTime: string;
  prizePool?: number;
  date?: Date; // Added missing date property
  created_by?: string; // Added missing created_by property
}

export const useGameInfo = (gameId: string | undefined) => {
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    title: "Partida en vivo",
    scheduledTime: ""
  });

  // Fetch game details
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!gameId) return;
      
      try {
        const { data, error } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();
        
        if (error) throw new Error(error.message);
        
        if (data) {
          const formattedDate = format(
            new Date(data.date), 
            "EEEE d 'de' MMMM, HH:mm", 
            { locale: es }
          );
          
          setGameInfo({
            id: data.id,
            title: data.title || "Partida en vivo",
            scheduledTime: formattedDate,
            prizePool: data.prize_pool,
            date: new Date(data.date),
            created_by: data.created_by
          });
        }
      } catch (err) {
        console.error("Error fetching game details:", err);
        // Fallback to defaults, silently fail to not disrupt the experience
      }
    };
    
    fetchGameDetails();
  }, [gameId]);

  return gameInfo;
};
