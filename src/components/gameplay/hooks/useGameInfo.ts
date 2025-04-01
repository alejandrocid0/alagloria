
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the shape of the game info object
interface GameInfo {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  participantsCount: number;
  creatorName: string;
  image_url?: string;
  created_by?: string;
  scheduledTime: string;
  prizePool?: number;
}

export const useGameInfo = (gameId: string | undefined) => {
  const [gameInfo, setGameInfo] = useState<GameInfo>({
    id: '',
    title: 'Cargando partida...',
    description: '',
    date: new Date(),
    category: '',
    participantsCount: 0,
    creatorName: '',
    image_url: '',
    scheduledTime: '',
    prizePool: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGameInfo = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the game details and participant count
      const { data: gameData, error: gameError } = await supabase
        .from('games_with_details')
        .select('*')
        .eq('id', gameId)
        .single();
      
      if (gameError) throw gameError;
      
      if (gameData) {
        // Format the date as a string for scheduledTime
        const dateObject = new Date(gameData.date);
        const formattedDate = dateObject.toLocaleString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        setGameInfo({
          id: gameData.id,
          title: gameData.title || 'Sin título',
          description: gameData.description || 'Sin descripción',
          date: new Date(gameData.date),
          category: gameData.category || 'General',
          participantsCount: gameData.participants_count || 0,
          creatorName: gameData.creator_name || 'Anónimo',
          image_url: gameData.image_url || '',
          created_by: gameData.created_by,
          scheduledTime: formattedDate,
          prizePool: 0 // Default value, update if you have actual prize data
        });
      }
    } catch (err) {
      console.error('Error fetching game info:', err);
      setError(err instanceof Error ? err : new Error('Error fetching game info'));
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGameInfo();
  }, [fetchGameInfo]);

  return {
    ...gameInfo,
    loading,
    error,
    refresh: fetchGameInfo
  };
};
