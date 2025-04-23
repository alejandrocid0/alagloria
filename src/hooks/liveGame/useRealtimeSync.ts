
import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { realTimeSync } from '@/services/games/realTimeSync';
import { toast } from '@/hooks/use-toast';

export type SubscriptionType = 'gameState' | 'participants' | 'answers' | 'leaderboard';

interface UseRealtimeSyncOptions {
  gameId: string;
  subscriptionTypes: SubscriptionType[];
  onUpdate?: (type: SubscriptionType, payload: any) => void;
  onConnectionChange?: (isConnected: boolean) => void;
}

export const useRealtimeSync = ({
  gameId,
  subscriptionTypes,
  onUpdate,
  onConnectionChange
}: UseRealtimeSyncOptions) => {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const channelsRef = useRef<Record<string, RealtimeChannel>>({});
  const lastUpdateRef = useRef<Record<string, number>>({});

  // Handler for updates from any subscription
  const handleUpdate = useCallback((type: SubscriptionType, payload: any) => {
    const now = Date.now();
    const lastUpdate = lastUpdateRef.current[type] || 0;
    
    // Basic throttling (prevent updates faster than 500ms)
    if (now - lastUpdate < 500) {
      return;
    }
    
    lastUpdateRef.current[type] = now;
    setIsConnected(true);
    onUpdate?.(type, payload);
  }, [onUpdate]);

  // Setup subscriptions
  useEffect(() => {
    if (!gameId) return;

    const setupSubscription = (type: SubscriptionType) => {
      try {
        let channel: RealtimeChannel;
        
        switch (type) {
          case 'gameState':
            channel = realTimeSync.subscribeToGameState(gameId, 
              (payload) => handleUpdate(type, payload));
            break;
          case 'participants':
            channel = realTimeSync.subscribeToParticipants(gameId,
              (payload) => handleUpdate(type, payload));
            break;
          case 'answers':
            channel = realTimeSync.subscribeToAnswers(gameId,
              (payload) => handleUpdate(type, payload));
            break;
          case 'leaderboard':
            channel = realTimeSync.subscribeToLeaderboard(gameId,
              (payload) => handleUpdate(type, payload));
            break;
          default:
            return;
        }

        channelsRef.current[type] = channel;
      } catch (error) {
        console.error(`[RealtimeSync] Error setting up ${type} subscription:`, error);
        setIsConnected(false);
        setReconnectAttempts(prev => prev + 1);
        onConnectionChange?.(false);
        
        toast({
          title: "Error de conexión",
          description: "Se perdió la conexión con el servidor. Intentando reconectar...",
          variant: "destructive"
        });
      }
    };

    // Set up all requested subscriptions
    subscriptionTypes.forEach(setupSubscription);

    // Cleanup function
    return () => {
      Object.values(channelsRef.current).forEach(channel => {
        realTimeSync.unsubscribe(channel);
      });
      channelsRef.current = {};
    };
  }, [gameId, subscriptionTypes, handleUpdate, onConnectionChange]);

  return {
    isConnected,
    reconnectAttempts
  };
};

export default useRealtimeSync;
