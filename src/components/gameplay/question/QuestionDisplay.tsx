
import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

interface QuestionDisplayProps {
  question: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center mb-4">
        <BrainCircuit className="w-6 h-6 text-gloria-purple mr-2" />
        <motion.h2 
          className="text-xl md:text-2xl font-serif font-bold text-gloria-purple"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {question}
        </motion.h2>
      </div>
    </motion.div>
  );
};

export default QuestionDisplay;
