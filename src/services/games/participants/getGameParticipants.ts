
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtiene el número de participantes en una partida
 * @param gameId ID de la partida
 * @returns Número de participantes
 */
export async function getGameParticipants(gameId: string) {
  const { count, error } = await supabase
    .from('game_participants')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', gameId);
  
  if (error) {
    console.error('Error counting participants:', error);
    throw new Error(`Error al contar participantes: ${error.message}`);
  }
  
  return count || 0;
}
