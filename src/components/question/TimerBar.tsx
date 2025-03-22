
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimerBarProps {
  timeRemaining: number;
  timeLimit: number;
  animateTimeWarning: boolean;
}

const TimerBar = ({ 
  timeRemaining, 
  timeLimit, 
  animateTimeWarning 
}: TimerBarProps) => {
  // Calculate progress bar width
  const progressWidth = (timeRemaining / timeLimit) * 100;
  
  // Determine color based on time remaining
  const getProgressColor = () => {
    if (progressWidth > 60) return 'bg-green-500';
    if (progressWidth > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Dynamic progress color
  const progressColor = getProgressColor();
  
  // Time formatting for display
  const formatTime = (seconds: number) => {
    if (seconds < 10) return `0${seconds}s`;
    return `${seconds}s`;
  };
  
  // Progress variants for animation
  const progressVariants = {
    normal: { 
      width: `${progressWidth}%`,
      transition: { duration: 0.3, ease: "linear" }
    },
    warning: { 
      width: `${progressWidth}%`,
      scale: [1, 1.02, 1],
      transition: { 
        scale: { 
          repeat: Infinity,
          duration: 0.5
        },
        width: { 
          duration: 0.3,
          ease: "linear"
        }
      }
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock 
            size={16} 
            className={cn(
              "mr-2 transition-colors",
              timeRemaining < timeLimit * 0.3 
                ? 'text-red-500' 
                : 'text-gloria-purple'
            )} 
          />
          <span className={cn(
            "text-sm font-medium transition-colors",
            timeRemaining < timeLimit * 0.3 ? 'text-red-500' : ''
          )}>
            {timeRemaining > 0 
              ? `${formatTime(timeRemaining)} restantes` 
              : "¡Tiempo agotado!"
            }
          </span>
        </div>
        
        {timeRemaining <= timeLimit * 0.3 && timeRemaining > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center text-xs text-red-500"
          >
            <AlertCircle size={14} className="mr-1 animate-pulse" />
            ¡Rápido!
          </motion.div>
        )}
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div 
          className={cn("h-3 rounded-full", progressColor)}
          variants={progressVariants}
          animate={animateTimeWarning ? "warning" : "normal"}
        />
      </div>
      
      {/* Time markers */}
      <div className="flex justify-between mt-1 px-1">
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default TimerBar;
