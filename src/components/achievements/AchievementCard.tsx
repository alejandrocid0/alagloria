
import { AchievementWithProgress } from '@/types/achievements';
import { Progress } from '@/components/ui/progress';
import AchievementIcon from './AchievementIcon';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AchievementCardProps {
  achievementWithProgress: AchievementWithProgress;
}

const AchievementCard = ({ 
  achievementWithProgress 
}: AchievementCardProps) => {
  const { achievement, earned, earned_at, progress, current_count } = achievementWithProgress;
  
  return (
    <div className={`p-4 rounded-lg border ${
      earned ? 'border-gloria-purple bg-gloria-purple/5' : 'border-gray-200'
    }`}>
      <div className="flex items-center space-x-3">
        <AchievementIcon 
          achievement={achievement} 
          earned={earned} 
          size={32}
          showTooltip={false}
        />
        <div className="flex-1">
          <h3 className="font-semibold">{achievement.name}</h3>
          <p className="text-sm text-gray-600">{achievement.description}</p>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span>{current_count} / {achievement.required_correct_answers} respuestas</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {earned && earned_at && (
        <div className="mt-2 text-xs text-right italic text-gloria-purple">
          Conseguido el {format(new Date(earned_at), 'PPP', { locale: es })}
        </div>
      )}
    </div>
  );
};

export default AchievementCard;
