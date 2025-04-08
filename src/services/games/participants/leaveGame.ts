
import { supabase } from '@/integrations/supabase/client';

/**
 * Permite a un usuario abandonar una partida
 * @param gameId ID de la partida
 * @param userId ID del usuario
 * @returns Objeto con el resultado de la operación
 */
export async function leaveGame(gameId: string, userId: string) {
  const { error: leaveError } = await supabase
    .from('game_participants')
    .delete()
    .eq('game_id', gameId)
    .eq('user_id', userId);
  
  if (leaveError) {
    console.error('Error leaving game:', leaveError);
    throw new Error(`Error al abandonar la partida: ${leaveError.message}`);
  }
  
  return { success: true };
}
