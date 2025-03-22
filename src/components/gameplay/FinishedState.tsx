
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, ArrowRight, Award, BadgeCheck, Clock, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';

interface Player {
  id: string;
  name: string;
  points: number;
  rank: number;
  avatar?: string;
  lastAnswer?: 'correct' | 'incorrect' | null;
}

interface FinishedStateProps {
  gameId: string;
  ranking: Player[];
  myPoints: number;
  myRank: number;
}

const FinishedState: React.FC<FinishedStateProps> = ({
  gameId,
  ranking,
  myPoints,
  myRank
}) => {
  const { user } = useAuth();
  const topPlayers = ranking.slice(0, 3);
  const otherPlayers = ranking.slice(3, 10);
  
  // Lanzar confetti cuando se muestre el componente
  useEffect(() => {
    // Diferentes estilos de confetti para hacer más festiva la pantalla
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 }
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 }
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);

  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-glory-gold/20 p-4 rounded-full mb-4"
        >
          <Trophy className="w-12 h-12 text-gloria-gold" />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gloria-purple mb-2">
            ¡Partida completada!
          </h2>
          
          <p className="text-gray-600 max-w-md mx-auto">
            Has finalizado la partida con <span className="font-bold text-gloria-purple">{myPoints} puntos</span> y 
            has quedado en el puesto <span className="font-bold text-gloria-purple">#{myRank}</span>.
          </p>
        </motion.div>
      </div>
      
      {/* Podio de ganadores */}
      <div className="mb-10">
        <h3 className="text-lg font-serif font-bold text-gloria-purple text-center mb-6">
          Ganadores
        </h3>
        
        <div className="relative h-48 flex items-end justify-center gap-4 md:gap-8 mb-6">
          {topPlayers.map((player, index) => {
            const isCurrentUser = player.id === user?.id;
            const height = index === 0 ? "h-full" : index === 1 ? "h-4/5" : "h-3/5";
            const delay = index * 0.2;
            
            return (
              <motion.div
                key={player.id}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay, duration: 0.5, type: "spring" }}
                className="relative flex flex-col items-center"
              >
                <div className="absolute -top-10">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    index === 0 ? "bg-gloria-gold" : index === 1 ? "bg-gray-300" : "bg-amber-600"
                  )}>
                    {index === 0 ? (
                      <Trophy className="w-4 h-4 text-white" />
                    ) : (
                      <Medal className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
                
                <div className={cn(
                  "relative w-20 md:w-24 rounded-t-lg flex items-center justify-center",
                  index === 0 ? "bg-gloria-gold/90" : index === 1 ? "bg-gray-300/90" : "bg-amber-600/90",
                  height
                )}>
                  <span className="absolute top-2 font-bold text-white">
                    #{index + 1}
                  </span>
                  
                  <div className="mt-4 flex flex-col items-center">
                    <img 
                      src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`}
                      alt={player.name}
                      className={cn(
                        "w-12 h-12 rounded-full border-2",
                        isCurrentUser ? "border-white" : "border-transparent"
                      )}
                    />
                    
                    <div className="px-1 mt-2 pb-2">
                      <div className="text-xs text-white font-medium truncate max-w-[80px]">
                        {isCurrentUser ? "Tú" : player.name}
                      </div>
                      <div className="text-xs text-white/90 font-bold">
                        {player.points}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Lista de otros jugadores */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 py-2 px-4">
            <div className="col-span-1 text-left font-medium text-gray-500 text-sm">#</div>
            <div className="col-span-7 text-left font-medium text-gray-500 text-sm">Jugador</div>
            <div className="col-span-4 text-right font-medium text-gray-500 text-sm">Puntos</div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {otherPlayers.map((player, index) => {
              const position = index + 4; // Empezar en la posición 4
              const isCurrentUser = player.id === user?.id;
              
              return (
                <motion.div 
                  key={player.id}
                  className={cn(
                    "grid grid-cols-12 py-3 px-4 items-center",
                    isCurrentUser ? "bg-gloria-purple/10" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1), duration: 0.3 }}
                >
                  <div className="col-span-1 font-semibold text-gray-700">
                    {position}
                  </div>
                  <div className="col-span-7 flex items-center">
                    <img 
                      src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`}
                      alt={player.name} 
                      className="w-8 h-8 rounded-full mr-3" 
                    />
                    <span className={cn(
                      "font-medium",
                      isCurrentUser ? "text-gloria-purple" : "text-gray-800"
                    )}>
                      {isCurrentUser ? "Tú" : player.name}
                    </span>
                  </div>
                  <div className="col-span-4 text-right font-semibold text-gray-800">
                    {player.points.toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Estadísticas y acciones */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
            <BadgeCheck className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
            <div className="text-sm text-gray-500">Puesto</div>
            <div className="font-bold text-gloria-purple">#{myRank}</div>
          </div>
          
          <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
            <Award className="w-5 h-5 mx-auto mb-2 text-gloria-gold" />
            <div className="text-sm text-gray-500">Puntos</div>
            <div className="font-bold text-gloria-gold">{myPoints}</div>
          </div>
          
          <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
            <div className="text-sm text-gray-500">Tiempo</div>
            <div className="font-bold text-gloria-purple">3:24</div>
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
        
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            href="/games"
          >
            Ver más partidas
          </Button>
          
          <Button
            variant="primary"
            size="lg"
            className="flex-1 flex items-center justify-center"
            href="/dashboard"
          >
            Mi historial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default FinishedState;
