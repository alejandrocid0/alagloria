
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Game } from '@/components/games/types';

export const fetchGamesFromSupabase = async (): Promise<Game[]> => {
  const { data: gamesData, error } = await supabase
    .from('games')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    toast({
      title: "Error al cargar partidas",
      description: "No se pudieron cargar las partidas. Por favor, inténtalo de nuevo más tarde.",
      variant: "destructive"
    });
    throw error;
  }

  if (!gamesData || gamesData.length === 0) {
    return [];
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

  return formattedGames;
};
