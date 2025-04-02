
import React from 'react';
import { motion } from 'framer-motion';

const LoadingIndicator = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative mb-4">
          <div className="w-12 h-12 border-4 border-gloria-purple border-t-transparent rounded-full animate-spin"></div>
          <motion.div 
            className="absolute inset-0 rounded-full"
            initial={{ boxShadow: '0 0 0 0px rgba(93, 56, 145, 0.1)' }}
            animate={{ boxShadow: '0 0 0 10px rgba(93, 56, 145, 0)' }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5, 
              ease: "easeInOut"
            }}
          />
        </div>
        
        <motion.h3 
          className="text-xl font-serif font-bold text-gloria-purple mb-2"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Uniendo a la partida...
        </motion.h3>
        
        <motion.p 
          className="text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Cargando preguntas y preparando el juego
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
