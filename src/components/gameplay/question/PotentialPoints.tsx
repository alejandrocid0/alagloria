
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PotentialPointsProps {
  potentialPoints: number;
  isTimeRunningOut: boolean;
  selectedOption: string | null;
  maxPoints?: number;
}

const PotentialPoints: React.FC<PotentialPointsProps> = ({
  potentialPoints,
  isTimeRunningOut,
  selectedOption,
  maxPoints = 200
}) => {
  const controls = useAnimation();
  
  // Si ya se seleccionó una opción, no mostramos los puntos potenciales
  if (selectedOption) return null;
  
  // Aplicar animación cuando los puntos bajan o el tiempo se agota
  useEffect(() => {
    if (isTimeRunningOut) {
      // Animación pulsante para urgencia
      controls.start({
        scale: [1, 1.05, 1],
        transition: {
          repeat: Infinity,
          duration: 0.5
        }
      });
    } else {
      controls.stop();
      controls.set({ scale: 1 });
    }
  }, [isTimeRunningOut, controls]);
  
  // Calculate percentage for the visual indicator
  const pointsPercentage = Math.min(100, Math.floor((potentialPoints / maxPoints) * 100));
  
  return (
    <motion.div 
      className={cn(
        "flex items-center rounded-full px-4 py-2 relative overflow-hidden",
        isTimeRunningOut ? "bg-red-50 text-red-600" : "bg-gloria-purple/10 text-gloria-purple"
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Background fill representing points percentage */}
      <div 
        className={cn(
          "absolute top-0 left-0 bottom-0 transition-all duration-300",
          isTimeRunningOut ? "bg-red-100" : "bg-gloria-purple/20"
        )}
        style={{ width: `${pointsPercentage}%` }}
      />
      
      {/* Content on top of the background */}
      <Award className={cn(
        "w-5 h-5 mr-2 z-10 relative",
        isTimeRunningOut && "animate-pulse"
      )} />
      <div className="z-10 relative">
        <span className="font-bold">{potentialPoints}</span>
        <span className="ml-1 text-sm">puntos posibles</span>
      </div>
    </motion.div>
  );
};

export default PotentialPoints;
