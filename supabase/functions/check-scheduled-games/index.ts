import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.2.0'

// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting scheduled games check...')
    
    // Run all scheduled tasks
    const results = await runScheduledGamesTasks()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Scheduled games check completed',
        results
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: err.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})

/**
 * Run all scheduled game tasks and return the combined results
 */
async function runScheduledGamesTasks() {
  // 1. Initialize upcoming games
  const initResults = await initializeScheduledGames()
  
  // 2. Start games ready to begin
  const startResults = await startScheduledGames()
  
  // 3. Auto-advance active games
  const advanceResults = await checkAutoAdvanceGames()
  
  return {
    games_initialized: initResults,
    games_started: startResults,
    games_advanced: advanceResults
  }
}

/**
 * Initialize new live_game records for upcoming scheduled games
 */
async function initializeScheduledGames() {
  try {
    // Find games scheduled in the next 10 minutes not yet in live_games
    const nowPlus10Min = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const now = new Date().toISOString()
    
    const { data, error } = await supabaseClient
      .from('games')
      .select('id, title, date')
      .gte('date', now)
      .lte('date', nowPlus10Min)
      .order('date', { ascending: true })
    
    if (error) {
      console.error('Error finding scheduled games:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`Found ${data?.length || 0} games scheduled for the next 10 minutes`)
    
    const results = []
    
    // Process each game
    for (const game of data || []) {
      // Check if game already exists in live_games
      const { data: existingGame, error: checkError } = await supabaseClient
        .from('live_games')
        .select('id')
        .eq('id', game.id)
        .maybeSingle()
      
      if (checkError) {
        console.error(`Error checking if game ${game.id} exists:`, checkError)
        results.push({ gameId: game.id, success: false, error: checkError.message })
        continue
      }
      
      // If game doesn't exist, create it in live_games with "waiting" status
      if (!existingGame) {
        const scheduledTime = new Date(game.date).getTime()
        const currentTime = Date.now()
        const timeUntilStart = Math.max(5, Math.floor((scheduledTime - currentTime) / 1000))
        
        const { error: insertError } = await supabaseClient
          .from('live_games')
          .insert({
            id: game.id,
            status: 'waiting',
            current_question: 0,
            countdown: timeUntilStart,
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error(`Error initializing game ${game.id}:`, insertError)
          results.push({ gameId: game.id, success: false, error: insertError.message })
        } else {
          console.log(`Game ${game.id} (${game.title}) initialized successfully! Wait time: ${timeUntilStart}s`)
          results.push({ gameId: game.id, success: true, action: 'initialized', countdown: timeUntilStart })
        }
      } else {
        console.log(`Game ${game.id} already initialized, skipping`)
        results.push({ gameId: game.id, success: true, action: 'skipped', reason: 'already_initialized' })
      }
    }
    
    return { success: true, games_processed: data?.length || 0, results }
  } catch (err) {
    console.error('Error in initializeScheduledGames:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Transition games from 'waiting' to 'question' when it's time to start
 */
async function startScheduledGames() {
  try {
    // Find games in "waiting" state with countdown near zero
    const { data, error } = await supabaseClient
      .from('live_games')
      .select('id, countdown, updated_at')
      .eq('status', 'waiting')
      .lte('countdown', 5) // Games within 5 seconds of starting
    
    if (error) {
      console.error('Error finding games ready to start:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`Found ${data?.length || 0} games ready to start`)
    
    const results = []
    
    // Process each game
    for (const game of data || []) {
      const lastUpdateTime = new Date(game.updated_at).getTime()
      const currentTime = Date.now()
      const timeSinceLastUpdate = Math.floor((currentTime - lastUpdateTime) / 1000)
      
      // If time since last update is greater than countdown, advance the game
      if (timeSinceLastUpdate >= game.countdown) {
        console.log(`Starting game ${game.id}! (Countdown: ${game.countdown}s, Time since last update: ${timeSinceLastUpdate}s)`)
        
        // Verificar que la fecha programada realmente ha llegado
        const { data: gameData, error: gameError } = await supabaseClient
          .from('games')
          .select('date')
          .eq('id', game.id)
          .single()
          
        if (gameError) {
          console.error(`Error checking date for game ${game.id}:`, gameError)
          results.push({ gameId: game.id, success: false, error: gameError.message })
          continue
        }
        
        const scheduledTime = new Date(gameData.date).getTime()
        const isTimeToStart = currentTime >= scheduledTime
        
        if (!isTimeToStart) {
          console.log(`Game ${game.id} countdown expired but scheduled time (${new Date(scheduledTime).toISOString()}) has not arrived yet`)
          results.push({ 
            gameId: game.id, 
            success: true, 
            action: 'skipped', 
            reason: 'scheduled_time_not_reached' 
          })
          continue
        }
        
        // Update status to "question"
        const { error: updateError } = await supabaseClient
          .from('live_games')
          .update({
            status: 'question',
            current_question: 1, // Start with first question
            countdown: 30, // Timer for first question (adjust as needed)
            updated_at: new Date().toISOString()
          })
          .eq('id', game.id)
        
        if (updateError) {
          console.error(`Error starting game ${game.id}:`, updateError)
          results.push({ gameId: game.id, success: false, error: updateError.message })
        } else {
          console.log(`Game ${game.id} started successfully!`)
          results.push({ gameId: game.id, success: true, newStatus: 'question' })
        }
      } else {
        console.log(`Game ${game.id} not ready to start yet (Countdown: ${game.countdown}s, Time since last update: ${timeSinceLastUpdate}s)`)
        results.push({ 
          gameId: game.id, 
          success: true, 
          action: 'skipped', 
          reason: 'countdown_not_expired',
          countdown: game.countdown,
          timeSinceUpdate: timeSinceLastUpdate
        })
      }
    }
    
    return { success: true, games_processed: results.length, results }
  } catch (err) {
    console.error('Error in startScheduledGames:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Auto-advance games between states when time expires
 */
async function checkAutoAdvanceGames() {
  try {
    // Get all active (non-finished) games
    const { data, error } = await supabaseClient
      .from('live_games')
      .select('id, status, current_question, countdown, updated_at')
      .not('status', 'eq', 'finished')
    
    if (error) {
      console.error('Error getting active games:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`Checking ${data?.length || 0} active games for auto-advancement`)
    
    const results = []
    
    // Process each game
    for (const game of data || []) {
      const now = new Date()
      const lastUpdate = new Date(game.updated_at)
      const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000)
      
      console.log(`Game ${game.id} in state ${game.status}: time elapsed ${elapsedSeconds}s / countdown ${game.countdown}s`)
      
      // Check if we should auto-advance the game state
      const advanceResult = await processGameAdvancement(game, elapsedSeconds)
      if (advanceResult) {
        results.push(advanceResult)
      }
    }
    
    return {
      success: true,
      games_checked: data?.length || 0,
      advanced_games: results.filter(r => r.success).length,
      results
    }
  } catch (err) {
    console.error('Error checking games for auto-advancement:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Process game advancement based on current state and elapsed time
 */
async function processGameAdvancement(game, elapsedSeconds) {
  // If countdown hasn't expired, skip
  if (elapsedSeconds < game.countdown) {
    return null
  }
  
  let nextState = {
    status: '',
    countdown: 0,
    current_question: game.current_question
  }
  
  // Determine next state based on current state
  switch (game.status) {
    case 'waiting':
      // Verificar que la fecha programada realmente ha llegado
      const { data: gameData, error: gameError } = await supabaseClient
        .from('games')
        .select('date')
        .eq('id', game.id)
        .single()
        
      if (gameError) {
        console.error(`Error checking date for game ${game.id}:`, gameError)
        return { gameId: game.id, success: false, error: gameError.message }
      }
      
      const scheduledTime = new Date(gameData.date).getTime()
      const currentTime = Date.now()
      const isTimeToStart = currentTime >= scheduledTime
      
      if (!isTimeToStart) {
        console.log(`Game ${game.id} countdown expired but scheduled time (${new Date(scheduledTime).toISOString()}) has not arrived yet`)
        return null
      }
      
      nextState.status = 'question'
      nextState.countdown = 30
      console.log(`Advancing game ${game.id} from "waiting" to "question"`)
      break
      
    case 'question':
      nextState.status = 'result'
      nextState.countdown = 10
      console.log(`Advancing game ${game.id} from "question" to "result"`)
      break
      
    case 'result':
      // Get total questions for this game
      const { data: questionsData, error: questionsError } = await supabaseClient
        .from('questions')
        .select('position')
        .eq('game_id', game.id)
        .order('position', { ascending: false })
        .limit(1)
      
      if (questionsError) {
        console.error(`Error getting questions for game ${game.id}:`, questionsError)
        return { gameId: game.id, success: false, error: questionsError.message }
      }
      
      const totalQuestions = questionsData && questionsData.length > 0 ? 
        questionsData[0].position : 10 // Default to 10 if can't get total
      
      nextState.status = 'leaderboard'
      nextState.countdown = 8
      console.log(`Advancing game ${game.id} from "result" to "leaderboard"`)
      break
      
    case 'leaderboard':
      // Get total questions for this game
      const { data: questionsData2, error: questionsError2 } = await supabaseClient
        .from('questions')
        .select('position')
        .eq('game_id', game.id)
        .order('position', { ascending: false })
        .limit(1)
      
      if (questionsError2) {
        console.error(`Error getting questions for game ${game.id}:`, questionsError2)
        return { gameId: game.id, success: false, error: questionsError2.message }
      }
      
      const totalQuestions2 = questionsData2 && questionsData2.length > 0 ? 
        questionsData2[0].position : 10
      
      // If we've reached the last question, go to finished state
      if (game.current_question >= totalQuestions2) {
        nextState.status = 'finished'
        nextState.countdown = 0
        console.log(`Advancing game ${game.id} to final "finished" state`)
      } else {
        // Otherwise, advance to next question
        nextState.status = 'question'
        nextState.countdown = 30
        nextState.current_question = game.current_question + 1
        console.log(`Advancing game ${game.id} to next question (${nextState.current_question})`)
      }
      break
      
    default:
      console.log(`Not auto-advancing game ${game.id} in state ${game.status}`)
      return null
  }
  
  // Update game with new state
  const updateData = {
    status: nextState.status,
    countdown: nextState.countdown,
    current_question: nextState.current_question,
    updated_at: new Date().toISOString()
  }
  
  const { error: updateError } = await supabaseClient
    .from('live_games')
    .update(updateData)
    .eq('id', game.id)
  
  if (updateError) {
    console.error(`Error advancing game ${game.id}:`, updateError)
    return { gameId: game.id, success: false, error: updateError.message }
  }
  
  console.log(`Game ${game.id} successfully advanced from "${game.status}" to "${nextState.status}"`)
  return { 
    gameId: game.id, 
    success: true, 
    previousStatus: game.status,
    newStatus: nextState.status,
    current_question: nextState.current_question
  }
}
