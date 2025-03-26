
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw, Play, FastForward, Wifi, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LiveGameState } from '@/types/liveGame';
import { advanceGameState, startGame, fetchGameState } from '@/hooks/liveGame/gameStateUtils';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const LiveGameMonitor: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playersCount, setPlayersCount] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isAdminLoaded, setIsAdminLoaded] = useState(false);

  // Fetch game state
  const loadGameState = async () => {
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
  };

  // Load player count
  const loadPlayersCount = async () => {
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
  };

  // Load answer count
  const loadAnswersCount = async () => {
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
  };

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
  }, [gameId]);

  // Handler for starting the game
  const handleStartGame = async () => {
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
  };

  // Handler for advancing game state
  const handleAdvanceState = async () => {
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
  };

  // Handler for forcing a specific state
  const handleForceState = async (state: "waiting" | "question" | "result" | "leaderboard" | "finished") => {
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
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monitor de Partida</CardTitle>
          <CardDescription>Cargando datos de la partida...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monitor de Partida</CardTitle>
          <CardDescription>Error al cargar la partida</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-red-600 gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={loadGameState}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Monitor de Partida</CardTitle>
            <CardDescription>
              {gameId}
              {lastUpdate && (
                <span className="ml-2 text-xs text-gray-400">
                  (Actualizado: {lastUpdate.toLocaleTimeString()})
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadGameState}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Status Indicator */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Estado:</div>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-mono",
                  gameState?.status === 'waiting' && "bg-blue-50 text-blue-600 border-blue-200",
                  gameState?.status === 'question' && "bg-yellow-50 text-yellow-600 border-yellow-200",
                  gameState?.status === 'result' && "bg-purple-50 text-purple-600 border-purple-200",
                  gameState?.status === 'leaderboard' && "bg-green-50 text-green-600 border-green-200",
                  gameState?.status === 'finished' && "bg-gray-50 text-gray-600 border-gray-200"
                )}
              >
                {gameState?.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Pregunta:</div>
              <Badge variant="secondary" className="font-mono">
                {gameState?.current_question ?? 0}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium">Temporizador:</div>
              <Badge variant="outline" className="font-mono">
                {gameState?.countdown ?? 0}s
              </Badge>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-gloria-purple" />
              <div>
                <div className="text-sm font-medium">Jugadores</div>
                <div className="text-xl font-bold">{playersCount}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-gloria-purple" />
              <div>
                <div className="text-sm font-medium">Respuestas</div>
                <div className="text-xl font-bold">{answersCount}</div>
              </div>
            </div>
          </div>
          
          <Separator className="my-2" />
          
          {/* Connection Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Wifi className={cn(
                "h-4 w-4",
                "text-green-500"
              )} />
              <div className="text-sm">
                Conexión: <span className="font-medium">Activa</span>
              </div>
            </div>
            <div className="text-sm text-right">
              Último cambio: {new Date(gameState?.updated_at ?? '').toLocaleTimeString()}
            </div>
          </div>
          
          {/* Admin Controls */}
          {isAdminLoaded && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium mb-2">Controles de Administrador</h4>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStartGame}
                    disabled={gameState?.status !== 'waiting'}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Iniciar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleAdvanceState}
                    disabled={gameState?.status === 'finished'}
                  >
                    <FastForward className="h-4 w-4 mr-1" />
                    Avanzar
                  </Button>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex flex-wrap gap-2 w-full">
                    {(["waiting", "question", "result", "leaderboard", "finished"] as const).map((state) => (
                      <Button 
                        key={state}
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          "text-xs flex-1",
                          gameState?.status === state && "bg-gloria-purple/10 text-gloria-purple"
                        )}
                        onClick={() => handleForceState(state)}
                      >
                        {state}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveGameMonitor;
