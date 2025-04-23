
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/types/liveGame';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface PlayersListSectionProps {
  playersOnline: Player[];
  isLoading?: boolean;
}

const PlayersListSection = ({ playersOnline, isLoading = false }: PlayersListSectionProps) => {
  const { user } = useAuth();
  const prevPlayersCountRef = useRef(playersOnline.length);
  const listRef = useRef<HTMLDivElement>(null);

  // Efecto para detectar cambios en la cantidad de jugadores
  useEffect(() => {
    const prevCount = prevPlayersCountRef.current;
    const currentCount = playersOnline.length;
    
    if (currentCount > prevCount) {
      console.log(`[PlayersListSection] Nuevos jugadores conectados: de ${prevCount} a ${currentCount}`);
    }
    
    prevPlayersCountRef.current = currentCount;
  }, [playersOnline.length]);

  // Scroll automático al final de la lista cuando nuevos jugadores se unen
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [playersOnline.length]);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-serif font-bold text-gloria-purple">Jugadores en línea</h3>
        <Badge variant="outline" className="bg-gloria-purple/10">
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Cargando...
            </span>
          ) : (
            `${playersOnline.length} ${playersOnline.length === 1 ? 'jugador' : 'jugadores'}`
          )}
        </Badge>
      </div>
      
      <div 
        ref={listRef}
        className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 max-h-80 overflow-y-auto"
      >
        {isLoading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-gloria-purple" />
            <p className="text-gray-500">Cargando participantes...</p>
          </div>
        ) : (
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
                exit={{ opacity: 0, x: 10 }}
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
                    Conectado
                  </motion.div>
                </div>
              </motion.div>
            ))}

            {!isLoading && playersOnline.length === 0 && (
              <motion.div 
                className="py-8 text-center text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Aún no hay jugadores conectados
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PlayersListSection;
