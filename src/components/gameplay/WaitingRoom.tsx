
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Player } from '@/types/liveGame';
import { cn } from '@/lib/utils';

interface WaitingRoomProps {
  gameTitle: string;
  scheduledTime: string;
  playersOnline: Player[];
  timeUntilStart: number; // en segundos
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameTitle,
  scheduledTime,
  playersOnline,
  timeUntilStart,
}) => {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<number>(timeUntilStart);
  const [showPulse, setShowPulse] = useState<boolean>(false);
  
  // Manejar la cuenta regresiva
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);
  
  // Pulsar la cuenta atrás cuando queda poco tiempo
  useEffect(() => {
    if (countdown <= 10 && countdown > 0) {
      setShowPulse(true);
    }
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
      <motion.div 
        className="bg-gradient-to-r from-gloria-purple to-purple-600 p-6 text-white"
        initial={{ opacity: 0.9 }}
        animate={{ 
          opacity: 1,
          background: [
            "linear-gradient(to right, #5D3891, #7952B3)",
            "linear-gradient(to right, #4A2D73, #6E48A6)",
            "linear-gradient(to right, #5D3891, #7952B3)"
          ]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <motion.h2 
          className="text-2xl font-serif font-bold mb-2"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {gameTitle}
        </motion.h2>
        <motion.div 
          className="flex items-center text-white/80 text-sm"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Clock className="w-4 h-4 mr-1" />
          <span>{scheduledTime}</span>
        </motion.div>
      </motion.div>
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-gloria-purple">Comienza en</h3>
            <motion.div 
              className={cn(
                "bg-gloria-purple/10 text-gloria-purple font-bold px-4 py-2 rounded-full",
                showPulse && countdown <= 10 && countdown > 0 ? "animate-pulse" : ""
              )}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {countdown <= 10 && countdown > 0 && (
                <Sparkles className="w-4 h-4 mr-1 inline-block" />
              )}
              {formatTimeRemaining(countdown)}
            </motion.div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-gloria-purple to-purple-600 rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${(countdown / timeUntilStart) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
            <motion.div 
              className="bg-gloria-purple/5 rounded-lg p-4 text-center hover:bg-gloria-purple/10 transition-colors"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Users className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
              <div className="text-sm text-gray-500">Jugadores</div>
              <motion.div 
                className="font-medium text-gloria-purple"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {playersOnline.length}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-gloria-purple/5 rounded-lg p-4 text-center hover:bg-gloria-purple/10 transition-colors"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-2 text-gloria-purple" />
              <div className="text-sm text-gray-500">Chat</div>
              <motion.div 
                className="font-medium text-gloria-purple"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Disponible
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-serif font-bold text-gloria-purple mb-3">Jugadores en línea</h3>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {playersOnline.map((player, index) => (
                <motion.div 
                  key={player.id}
                  className={cn(
                    "flex items-center py-3 px-4",
                    player.id === user?.id ? "bg-gloria-purple/10" : ""
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="flex-shrink-0 mr-3">
                    <motion.img 
                      src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`}
                      alt={player.name} 
                      className="w-8 h-8 rounded-full" 
                      whileHover={{ scale: 1.1 }}
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
                    <motion.div 
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={{ 
                        y: player.id === user?.id ? [0, -2, 0] : 0
                      }}
                      transition={{ 
                        y: { repeat: player.id === user?.id ? Infinity : 0, repeatDelay: 2 }
                      }}
                    >
                      Listo
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {playersOnline.length === 0 && (
              <motion.div 
                className="py-8 text-center text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Aún no hay jugadores conectados
              </motion.div>
            )}
          </div>
        </div>
        
        <motion.div 
          className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">Importante</p>
            <p>No cierres esta página. La partida comenzará automáticamente cuando se alcance la hora programada.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WaitingRoom;
