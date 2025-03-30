
import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare } from 'lucide-react';

interface GameInfoCardsProps {
  playersCount: number;
  gameStatus: string;
}

const GameInfoCards = ({ playersCount, gameStatus }: GameInfoCardsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
      <motion.div 
        className="bg-gloria-purple/5 rounded-lg p-4 text-center hover:bg-gloria-purple/10 transition-colors"
        whileHover={{ scale: 1.03 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Users className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
        <div className="text-sm text-gray-500">Jugadores</div>
        <motion.div 
          className="font-medium text-gloria-purple"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 1] }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {playersCount}
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="bg-gloria-purple/5 rounded-lg p-4 text-center hover:bg-gloria-purple/10 transition-colors"
        whileHover={{ scale: 1.03 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <MessageSquare className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
        <div className="text-sm text-gray-500">Estado</div>
        <motion.div 
          className="font-medium text-gloria-purple"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 1] }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {gameStatus}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameInfoCards;
