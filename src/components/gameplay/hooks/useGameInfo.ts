
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface GameInfo {
  title: string;
  scheduledTime: string;
  prizePool?: number;
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
        const { data, error } = await fetch(`/api/games/${gameId}`).then(res => res.json());
        
        if (error) throw new Error(error.message);
        
        if (data) {
          const formattedDate = format(
            new Date(data.date), 
            "EEEE d 'de' MMMM, HH:mm", 
            { locale: es }
          );
          
          setGameInfo({
            title: data.title || "Partida en vivo",
            scheduledTime: data.date,
            prizePool: data.prize_pool
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
