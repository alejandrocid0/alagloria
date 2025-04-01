
import React from 'react';
import { Trophy, Save, CheckCircle } from 'lucide-react';

interface HeaderSectionProps {
  title: string;
  myRank: number;
  resultsSaved: boolean;
}

const HeaderSection = ({ title, myRank, resultsSaved }: HeaderSectionProps) => {
  // Determine rank message
  const getRankMessage = (rank: number) => {
    if (rank === 1) return "¡Has ganado la partida!";
    if (rank === 2) return "¡Segundo lugar!";
    if (rank === 3) return "¡Tercer lugar!";
    if (rank <= 10) return `Posición ${rank}. ¡Buen trabajo!`;
    return `Has quedado en posición ${rank}`;
  };

  return (
    <div className="mb-6 text-center">
      <div className="flex justify-center">
        <div className="inline-flex items-center justify-center bg-gloria-purple text-white rounded-full h-14 w-14 mb-4">
          <Trophy className="w-7 h-7" />
        </div>
      </div>
      
      <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-1">
        ¡Partida finalizada!
      </h2>
      
      <p className="text-lg font-medium text-gray-800 mb-2">
        {getRankMessage(myRank)}
      </p>
      
      <p className="text-sm text-gray-600 mb-3">
        {title}
      </p>
      
      {resultsSaved ? (
        <div className="flex items-center justify-center text-sm text-green-600">
          <CheckCircle className="w-4 h-4 mr-1" />
          <span>Resultados guardados</span>
        </div>
      ) : (
        <div className="flex items-center justify-center text-sm text-blue-600 animate-pulse">
          <Save className="w-4 h-4 mr-1" />
          <span>Guardando resultados...</span>
        </div>
      )}
    </div>
  );
};

export default HeaderSection;
