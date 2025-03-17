
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, GameResult } from './types';
import { toast } from '@/hooks/use-toast';

// Format game results from database response
export const formatGameResults = (gameResults: any[] | null): GameResult[] => {
  if (!gameResults) return [];
  
  return gameResults.map((result) => ({
    id: result.id,
    gameId: result.game_id,
    gameTitle: result.game_title,
    date: new Date(result.date),
    position: result.position,
    entryFee: result.entry_fee,
    correctAnswers: result.correct_answers,
    totalAnswers: result.total_answers
  }));
};

// Calculate user statistics based on game results
export const calculateUserStats = (gameResults: GameResult[]) => {
  const totalSpent = gameResults.reduce((sum, game) => sum + game.entryFee, 0);
  const correctAnswers = gameResults.reduce((sum, game) => sum + game.correctAnswers, 0);
  const totalAnswers = gameResults.reduce((sum, game) => sum + game.totalAnswers, 0);
  
  return {
    totalSpent,
    correctAnswers,
    totalAnswers
  };
};

// Fetch user profile from Supabase
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) throw profileError;

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_roles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (adminError) {
      console.error('Error al verificar rol de administrador:', adminError);
    }

    // Get user game results
    const { data: gameResults, error: gameError } = await supabase
      .from('game_results')
      .select('*')
      .eq('user_id', userId);

    if (gameError) {
      console.error('Error al obtener resultados de juegos:', gameError);
    }

    // Format game results
    const formattedGameResults = formatGameResults(gameResults);
    
    // Calculate user stats
    const { totalSpent, correctAnswers, totalAnswers } = calculateUserStats(formattedGameResults);

    if (!profileData) return null;

    // Create and return user profile
    return {
      id: profileData.id,
      name: profileData.name,
      email: profileData.email,
      stats: {
        gamesPlayed: formattedGameResults,
        totalSpent,
        correctAnswers,
        totalAnswers
      },
      isAdmin: !!adminData
    };
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    toast({
      title: "Error",
      description: "No se pudieron cargar los datos del usuario",
      variant: "destructive"
    });
    return null;
  }
};
