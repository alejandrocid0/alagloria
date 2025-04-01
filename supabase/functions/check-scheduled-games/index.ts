
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Checking for scheduled games...');

    // Get current server time
    const now = new Date();
    
    // 1. Initialize live_games for games that are about to start (5 min window)
    // We'll find games scheduled to start within the next 10 minutes that don't have a live_game entry yet
    const { data: upcomingGames, error: upcomingError } = await supabaseClient
      .from('games')
      .select('id, date, title')
      .gte('date', new Date(now.getTime() - 5 * 60 * 1000).toISOString()) // Games that started up to 5 minutes ago
      .lte('date', new Date(now.getTime() + 10 * 60 * 1000).toISOString()) // Games starting in the next 10 minutes
      .order('date', { ascending: true });
    
    if (upcomingError) {
      console.error('Error fetching upcoming games:', upcomingError);
      throw upcomingError;
    }
    
    console.log(`Found ${upcomingGames?.length || 0} games scheduled for the next 10 minutes`);
    
    // For each upcoming game, ensure it has a live_game entry and is initialized correctly
    if (upcomingGames) {
      for (const game of upcomingGames) {
        // Check if game already has a live_game entry
        const { data: liveGame, error: liveGameError } = await supabaseClient
          .from('live_games')
          .select('id, status')
          .eq('id', game.id)
          .single();
        
        if (liveGameError && liveGameError.code !== 'PGRST116') { // Not found error is ok here
          console.error(`Error checking live game for ${game.id}:`, liveGameError);
          continue;
        }
        
        // If game doesn't have a live_game entry, create one in 'waiting' status
        if (!liveGame) {
          const gameTime = new Date(game.date);
          const diffInSeconds = Math.round((gameTime.getTime() - now.getTime()) / 1000);
          
          // Only create new live_game if it's in the future (safety check)
          if (diffInSeconds > -30) { // Allow small buffer for clock differences
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
              console.log(`Initialized new live game for "${game.title}" with ${diffInSeconds} seconds countdown`);
            }
          } else {
            console.log(`Game ${game.id} already started, initializing directly`);
            
            // If game should have already started, create it in 'question' state directly
            const { error: createError } = await supabaseClient
              .from('live_games')
              .insert({
                id: game.id,
                status: 'question',
                countdown: 20, // Standard time for first question
                current_question: 0,
                started_at: now.toISOString(),
                updated_at: now.toISOString()
              });
            
            if (createError) {
              console.error(`Error creating live game for ${game.id}:`, createError);
            } else {
              console.log(`Game ${game.id} started directly in question state`);
            }
          }
        } else {
          console.log(`Game ${game.id} already initialized, skipping`);
        }
      }
    }
    
    // 2. Find games that need to be started because their scheduled time has arrived
    const { data: readyGames, error: readyError } = await supabaseClient
      .from('live_games')
      .select('id, countdown')
      .eq('status', 'waiting');
    
    if (readyError) {
      console.error('Error fetching ready games:', readyError);
    }
    
    console.log(`Found ${readyGames?.length || 0} games ready to start`);
    
    const transitionedGames = [];
    
    // Process games in waiting status
    if (readyGames) {
      for (const game of readyGames) {
        // Get the scheduled time from the games table to be more precise
        const { data: gameData, error: gameError } = await supabaseClient
          .from('games')
          .select('date')
          .eq('id', game.id)
          .single();
        
        if (gameError) {
          console.error(`Error getting scheduled time for game ${game.id}:`, gameError);
          continue;
        }
        
        const scheduledTime = new Date(gameData.date);
        const currentTime = new Date();
        
        // Calculate time difference in seconds
        const diffInSeconds = Math.round((scheduledTime.getTime() - currentTime.getTime()) / 1000);
        
        // If it's time to start the game (0 or negative difference)
        if (diffInSeconds <= 0) {
          console.log(`Game ${game.id} scheduled time has arrived, starting game...`);
          
          // Transition to question state
          const { error: updateError } = await supabaseClient
            .from('live_games')
            .update({
              status: 'question',
              current_question: 0,
              countdown: 20, // Standard time for first question
              updated_at: currentTime.toISOString()
            })
            .eq('id', game.id);
          
          if (updateError) {
            console.error(`Error starting game ${game.id}:`, updateError);
          } else {
            transitionedGames.push(game.id);
            console.log(`Game ${game.id} successfully transitioned to question state`);
          }
        } else {
          // Update countdown to be more accurate (based on actual scheduled time)
          const { error: countdownError } = await supabaseClient
            .from('live_games')
            .update({
              countdown: diffInSeconds,
              updated_at: currentTime.toISOString()
            })
            .eq('id', game.id);
          
          if (countdownError) {
            console.error(`Error updating countdown for game ${game.id}:`, countdownError);
          } else {
            console.log(`Updated countdown for game ${game.id} to ${diffInSeconds} seconds`);
          }
        }
      }
    }
    
    // 3. Auto-advance active games (if needed)
    const { data: activeGames, error: activeError } = await supabaseClient
      .from('live_games')
      .select('id, status, countdown, current_question')
      .in('status', ['question', 'result', 'leaderboard'])
      .order('updated_at', { ascending: true });
    
    if (activeError) {
      console.error('Error fetching active games:', activeError);
    }
    
    console.log(`Checking ${activeGames?.length || 0} active games for auto-advancement`);
    
    if (activeGames) {
      for (const game of activeGames) {
        // If countdown has expired, advance the game state
        if (game.countdown <= 0) {
          let nextStatus;
          let nextCountdown;
          let nextQuestion = game.current_question;
          
          // Determine next state based on current state
          if (game.status === 'question') {
            nextStatus = 'result';
            nextCountdown = 10; // Show results for 10 seconds
          } else if (game.status === 'result') {
            nextStatus = 'leaderboard';
            nextCountdown = 10; // Show leaderboard for 10 seconds
          } else if (game.status === 'leaderboard') {
            // Get total number of questions for this game
            const { data: questionsData, error: questionsError } = await supabaseClient
              .from('questions')
              .select('id')
              .eq('game_id', game.id)
              .order('position', { ascending: true });
            
            if (questionsError) {
              console.error(`Error fetching questions for game ${game.id}:`, questionsError);
              continue;
            }
            
            // Check if there are more questions
            if (questionsData && game.current_question < questionsData.length - 1) {
              nextStatus = 'question';
              nextQuestion = game.current_question + 1;
              nextCountdown = 20; // Standard time for questions
            } else {
              nextStatus = 'finished';
              nextCountdown = 0;
            }
          }
          
          // Update game state
          if (nextStatus) {
            const { error: updateError } = await supabaseClient
              .from('live_games')
              .update({
                status: nextStatus,
                current_question: nextQuestion,
                countdown: nextCountdown,
                updated_at: new Date().toISOString()
              })
              .eq('id', game.id);
            
            if (updateError) {
              console.error(`Error advancing game ${game.id}:`, updateError);
            } else {
              console.log(`Advanced game ${game.id} from ${game.status} to ${nextStatus}`);
            }
          }
        } else {
          // Decrement countdown
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
      }
    }

    // Return summary of actions taken
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Scheduled games check completed',
        transitioned_games: transitionedGames,
        waiting_games: readyGames?.length || 0,
        active_games: activeGames?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});
