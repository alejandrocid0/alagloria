
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  reconnectAttempts 
}) => {
  const [showBanner, setShowBanner] = useState(false);
  
  // Mostrar el banner después de 2 intentos de reconexión o si ya está desconectado
  useEffect(() => {
    if (!isConnected || reconnectAttempts > 1) {
      setShowBanner(true);
    } else if (isConnected && reconnectAttempts === 0) {
      // Si se reconecta, ocultar el banner después de un tiempo
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, reconnectAttempts]);
  
  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative px-4 py-2 mb-4 rounded-lg text-sm flex items-center justify-between",
            isConnected ? "bg-green-50 text-green-700 border border-green-200" : 
                         "bg-red-50 text-red-700 border border-red-200"
          )}
        >
          <div className="flex items-center">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                <span>Conectado al servidor</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                <span>
                  {reconnectAttempts > 0 
                    ? `Reconectando (intento ${reconnectAttempts})...` 
                    : "Conexión perdida"}
                </span>
              </>
            )}
          </div>
          
          {reconnectAttempts > 3 && (
            <div className="text-xs flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Problemas de red detectados
            </div>
          )}
          
          {isConnected && (
            <motion.button 
              onClick={() => setShowBanner(false)}
              className="text-xs underline"
              whileHover={{ scale: 1.05 }}
            >
              Cerrar
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;
