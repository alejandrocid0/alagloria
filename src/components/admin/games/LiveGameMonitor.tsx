
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RefreshCw } from 'lucide-react';
import { useLiveGameMonitor } from './hooks/useLiveGameMonitor';
import GameStatusDisplay from './components/GameStatusDisplay';
import GameStats from './components/GameStats';
import ConnectionInfo from './components/ConnectionInfo';
import AdminControls from './components/AdminControls';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

const LiveGameMonitor: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const {
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
  } = useLiveGameMonitor(gameId);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadGameState} />;
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
          {gameState && (
            <GameStatusDisplay
              status={gameState.status}
              currentQuestion={gameState.current_question}
              countdown={gameState.countdown}
            />
          )}
          
          {/* Stats */}
          <GameStats 
            playersCount={playersCount}
            answersCount={answersCount}
          />
          
          <Separator className="my-2" />
          
          {/* Connection Info */}
          {gameState && (
            <ConnectionInfo 
              isConnected={true}
              lastUpdateTime={new Date(gameState.updated_at).toLocaleTimeString()}
            />
          )}
          
          {/* Admin Controls */}
          {isAdminLoaded && gameState && (
            <>
              <Separator className="my-2" />
              <AdminControls 
                gameStatus={gameState.status}
                onStartGame={handleStartGame}
                onAdvanceState={handleAdvanceState}
                onForceState={handleForceState}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveGameMonitor;
