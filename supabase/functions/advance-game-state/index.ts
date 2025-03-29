
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Crear el cliente de Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Manejar peticiones OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    const { gameId, forceState } = body;

    if (!gameId) {
      return new Response(
        JSON.stringify({ error: 'Game ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    console.log(`Avanzando estado del juego: ${gameId}`, forceState ? `(Forzando a: ${forceState})` : '');

    // Obtener el estado actual del juego
    const { data: gameState, error: getError } = await supabaseClient
      .rpc('get_live_game_state', { game_id: gameId });

    if (getError) {
      console.error('Error al obtener el estado del juego:', getError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener el estado del juego' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    if (!gameState || gameState.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No game state found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 404 
        }
      );
    }

    const currentState = gameState[0];
    const totalQuestions = await getTotalQuestions(gameId);
    
    if (totalQuestions === null) {
      return new Response(
        JSON.stringify({ error: 'Error al obtener número total de preguntas' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Si se especifica un estado forzado, actualizar a ese estado
    if (forceState) {
      // Necesitamos verificaciones adicionales para prevenir transiciones inválidas
      // Por ejemplo, no permitir forzar a "finished" si no se han respondido todas las preguntas
      if (forceState === 'finished' && currentState.current_question < totalQuestions - 1) {
        console.log(`Intento de forzar a estado "finished" detenido. Solo se han contestado ${currentState.current_question + 1} de ${totalQuestions} preguntas.`);
        return new Response(
          JSON.stringify({ 
            error: 'No se puede finalizar el juego porque no se han completado todas las preguntas',
            currentQuestion: currentState.current_question + 1,
            totalQuestions: totalQuestions
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
      }

      const { error: updateError } = await supabaseClient
        .from('live_games')
        .update({
          status: forceState,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (updateError) {
        console.error('Error al forzar el estado del juego:', updateError);
        return new Response(
          JSON.stringify({ error: 'Error al actualizar el estado del juego' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 500 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Estado del juego forzado a ${forceState}`,
          newStatus: forceState
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    }

    // Determinar el siguiente estado según el estado actual
    let nextState = '';
    let countdown = 0;
    let currentQuestion = currentState.current_question;
    
    switch (currentState.status) {
      case 'waiting':
        nextState = 'question';
        countdown = 20; // 20 segundos para responder
        currentQuestion = 0;
        break;
        
      case 'question':
        nextState = 'result';
        countdown = 5; // 5 segundos para mostrar resultados
        break;
        
      case 'result':
        nextState = 'leaderboard';
        countdown = 8; // 8 segundos para mostrar clasificación
        break;
        
      case 'leaderboard':
        // Verificar si hay más preguntas o terminar el juego
        if (currentQuestion < totalQuestions - 1) {
          nextState = 'question';
          countdown = 20; // 20 segundos para la siguiente pregunta
          currentQuestion = currentQuestion + 1;
          console.log(`Avanzando a la siguiente pregunta: ${currentQuestion + 1} de ${totalQuestions}`);
        } else {
          nextState = 'finished';
          countdown = 0;
          console.log(`Todas las preguntas completadas (${totalQuestions}). Finalizando juego.`);
        }
        break;
        
      case 'finished':
        // Ya está terminado, no hay siguiente estado
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'El juego ya ha terminado',
            currentStatus: 'finished'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 200 
          }
        );
        
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Estado no reconocido',
            currentStatus: currentState.status
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
            status: 400 
          }
        );
    }

    // Actualizar al siguiente estado
    const { error: updateError } = await supabaseClient
      .from('live_games')
      .update({
        status: nextState,
        current_question: currentQuestion,
        countdown: countdown,
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId);

    if (updateError) {
      console.error('Error al actualizar el estado del juego:', updateError);
      return new Response(
        JSON.stringify({ error: 'Error al actualizar el estado del juego' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Estado del juego actualizado a ${nextState}`,
        previousStatus: currentState.status,
        newStatus: nextState,
        currentQuestion: currentQuestion,
        totalQuestions: totalQuestions
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (err) {
    console.error('Error inesperado:', err);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

// Función auxiliar para obtener el número total de preguntas
async function getTotalQuestions(gameId: string): Promise<number | null> {
  try {
    const { count, error } = await supabaseClient
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId);
    
    if (error) {
      console.error('Error al contar preguntas:', error);
      return null;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Error al obtener total de preguntas:', err);
    return null;
  }
}
