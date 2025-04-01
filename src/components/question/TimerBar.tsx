
import React from 'react';

interface TimerBarProps {
  timeRemaining: number;
  timeLimit: number;
  animateTimeWarning?: boolean;
}

const TimerBar: React.FC<TimerBarProps> = ({ 
  timeRemaining, 
  timeLimit,
  animateTimeWarning = false
}) => {
  // Calculate progress percentage
  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / timeLimit) * 100));
  
  // Determine color based on time remaining
  const getBarColor = () => {
    if (timeRemaining <= 5) return 'bg-red-500';
    if (timeRemaining <= 10) return 'bg-yellow-500'; 
    return 'bg-green-500';
  };

  return (
    <div className="h-2 bg-gray-100 rounded-full w-full overflow-hidden">
      <div 
        className={`h-full ${getBarColor()} transition-all duration-1000 ${
          animateTimeWarning ? 'animate-pulse' : ''
        }`}
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
};

export default TimerBar;
