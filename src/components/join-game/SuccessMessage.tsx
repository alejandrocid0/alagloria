
import React from 'react';
import { Check, Calendar, Clock } from 'lucide-react';
import Button from '@/components/Button';
import { Game } from '@/components/games/types';

interface SuccessMessageProps {
  gameData: Game;
  formattedDate: string;
  gameId: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ gameData, formattedDate, gameId }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-gloria-purple mb-4">
          ¡Te has unido a la partida!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Has completado tu inscripción a <span className="font-semibold">{gameData.title}</span>. 
          Recuerda conectarte el <span className="font-semibold">{formattedDate}</span> para participar.
        </p>
        
        <div className="bg-gloria-cream/20 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gloria-purple mb-4">Detalles de la partida</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center">
              <Calendar className="h-6 w-6 text-gloria-purple mx-auto mb-2" />
              <div className="text-sm text-gray-500">Fecha</div>
              <div className="font-medium">{gameData.date.toLocaleDateString('es-ES')}</div>
            </div>
            
            <div className="text-center">
              <Clock className="h-6 w-6 text-gloria-purple mx-auto mb-2" />
              <div className="text-sm text-gray-500">Hora</div>
              <div className="font-medium">{gameData.date.toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            href={`/game/${gameId}`}
          >
            Ir a la sala de espera
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            href="/games"
          >
            Ver más partidas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
