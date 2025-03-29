
import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  reconnectAttempts 
}) => {
  if (isConnected && reconnectAttempts === 0) return null;
  
  return (
    <motion.div 
      className={`px-4 py-2 ${isConnected ? 'bg-green-50' : 'bg-red-50'} border-b ${isConnected ? 'border-green-100' : 'border-red-100'}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-center">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700">Conexión restaurada</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">
              Problemas de conexión{reconnectAttempts > 0 ? ` - Reconectando (intento ${reconnectAttempts})` : ''}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ConnectionStatus;
