
import React from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

const NextQuestionIndicator: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.5, 1] }}
      transition={{ delay: 0.8, duration: 1 }}
      className="text-center text-gray-500 flex items-center justify-center"
    >
      <Timer className="w-4 h-4 mr-2 animate-pulse" />
      Preparándose para la siguiente pregunta...
    </motion.div>
  );
};

export default NextQuestionIndicator;
