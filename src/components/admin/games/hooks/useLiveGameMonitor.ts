
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { advanceGameState, startGame, fetchGameState } from '@/hooks/liveGame/gameStateUtils';
import { LiveGameState } from '@/types/liveGame';

export const useLiveGameMonitor = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playersCount, setPlayersCount] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isAdminLoaded, setIsAdminLoaded] = useState(false);

  // Fetch game state
  const loadGameState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      setLoading(true);
      const state = await fetchGameState(gameId);
      
      if (state) {
        setGameState(state);
        setLastUpdate(new Date());
      } else {
        setError('No se encontró la partida');
      }
    } catch (err) {
      console.error('Error loading game state:', err);
      setError('Error al cargar el estado de la partida');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Load player count
  const loadPlayersCount = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { count, error } = await supabase
        .from('game_participants')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', gameId);
      
      if (error) throw error;
      setPlayersCount(count || 0);
    } catch (err) {
      console.error('Error loading players count:', err);
    }
  }, [gameId]);

  // Load answer count
  const loadAnswersCount = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { count, error } = await supabase
        .from('live_game_answers')
        .select('*', { count: 'exact', head: true })
        .eq('game_id', gameId);
      
      if (error) throw error;
      setAnswersCount(count || 0);
    } catch (err) {
      console.error('Error loading answers count:', err);
    }
  }, [gameId]);

  // Handler for starting the game
  const handleStartGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      await startGame(gameId);
      toast({
        title: "Partida iniciada",
        description: "La partida se ha iniciado correctamente.",
      });
      loadGameState();
    } catch (err) {
      console.error('Error starting game:', err);
      toast({
        title: "Error al iniciar la partida",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [gameId, loadGameState]);

  // Handler for advancing game state
  const handleAdvanceState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      await advanceGameState(gameId);
      toast({
        title: "Estado avanzado",
        description: "El estado de la partida se ha avanzado correctamente.",
      });
      loadGameState();
    } catch (err) {
      console.error('Error advancing game state:', err);
      toast({
        title: "Error al avanzar el estado",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [gameId, loadGameState]);

  // Handler for forcing a specific state
  const handleForceState = useCallback(async (state: "waiting" | "question" | "result" | "leaderboard" | "finished") => {
    if (!gameId) return;
    
    try {
      await advanceGameState(gameId, state);
      toast({
        title: "Estado forzado",
        description: `La partida se ha movido al estado "${state}".`,
      });
      loadGameState();
    } catch (err) {
      console.error('Error forcing game state:', err);
      toast({
        title: "Error al forzar el estado",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    }
  }, [gameId, loadGameState]);

  // Subscribe to game changes
  useEffect(() => {
    if (!gameId) return;
    
    loadGameState();
    loadPlayersCount();
    loadAnswersCount();
    
    // Subscribe to game state changes
    const gameSubscription = supabase
      .channel(`game-monitor-${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        payload => {
          console.log('Game state changed:', payload);
          loadGameState();
        }
      )
      .subscribe();
    
    // Subscribe to participants changes
    const participantsSubscription = supabase
      .channel(`participants-monitor-${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        },
        payload => {
          console.log('Participants changed:', payload);
          loadPlayersCount();
        }
      )
      .subscribe();
    
    // Subscribe to answers changes
    const answersSubscription = supabase
      .channel(`answers-monitor-${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_game_answers',
          filter: `game_id=eq.${gameId}`
        },
        payload => {
          console.log('Answers changed:', payload);
          loadAnswersCount();
        }
      )
      .subscribe();
    
    // Check admin status
    const checkAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          setIsAdminLoaded(data?.is_admin || false);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setIsAdminLoaded(false);
      }
    };
    
    checkAdmin();
    
    // Set up refresh interval
    const intervalId = setInterval(() => {
      loadGameState();
      loadPlayersCount();
      loadAnswersCount();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(gameSubscription);
      supabase.removeChannel(participantsSubscription);
      supabase.removeChannel(answersSubscription);
    };
  }, [gameId, loadGameState, loadPlayersCount, loadAnswersCount]);

  return {
    gameState,
    loading,
    error,
    playersCount,
    answersCount,
    lastUpdate,
    isAdminLoaded,
    loadGameState,
    handleStartGame,
    handleAdvanceState,
    handleForceState
  };
};
