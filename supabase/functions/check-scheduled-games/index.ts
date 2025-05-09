
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Initialize games that are about to start
async function initializeUpcomingGames(now: Date) {
  console.log('Checking for games to initialize...');
  
  // Búsqueda ampliada para cubrir también juegos cuya hora de inicio ya ha pasado 
  // pero que podrían no haberse inicializado correctamente
  const { data: upcomingGames, error: upcomingError } = await supabaseClient
    .from('games')
    .select('id, date, title, auto_start')
    .or(`and(date.gte.${new Date(now.getTime() - 15 * 60 * 1000).toISOString()},date.lte.${new Date(now.getTime() + 15 * 60 * 1000).toISOString()}),and(date.lt.${now.toISOString()},auto_start.eq.true)`)
    .order('date', { ascending: true });
  
  if (upcomingError) {
    console.error('Error fetching upcoming games:', upcomingError);
    throw upcomingError;
  }
  
  console.log(`Found ${upcomingGames?.length || 0} games scheduled for processing`);
  
  for (const game of upcomingGames || []) {
    await initializeSingleGame(game, now);
  }
  
  return upcomingGames?.length || 0;
}

// Initialize a single game
async function initializeSingleGame(game: any, now: Date) {
  try {
    const { data: liveGame, error: liveGameError } = await supabaseClient
      .from('live_games')
      .select('id, status')
      .eq('id', game.id)
      .single();
    
    if (liveGameError && liveGameError.code !== 'PGRST116') {
      console.error(`Error checking live game for ${game.id}:`, liveGameError);
      return;
    }
    
    if (!liveGame) {
      await createLiveGameEntry(game, now);
    } else if (liveGame.status === 'waiting') {
      // Si ya existe pero está en espera, verificar si debe actualizarse
      // Por ejemplo, si la hora programada ya pasó y tiene auto_start=true
      const gameTime = new Date(game.date);
      if (now >= gameTime && game.auto_start === true) {
        console.log(`Game ${game.id} should have started (auto_start=true, scheduled time passed), updating...`);
        await transitionGameToQuestion({ id: game.id });
      }
    } else {
      console.log(`Game ${game.id} already initialized with status ${liveGame.status}, skipping`);
    }
  } catch (err) {
    console.error(`Error initializing game ${game.id}:`, err);
  }
}

// Create a new live game entry
async function createLiveGameEntry(game: any, now: Date) {
  const gameTime = new Date(game.date);
  const diffInSeconds = Math.round((gameTime.getTime() - now.getTime()) / 1000);
  
  // Verificar si la partida debe iniciarse automáticamente
  const shouldAutoStart = game.auto_start === true;
  
  // Solo iniciar en estado 'question' si:
  // 1. La hora programada ya ha pasado
  // 2. La partida está configurada para iniciar automáticamente
  if (diffInSeconds <= 0 && shouldAutoStart) {
    const { error: createError } = await supabaseClient
      .from('live_games')
      .insert({
        id: game.id,
        status: 'question',  // Iniciar en estado 'question'
        countdown: 20,       // Tiempo estándar para la primera pregunta
        current_question: 0, // Comenzando en la primera pregunta
        started_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    
    if (createError) {
      console.error(`Error creating live game for ${game.id}:`, createError);
    } else {
      console.log(`Game ${game.id} started directly in question state (auto_start=true)`);
    }
  } else {
    // En todos los demás casos, iniciar en estado 'waiting'
    // Incluso si la hora ha pasado pero no está configurado para inicio automático
    const { error: createError } = await supabaseClient
      .from('live_games')
      .insert({
        id: game.id,
        status: 'waiting',
        countdown: Math.max(0, diffInSeconds),
        current_question: 0,
        started_at: now.toISOString(),
        updated_at: now.toISOString()
      });
    
    if (createError) {
      console.error(`Error creating live game for ${game.id}:`, createError);
    } else {
      console.log(`Initialized new live game "${game.title}" with ${diffInSeconds} seconds countdown (auto_start=${shouldAutoStart})`);
    }
  }
}

// Process games in waiting status
async function processWaitingGames() {
  console.log('Processing games in waiting status...');
  
  const { data: readyGames, error: readyError } = await supabaseClient
    .from('live_games')
    .select('id, countdown')
    .eq('status', 'waiting');
  
  if (readyError) {
    console.error('Error fetching ready games:', readyError);
    return [];
  }
  
  console.log(`Found ${readyGames?.length || 0} games in waiting status`);
  
  const transitionedGames = [];
  
  for (const game of readyGames || []) {
    if (await shouldStartGame(game)) {
      if (await transitionGameToQuestion(game)) {
        transitionedGames.push(game.id);
      }
    }
  }
  
  return transitionedGames;
}

// Check if a game should start
async function shouldStartGame(game: any): Promise<boolean> {
  const { data: gameData, error: gameError } = await supabaseClient
    .from('games')
    .select('date, auto_start')
    .eq('id', game.id)
    .single();
  
  if (gameError) {
    console.error(`Error getting scheduled time for game ${game.id}:`, gameError);
    return false;
  }
  
  // Verificar si la partida tiene habilitado el inicio automático
  const shouldAutoStart = gameData.auto_start === true;
  
  // Verificar si ha llegado la hora programada
  const scheduledTime = new Date(gameData.date);
  const currentTime = new Date();
  const diffInSeconds = Math.round((scheduledTime.getTime() - currentTime.getTime()) / 1000);
  const timeHasCome = diffInSeconds <= 0;
  
  console.log(`Game ${game.id} check: scheduled=${scheduledTime.toISOString()}, auto_start=${shouldAutoStart}, time has come=${timeHasCome}`);
  
  // Solo iniciar automáticamente si auto_start=true y ha llegado la hora
  return shouldAutoStart && timeHasCome;
}

// Transition a game to question state
async function transitionGameToQuestion(game: any): Promise<boolean> {
  console.log(`Transitioning game ${game.id} to question state...`);
  
  const { error: updateError } = await supabaseClient
    .from('live_games')
    .update({
      status: 'question',
      current_question: 0,
      countdown: 20,
      updated_at: new Date().toISOString()
    })
    .eq('id', game.id);
  
  if (updateError) {
    console.error(`Error transitioning game ${game.id}:`, updateError);
    return false;
  }
  
  console.log(`Successfully transitioned game ${game.id} to question state`);
  return true;
}

// Process active games
async function processActiveGames() {
  console.log('Processing active games...');
  
  const { data: activeGames, error: activeError } = await supabaseClient
    .from('live_games')
    .select('id, status, countdown, current_question')
    .in('status', ['question', 'result', 'leaderboard'])
    .order('updated_at', { ascending: true });
  
  if (activeError) {
    console.error('Error fetching active games:', activeError);
    return;
  }
  
  console.log(`Processing ${activeGames?.length || 0} active games`);
  
  for (const game of activeGames || []) {
    await updateGameState(game);
  }
}

// Update game state based on countdown and current state
async function updateGameState(game: any) {
  if (game.countdown <= 0) {
    const nextState = await determineNextState(game);
    if (nextState) {
      await transitionGameState(game, nextState);
    }
  } else {
    await decrementCountdown(game);
  }
}

// Determine the next state for a game
async function determineNextState(game: any) {
  if (game.status === 'question') {
    return { status: 'result', countdown: 10 };
  } else if (game.status === 'result') {
    return { status: 'leaderboard', countdown: 10 };
  } else if (game.status === 'leaderboard') {
    const hasMoreQuestions = await checkForMoreQuestions(game);
    return hasMoreQuestions
      ? { status: 'question', countdown: 20, incrementQuestion: true }
      : { status: 'finished', countdown: 0 };
  }
}

// Check if there are more questions
async function checkForMoreQuestions(game: any) {
  const { data: questionsData, error: questionsError } = await supabaseClient
    .from('questions')
    .select('id')
    .eq('game_id', game.id)
    .order('position', { ascending: true });
  
  if (questionsError) {
    console.error(`Error fetching questions for game ${game.id}:`, questionsError);
    return false;
  }
  
  return questionsData && game.current_question < questionsData.length - 1;
}

// Transition game to new state
async function transitionGameState(game: any, nextState: any) {
  const updateData = {
    status: nextState.status,
    countdown: nextState.countdown,
    current_question: nextState.incrementQuestion ? game.current_question + 1 : game.current_question,
    updated_at: new Date().toISOString()
  };
  
  const { error: updateError } = await supabaseClient
    .from('live_games')
    .update(updateData)
    .eq('id', game.id);
  
  if (updateError) {
    console.error(`Error updating game ${game.id}:`, updateError);
  } else {
    console.log(`Updated game ${game.id} to ${nextState.status} state`);
  }
}

// Decrement countdown for a game
async function decrementCountdown(game: any) {
  const { error: countdownError } = await supabaseClient
    .from('live_games')
    .update({
      countdown: game.countdown - 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', game.id);
  
  if (countdownError) {
    console.error(`Error updating countdown for game ${game.id}:`, countdownError);
  }
}

// Main handler function
Deno.serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log('Starting scheduled games check...');
    const now = new Date();
    
    // Process each type of game
    const initializedCount = await initializeUpcomingGames(now);
    const transitionedGames = await processWaitingGames();
    await processActiveGames();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scheduled games check completed',
        initialized_games: initializedCount,
        transitioned_games: transitionedGames.length,
        timestamp: now.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: err.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
