
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[300px] py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex items-center justify-center w-16 h-16 bg-gloria-purple/10 rounded-full mb-4"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut" 
        }}
      >
        <Loader2 className="w-8 h-8 text-gloria-purple animate-spin" />
      </motion.div>
      
      <motion.h3 
        className="text-xl font-serif text-gloria-purple mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Cargando partida
      </motion.h3>
      
      <motion.p 
        className="text-gray-500 text-center max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Estamos preparando todo para tu experiencia de juego.
        <br />Esto solo tomará unos segundos.
      </motion.p>
    </motion.div>
  );
};

export default LoadingState;
