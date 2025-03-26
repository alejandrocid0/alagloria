
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook para monitorear el estado de la conexión de red y
 * manejar reconexiones automáticas.
 */
export const useNetworkStatus = (
  isConnected: boolean,
  fetchGameStateData: () => Promise<void>,
  scheduleReconnect: () => void,
  gameId?: string
) => {
  const [networkStatus, setNetworkStatus] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const monitorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Función para verificar la conexión a internet
  const checkNetworkStatus = useCallback(async () => {
    try {
      const online = navigator.onLine;
      
      // Si no hay conexión a Internet, marcar como desconectado
      if (!online) {
        setNetworkStatus(false);
        return false;
      }
      
      // Verificar también capacidad de alcanzar el servidor
      // Usando un endpoint ligero o imagen para verificar
      const response = await fetch('/ping', { 
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      const isOnline = response.ok;
      setNetworkStatus(isOnline);
      return isOnline;
    } catch (err) {
      // Si hay error al verificar, asumimos desconexión
      setNetworkStatus(false);
      return false;
    }
  }, []);
  
  // Manejar cambio en el estado de la conexión
  useEffect(() => {
    if (!isConnected && networkStatus) {
      console.log('Estado de la aplicación desconectado pero red disponible, intentando reconexión');
      setReconnectAttempts(prev => prev + 1);
      scheduleReconnect();
      
      // Mostrar notificación solo en los primeros intentos
      if (reconnectAttempts <= 3) {
        toast({
          title: "Problemas de conexión",
          description: `Intentando reconectar (intento ${reconnectAttempts + 1})...`,
          variant: "destructive",
        });
      }
    } else if (isConnected && reconnectAttempts > 0) {
      setReconnectAttempts(0);
    }
  }, [isConnected, networkStatus, scheduleReconnect, reconnectAttempts]);
  
  // Configurar listeners para eventos de conexión online/offline
  useEffect(() => {
    const handleOnline = async () => {
      console.log('Navegador reporta conexión online');
      const isConnected = await checkNetworkStatus();
      
      if (isConnected) {
        console.log('Conexión de red restaurada, intentando reconectar con el juego');
        // Permitir un pequeño retraso para que la conexión se estabilice
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          fetchGameStateData();
        }, 1000);
      }
    };
    
    const handleOffline = () => {
      console.log('Navegador reporta conexión offline');
      setNetworkStatus(false);
    };
    
    // Agregar listeners para eventos de online/offline
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Configurar monitor periódico de estado de red
    monitorIntervalRef.current = setInterval(async () => {
      if (gameId) {
        await checkNetworkStatus();
      }
    }, 30000); // Cada 30 segundos
    
    // Verificar estado inicial
    checkNetworkStatus();
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (monitorIntervalRef.current) {
        clearInterval(monitorIntervalRef.current);
        monitorIntervalRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [checkNetworkStatus, fetchGameStateData, gameId]);
  
  return {
    networkStatus,
    reconnectAttempts,
    checkNetworkStatus
  };
};

export default useNetworkStatus;
