
import { supabase } from '@/integrations/supabase/client';
import { AnswerResult } from '@/types/liveGame';

// Objeto para seguimiento de respuestas por usuario y pregunta
const answerAttemptTracker: {
  [key: string]: {
    timestamp: number;
    attempts: number;
  }
} = {};

// Function to submit an answer with additional security measures
export async function submitPlayerAnswer(
  gameId: string, 
  userId: string, 
  questionPosition: number, 
  selectedOption: string, 
  answerTimeMs: number
): Promise<AnswerResult> {
  try {
    // Generar clave única para esta combinación de usuario y pregunta
    const trackingKey = `${gameId}-${userId}-${questionPosition}`;
    
    // Verificar si ya hay un intento previo registrado
    if (answerAttemptTracker[trackingKey]) {
      // Si ya se ha respondido esta pregunta, rechazar
      if (answerAttemptTracker[trackingKey].attempts >= 1) {
        console.error('Security warning: Multiple submission attempts for the same question');
        throw new Error('Ya has respondido a esta pregunta');
      }
      
      // Verificar si el tiempo entre intentos es sospechosamente corto
      const now = Date.now();
      const timeSinceLastAttempt = now - answerAttemptTracker[trackingKey].timestamp;
      
      if (timeSinceLastAttempt < 300) { // 300ms es demasiado rápido para ser humano
        console.error('Security warning: Suspicious submission timing detected');
        throw new Error('Demasiados intentos en poco tiempo');
      }
      
      // Actualizar el contador de intentos
      answerAttemptTracker[trackingKey].attempts += 1;
      answerAttemptTracker[trackingKey].timestamp = now;
    } else {
      // Registrar el primer intento
      answerAttemptTracker[trackingKey] = {
        timestamp: Date.now(),
        attempts: 1
      };
    }
    
    // Validar que el tiempo de respuesta sea razonable
    if (answerTimeMs < 0 || answerTimeMs > 60000) { // Entre 0 y 60 segundos
      console.error('Security warning: Suspicious answer time');
      throw new Error('Tiempo de respuesta no válido');
    }

    // Use RPC instead of directly querying the table
    const { data, error } = await supabase
      .rpc('submit_game_answer', {
        p_game_id: gameId,
        p_user_id: userId,
        p_question_position: questionPosition,
        p_selected_option: selectedOption,
        p_answer_time_ms: answerTimeMs
      });
    
    if (error) {
      console.error('Error submitting answer:', error);
      throw new Error(`Error al enviar respuesta: ${error.message}`);
    }
    
    // Si no hay datos o está vacío, lanzar error
    if (!data || data.length === 0) {
      throw new Error('No se recibió respuesta del servidor');
    }
    
    // Map the response to match the expected type
    return {
      is_correct: data[0].is_correct,
      points: data[0].points,
      correctOption: data[0].correctoption
    };
  } catch (err: any) {
    console.error('Error in submitPlayerAnswer:', err);
    throw err;
  }
}
