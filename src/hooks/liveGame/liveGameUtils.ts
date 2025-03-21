
import { supabase } from '@/integrations/supabase/client';
import { LiveGameState, Player, AnswerResult } from '@/types/liveGame';
import { QuizQuestion } from '@/types/quiz';

// Función para obtener el estado del juego en vivo
export async function fetchLiveGameState(gameId: string): Promise<LiveGameState | null> {
  try {
    const { data, error } = await supabase
      .from('live_games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching live game state:', error);
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Error in fetchLiveGameState:', err);
    return null;
  }
}

// Función para obtener las preguntas del juego
export async function fetchGameQuestions(gameId: string): Promise<QuizQuestion[]> {
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

// Función para actualizar el leaderboard utilizando la función RPC
export async function fetchGameLeaderboard(gameId: string): Promise<Player[]> {
  try {
    // Utilizamos la nueva función RPC get_game_leaderboard
    const { data, error } = await supabase
      .rpc('get_game_leaderboard', { game_id: gameId });
    
    if (error) {
      console.error('Error fetching leaderboard with RPC:', error);
      throw error;
    }
    
    // Añadir ranks a los jugadores
    return data.map((player: any, index: number) => ({
      user_id: player.user_id,
      name: player.name,
      total_points: player.total_points,
      rank: index + 1,
      lastAnswer: player.last_answer,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
    }));
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return [];
  }
}

// Función para enviar una respuesta
export async function submitAnswer(
  gameId: string, 
  userId: string, 
  questionPosition: number, 
  selectedOption: string, 
  answerTimeMs: number
): Promise<AnswerResult> {
  try {
    // Obtener la pregunta actual
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .eq('position', questionPosition)
      .maybeSingle();
    
    if (questionError || !questionData) {
      console.error('Error fetching question:', questionError);
      throw new Error('Error al obtener la pregunta');
    }
    
    // Verificar si la respuesta es correcta
    const isCorrect = questionData.correct_option === selectedOption;
    
    // Calcular puntos (más puntos si responde más rápido)
    let points = 0;
    if (isCorrect) {
      // Fórmula: 100 puntos base + bonus por tiempo (máx 100 adicionales)
      const timeBonus = Math.max(0, 100 - (answerTimeMs / 200)); 
      points = Math.round(100 + timeBonus);
    }
    
    // Guardar la respuesta
    const { data: answerData, error: answerError } = await supabase
      .from('live_game_answers')
      .insert({
        game_id: gameId,
        user_id: userId,
        question_position: questionPosition,
        selected_option: selectedOption,
        is_correct: isCorrect,
        points: points,
        answer_time_ms: answerTimeMs
      })
      .select()
      .single();
    
    if (answerError) {
      console.error('Error submitting answer:', answerError);
      throw new Error(`Error al enviar respuesta: ${answerError.message}`);
    }
    
    return {
      ...answerData as any,
      correctOption: questionData.correct_option
    };
  } catch (err: any) {
    console.error('Error in submitAnswer:', err);
    throw err;
  }
}

// Función para iniciar el juego
export async function startGame(gameId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('live_games')
      .upsert({
        id: gameId,
        status: 'question',
        current_question: 0,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
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

// Función para suscribirse a cambios en el leaderboard
export function subscribeToLeaderboardUpdates(
  gameId: string, 
  callback: (payload: any) => void
): any {
  return supabase
    .channel(`leaderboard-${gameId}`)
    .on(
      'postgres_changes',
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'live_game_answers',
        filter: `game_id=eq.${gameId}`
      },
      callback
    )
    .subscribe();
}
