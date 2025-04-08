
import { supabase } from '@/integrations/supabase/client';

/**
 * Permite a un usuario unirse a una partida
 * @param gameId ID de la partida
 * @param userId ID del usuario
 * @returns Objeto con el resultado de la operación
 */
export async function joinGame(gameId: string, userId: string) {
  try {
    // Verificar si el usuario ya está registrado para esta partida
    const { data: existingParticipation, error: checkError } = await supabase
      .from('game_participants')
      .select()
      .eq('game_id', gameId)
      .eq('user_id', userId);
  
    if (checkError) {
      console.error('Error checking participation:', checkError);
      throw new Error(`Error al verificar participación: ${checkError.message}`);
    }
  
    // Si el usuario ya está registrado, no hacemos nada
    if (existingParticipation && existingParticipation.length > 0) {
      return { alreadyJoined: true };
    }
  
    // Registrar al usuario como participante
    const { error: joinError } = await supabase
      .from('game_participants')
      .insert({
        game_id: gameId,
        user_id: userId
      });
  
    if (joinError) {
      console.error('Error joining game:', joinError);
      throw new Error(`Error al unirse a la partida: ${joinError.message}`);
    }
  
    return { success: true };
  } catch (error) {
    console.error('Error in joinGame:', error);
    throw error;
  }
}
