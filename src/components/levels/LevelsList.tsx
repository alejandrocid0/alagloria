
import { UserLevelWithProgress } from '@/types/userLevels';
import LevelCard from './LevelCard';

interface LevelsListProps {
  levels: UserLevelWithProgress[];
  loading?: boolean;
}

const LevelsList = ({ 
  levels,
  loading = false
}: LevelsListProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse p-4 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-gray-200 h-8 w-8"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (levels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay niveles disponibles en esta categoría.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {levels.map(levelWithProgress => (
        <LevelCard 
          key={levelWithProgress.level.id}
          levelWithProgress={levelWithProgress}
        />
      ))}
    </div>
  );
};

export default LevelsList;
