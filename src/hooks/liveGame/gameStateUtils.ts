
import { supabase } from '@/integrations/supabase/client';
import { LiveGameState } from '@/types/liveGame';

// Función para obtener el estado del juego en vivo
export async function fetchLiveGameState(gameId: string): Promise<LiveGameState | null> {
  try {
    // Necesitamos usar rpc para obtener datos, ya que live_games no está en la definición de tipos
    const { data: gameStateData, error: gameStateError } = await supabase
      .rpc('get_live_game_state', { game_id: gameId });
    
    if (gameStateError) {
      console.error('Error fetching live game state:', gameStateError);
      throw gameStateError;
    }
    
    // Si no hay error pero tampoco datos, creamos un estado por defecto
    if (!gameStateData) {
      return {
        id: gameId,
        status: 'waiting',
        current_question: 0,
        countdown: 5
      };
    }
    
    return gameStateData as LiveGameState;
  } catch (err) {
    console.error('Error in fetchLiveGameState:', err);
    return null;
  }
}

// Función para obtener las preguntas del juego
export async function fetchGameQuestions(gameId: string): Promise<any[]> {
  try {
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        correct_option,
        position,
        options (
          id,
          option_id,
          option_text,
          position
        )
      `)
      .eq('game_id', gameId)
      .order('position', { ascending: true });

    if (questionsError) {
      throw questionsError;
    }

    // Formatear las preguntas para que sean compatibles con QuizQuestion
    return questionsData.map(q => ({
      id: q.id,
      question: q.question_text,
      correctOption: q.correct_option,
      position: q.position,
      options: q.options.map(opt => ({
        id: opt.option_id,
        text: opt.option_text
      }))
    }));
  } catch (err) {
    console.error('Error fetching game questions:', err);
    return [];
  }
}

// Función para iniciar el juego
export async function startGame(gameId: string): Promise<void> {
  try {
    // Usamos una función RPC en lugar de manipular la tabla directamente
    const { error } = await supabase
      .rpc('start_live_game', { game_id: gameId });
    
    if (error) throw error;
  } catch (err: any) {
    console.error('Error starting game:', err);
    throw err;
  }
}

// Función para suscribirse a cambios en el estado del juego
export function subscribeToGameUpdates(
  gameId: string, 
  callback: (payload: any) => void
): any {
  return supabase
    .channel(`game-${gameId}`)
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
}
