
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  myPoints: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentQuestion, 
  totalQuestions,
  myPoints 
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">
          Pregunta {currentQuestion + 1} de {totalQuestions}
        </div>
        <div className="text-sm font-medium text-gloria-purple">
          {myPoints} puntos
        </div>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className={cn(
            "h-full rounded-full",
            progress < 33 ? "bg-gloria-purple" : 
            progress < 66 ? "bg-blue-500" : 
            progress < 90 ? "bg-green-500" : "bg-gloria-gold"
          )}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
