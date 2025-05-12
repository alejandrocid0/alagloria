
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  reconnectAttempts: number;
  onRefresh: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  connectionStatus, 
  reconnectAttempts,
  onRefresh 
}) => {
  // No mostrar nada si estamos conectados
  if (connectionStatus === 'connected') {
    return null;
  }
  
  let statusText = '';
  let statusClass = '';
  
  switch (connectionStatus) {
    case 'disconnected':
      statusText = 'Conexión perdida';
      statusClass = 'bg-amber-100 text-amber-800 border-amber-300';
      break;
    case 'connecting':
      statusText = 'Conectando...';
      statusClass = 'bg-blue-100 text-blue-800 border-blue-300';
      break;
    case 'error':
      statusText = 'Error de conexión';
      statusClass = 'bg-red-100 text-red-800 border-red-300';
      break;
  }
  
  return (
    <div className={`p-2 mb-4 flex items-center justify-between rounded border ${statusClass}`}>
      <div className="flex items-center">
        <span className="font-medium">{statusText}</span>
        {reconnectAttempts > 0 && (
          <span className="ml-2 text-sm">
            (Intentos: {reconnectAttempts})
          </span>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Recargar
      </Button>
    </div>
  );
};

export default ConnectionStatus;
