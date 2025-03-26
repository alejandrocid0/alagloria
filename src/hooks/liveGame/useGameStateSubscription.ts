
import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveGameState } from '@/types/liveGame';
import { fetchGameState, subscribeToGameStateUpdates, runGameStateManager, checkScheduledGames } from './gameStateUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTimeSync } from './useTimeSync';

export const useGameStateSubscription = (gameId: string | undefined) => {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // Referencias para reconexión y verificación
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConnectionAttemptRef = useRef<number>(0);
  const reconnectAttemptsRef = useRef<number>(0);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameCheckerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastGameStateUpdateRef = useRef<number>(Date.now());
  
  // Obtenemos la función para sincronizar tiempo
  const { syncWithServer } = useTimeSync();
  
  // Fetch game state from the server
  const fetchGameStateData = useCallback(async () => {
    if (!gameId) return;

    try {
      // Sincronizar con el servidor antes de obtener el estado
      await syncWithServer();
      
      const state = await fetchGameState(gameId);
      
      if (state) {
        console.log(`Estado del juego ${gameId} obtenido:`, state);
        setGameState(state);
        setIsLoading(false);
        lastGameStateUpdateRef.current = Date.now();
        
        // Update connection state to connected if we successfully fetched the state
        if (!isConnected) {
          setIsConnected(true);
          toast({
            title: "Conexión recuperada",
            description: "Te has vuelto a conectar a la partida",
            variant: "default",
          });
          reconnectAttemptsRef.current = 0;
        }
        
        // Configurar un timer para auto-avanzar basado en el countdown
        setupAutoAdvanceTimer(state);
      } else {
        console.log(`No se encontró estado para el juego ${gameId}`);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching game state:', err);
      setError('No se pudo cargar el estado del juego');
      setIsLoading(false);
      
      // Mark as disconnected if fetch fails
      if (isConnected) {
        setIsConnected(false);
        toast({
          title: "Conexión perdida",
          description: "Intentando reconectar...",
          variant: "destructive",
        });
      }
      
      // Schedule reconnection attempt with exponential backoff
      scheduleReconnect();
    }
  }, [gameId, isConnected, syncWithServer]);

  // Configurar temporizador para avanzar automáticamente basado en el countdown
  const setupAutoAdvanceTimer = useCallback((state: LiveGameState) => {
    // Limpiar cualquier timer existente
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    
    // Solo configurar si tenemos un estado válido con countdown
    if (state && state.countdown > 0) {
      const timeElapsedSinceUpdate = (Date.now() - new Date(state.updated_at).getTime()) / 1000;
      const remainingTime = Math.max(0, state.countdown - timeElapsedSinceUpdate);
      
      console.log(`Configurando auto-avance para ${state.status} en ${remainingTime.toFixed(1)} segundos`);
      
      if (remainingTime > 0) {
        autoAdvanceTimerRef.current = setTimeout(() => {
          console.log(`Auto-avance para ${state.status} ejecutándose, verificando estado actual`);
          // Verificar el estado actual nuevamente antes de avanzar
          fetchGameStateData();
        }, remainingTime * 1000 + 500); // Añadimos 500ms de margen
      } else {
        // Si el tiempo ya pasó, verificar inmediatamente
        console.log(`El tiempo de ${state.status} ya ha pasado, verificando estado inmediatamente`);
        fetchGameStateData();
      }
    }
  }, [fetchGameStateData]);

  // Function to handle reconnection attempts with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }

    const now = Date.now();
    const timeSinceLastAttempt = now - lastConnectionAttemptRef.current;
    
    // If we've tried reconnecting recently, back off exponentially
    const baseDelay = 1000; // Start with 1 second
    const maxDelay = 30000; // Cap at 30 seconds
    const attemptsCount = reconnectAttemptsRef.current;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      baseDelay * Math.pow(1.5, attemptsCount),
      maxDelay
    );
    
    console.log(`Programando reconexión en ${delay}ms (intento ${reconnectAttemptsRef.current + 1})`);
    
    // Schedule reconnection
    reconnectTimerRef.current = setTimeout(() => {
      lastConnectionAttemptRef.current = Date.now();
      reconnectAttemptsRef.current += 1;
      console.log(`Intento de reconexión ${reconnectAttemptsRef.current} después de ${delay}ms`);
      
      // Attempt to fetch data and reestablish subscriptions
      fetchGameStateData();
    }, delay);
  }, [fetchGameStateData]);

  // Handle game state changes
  const handleGameStateChange = useCallback((payload: any) => {
    console.log('Cambio en el estado del juego detectado:', payload);
    
    // Actualizar referencia de último cambio
    lastGameStateUpdateRef.current = Date.now();
    
    // Sincronizar con el servidor antes de obtener el nuevo estado
    syncWithServer().then(() => {
      fetchGameStateData();
    });
  }, [fetchGameStateData, syncWithServer]);

  // Initialize periodic check for game state
  const initializeGameChecker = useCallback(() => {
    if (gameCheckerIntervalRef.current) {
      clearInterval(gameCheckerIntervalRef.current);
    }
    
    console.log('Inicializando verificador periódico de estado de juego...');
    
    // Check immediately
    runGameStateManager()
      .then(result => console.log('Resultado de verificación inicial:', result))
      .catch(err => console.error('Error en verificación inicial:', err));
    
    checkScheduledGames()
      .then(result => console.log('Resultado de verificación de partidas programadas:', result))
      .catch(err => console.error('Error en verificación de partidas programadas:', err));
    
    // Set up periodic check (every 30 seconds)
    gameCheckerIntervalRef.current = setInterval(() => {
      console.log('Ejecutando verificación periódica de estado de juego...');
      
      // Solo ejecutar si hay un gameId
      if (gameId) {
        runGameStateManager().catch(err => console.error('Error en verificación periódica:', err));
        checkScheduledGames().catch(err => console.error('Error en verificación periódica de partidas programadas:', err));
      }
    }, 30000); // 30 seconds
    
    return () => {
      if (gameCheckerIntervalRef.current) {
        clearInterval(gameCheckerIntervalRef.current);
        gameCheckerIntervalRef.current = null;
      }
    };
  }, [gameId]);

  // Verificar si no hay actualizaciones por un tiempo prolongado
  useEffect(() => {
    // Crear un intervalo para verificar si no hay actualizaciones recientes
    const staleCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastGameStateUpdateRef.current;
      
      // Si han pasado más de 45 segundos sin actualizaciones y estamos conectados
      if (timeSinceLastUpdate > 45000 && isConnected && gameState) {
        console.log(`No hay actualizaciones desde hace ${Math.floor(timeSinceLastUpdate / 1000)}s, verificando estado del juego`);
        
        // Verificar nuevamente el estado del juego
        fetchGameStateData();
      }
    }, 15000); // Verificar cada 15 segundos
    
    return () => clearInterval(staleCheckInterval);
  }, [isConnected, gameState, fetchGameStateData]);

  // Set up subscriptions for real-time updates
  useEffect(() => {
    let gameStateChannel: any = null;
    
    if (gameId) {
      console.log(`Suscribiendo a actualizaciones para el juego ${gameId}`);
      gameStateChannel = subscribeToGameStateUpdates(gameId, handleGameStateChange);
      
      // Fetch initial state
      fetchGameStateData();
      
      // Initialize game checker
      const cleanupGameChecker = initializeGameChecker();
      
      return () => {
        console.log(`Cancelando suscripción para el juego ${gameId}`);
        if (gameStateChannel) supabase.removeChannel(gameStateChannel);
        
        // Clean up game checker
        cleanupGameChecker();
        
        // Clear any auto-advance timer
        if (autoAdvanceTimerRef.current) {
          clearTimeout(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }
        
        // Clear reconnect timer
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };
    }
    
    return () => {
      if (gameStateChannel) supabase.removeChannel(gameStateChannel);
    };
  }, [gameId, handleGameStateChange, fetchGameStateData, initializeGameChecker]);

  return {
    gameState,
    isLoading,
    error,
    isConnected,
    fetchGameStateData,
    scheduleReconnect,
    reconnectAttempts: reconnectAttemptsRef.current
  };
};
