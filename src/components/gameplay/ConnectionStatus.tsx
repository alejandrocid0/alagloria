
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
  return (
    <AnimatePresence mode="wait">
      {!isConnected && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-yellow-50 border-b border-yellow-100 px-4 py-2"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <WifiOff size={16} className="text-yellow-600" />
            </motion.div>
            <p className="text-sm text-yellow-700">
              Conexión interrumpida {reconnectAttempts > 0 && `(intento ${reconnectAttempts})`}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
