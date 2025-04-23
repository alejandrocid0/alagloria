
import React from 'react';
import { CalendarIcon, Users } from 'lucide-react';

interface GameInfoSectionProps {
  gameTitle: string;
  isGameHost: boolean;
}

const GameInfoSection = ({ gameTitle, isGameHost }: GameInfoSectionProps) => {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-serif font-bold text-gloria-purple mb-4 flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5" />
        Información de la partida
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Título:</span>
          <span className="font-medium text-gray-800">{gameTitle}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Tu rol:</span>
          <span className="font-medium">
            {isGameHost ? (
              <span className="text-gloria-purple flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Anfitrión
              </span>
            ) : (
              <span className="text-gray-800">Participante</span>
            )}
          </span>
        </div>
        
        {isGameHost && (
          <div className="bg-gloria-purple/5 rounded-lg p-4 mt-2">
            <p className="text-sm text-gloria-purple">
              Como anfitrión, puedes iniciar la partida en cualquier momento utilizando el botón "Iniciar partida ahora".
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInfoSection;
