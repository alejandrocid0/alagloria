
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';

/**
 * Servicio simplificado para gestionar la sincronización del estado del juego
 */
export const gameStateSync = {
  // Verificar partidas programadas (para ser llamado desde un cronjob o manualmente)
  async checkScheduledGames() {
    try {
      const { data, error } = await supabase.functions.invoke('check-scheduled-games');
      
      if (error) {
        console.error('Error al verificar partidas programadas:', error);
        return false;
      }
      
      return data?.success || false;
    } catch (err) {
      console.error('Error inesperado al verificar partidas programadas:', err);
      return false;
    }
  },
  
  // Obtener el estado actual de una partida
  async getGameState(gameId: string) {
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
        status: data[0].status,
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
  
  // Iniciar una partida manualmente (para anfitriones)
  async startGame(gameId: string) {
    if (!gameId) return false;
    
    try {
      const { data, error } = await supabase.rpc('start_live_game', { game_id: gameId });
      
      if (error) {
        console.error('Error al iniciar la partida:', error);
        toast({
          title: "Error",
          description: "No se pudo iniciar la partida",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Error al iniciar la partida:', err);
      return false;
    }
  },
  
  // Programar una partida para iniciar automáticamente
  async scheduleGame(gameId: string, scheduledTime: Date) {
    if (!gameId) return false;
    
    try {
      // Calcular countdown basado en la diferencia entre la hora actual y la programada
      const now = new Date();
      const diffInSeconds = Math.round((scheduledTime.getTime() - now.getTime()) / 1000);
      
      if (diffInSeconds <= 0) {
        console.error('No se puede programar una partida en el pasado');
        return false;
      }
      
      // Crear o actualizar la entrada en live_games con estado waiting
      const { error } = await supabase
        .from('live_games')
        .upsert({
          id: gameId,
          status: 'waiting',
          countdown: diffInSeconds,
          current_question: 0,
          started_at: now.toISOString(),
          updated_at: now.toISOString()
        });
      
      if (error) {
        console.error('Error al programar la partida:', error);
        return false;
      }
      
      // Activar función de verificación para iniciar el proceso
      await this.checkScheduledGames();
      
      return true;
    } catch (err) {
      console.error('Error al programar la partida:', err);
      return false;
    }
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
  },
  
  // Sincronizar el tiempo del cliente con el servidor
  async syncWithServerTime() {
    try {
      const startTime = Date.now();
      const response = await fetch('https://worldtimeapi.org/api/ip');
      const endTime = Date.now();
      
      if (!response.ok) {
        return 0;
      }
      
      const data = await response.json();
      const serverTime = new Date(data.datetime).getTime();
      const clientTime = Date.now();
      const roundTripTime = endTime - startTime;
      
      // Ajustar por la latencia (aproximación)
      return serverTime - (clientTime - Math.floor(roundTripTime / 2));
    } catch (err) {
      console.error('Error al sincronizar con el servidor:', err);
      return 0;
    }
  },
  
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
      
      return true;
    } catch (err) {
      console.error('Error al guardar resultados:', err);
      return false;
    }
  }
};
