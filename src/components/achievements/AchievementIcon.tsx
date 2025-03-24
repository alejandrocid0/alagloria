
import { Achievement } from '@/types/achievements';
import { 
  Award, Star, Trophy, Medal, BookOpen, 
  Heart, ThumbsUp, Target, CheckCircle, Clock,
  LucideProps
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AchievementIconProps {
  achievement: Achievement;
  size?: number;
  earned?: boolean;
  showTooltip?: boolean;
}

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  'award': Award,
  'star': Star,
  'trophy': Trophy,
  'medal': Medal,
  'book': BookOpen,
  'heart': Heart,
  'thumbsup': ThumbsUp,
  'target': Target,
  'check': CheckCircle,
  'clock': Clock
};

const AchievementIcon = ({ 
  achievement, 
  size = 24, 
  earned = false,
  showTooltip = true 
}: AchievementIconProps) => {
  // Seleccionar el icono según el nombre
  const IconComponent = iconMap[achievement.icon_name] || Award;
  
  const icon = (
    <div className={`rounded-full p-2 ${
      earned 
        ? 'bg-gloria-purple text-white' 
        : 'bg-gray-200 text-gray-400'
    }`}>
      <IconComponent size={size} className={earned ? 'animate-pulse' : ''} />
    </div>
  );
  
  if (!showTooltip) {
    return icon;
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {icon}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-bold">{achievement.name}</p>
            <p className="text-xs text-gray-500">{achievement.description}</p>
            <p className="text-xs mt-1">
              {earned 
                ? '¡Logro conseguido!' 
                : `Necesitas ${achievement.required_correct_answers} respuestas correctas`
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementIcon;
