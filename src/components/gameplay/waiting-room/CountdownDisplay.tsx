
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface CountdownDisplayProps {
  countdown: number;
  hasGameStarted: boolean;
  showPulse: boolean;
  formatTimeRemaining: (seconds: number) => string;
}

const CountdownDisplay = ({ 
  countdown, 
  hasGameStarted, 
  showPulse,
  formatTimeRemaining 
}: CountdownDisplayProps) => {
  return (
    <motion.div 
      className={cn(
        "bg-gloria-purple/10 text-gloria-purple font-bold px-4 py-2 rounded-full",
        showPulse && countdown <= 10 && countdown > 0 ? "animate-pulse" : ""
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {countdown <= 10 && countdown > 0 && (
        <Sparkles className="w-4 h-4 mr-1 inline-block" />
      )}
      {hasGameStarted ? 'En curso' : formatTimeRemaining(countdown)}
    </motion.div>
  );
};

export default CountdownDisplay;
