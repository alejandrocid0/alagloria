
import React from 'react';
import { BadgeCheck, Award, Clock, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserStatsCardsProps {
  rank: number;
  points: number;
  playTime?: string;
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ 
  rank, 
  points, 
  playTime = "3:24" 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
        <BadgeCheck className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
        <div className="text-sm text-gray-500">Puesto</div>
        <div className="font-bold text-gloria-purple">#{rank}</div>
      </div>
      
      <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
        <Award className="w-5 h-5 mx-auto mb-2 text-gloria-gold" />
        <div className="text-sm text-gray-500">Puntos</div>
        <div className="font-bold text-gloria-gold">{points}</div>
      </div>
      
      <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
        <Clock className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
        <div className="text-sm text-gray-500">Tiempo</div>
        <div className="font-bold text-gloria-purple">{playTime}</div>
      </div>
      
      <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
        <Share2 className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
        <div className="text-sm text-gray-500">Compartir</div>
        <div className="font-bold text-gloria-purple">
          <button className="text-sm hover:underline">
            Invitar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;
