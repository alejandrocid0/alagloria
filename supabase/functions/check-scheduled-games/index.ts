
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
    console.log('Comenzando verificación de partidas programadas...')

    // Llamar a la función check_scheduled_games
    const { error } = await supabaseClient.rpc('check_scheduled_games')
    
    if (error) {
      console.error('Error al verificar partidas programadas:', error)
      return new Response(
        JSON.stringify({ error: 'Error al verificar partidas programadas' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      )
    }
    
    // También realizar una verificación de las partidas que están en "waiting" y que han excedido su tiempo de espera
    await checkWaitingGames();
    
    console.log('Verificación de partidas programadas completada con éxito')
    return new Response(
      JSON.stringify({ success: true, message: 'Verificación de partidas programadas completada' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (err) {
    console.error('Error inesperado:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

// Función para verificar las partidas en estado "waiting" que han excedido su tiempo de espera
async function checkWaitingGames() {
  try {
    // Buscar partidas en estado "waiting" que han estado esperando por más de 5 minutos
    const { data, error } = await supabaseClient
      .from('live_games')
      .select('id, countdown, updated_at')
      .eq('status', 'waiting')
      .lt('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // 5 minutos antes
    
    if (error) {
      console.error('Error al buscar partidas en espera:', error);
      return;
    }
    
    // Para cada partida que ha excedido el tiempo de espera, avanzar al siguiente estado
    for (const game of data || []) {
      console.log(`Partida ${game.id} ha excedido el tiempo de espera, avanzando automáticamente...`);
      
      // Llamar a la función de Edge Function para avanzar el estado
      const { error: advanceError } = await supabaseClient.functions.invoke('advance-game-state', {
        body: { gameId: game.id }
      });
      
      if (advanceError) {
        console.error(`Error al avanzar el estado de la partida ${game.id}:`, advanceError);
      } else {
        console.log(`Partida ${game.id} avanzada correctamente de "waiting" a "question"`);
      }
    }
  } catch (err) {
    console.error('Error al verificar partidas en espera:', err);
  }
}
