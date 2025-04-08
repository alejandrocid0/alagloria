
import { supabase } from '@/integrations/supabase/client';

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
