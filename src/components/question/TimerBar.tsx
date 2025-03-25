
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  timeRemaining: number;
  timeLimit: number;
  animateTimeWarning: boolean;
}

const TimerBar = ({ timeRemaining, timeLimit, animateTimeWarning }: TimerBarProps) => {
  // Calculate progress bar width
  const progressWidth = (timeRemaining / timeLimit) * 100;
  let progressColor = progressWidth > 50 
    ? 'bg-green-500' 
    : progressWidth > 20 
      ? 'bg-yellow-500' 
      : 'bg-red-500';
  
  // Progress variants for animation
  const progressVariants = {
    normal: { width: `${progressWidth}%` },
    warning: { 
      width: `${progressWidth}%`,
      scale: [1, 1.03, 1],
      transition: { 
        scale: { 
          repeat: Infinity,
          duration: 0.5
        },
        width: { 
          duration: 1
        }
      }
    }
  };

  return (
    <div className="flex items-center">
      <Clock size={16} className={`mr-2 ${timeRemaining < timeLimit * 0.3 ? 'text-red-500' : 'text-gloria-purple'}`} />
      <span className={`text-sm font-medium ${timeRemaining < timeLimit * 0.3 ? 'text-red-500' : ''}`}>
        {timeRemaining > 0 ? `${timeRemaining}s restantes` : "¡Tiempo agotado!"}
      </span>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden ml-2">
        <motion.div 
          className={`h-2 rounded-full ${progressColor}`}
          variants={progressVariants}
          animate={animateTimeWarning ? "warning" : "normal"}
        />
      </div>
    </div>
  );
};

export default TimerBar;
