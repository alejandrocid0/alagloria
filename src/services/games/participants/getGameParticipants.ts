
import { supabase } from '@/integrations/supabase/client';

/**
 * Obtiene el número de participantes en una partida
 * @param gameId ID de la partida
 * @returns Número de participantes
 */
export async function getGameParticipants(gameId: string) {
  const { data, error } = await supabase
    .from('game_participants')
    .select('count')
    .eq('game_id', gameId);
  
  if (error) {
    console.error('Error counting participants:', error);
    throw new Error(`Error al contar participantes: ${error.message}`);
  }
  
  // Convert count to number properly
  return data && data[0] ? parseInt(String(data[0].count)) : 0;
}
