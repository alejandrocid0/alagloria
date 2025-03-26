
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
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
  
  return (
    <motion.div 
      className={cn(
        "flex items-center rounded-full px-4 py-2",
        isTimeRunningOut ? "bg-red-50 text-red-600" : "bg-gloria-purple/10 text-gloria-purple"
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={controls}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Award className={cn(
        "w-5 h-5 mr-2",
        isTimeRunningOut && "animate-pulse"
      )} />
      <div>
        <span className="font-bold">{potentialPoints}</span>
        <span className="ml-1 text-sm">puntos posibles</span>
      </div>
    </motion.div>
  );
};

export default PotentialPoints;
