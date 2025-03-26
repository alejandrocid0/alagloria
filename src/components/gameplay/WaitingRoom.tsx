
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, MessageSquare, AlertTriangle, Sparkles, PlayCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Player } from '@/types/liveGame';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/Button';
import { subscribeToGameStateUpdates } from '@/hooks/liveGame/gameStateUtils';
import { useParams } from 'react-router-dom';
import { subscribeToLeaderboardUpdates } from '@/hooks/liveGame/leaderboardUtils';
import { supabase } from '@/integrations/supabase/client';
import { gameNotifications } from '@/components/ui/notification-toast';

interface WaitingRoomProps {
  gameTitle: string;
  scheduledTime: string;
  playersOnline: Player[];
  timeUntilStart: number; // en segundos
  isGameActive?: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({
  gameTitle,
  scheduledTime,
  playersOnline: initialPlayersOnline,
  timeUntilStart,
  isGameActive = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [countdown, setCountdown] = useState<number>(timeUntilStart);
  const [showPulse, setShowPulse] = useState<boolean>(false);
  const [playersOnline, setPlayersOnline] = useState<Player[]>(initialPlayersOnline);
  const [isWithinFiveMinutes, setIsWithinFiveMinutes] = useState(countdown <= 300); // 5 minutos (300 segundos)
  
  // Estado para controlar si el juego ya comenzó
  const [hasGameStarted, setHasGameStarted] = useState(isGameActive);
  
  // Suscribirse a cambios en el estado del juego y en la lista de jugadores
  useEffect(() => {
    if (!gameId) return;
    
    // Canal para estado del juego
    const gameStateChannel = subscribeToGameStateUpdates(gameId, (payload) => {
      console.log('Cambio en el estado del juego detectado:', payload);
      
      // Si el juego ha cambiado a estado 'waiting' o posterior, marcar como iniciado
      if (payload.new && (payload.new.status !== 'pending')) {
        setHasGameStarted(true);
        gameNotifications.gameStarting();
        
        // Redirigir automáticamente a la partida tras un breve retraso
        setTimeout(() => {
          navigate(`/game/${gameId}`);
        }, 1500);
      }
    });
    
    // Canal para actualizaciones de la lista de jugadores
    const leaderboardChannel = subscribeToLeaderboardUpdates(gameId, async () => {
      // Actualizar lista de jugadores desde el servidor
      try {
        const { data: gameParticipants } = await supabase
          .from('game_participants')
          .select('user_id, users(name, avatar_url)')
          .eq('game_id', gameId);
        
        if (gameParticipants) {
          const players = gameParticipants.map((p, index) => ({
            id: p.user_id,
            name: p.users?.name || `Jugador ${index + 1}`,
            points: 0,
            rank: index + 1,
            avatar: p.users?.avatar_url || undefined,
            lastAnswer: null
          }));
          
          setPlayersOnline(players);
        }
      } catch (err) {
        console.error('Error al obtener participantes:', err);
      }
    });
    
    // Cargar participantes iniciales
    const loadInitialParticipants = async () => {
      try {
        const { data: gameParticipants, error } = await supabase
          .from('game_participants')
          .select('user_id, users:user_id(name, avatar_url)')
          .eq('game_id', gameId);
        
        if (error) throw error;
        
        if (gameParticipants && gameParticipants.length > 0) {
          const players = gameParticipants.map((p, index) => {
            // Safely access properties using optional chaining
            const userData = p.users as any;
            return {
              id: p.user_id,
              name: userData?.name || `Jugador ${index + 1}`,
              points: 0,
              rank: index + 1,
              avatar: userData?.avatar_url || undefined,
              lastAnswer: null
            };
          });
          
          setPlayersOnline(players);
        }
      } catch (err) {
        console.error('Error al obtener participantes iniciales:', err);
      }
    };
    
    loadInitialParticipants();
    
    // Limpiar suscripciones al desmontar
    return () => {
      supabase.removeChannel(gameStateChannel);
      supabase.removeChannel(leaderboardChannel);
    };
  }, [gameId, navigate]);
  
  // Manejar la cuenta regresiva
  useEffect(() => {
    if (countdown <= 0) {
      // Cuando la cuenta regresiva llegue a cero, actualizamos el estado
      setHasGameStarted(true);
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        const newValue = Math.max(0, prev - 1);
        
        // Cuando llegamos a 5 minutos (300 segundos), actualizar el estado
        if (prev > 300 && newValue <= 300) {
          setIsWithinFiveMinutes(true);
          // Opcional: mostrar alguna notificación
          gameNotifications.fiveMinutesWarning();
        }
        
        // Cuando llegamos a cero, marcar como iniciado
        if (newValue === 0) {
          setHasGameStarted(true);
          gameNotifications.gameStarting();
          
          // Redirigir automáticamente a la partida tras un breve retraso
          if (gameId) {
            setTimeout(() => {
              navigate(`/game/${gameId}`);
            }, 1500);
          }
        }
        
        return newValue;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, gameId, navigate]);
  
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
  
  // Manejar el clic en el botón de jugar ahora
  const handlePlayNow = () => {
    if (gameId) {
      navigate(`/game/${gameId}`);
    }
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
            <h3 className="text-lg font-serif font-bold text-gloria-purple">
              {hasGameStarted ? 'Partida en curso' : 'Comienza en'}
            </h3>
            
            {hasGameStarted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePlayNow}
                  className="flex items-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Jugar ahora
                </Button>
              </motion.div>
            ) : (
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
                {hasGameStarted ? 'En curso' : formatTimeRemaining(countdown)}
              </motion.div>
            )}
          </div>
          
          {!hasGameStarted && (
            <div className="w-full bg-gray-100 rounded-full h-2 mb-4 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-gloria-purple to-purple-600 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${(countdown / timeUntilStart) * 100}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          )}
          
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
              <div className="text-sm text-gray-500">Estado</div>
              <motion.div 
                className="font-medium text-gloria-purple"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {hasGameStarted ? 'En curso' : (isWithinFiveMinutes ? 'Preparando' : 'Esperando')}
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
            {hasGameStarted ? (
              <p>La partida ya ha comenzado. Haz clic en "Jugar ahora" para unirte a ella inmediatamente.</p>
            ) : (
              <p>No cierres esta página. La partida comenzará automáticamente cuando se alcance la hora programada.</p>
            )}
          </div>
        </motion.div>
        
        {hasGameStarted && (
          <div className="mt-4 text-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={handlePlayNow}
              className="w-full mt-4"
            >
              Unirse a la partida en curso
            </Button>
          </div>
        )}
        
        {isWithinFiveMinutes && !hasGameStarted && (
          <div className="mt-4 bg-gloria-purple/5 rounded-lg p-4 text-center">
            <p className="text-gloria-purple font-medium">Estamos a menos de 5 minutos del inicio de la partida</p>
            <p className="text-sm text-gray-600 mt-1">Prepárate para jugar, la partida comenzará automáticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
