
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, MessageSquare, Award, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Player } from '@/types/liveGame';
import { cn } from '@/lib/utils';

interface WaitingRoomProps {
  gameTitle: string;
  scheduledTime: string;
  playersOnline: Player[];
  prizePool?: number;
  timeUntilStart: number; // en segundos
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameTitle,
  scheduledTime,
  playersOnline,
  prizePool = 0,
  timeUntilStart,
}) => {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<number>(timeUntilStart);
  
  // Manejar la cuenta regresiva
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);
  
  // Formatear el tiempo restante
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Comenzando...';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-gloria-purple to-purple-600 p-6 text-white">
        <h2 className="text-2xl font-serif font-bold mb-2">{gameTitle}</h2>
        <div className="flex items-center text-white/80 text-sm">
          <Clock className="w-4 h-4 mr-1" />
          <span>{scheduledTime}</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-gloria-purple">Comienza en</h3>
            <div className="bg-gloria-purple/10 text-gloria-purple font-bold px-4 py-2 rounded-full">
              {formatTimeRemaining(countdown)}
            </div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
            <motion.div 
              className="h-full bg-gradient-to-r from-gloria-purple to-purple-600 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(countdown / timeUntilStart) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
              <div className="text-sm text-gray-500">Jugadores</div>
              <div className="font-medium text-gloria-purple">{playersOnline.length}</div>
            </div>
            
            <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
              <Award className="w-5 h-5 mx-auto mb-2 text-gloria-gold" />
              <div className="text-sm text-gray-500">Premio</div>
              <div className="font-medium text-gloria-gold">{prizePool}€</div>
            </div>
            
            <div className="bg-gloria-purple/5 rounded-lg p-4 text-center">
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
              <div className="text-sm text-gray-500">Chat</div>
              <div className="font-medium text-gloria-purple">Disponible</div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-serif font-bold text-gloria-purple mb-3">Jugadores en línea</h3>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-80 overflow-y-auto">
            {playersOnline.map((player, index) => (
              <div 
                key={player.id}
                className={cn(
                  "flex items-center py-3 px-4",
                  player.id === user?.id ? "bg-gloria-purple/10" : ""
                )}
              >
                <div className="flex-shrink-0 mr-3">
                  <img 
                    src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`}
                    alt={player.name} 
                    className="w-8 h-8 rounded-full" 
                  />
                </div>
                <div className="flex-grow">
                  <div className={cn(
                    "font-medium",
                    player.id === user?.id ? "text-gloria-purple" : "text-gray-800"
                  )}>
                    {player.id === user?.id ? `${player.name} (Tú)` : player.name}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Listo
                  </div>
                </div>
              </div>
            ))}
            
            {playersOnline.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Aún no hay jugadores conectados
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Importante</p>
            <p>No cierres esta página. La partida comenzará automáticamente cuando se alcance la hora programada.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
