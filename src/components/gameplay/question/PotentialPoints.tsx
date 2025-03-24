
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Award } from 'lucide-react';

interface PotentialPointsProps {
  potentialPoints: number;
  isTimeRunningOut: boolean;
  selectedOption: string | null;
}

const PotentialPoints: React.FC<PotentialPointsProps> = ({
  potentialPoints,
  isTimeRunningOut,
  selectedOption
}) => {
  const pointsContainerVariants = {
    normal: { scale: 1 },
    warning: { 
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity,
        duration: 0.8
      }
    }
  };

  return (
    <motion.div 
      className="flex items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      variants={pointsContainerVariants}
      // Fix: Only use a single animate prop
      animate={isTimeRunningOut && !selectedOption ? "warning" : "normal"}
    >
      <motion.div 
        className="bg-gloria-cream/30 rounded-lg px-4 py-2.5 flex items-center"
        whileHover={{ scale: 1.03 }}
        animate={{ 
          y: isTimeRunningOut && !selectedOption ? [0, -2, 0] : 0
        }}
        transition={{ 
          y: { 
            repeat: isTimeRunningOut && !selectedOption ? Infinity : 0, 
            duration: 0.5 
          }
        }}
      >
        <Award className={cn(
          "w-5 h-5 mr-2",
          isTimeRunningOut && !selectedOption ? "text-red-500" : "text-gloria-gold"
        )} />
        <div>
          <div className="text-xs text-gray-500">Puntos potenciales</div>
          <div className={cn(
            "font-bold transition-colors",
            isTimeRunningOut && !selectedOption ? "text-red-500" : "text-gloria-purple"
          )}>
            {potentialPoints}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PotentialPoints;
