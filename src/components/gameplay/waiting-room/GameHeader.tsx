
import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface GameHeaderProps {
  gameTitle: string;
  scheduledTime: string;
}

const GameHeader = ({ gameTitle, scheduledTime }: GameHeaderProps) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-gloria-purple to-purple-600 p-6 text-white"
      initial={{ opacity: 0.9 }}
      animate={{ 
        opacity: 1,
        background: [
          "linear-gradient(to right, #5D3891, #7952B3)",
          "linear-gradient(to right, #4A2D73, #6E48A6)",
          "linear-gradient(to right, #5D3891, #7952B3)"
        ]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <motion.h2 
        className="text-2xl font-serif font-bold mb-2"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {gameTitle}
      </motion.h2>
      <motion.div 
        className="flex items-center text-white/80 text-sm"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Clock className="w-4 h-4 mr-1" />
        <span>{scheduledTime}</span>
      </motion.div>
    </motion.div>
  );
};

export default GameHeader;
