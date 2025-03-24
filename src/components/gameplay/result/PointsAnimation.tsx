
import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles } from 'lucide-react';

interface PointsAnimationProps {
  pointsRef: React.RefObject<HTMLDivElement>;
  points: number;
  isVisible: boolean;
}

const PointsAnimation: React.FC<PointsAnimationProps> = ({ pointsRef, points, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <motion.div 
      ref={pointsRef}
      className="mt-4 inline-flex items-center justify-center bg-gloria-gold/20 text-gloria-gold px-4 py-2 rounded-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -5, 0],
        transition: { 
          y: { repeat: Infinity, duration: 1.5 },
          opacity: { duration: 0.3 }
        }
      }}
    >
      {points > 500 ? (
        <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
      ) : (
        <Award className="w-5 h-5 mr-2" />
      )}
      <span className="font-bold text-lg">+{points} puntos</span>
    </motion.div>
  );
};

export default PointsAnimation;
