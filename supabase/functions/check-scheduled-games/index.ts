
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

    // Call the database function to activate scheduled games
    const { data, error } = await supabaseClient.rpc('check_scheduled_games');

    if (error) {
      console.error('Error checking scheduled games:', error);
      return new Response(
        JSON.stringify({ error: 'Error checking scheduled games' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
          status: 500 
        }
      );
    }

    // Get all active games in waiting state
    const { data: waitingGames, error: waitingError } = await supabaseClient
      .from('live_games')
      .select('id, countdown')
      .eq('status', 'waiting');
    
    if (waitingError) {
      console.error('Error fetching waiting games:', waitingError);
    }

    // Process any games that should transition out of waiting
    const transitionedGames = [];
    
    if (waitingGames) {
      console.log(`Found ${waitingGames.length} games in waiting state`);
      
      for (const game of waitingGames) {
        // If countdown is 0 or less, transition to question state
        if (game.countdown <= 0) {
          console.log(`Game ${game.id} countdown reached zero, starting game...`);
          
          const { error: updateError } = await supabaseClient
            .from('live_games')
            .update({
              status: 'question',
              current_question: 0,
              countdown: 20, // Standard time for questions
              updated_at: new Date().toISOString()
            })
            .eq('id', game.id);
          
          if (updateError) {
            console.error(`Error starting game ${game.id}:`, updateError);
          } else {
            transitionedGames.push(game.id);
          }
        } else {
          // Decrement countdown
          const { error: countdownError } = await supabaseClient
            .from('live_games')
            .update({
              countdown: game.countdown - 10, // Reduce by 10 seconds per check (adjust as needed)
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
        waiting_games: waitingGames?.length || 0
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
