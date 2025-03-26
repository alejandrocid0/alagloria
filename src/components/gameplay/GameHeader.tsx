
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameHeaderProps {
  quizTitle: string;
  playersCount: number;
  myPoints: number;
  isDemoGame?: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({
  quizTitle,
  playersCount,
  myPoints,
  isDemoGame = false
}) => {
  return (
    <motion.div 
      className="bg-gloria-purple text-white p-4 rounded-t-xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <motion.h1 
          className="text-xl font-serif mb-2 sm:mb-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {quizTitle}
        </motion.h1>
        
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm">{playersCount}</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center bg-white/10 px-3 py-1 rounded-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Trophy className="w-4 h-4 mr-1 text-gloria-gold" />
            <span className="text-sm font-medium">{myPoints}</span>
          </motion.div>
          
          {!isDemoGame && (
            <motion.div
              className="hidden sm:block text-xs bg-gloria-gold/20 text-gloria-gold px-3 py-1 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              ¡En juego!
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GameHeader;
