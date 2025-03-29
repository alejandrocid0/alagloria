
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import WaitingRoom from '@/components/gameplay/WaitingRoom';
import { useGameInfo } from '@/components/gameplay/hooks/useGameInfo';
import { fetchGameState } from '@/hooks/liveGame/gameStateUtils';
import { gameNotifications } from '@/components/ui/notification-toast';
import { supabase } from '@/integrations/supabase/client';

const GamePlay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameId, mode } = useParams<{ gameId: string; mode?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [playersCount, setPlayersCount] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [playersOnline, setPlayersOnline] = useState([]);
  
  // Obtener información del juego
  const gameInfo = useGameInfo(gameId);
  
  // Determinar si estamos en modo sala de espera o juego
  const isWaitingMode = mode === 'waiting';
  
  // Cargar participantes de la partida
  useEffect(() => {
    if (!gameId) return;
    
    const loadParticipants = async () => {
      try {
        const { data, error } = await supabase
          .from('game_participants')
          .select('user_id, profiles:user_id(name, avatar_url)')
          .eq('game_id', gameId);
          
        if (error) throw error;
        
        if (data) {
          console.log('Participantes cargados:', data);
          const formattedPlayers = data.map((p, index) => {
            const profileData = p.profiles as any;
            return {
              id: p.user_id,
              name: profileData?.name || `Jugador ${index + 1}`,
              points: 0,
              rank: index + 1,
              avatar: profileData?.avatar_url || undefined,
              lastAnswer: null
            };
          });
          
          setPlayersOnline(formattedPlayers);
          setPlayersCount(data.length);
        }
      } catch (err) {
        console.error('Error al cargar participantes:', err);
      }
    };
    
    loadParticipants();
    
    // Suscribirse a cambios en los participantes
    const participantsChannel = supabase
      .channel(`game-participants-${gameId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`
        }, 
        () => {
          console.log('Cambio en participantes detectado, recargando');
          loadParticipants();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [gameId]);
  
  // Comprobar si el juego está activo para redireccionar automáticamente
  useEffect(() => {
    const checkGameActive = async () => {
      if (!gameId) return;
      
      try {
        const gameState = await fetchGameState(gameId);
        
        if (gameState) {
          setIsGameActive(true);
          
          // Si estamos en modo espera pero el juego ya está activo, redirigir
          if (isWaitingMode) {
            console.log('Juego activo detectado mientras estábamos en sala de espera, redirigiendo a juego en vivo');
            gameNotifications.gameStarting();
            
            setTimeout(() => {
              navigate(`/game/${gameId}`);
            }, 1500);
          }
        }
      } catch (err) {
        console.error('Error al verificar estado del juego:', err);
      }
    };
    
    checkGameActive();
    
    // Verificar periódicamente si el juego se activó
    const intervalId = setInterval(() => {
      if (isWaitingMode) {
        checkGameActive();
      }
    }, 30000); // Cada 30 segundos
    
    return () => clearInterval(intervalId);
  }, [gameId, isWaitingMode, navigate]);
  
  // Manejar estado de carga y redirigir a login si no hay usuario autenticado
  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else {
      // Pequeño retraso para asegurarnos de que la autenticación ha sido comprobada
      const timeout = setTimeout(() => {
        setIsLoading(false);
        if (!user) {
          navigate('/login', { state: { from: location.pathname } });
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [user, navigate]);
  
  // Comprobar si debemos redireccionar según la hora programada
  useEffect(() => {
    if (!isLoading && !isWaitingMode && gameInfo.scheduledTime) {
      const currentTime = new Date();
      const scheduledTime = new Date(gameInfo.scheduledTime);
      const isBeforeGameStart = currentTime < scheduledTime;
      
      // Calcular minutos hasta el inicio
      const minutesUntilStart = isBeforeGameStart 
        ? Math.ceil((scheduledTime.getTime() - currentTime.getTime()) / (1000 * 60)) 
        : 0;
      
      // Si estamos a más de 5 minutos del inicio y no estamos en la sala de espera, redirigir
      if (isBeforeGameStart && minutesUntilStart > 5 && !isWaitingMode) {
        console.log(`Partida programada para dentro de ${minutesUntilStart} minutos, redirigiendo a sala de espera...`);
        navigate(`/game/${gameId}/waiting`);
      }
    }
  }, [isLoading, gameInfo.scheduledTime, isWaitingMode, gameId, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="pt-20 md:pt-24 pb-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-gloria-purple/20 border-t-gloria-purple rounded-full"></div>
        </div>
      </div>
    );
  }
  
  // Solo renderizar si hay un usuario autenticado
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {isWaitingMode ? (
            // Renderizar la sala de espera previa
            <div className="min-h-[70vh] flex items-center justify-center">
              <WaitingRoom 
                gameTitle={gameInfo.title || (gameId ? `Partida #${gameId}` : "Partida")}
                scheduledTime={gameInfo.scheduledTime || new Date().toLocaleDateString()}
                playersOnline={playersOnline} // Usar la lista actualizada de jugadores
                timeUntilStart={
                  gameInfo.scheduledTime 
                    ? Math.max(0, Math.floor((new Date(gameInfo.scheduledTime).getTime() - new Date().getTime()) / 1000)) 
                    : 300
                }
                isGameActive={isGameActive}
              />
            </div>
          ) : (
            // Renderizar el juego en vivo
            <LiveGameRenderer />
          )}
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
