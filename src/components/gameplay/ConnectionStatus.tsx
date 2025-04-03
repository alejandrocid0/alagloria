
import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  reconnectAttempts 
}) => {
  // Solo mostrar el estado de conexión si hay intentos de reconexión y no estamos conectados
  // o si hubo un problema reciente (reconectAttempts > 0)
  if (reconnectAttempts === 0 || (isConnected && reconnectAttempts < 2)) return null;
  
  return (
    <div className={`px-4 py-1 text-sm text-center ${
      isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
    }`}>
      <div className="flex items-center justify-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Reconectando...</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
