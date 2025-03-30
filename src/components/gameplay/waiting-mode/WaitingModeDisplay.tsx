
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusHeader from './StatusHeader';
import CountdownSection from './CountdownSection';
import ActionButtons from './ActionButtons';
import WaitingRoom from '../WaitingRoom';
import useWaitingModeDisplay from './hooks/useWaitingModeDisplay';
import { advanceGameState } from '@/hooks/liveGame/gameStateUtils';
import ConnectionStatus from '../ConnectionStatus';
import { useGameSubscription } from './hooks/useGameSubscription';
import { toast } from '@/hooks/use-toast';

interface WaitingModeDisplayProps {
  gameId: string | undefined;
  gameTitle: string;
  scheduledTime: string;
  playersOnline: any[];
  timeUntilStart: number;
  isGameActive: boolean;
  onRefresh?: () => void;
}

const WaitingModeDisplay = ({
  gameId,
  gameTitle,
  scheduledTime,
  playersOnline,
  timeUntilStart,
  isGameActive,
  onRefresh
}: WaitingModeDisplayProps) => {
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [localPlayersOnline, setLocalPlayersOnline] = useState(playersOnline);
  
  const {
    countdown,
    isImminentStart,
    formatTimeRemaining,
    formatDate,
    handleRefresh,
    handleGoToGame,
  } = useWaitingModeDisplay(gameId, timeUntilStart, isGameActive, onRefresh);
  
  // Usar el hook para suscribirse a cambios en el estado del juego y en la lista de jugadores
  useGameSubscription(gameId, setHasGameStarted, setLocalPlayersOnline);
  
  // Sincronizar el estado local con las props cuando cambian
  useEffect(() => {
    setLocalPlayersOnline(playersOnline);
  }, [playersOnline]);
  
  // Simular verificación de conexión periódica
  useEffect(() => {
    const checkConnectionStatus = () => {
      // Verificar si tenemos conexión a Internet
      const isOnline = navigator.onLine;
      
      if (!isOnline && isConnected) {
        setIsConnected(false);
        toast({
          title: "Conexión perdida",
          description: "Intentando reconectar...",
          variant: "destructive",
        });
        setReconnectAttempts(prev => prev + 1);
      } else if (isOnline && !isConnected) {
        setIsConnected(true);
        toast({
          title: "Conexión restablecida",
          description: "Has vuelto a conectarte a la sala de espera.",
          variant: "default",
        });
        
        // Forzar actualización de datos
        if (onRefresh) {
          onRefresh();
        }
      }
    };
    
    // Comprobar estado inicial
    checkConnectionStatus();
    
    // Comprobar periódicamente
    const interval = setInterval(checkConnectionStatus, 10000);
    
    // Configurar listeners para eventos de conexión
    window.addEventListener('online', checkConnectionStatus);
    window.addEventListener('offline', checkConnectionStatus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', checkConnectionStatus);
      window.removeEventListener('offline', checkConnectionStatus);
    };
  }, [isConnected, onRefresh]);
  
  // Efecto para mostrar alerta cuando el juego está por comenzar
  useEffect(() => {
    if (isImminentStart && countdown <= 60 && countdown > 55) {
      toast({
        title: "¡La partida está por comenzar!",
        description: "Prepárate, comenzará en menos de un minuto",
        variant: "default",
      });
    }
  }, [isImminentStart, countdown]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      {/* Header section with title and metadata */}
      <StatusHeader 
        gameTitle={gameTitle} 
        scheduledTime={scheduledTime} 
        playersCount={localPlayersOnline.length}
        formatDate={formatDate}
      />
      
      {/* Connection status indicator */}
      <ConnectionStatus 
        isConnected={isConnected} 
        reconnectAttempts={reconnectAttempts}
      />
      
      {/* Countdown section */}
      <div className="p-6 border-b border-gray-200">
        <CountdownSection 
          countdown={countdown}
          isImminentStart={isImminentStart}
          isGameActive={isGameActive || hasGameStarted}
          formatTimeRemaining={formatTimeRemaining}
        />
        
        {countdown <= 0 && !isGameActive && !hasGameStarted ? (
          <ActionButtons 
            onRefresh={handleRefresh}
            onGoToGame={handleGoToGame}
          />
        ) : hasGameStarted && (
          <div className="mt-4 text-center">
            <motion.button
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              onClick={handleGoToGame}
              className="bg-gloria-purple text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-gloria-purple/90 transition-colors"
            >
              ¡La partida ha comenzado! Entrar ahora
            </motion.button>
          </div>
        )}
      </div>
      
      {/* Waiting room component */}
      <WaitingRoom 
        gameTitle={gameTitle} 
        scheduledTime={scheduledTime}
        playersOnline={localPlayersOnline}
        timeUntilStart={countdown}
        isGameActive={isGameActive || hasGameStarted}
      />
      
      {/* Información adicional sobre la conexión */}
      {!isConnected && (
        <div className="p-3 bg-yellow-50 border-t border-yellow-100">
          <p className="text-sm text-yellow-700 text-center">
            Intentando restablecer la conexión... 
            <button 
              onClick={handleRefresh}
              className="ml-2 text-gloria-purple hover:underline focus:outline-none"
            >
              Reintentar manualmente
            </button>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WaitingModeDisplay;
