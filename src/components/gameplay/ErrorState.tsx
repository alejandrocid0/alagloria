
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  errorMessage: string | null;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  errorMessage, 
  onRetry 
}) => {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[300px] py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring" }}
      >
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </motion.div>
      
      <motion.h3 
        className="text-xl font-serif text-red-600 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        ¡Ups! Ha ocurrido un error
      </motion.h3>
      
      <motion.p 
        className="text-gray-500 text-center max-w-md mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {errorMessage || "No pudimos cargar la partida. Por favor, inténtalo nuevamente."}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          onClick={handleRefresh}
          className="bg-gloria-purple hover:bg-gloria-purple/90 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Intentar nuevamente
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ErrorState;
