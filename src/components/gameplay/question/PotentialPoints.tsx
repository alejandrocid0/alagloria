
import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  // Si ya se seleccionó una opción, no mostramos los puntos potenciales
  if (selectedOption) return null;
  
  return (
    <motion.div 
      className={cn(
        "flex items-center rounded-full px-4 py-2",
        isTimeRunningOut ? "bg-red-50 text-red-600" : "bg-gloria-purple/10 text-gloria-purple"
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        y: isTimeRunningOut ? [0, -3, 0] : 0
      }}
      transition={{ 
        duration: 0.3,
        y: { repeat: isTimeRunningOut ? Infinity : 0, duration: 0.5 }
      }}
    >
      <Award className="w-5 h-5 mr-2" />
      <div>
        <span className="font-bold">{potentialPoints}</span>
        <span className="ml-1 text-sm">puntos posibles</span>
      </div>
    </motion.div>
  );
};

export default PotentialPoints;
