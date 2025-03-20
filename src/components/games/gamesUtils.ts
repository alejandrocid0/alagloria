
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Game } from '@/components/games/types';
import { gameService } from '@/services/gameService';

export const fetchGamesFromSupabase = async (): Promise<Game[]> => {
  try {
    const gamesData = await gameService.fetchGames();

    if (!gamesData || gamesData.length === 0) {
      return [];
    }

    console.log('Games data from Supabase:', gamesData);

    const formattedGames = gamesData.map(game => ({
      id: game.id,
      title: game.title,
      date: new Date(game.date),
      description: game.description,
      participants: Math.floor(Math.random() * 50), // Placeholder value
      maxParticipants: 100, // Placeholder value
      prizePool: 100, // Placeholder value
      image: game.image_url || undefined,
      category: game.category || 'semana-santa' // Default to 'semana-santa'
    }));

    return formattedGames;
  } catch (error) {
    console.error('Error fetching games:', error);
    toast({
      title: "Error al cargar partidas",
      description: "No se pudieron cargar las partidas. Por favor, inténtalo de nuevo más tarde.",
      variant: "destructive"
    });
    return [];
  }
};
