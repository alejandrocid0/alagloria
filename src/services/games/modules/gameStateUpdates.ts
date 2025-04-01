
import { supabase } from '@/integrations/supabase/client';
import { LiveGameState } from '@/types/liveGame';

/**
 * Servicio para manejar actualizaciones del estado de la partida
 */
export const gameStateUpdates = {
  // Obtener el estado actual de una partida
  async getGameState(gameId: string): Promise<LiveGameState | null> {
    if (!gameId) return null;
    
    try {
      const { data, error } = await supabase
        .rpc('get_live_game_state', { game_id: gameId });
      
      if (error) {
        console.error('Error al obtener el estado de la partida:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        return null;
      }
      
      // Convertir el estado a la estructura necesaria
      return {
        id: data[0].id,
        status: data[0].status as "waiting" | "question" | "result" | "leaderboard" | "finished",
        current_question: data[0].current_question,
        countdown: data[0].countdown,
        started_at: data[0].started_at,
        updated_at: data[0].updated_at
      };
    } catch (err) {
      console.error('Error al obtener el estado de la partida:', err);
      return null;
    }
  },
  
  // Suscribirse a los cambios en el estado de la partida
  subscribeToGameChanges(gameId: string, callback: (payload: any) => void) {
    if (!gameId) return null;
    
    return supabase
      .channel(`game-state-${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        callback
      )
      .subscribe();
  },
  
  // Avanzar el estado de la partida
  async advanceGameState(gameId: string, forceState?: "waiting" | "question" | "result" | "leaderboard" | "finished") {
    if (!gameId) return false;
    
    try {
      const body: any = { gameId };
      if (forceState) {
        body.forceState = forceState;
      }
      
      // Llamar a la edge function para avanzar el estado del juego
      const { data, error } = await supabase.functions.invoke('advance-game-state', {
        body
      });
      
      if (error) {
        console.error('Error al avanzar el estado de la partida:', error);
        return false;
      }
      
      return data?.success || false;
    } catch (err) {
      console.error('Error al avanzar el estado de la partida:', err);
      return false;
    }
  }
};
