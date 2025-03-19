
import { Users, Award } from 'lucide-react';

interface GameHeaderProps {
  quizTitle: string;
  playersCount: number;
  myPoints: number;
  isDemoGame: boolean;
}

const GameHeader = ({ 
  quizTitle, 
  playersCount, 
  myPoints, 
  isDemoGame 
}: GameHeaderProps) => {
  return (
    <div className="bg-gloria-purple text-white px-6 py-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-xl md:text-2xl font-serif font-bold">
          {quizTitle}
        </h1>
        
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <div className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            <span>{playersCount} jugadores</span>
          </div>
          
          {!isDemoGame && (
            <div className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              <span>Puntos: {myPoints}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHeader;
