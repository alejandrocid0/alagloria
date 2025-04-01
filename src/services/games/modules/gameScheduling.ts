
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Servicio para gestionar la programación de partidas
 */
export const gameScheduling = {
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
  }
};
