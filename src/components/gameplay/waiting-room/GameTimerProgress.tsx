
import React from 'react';
import { motion } from 'framer-motion';

interface GameTimerProgressProps {
  hasGameStarted: boolean;
  countdown: number;
  totalTime: number;
}

const GameTimerProgress = ({ hasGameStarted, countdown, totalTime }: GameTimerProgressProps) => {
  if (hasGameStarted) return null;
  
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
      <motion.div 
        className="h-full bg-gradient-to-r from-gloria-purple to-purple-600 rounded-full"
        initial={{ width: '100%' }}
        animate={{ width: `${(countdown / totalTime) * 100}%` }}
        transition={{ duration: 1 }}
      />
    </div>
  );
};

export default GameTimerProgress;
