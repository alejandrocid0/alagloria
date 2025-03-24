
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
    // Comprobar todos los juegos activos que necesitan avanzar de estado
    const { data: activeGames, error: gamesError } = await supabaseClient
      .from('live_games')
      .select('id, status, current_question, countdown, updated_at')
      .not('status', 'eq', 'finished');
    
    if (gamesError) {
      console.error('Error al obtener juegos activos:', gamesError);
      return new Response(
        JSON.stringify({ error: 'Error al obtener juegos activos' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }
    
    console.log(`Comprobando ${activeGames.length} juegos activos`);
    
    const results = [];
    
    // Para cada juego activo
    for (const game of activeGames) {
      const now = new Date();
      const lastUpdate = new Date(game.updated_at);
      const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      // Si el tiempo transcurrido excede el countdown, avanzar el estado
      if (elapsedSeconds >= game.countdown) {
        console.log(`Avanzando automáticamente el juego ${game.id} desde el estado ${game.status} (${elapsedSeconds}s transcurridos > ${game.countdown}s countdown)`);
        
        const advanceResult = await advanceGameState(game.id);
        results.push({
          gameId: game.id,
          previousStatus: game.status,
          newStatus: advanceResult.newStatus,
          autoAdvanced: true
        });
      }
    }
    
    // También comprobamos juegos programados que deberían iniciarse
    await checkScheduledGames();
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Comprobados ${activeGames.length} juegos activos`,
        advancedGames: results
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

// Función para avanzar el estado de un juego
async function advanceGameState(gameId) {
  try {
    // Obtener el estado actual del juego
    const { data: gameState, error: getError } = await supabaseClient
      .rpc('get_live_game_state', { game_id: gameId });

    if (getError) {
      console.error('Error al obtener el estado del juego:', getError);
      throw new Error('Error al obtener el estado del juego');
    }

    if (!gameState || gameState.length === 0) {
      throw new Error('No se encontró el estado del juego');
    }

    const currentState = gameState[0];
    const totalQuestions = await getTotalQuestions(gameId);
    
    if (totalQuestions === null) {
      throw new Error('Error al obtener número total de preguntas');
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
        } else {
          nextState = 'finished';
          countdown = 0;
        }
        break;
        
      case 'finished':
        // Ya está terminado, no hay siguiente estado
        return {
          success: false, 
          message: 'El juego ya ha terminado',
          currentStatus: 'finished',
          newStatus: 'finished'
        };
        
      default:
        throw new Error(`Estado no reconocido: ${currentState.status}`);
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
      throw new Error('Error al actualizar el estado del juego');
    }

    return {
      success: true, 
      message: `Estado del juego actualizado a ${nextState}`,
      previousStatus: currentState.status,
      newStatus: nextState,
      currentQuestion: currentQuestion
    };
  } catch (err) {
    console.error('Error avanzando el estado del juego:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

// Función para comprobar y activar juegos programados
async function checkScheduledGames() {
  try {
    // Invocar la función RPC de base de datos
    const { data, error } = await supabaseClient.rpc('check_scheduled_games');
    
    if (error) {
      console.error('Error al comprobar juegos programados:', error);
      return false;
    }
    
    console.log('Juegos programados comprobados correctamente');
    return true;
  } catch (err) {
    console.error('Error inesperado al comprobar juegos programados:', err);
    return false;
  }
}

// Función auxiliar para obtener el número total de preguntas
async function getTotalQuestions(gameId) {
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
