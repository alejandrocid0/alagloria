
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Timer } from 'lucide-react';

interface StatusMessageProps {
  selectedOption: string | null;
  isTimeRunningOut: boolean;
  isUrgent: boolean;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  selectedOption,
  isTimeRunningOut,
  isUrgent
}) => {
  return (
    <AnimatePresence>
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-center text-gray-500 italic"
        >
          <Timer className="inline-block w-4 h-4 mr-1 animate-pulse" />
          Espera mientras los demás jugadores responden...
        </motion.div>
      )}
      
      {isTimeRunningOut && !selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            boxShadow: isUrgent ? ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 5px rgba(239, 68, 68, 0.2)", "0 0 0 0 rgba(239, 68, 68, 0)"] : "none" 
          }}
          transition={{ 
            boxShadow: { repeat: isUrgent ? Infinity : 0, duration: 1 }
          }}
          className="bg-red-50 border border-red-100 rounded-lg p-3 text-center text-red-600 mt-4"
        >
          <AlertCircle className="inline-block w-5 h-5 mr-2 animate-pulse" />
          ¡El tiempo se está agotando! Selecciona una respuesta rápido.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatusMessage;
