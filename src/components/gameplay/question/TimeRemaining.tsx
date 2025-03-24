
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle } from 'lucide-react';

interface TimeRemainingProps {
  secondsLeft: number;
  timeRemaining: number;
  isTimeRunningOut: boolean;
  isUrgent: boolean;
  flashWarning: boolean;
}

const TimeRemaining: React.FC<TimeRemainingProps> = ({
  secondsLeft,
  timeRemaining,
  isTimeRunningOut,
  isUrgent,
  flashWarning
}) => {
  return (
    <div className="flex items-center space-x-4 mb-4 md:mb-0">
      <motion.div 
        className={cn(
          "flex items-center justify-center w-14 h-14 rounded-full text-white font-bold text-xl",
          isTimeRunningOut 
            ? (isUrgent ? "bg-red-600" : "bg-red-500") 
            : secondsLeft <= 10 
              ? "bg-yellow-500" 
              : "bg-gloria-purple"
        )}
        animate={{ 
          scale: isTimeRunningOut ? [1, 1.1, 1] : 1,
          boxShadow: isUrgent 
            ? ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 10px rgba(239, 68, 68, 0.1)", "0 0 0 0 rgba(239, 68, 68, 0)"] 
            : "none"
        }}
        transition={{ 
          duration: 0.8, 
          repeat: isTimeRunningOut ? Infinity : 0,
          repeatDelay: 0.2
        }}
      >
        {secondsLeft}
      </motion.div>
      <div>
        <h3 className="text-sm text-gray-500 mb-1">Tiempo restante</h3>
        <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            className={cn(
              "h-full rounded-full",
              isTimeRunningOut 
                ? (isUrgent ? "bg-red-600" : "bg-red-500") 
                : secondsLeft <= 10 
                  ? "bg-yellow-500" 
                  : "bg-gloria-purple"
            )}
            initial={{ width: "100%" }}
            animate={{ 
              width: `${(secondsLeft / timeRemaining) * 100}%`,
              opacity: flashWarning ? [1, 0.5, 1] : 1
            }}
            transition={{ 
              duration: 0.4,
              opacity: { duration: 0.2 }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TimeRemaining;
