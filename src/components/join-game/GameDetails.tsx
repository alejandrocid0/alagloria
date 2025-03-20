
import React from 'react';
import { Calendar, Users, Award, Check } from 'lucide-react';
import { Game } from '@/components/games/types';

interface GameDetailsProps {
  gameData: Game;
  formattedDate: string;
}

const GameDetails: React.FC<GameDetailsProps> = ({ gameData, formattedDate }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={gameData.image} 
          alt={gameData.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gloria-deepPurple/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
            {gameData.title}
          </h1>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gloria-purple mr-2" />
            <span className="text-gray-700">{formattedDate}</span>
          </div>
          
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gloria-purple mr-2" />
            <span className="text-gray-700">{gameData.participants} de {gameData.maxParticipants} participantes</span>
          </div>
          
          <div className="flex items-center">
            <Award className="h-5 w-5 text-gloria-gold mr-2" />
            <span className="font-medium text-gloria-gold">{gameData.prizePool}€ en premios</span>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gloria-purple mb-2">
            Descripción
          </h2>
          <p className="text-gray-600">
            {gameData.description || "Sin descripción disponible."}
          </p>
        </div>
        
        {gameData.prizeDistribution && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gloria-purple mb-3">
              Premios
            </h2>
            <div className="bg-gloria-cream/20 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {gameData.prizeDistribution.map((prize) => (
                  <div 
                    key={prize.position} 
                    className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm text-center"
                  >
                    <div className="text-lg font-semibold text-gloria-purple mb-1">
                      {prize.position === 1 ? "🥇 Primer puesto" : 
                       prize.position === 2 ? "🥈 Segundo puesto" : 
                       "🥉 Tercer puesto"}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {prize.percentage}% del bote
                    </div>
                    <div className="text-xl font-bold text-gloria-gold">
                      {prize.amount}€
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-lg font-semibold text-gloria-purple mb-3">
            ¿Cómo funciona?
          </h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Une a la partida por solo 1€ para poder participar.</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Conéctate a la hora programada para jugar en directo con todos los participantes.</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Responde correctamente y lo más rápido posible para acumular puntos.</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-600">Los tres primeros puestos reciben premios económicos del bote acumulado.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
