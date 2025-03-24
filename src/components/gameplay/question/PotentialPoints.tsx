
import { AlertCircle } from 'lucide-react';

interface PotentialPointsProps {
  potentialPoints: number;
  isTimeRunningOut: boolean;
  selectedOption: string | null;
}

const PotentialPoints = ({ 
  potentialPoints,
  isTimeRunningOut,
  selectedOption
}: PotentialPointsProps) => {
  if (selectedOption) return null;
  
  return (
    <div className={`flex-shrink-0 ${isTimeRunningOut ? 'animate-pulse' : ''}`}>
      <div className="flex items-center p-2 rounded-lg bg-gloria-purple/10 border border-gloria-purple/20">
        <AlertCircle size={16} className="text-gloria-purple mr-2" />
        <span className="text-sm text-gloria-purple font-medium">
          {potentialPoints} puntos posibles
        </span>
      </div>
    </div>
  );
};

export default PotentialPoints;
