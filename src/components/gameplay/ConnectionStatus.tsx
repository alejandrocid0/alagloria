
import React from 'react';
import { WifiOff, Wifi, WifiAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  connectionStatus: string;
  reconnectAttempts: number;
  onRefresh?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connectionStatus, 
  reconnectAttempts,
  onRefresh
}) => {
  // Solo mostrar si hay un problema de conexión o ha habido intentos de reconexión
  if (connectionStatus === 'connected' && reconnectAttempts === 0) return null;
  
  // Configuración según el estado
  const config = {
    connected: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: <Wifi className="h-3 w-3" />,
      message: "Conexión establecida"
    },
    connecting: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      message: "Conectando..."
    },
    disconnected: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <WifiOff className="h-3 w-3" />,
      message: "Desconectado"
    },
    error: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <WifiAlert className="h-3 w-3" />,
      message: "Error de conexión"
    }
  };
  
  // Obtener configuración actual
  const currentConfig = config[connectionStatus as keyof typeof config] || config.error;
  
  return (
    <div className={`px-4 py-1 text-sm text-center ${currentConfig.bg} ${currentConfig.text}`}>
      <div className="flex items-center justify-center gap-2">
        {currentConfig.icon}
        <span>{currentConfig.message}</span>
        
        {/* Botón de reconexión manual si hay problemas */}
        {(connectionStatus === 'disconnected' || connectionStatus === 'error') && onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 py-1 ml-2" 
            onClick={onRefresh}
          >
            Reconectar
          </Button>
        )}
        
        {/* Mostrar intentos de reconexión si hay más de 0 */}
        {reconnectAttempts > 0 && connectionStatus !== 'connected' && (
          <span className="text-xs ml-1">
            (intento {reconnectAttempts})
          </span>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
