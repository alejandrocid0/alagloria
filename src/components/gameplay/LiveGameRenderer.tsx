
import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import useLiveGameState from './hooks/useLiveGameState';
import GameContainer from './GameContainer';
import ConnectionStatus from './ConnectionStatus';
import { useEnhancedGameSync } from '@/hooks/liveGame/useEnhancedGameSync';

const LiveGameRenderer = () => {
  const {
    gameId,
    gameState,
    questions,
    leaderboardData,
    currentQuestion,
    adaptedCurrentQuestion,
    lastAnswerResult,
    isLoading,
    error,
    myRank,
    myPoints,
    lastPoints
  } = useLiveGameState();
  
  // Usar el sistema de sincronización mejorado
  const {
    isConnected,
    connectionStatus,
    reconnectAttempts,
    refresh: refreshConnection
  } = useEnhancedGameSync(gameId);
  
  // Función para manejar la recarga manual de datos
  const handleManualRefresh = () => {
    toast({
      title: "Actualizando datos",
      description: "Recargando información de la partida"
    });
    
    // Intentar reconectar si hay problemas de conexión
    if (!isConnected) {
      refreshConnection();
    } else {
      // Si estamos conectados, simplemente recargar la página
      window.location.reload();
    }
  };
  
  // Mostrar estado de conexión siempre que haya un cambio de estado
  useEffect(() => {
    if (connectionStatus === 'connected' && reconnectAttempts > 0) {
      toast({
        title: "Conexión restablecida",
        description: "La conexión con el servidor ha sido restablecida"
      });
    }
  }, [connectionStatus, reconnectAttempts]);
  
  return (
    <>
      <ConnectionStatus 
        connectionStatus={connectionStatus} 
        reconnectAttempts={reconnectAttempts}
        onRefresh={refreshConnection}
      />
      
      <GameContainer 
        gameState={gameState}
        questions={questions}
        currentQuestion={currentQuestion}
        adaptedCurrentQuestion={adaptedCurrentQuestion}
        leaderboardData={leaderboardData}
        lastAnswerResult={lastAnswerResult}
        isLoading={isLoading}
        error={error}
        isConnected={isConnected}
        reconnectAttempts={reconnectAttempts}
        submitAnswer={handleManualRefresh}
        gameId={gameId}
        myRank={myRank}
        myPoints={myPoints}
        lastPoints={lastPoints}
      />
    </>
  );
};

export default LiveGameRenderer;
