
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
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
  const controls = useAnimation();
  
  // Animar cuando cambian los puntos o la pregunta actual
  useEffect(() => {
    controls.start({
      scale: [1, 1.03, 1],
      transition: { duration: 0.3 }
    });
  }, [myPoints, currentQuestion, controls]);
  
  // Determinar el color según el progreso
  const getProgressColor = () => {
    if (progress < 33) return "bg-gloria-purple";
    if (progress < 66) return "bg-blue-500";
    if (progress < 90) return "bg-green-500";
    return "bg-gloria-gold";
  };
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">
          Pregunta {currentQuestion + 1} de {totalQuestions}
        </div>
        <motion.div 
          className="text-sm font-medium text-gloria-purple"
          animate={controls}
        >
          {myPoints} puntos
        </motion.div>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className={cn(
            "h-full rounded-full",
            getProgressColor()
          )}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut" 
          }}
          layout
        />
      </div>
    </div>
  );
};

export default ProgressBar;
