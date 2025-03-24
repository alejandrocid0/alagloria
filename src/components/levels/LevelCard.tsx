
import { UserLevelWithProgress } from '@/types/userLevels';
import { Progress } from '@/components/ui/progress';
import LevelIcon from './LevelIcon';
import { Badge } from '@/components/ui/badge';

interface LevelCardProps {
  levelWithProgress: UserLevelWithProgress;
}

const LevelCard = ({ 
  levelWithProgress 
}: LevelCardProps) => {
  const { level, isCurrentLevel, isAchieved, progress, currentAnswers, nextLevelAnswers } = levelWithProgress;
  
  return (
    <div className={`p-4 rounded-lg border ${
      isCurrentLevel 
        ? 'border-gloria-purple bg-gloria-purple/10'
        : isAchieved 
          ? 'border-gloria-purple/50 bg-gloria-purple/5' 
          : 'border-gray-200'
    }`}>
      <div className="flex items-center space-x-3">
        <LevelIcon 
          level={level} 
          achieved={isAchieved} 
          isCurrentLevel={isCurrentLevel}
          size={32}
          showTooltip={false}
        />
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-semibold">{level.name}</h3>
            {isCurrentLevel && (
              <Badge className="ml-2 bg-gloria-purple">Actual</Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">{level.description}</p>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span>{currentAnswers} / {nextLevelAnswers || level.required_correct_answers} respuestas</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {isAchieved && !isCurrentLevel && (
        <div className="mt-2 text-xs text-right italic text-gloria-purple">
          ¡Nivel superado!
        </div>
      )}
    </div>
  );
};

export default LevelCard;
