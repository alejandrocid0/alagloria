
import { UserLevel } from '@/types/userLevels';
import { 
  User, UserRound, Users, UsersRound, 
  Badge, BadgeCheck, Trophy, LucideProps
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LevelIconProps {
  level: UserLevel;
  size?: number;
  achieved?: boolean;
  isCurrentLevel?: boolean;
  showTooltip?: boolean;
}

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  'user': User,
  'user-round': UserRound,
  'users': Users,
  'users-round': UsersRound,
  'badge': Badge,
  'badge-check': BadgeCheck,
  'trophy': Trophy
};

const LevelIcon = ({ 
  level, 
  size = 24, 
  achieved = false,
  isCurrentLevel = false,
  showTooltip = true 
}: LevelIconProps) => {
  // Seleccionar el icono según el nombre
  const IconComponent = iconMap[level.icon_name] || Trophy;
  
  const icon = (
    <div className={`rounded-full p-2 ${
      isCurrentLevel 
        ? 'bg-gloria-purple text-white animate-pulse'
        : achieved 
          ? 'bg-gloria-purple/80 text-white' 
          : 'bg-gray-200 text-gray-400'
    }`}>
      <IconComponent size={size} />
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
            <p className="font-bold">{level.name}</p>
            <p className="text-xs text-gray-500">{level.description}</p>
            <p className="text-xs mt-1">
              {achieved 
                ? isCurrentLevel 
                  ? '¡Tu nivel actual!' 
                  : '¡Nivel desbloqueado!'
                : `Necesitas ${level.required_correct_answers} respuestas correctas`
              }
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LevelIcon;
