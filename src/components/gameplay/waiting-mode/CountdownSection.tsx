
import React from 'react';
import { motion } from 'framer-motion';

interface CountdownSectionProps {
  countdown: number;
  isImminentStart: boolean;
  isGameActive: boolean;
  formatTimeRemaining: (seconds: number) => string;
}

const CountdownSection = ({ 
  countdown, 
  isImminentStart, 
  isGameActive,
  formatTimeRemaining 
}: CountdownSectionProps) => {
  return (
    <div className="text-center">
      <h2 className="text-lg font-medium text-gray-700 mb-1">
        {countdown > 0 ? 'Tiempo hasta el inicio' : 'La partida está iniciando...'}
      </h2>
      
      <motion.div 
        className={`text-4xl font-bold mt-3 ${isImminentStart ? 'text-gloria-gold' : 'text-gloria-purple'}`}
        animate={{ 
          scale: isImminentStart && countdown > 0 ? [1, 1.1, 1] : 1,
        }}
        transition={{ 
          duration: 1, 
          repeat: isImminentStart && countdown > 0 ? Infinity : 0,
          repeatDelay: 0.5
        }}
      >
        {formatTimeRemaining(countdown)}
      </motion.div>
      
      {isImminentStart && countdown > 0 && (
        <p className="text-sm text-gloria-gold mt-2 font-medium animate-pulse">
          Prepárate, la partida comenzará muy pronto...
        </p>
      )}
      
      {countdown <= 0 && isGameActive && (
        <p className="text-sm text-gloria-purple mt-2">
          La partida ya ha comenzado.
        </p>
      )}
    </div>
  );
};

export default CountdownSection;
