
import { supabase } from '@/integrations/supabase/client';
import { gameNotifications } from '@/components/ui/notification-toast';

/**
 * Servicio para gestionar los resultados de las partidas
 */
export const gameResults = {
  // Guardar resultados de la partida
  async saveGameResults(gameId: string, userId: string, stats: any) {
    if (!gameId || !userId) return false;
    
    try {
      // Verificar si ya existe un resultado para este usuario y partida
      const { data: existingResult, error: checkError } = await supabase
        .from('game_results')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error al verificar resultados existentes:', checkError);
        return false;
      }
      
      // Si ya existe un resultado, no guardar de nuevo
      if (existingResult) {
        console.log('Los resultados ya fueron guardados anteriormente');
        return true;
      }
      
      // Obtener información de la partida
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('title')
        .eq('id', gameId)
        .single();
      
      if (gameError) {
        console.error('Error al obtener datos de la partida:', gameError);
        return false;
      }
      
      // Guardar los resultados
      const { error: saveError } = await supabase
        .from('game_results')
        .insert({
          game_id: gameId,
          user_id: userId,
          game_title: gameData.title,
          position: stats.rank || 0,
          correct_answers: stats.correctAnswers || 0,
          total_answers: stats.totalAnswers || stats.totalQuestions || 0,
          entry_fee: 0
        });
      
      if (saveError) {
        console.error('Error al guardar resultados:', saveError);
        return false;
      }
      
      gameNotifications.resultsSaved();
      return true;
    } catch (err) {
      console.error('Error al guardar resultados:', err);
      return false;
    }
  }
};
