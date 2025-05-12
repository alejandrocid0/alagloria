
import { useState, useEffect, useCallback } from 'react';
import { enhancedRealTimeSync } from '@/services/games/enhancedRealTimeSync';
import { toast } from '@/hooks/use-toast';

export const useEnhancedGameSync = (gameId: string | undefined) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('connected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Manejar actualizaciones de estado del juego
  const handleGameStateUpdate = useCallback((payload: any) => {
    console.log('[EnhancedGameSync] Estado del juego actualizado:', payload);
    setLastUpdate(new Date());
  }, []);

  // Refrescar manualmente
  const refresh = useCallback(() => {
    if (connectionStatus !== 'connected' && connectionStatus !== 'connecting') {
      enhancedRealTimeSync.reconnectAll();
      toast({
        title: "Reconectando",
        description: "Intentando restablecer la conexión con el servidor...",
      });
    }
  }, [connectionStatus]);

  // Configurar suscripciones
  useEffect(() => {
    if (!gameId) return;

    console.log('[EnhancedGameSync] Configurando sincronización para el juego:', gameId);
    let subscriptions: { unsubscribe: () => void }[] = [];

    try {
      // Suscribirse a cambios en el estado de conexión
      const connectionUnsub = enhancedRealTimeSync.onConnectionChange((status) => {
        setConnectionStatus(status);
        
        // Si pasamos de desconectado a conectado, actualizar los intentos de reconexión
        if (status === 'connected') {
          const attempts = enhancedRealTimeSync.getReconnectionAttempts();
          setReconnectAttempts(attempts);
        }
      });

      // Suscribirse a cambios en el estado del juego
      const gameStateSubscription = enhancedRealTimeSync.subscribeToGameState(
        gameId, 
        handleGameStateUpdate
      );
      subscriptions.push(gameStateSubscription);
      
      return () => {
        console.log('[EnhancedGameSync] Limpiando suscripciones');
        connectionUnsub();
        subscriptions.forEach(sub => sub.unsubscribe());
      };
    } catch (error) {
      console.error('[EnhancedGameSync] Error configurando sincronización:', error);
      setConnectionStatus('error');
      toast({
        title: "Error de conexión",
        description: "No se pudo establecer conexión con el servidor",
        variant: "destructive"
      });
    }
  }, [gameId, handleGameStateUpdate]);

  return {
    lastUpdate,
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    reconnectAttempts,
    refresh
  };
};

export default useEnhancedGameSync;
