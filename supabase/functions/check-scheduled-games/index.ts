
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
    const { data, error } = await supabaseClient.rpc('check_scheduled_games')
    
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
    const waitingGamesResult = await checkWaitingGames();
    
    // Verificar las partidas que deberían avanzar de estado automáticamente
    const autoAdvanceResult = await checkAutoAdvanceGames();
    
    console.log('Verificación de partidas programadas completada con éxito')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verificación de partidas programadas completada',
        waiting_games_checked: waitingGamesResult,
        auto_advance_games_checked: autoAdvanceResult 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (err) {
    console.error('Error inesperado:', err)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: err.message }), 
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
      return { success: false, error: error.message };
    }
    
    console.log(`Encontradas ${data?.length || 0} partidas en estado waiting que necesitan avanzar`);
    
    // Para cada partida que ha excedido el tiempo de espera, avanzar al siguiente estado
    const results = [];
    for (const game of data || []) {
      console.log(`Partida ${game.id} ha excedido el tiempo de espera, avanzando automáticamente...`);
      
      try {
        // Llamar a la función para avanzar el estado
        const { data: advanceData, error: advanceError } = await supabaseClient.functions.invoke('advance-game-state', {
          body: { gameId: game.id }
        });
        
        if (advanceError) {
          console.error(`Error al avanzar el estado de la partida ${game.id}:`, advanceError);
          results.push({ gameId: game.id, success: false, error: advanceError.message });
        } else {
          console.log(`Partida ${game.id} avanzada correctamente de "waiting" a "question"`);
          results.push({ gameId: game.id, success: true, newStatus: 'question' });
        }
      } catch (err) {
        console.error(`Error inesperado al avanzar partida ${game.id}:`, err);
        results.push({ gameId: game.id, success: false, error: err.message });
      }
    }
    
    return { 
      success: true, 
      games_checked: data?.length || 0,
      results 
    };
  } catch (err) {
    console.error('Error al verificar partidas en espera:', err);
    return { success: false, error: err.message };
  }
}

// Función para verificar partidas que necesitan avanzar a su siguiente estado automáticamente
async function checkAutoAdvanceGames() {
  try {
    // Obtener todas las partidas activas (no finalizadas)
    const { data, error } = await supabaseClient
      .from('live_games')
      .select('id, status, current_question, countdown, updated_at')
      .not('status', 'eq', 'finished');
    
    if (error) {
      console.error('Error al obtener partidas activas:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`Verificando ${data?.length || 0} partidas activas para auto-avance`);
    
    const results = [];
    for (const game of data || []) {
      const now = new Date();
      const lastUpdate = new Date(game.updated_at);
      const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      // Si el tiempo transcurrido excede el countdown, avanzar el estado
      if (elapsedSeconds >= game.countdown) {
        console.log(`Partida ${game.id} necesita avanzar de estado ${game.status} después de ${elapsedSeconds}s (countdown: ${game.countdown}s)`);
        
        try {
          // Invocar edge function para avanzar el estado
          const { data: advanceData, error: advanceError } = await supabaseClient.functions.invoke('advance-game-state', {
            body: { gameId: game.id }
          });
          
          if (advanceError) {
            console.error(`Error al avanzar partida ${game.id}:`, advanceError);
            results.push({ gameId: game.id, success: false, error: advanceError.message });
          } else {
            console.log(`Partida ${game.id} avanzada correctamente de "${game.status}" a "${advanceData?.newStatus || 'desconocido'}"`);
            results.push({ 
              gameId: game.id, 
              success: true, 
              previousStatus: game.status,
              newStatus: advanceData?.newStatus 
            });
          }
        } catch (err) {
          console.error(`Error inesperado al avanzar partida ${game.id}:`, err);
          results.push({ gameId: game.id, success: false, error: err.message });
        }
      } else {
        // Para seguimiento, registrar el tiempo restante
        console.log(`Partida ${game.id} en estado ${game.status}: faltan ${game.countdown - elapsedSeconds}s para avanzar`);
      }
    }
    
    return {
      success: true,
      games_checked: data?.length || 0,
      advanced_games: results.filter(r => r.success).length,
      results
    };
  } catch (err) {
    console.error('Error al verificar partidas para auto-avance:', err);
    return { success: false, error: err.message };
  }
}
