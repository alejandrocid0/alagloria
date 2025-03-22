
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

    const { gameId } = body;

    if (!gameId) {
      return new Response(
        JSON.stringify({ error: 'Game ID is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 400 
        }
      );
    }

    console.log(`Avanzando estado del juego: ${gameId}`);

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

    // Si el estado es "waiting", cambiarlo a "question"
    if (currentState.status === 'waiting') {
      const { error: updateError } = await supabaseClient
        .from('live_games')
        .update({
          status: 'question',
          current_question: 0,
          countdown: 20, // tiempo para responder en segundos
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
          message: 'Estado del juego actualizado a question',
          newStatus: 'question'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    } else {
      // Si no está en estado waiting, devolver el estado actual
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'El juego no está en estado waiting',
          currentStatus: currentState.status
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 200 
        }
      );
    }
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
})
