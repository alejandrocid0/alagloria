
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';

interface Player {
  id: number;
  name: string;
  points: number;
  avatar: string;
}

interface FinishedStateProps {
  gameId: string | undefined;
  ranking: Player[];
  myPoints: number;
  myRank: number;
}

const FinishedState = ({ gameId, ranking, myPoints, myRank }: FinishedStateProps) => {
  return (
    <motion.div 
      key="finished"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center py-10"
    >
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-4">
          ¡Partida Finalizada!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Gracias por participar. Aquí tienes los resultados finales.
        </p>
        
        <div className="bg-gloria-cream/20 rounded-lg p-6 mb-8">
          <div className="mb-4">
            <span className="text-sm text-gray-500">Tu puntuación final</span>
            <div className="text-4xl font-bold text-gloria-purple">
              {myPoints}
            </div>
          </div>
          
          <div className="mb-4">
            <span className="text-sm text-gray-500">Tu posición final</span>
            <div className="text-2xl font-bold text-gloria-purple">
              {myRank}º lugar
            </div>
          </div>
          
          {gameId === 'demo-123' && myRank <= 3 ? (
            <div className="bg-gloria-gold/20 rounded-lg p-4 mt-6">
              <div className="flex items-center justify-center">
                <Award className="h-6 w-6 text-gloria-gold mr-2" />
                <span className="text-lg font-semibold text-gloria-gold">
                  ¡Felicidades! Has ganado un premio
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                El premio será transferido a tu cuenta en las próximas 48 horas.
              </p>
            </div>
          ) : (
            <div className="text-gray-600 mt-4">
              Sigue participando en más partidas para ganar puntos.
            </div>
          )}
        </div>
      </div>
      
      <h3 className="text-xl font-serif font-semibold text-gloria-purple mb-4">
        Clasificación Final
      </h3>
      
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="divide-y divide-gray-200">
          {ranking.slice(0, 3).map((player, index) => (
            <div 
              key={player.id}
              className={cn(
                "flex items-center py-4 px-6",
                index === 0 ? "bg-yellow-50" : 
                index === 1 ? "bg-gray-100" : 
                index === 2 ? "bg-amber-50" : "bg-white"
              )}
            >
              <div className="w-8 h-8 flex items-center justify-center mr-4">
                {index === 0 ? (
                  <span className="text-2xl">🥇</span>
                ) : index === 1 ? (
                  <span className="text-2xl">🥈</span>
                ) : (
                  <span className="text-2xl">🥉</span>
                )}
              </div>
              
              <div className="flex items-center flex-1">
                <img 
                  src={player.avatar} 
                  alt={player.name} 
                  className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" 
                />
                <div>
                  <div className="font-medium text-gray-800">
                    {player.id === 2 ? "Tú" : player.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {player.points.toLocaleString()} puntos
                  </div>
                </div>
              </div>
              
              {gameId === 'demo-123' && (
                <div className="text-right font-semibold">
                  {index === 0 ? "100€" : index === 1 ? "60€" : "40€"}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" href="/games">
          Ver más partidas
        </Button>
        
        <Button variant="secondary" href="/">
          Volver al inicio
        </Button>
      </div>
    </motion.div>
  );
};

export default FinishedState;
