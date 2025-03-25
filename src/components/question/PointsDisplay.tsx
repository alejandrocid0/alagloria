
import { AlertCircle } from 'lucide-react';

interface PointsDisplayProps {
  timeRemaining: number;
  timeLimit: number;
}

const PointsDisplay = ({ timeRemaining, timeLimit }: PointsDisplayProps) => {
  const calculatePotentialPoints = () => {
    if (timeLimit === 0) return 0;
    // Calculate points directly based on time percentage with max 200
    const timePercentage = timeRemaining / timeLimit;
    return Math.round(200 * timePercentage);
  };
  
  return (
    <div className="mb-4 flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
      <AlertCircle size={16} className="text-blue-500 mr-2" />
      <span className="text-sm text-blue-700">
        Puntos posibles: <strong>{calculatePotentialPoints()}</strong> (basado en tiempo restante)
      </span>
    </div>
  );
};

export default PointsDisplay;
