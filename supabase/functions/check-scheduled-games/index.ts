
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

    // 1. Verificamos partidas que deberían inicializarse
    await initializeScheduledGames();
    
    // 2. Verificamos partidas que deberían comenzar ahora (de waiting a question)
    await startScheduledGames();
    
    // 3. Verificamos partidas que deberían avanzar de estado automáticamente
    const autoAdvanceResult = await checkAutoAdvanceGames();
    
    console.log('Verificación de partidas programadas completada con éxito')
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Verificación de partidas programadas completada',
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

// 1. Inicialización: Crear registros 'live_games' para partidas programadas
async function initializeScheduledGames() {
  try {
    // Buscar partidas programadas para los próximos 10 minutos que aún no están en live_games
    const nowPlus10Min = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const now = new Date().toISOString();
    
    const { data, error } = await supabaseClient
      .from('games')
      .select('id, title, date')
      .gte('date', now)
      .lte('date', nowPlus10Min)
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error al buscar partidas programadas:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`Encontradas ${data?.length || 0} partidas programadas para los próximos 10 minutos`);
    
    // Para cada partida, verificar si ya existe en live_games
    for (const game of data || []) {
      const { data: existingGame, error: checkError } = await supabaseClient
        .from('live_games')
        .select('id')
        .eq('id', game.id)
        .maybeSingle();
      
      if (checkError) {
        console.error(`Error al verificar si la partida ${game.id} ya existe:`, checkError);
        continue;
      }
      
      // Si no existe, crear un registro en live_games con estado "waiting"
      if (!existingGame) {
        // Calcular el tiempo de espera: tiempo hasta la fecha programada en segundos
        const scheduledTime = new Date(game.date).getTime();
        const currentTime = Date.now();
        const timeUntilStart = Math.max(5, Math.floor((scheduledTime - currentTime) / 1000));
        
        const { data: insertData, error: insertError } = await supabaseClient
          .from('live_games')
          .insert({
            id: game.id,
            status: 'waiting',
            current_question: 0,
            countdown: timeUntilStart,
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`Error al inicializar partida ${game.id}:`, insertError);
        } else {
          console.log(`¡Partida ${game.id} (${game.title}) inicializada con éxito! Tiempo de espera: ${timeUntilStart}s`);
        }
      } else {
        console.log(`Partida ${game.id} ya inicializada, omitiendo`);
      }
    }
    
    return { success: true, games_initialized: data?.length || 0 };
  } catch (err) {
    console.error('Error en initializeScheduledGames:', err);
    return { success: false, error: err.message };
  }
}

// 2. Inicio: Transición de partidas de 'waiting' a 'question' cuando llega la hora
async function startScheduledGames() {
  try {
    // Buscar partidas en estado "waiting" cuyo contador esté cerca de cero o haya pasado su fecha
    const { data, error } = await supabaseClient
      .from('live_games')
      .select('id, countdown, updated_at')
      .eq('status', 'waiting')
      .lte('countdown', 5); // Partidas a 5 segundos o menos de comenzar
    
    if (error) {
      console.error('Error al buscar partidas listas para iniciar:', error);
      return { success: false, error: error.message };
    }
    
    console.log(`Encontradas ${data?.length || 0} partidas listas para comenzar`);
    
    // Para cada partida, avanzar el estado y notificar
    const results = [];
    for (const game of data || []) {
      const lastUpdateTime = new Date(game.updated_at).getTime();
      const currentTime = Date.now();
      const timeSinceLastUpdate = Math.floor((currentTime - lastUpdateTime) / 1000);
      
      // Si el tiempo desde la última actualización es mayor que el countdown, avanzar
      if (timeSinceLastUpdate >= game.countdown) {
        console.log(`¡Iniciando partida ${game.id}! (Countdown: ${game.countdown}s, Tiempo desde última actualización: ${timeSinceLastUpdate}s)`);
        
        // Actualizar estado a "question"
        const { data: updateData, error: updateError } = await supabaseClient
          .from('live_games')
          .update({
            status: 'question',
            current_question: 1, // Comenzamos con la primera pregunta
            countdown: 30, // Temporizador para la primera pregunta (ajustar según necesidad)
            updated_at: new Date().toISOString()
          })
          .eq('id', game.id);
        
        if (updateError) {
          console.error(`Error al iniciar partida ${game.id}:`, updateError);
          results.push({ gameId: game.id, success: false, error: updateError.message });
        } else {
          console.log(`¡Partida ${game.id} iniciada con éxito!`);
          results.push({ gameId: game.id, success: true, newStatus: 'question' });
        }
      } else {
        console.log(`Partida ${game.id} aún no lista para iniciar (Countdown: ${game.countdown}s, Tiempo desde última actualización: ${timeSinceLastUpdate}s)`);
      }
    }
    
    return { success: true, games_started: results.length, results };
  } catch (err) {
    console.error('Error en startScheduledGames:', err);
    return { success: false, error: err.message };
  }
}

// 3. Avance automático: Transición entre estados cuando expira el tiempo
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
      
      // Para seguimiento, registrar el tiempo restante
      console.log(`Partida ${game.id} en estado ${game.status}: tiempo transcurrido ${elapsedSeconds}s / countdown ${game.countdown}s`);
      
      // Determinar si debemos avanzar el estado automáticamente
      let shouldAdvance = false;
      let nextStatus = '';
      let nextCountdown = 0;
      
      switch (game.status) {
        case 'waiting':
          if (elapsedSeconds >= game.countdown) {
            shouldAdvance = true;
            nextStatus = 'question';
            nextCountdown = 30; // Tiempo para responder la primera pregunta
            console.log(`Avanzando partida ${game.id} de "waiting" a "question"`);
          }
          break;
        
        case 'question':
          if (elapsedSeconds >= game.countdown) {
            shouldAdvance = true;
            nextStatus = 'result';
            nextCountdown = 10; // Tiempo para mostrar resultados
            console.log(`Avanzando partida ${game.id} de "question" a "result"`);
          }
          break;
        
        case 'result':
          if (elapsedSeconds >= game.countdown) {
            shouldAdvance = true;
            
            // Obtener el total de preguntas para este juego
            const { data: questionsData, error: questionsError } = await supabaseClient
              .from('questions')
              .select('position')
              .eq('game_id', game.id)
              .order('position', { ascending: false })
              .limit(1);
            
            const totalQuestions = questionsData && questionsData.length > 0 ? 
              questionsData[0].position : 10; // Default a 10 si no podemos obtener el total
            
            // Si hemos llegado a la última pregunta, ir a leaderboard final
            if (game.current_question >= totalQuestions) {
              nextStatus = 'finished';
              nextCountdown = 0;
              console.log(`Avanzando partida ${game.id} a estado final "finished"`);
            } else {
              // Si no, avanzar a la siguiente pregunta
              nextStatus = 'question';
              nextCountdown = 30; // Tiempo para la siguiente pregunta
              console.log(`Avanzando partida ${game.id} a siguiente pregunta`);
            }
          }
          break;
        
        // Para los estados "leaderboard" y "finished", no avanzamos automáticamente
        default:
          console.log(`No avanzando partida ${game.id} en estado ${game.status} automáticamente`);
      }
      
      // Si se debe avanzar, actualizar el estado
      if (shouldAdvance) {
        const updateData = {
          status: nextStatus,
          countdown: nextCountdown,
          updated_at: new Date().toISOString()
        };
        
        // Si avanzamos a una nueva pregunta, incrementar el contador de preguntas
        if (game.status === 'result' && nextStatus === 'question') {
          updateData.current_question = game.current_question + 1;
        }
        
        const { data: updateResult, error: updateError } = await supabaseClient
          .from('live_games')
          .update(updateData)
          .eq('id', game.id);
        
        if (updateError) {
          console.error(`Error al avanzar partida ${game.id}:`, updateError);
          results.push({ gameId: game.id, success: false, error: updateError.message });
        } else {
          console.log(`Partida ${game.id} avanzada correctamente de "${game.status}" a "${nextStatus}"`);
          results.push({ 
            gameId: game.id, 
            success: true, 
            previousStatus: game.status,
            newStatus: nextStatus,
            current_question: nextStatus === 'question' ? (game.status === 'result' ? game.current_question + 1 : game.current_question) : game.current_question
          });
        }
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
