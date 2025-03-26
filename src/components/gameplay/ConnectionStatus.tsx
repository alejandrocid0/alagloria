
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected,
  reconnectAttempts
}) => {
  // Solo mostrar cuando se está desconectado o intentando reconectar
  if (isConnected && reconnectAttempts === 0) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className={`border-l-4 p-4 flex items-center space-x-3 ${
          !isConnected ? 'bg-yellow-50 border-yellow-400' : 'bg-green-50 border-green-400'
        }`}
      >
        <div className="flex-shrink-0 relative">
          {!isConnected ? (
            <>
              <WifiOff className="h-5 w-5 text-yellow-500" />
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Wifi className="h-5 w-5 text-yellow-500" />
              </motion.div>
            </>
          ) : (
            <Wifi className="h-5 w-5 text-green-500" />
          )}
        </div>
        <div>
          <p className="text-sm">
            {!isConnected ? (
              <span className="text-yellow-700">
                Conexión perdida. Intentando reconectar...
                {reconnectAttempts > 0 && ` (Intento ${reconnectAttempts})`}
              </span>
            ) : (
              <span className="text-green-700">
                Conexión recuperada
              </span>
            )}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConnectionStatus;
