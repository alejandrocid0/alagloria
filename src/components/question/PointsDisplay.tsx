
import { AlertCircle } from 'lucide-react';

interface PointsDisplayProps {
  timeRemaining: number;
  timeLimit: number;
}

const PointsDisplay = ({ timeRemaining, timeLimit }: PointsDisplayProps) => {
  const calculatePotentialPoints = () => {
    if (timeLimit === 0) return 0;
    const basePoints = 100;
    const timeBonus = Math.round((timeRemaining / timeLimit) * 100);
    return basePoints + timeBonus;
  };
  
  return (
    <div className="mb-4 flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
      <AlertCircle size={16} className="text-blue-500 mr-2" />
      <span className="text-sm text-blue-700">
        Puntos posibles: <strong>{calculatePotentialPoints()}</strong> (100 base + {Math.round((timeRemaining / timeLimit) * 100)} por tiempo)
      </span>
    </div>
  );
};

export default PointsDisplay;
