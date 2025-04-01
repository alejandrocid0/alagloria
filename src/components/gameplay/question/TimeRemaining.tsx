
import React from 'react';

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
  // Calculate percentage for progress bar
  const progressPercentage = (secondsLeft / timeRemaining) * 100;
  
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="text-sm font-medium mr-2">
        Tiempo: {secondsLeft}s
      </div>
      
      <div className="h-2 flex-grow bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            isUrgent
              ? 'bg-red-500'
              : isTimeRunningOut
                ? 'bg-yellow-500'
                : 'bg-green-500'
          } ${flashWarning ? 'animate-pulse' : ''}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default TimeRemaining;
