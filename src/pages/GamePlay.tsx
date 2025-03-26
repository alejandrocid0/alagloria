
import Navbar from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import WaitingRoom from '@/components/gameplay/WaitingRoom';

const GamePlay = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameId, mode } = useParams<{ gameId: string; mode?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  
  // Determinar si estamos en modo sala de espera o juego
  const isWaitingMode = mode === 'waiting';
  
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
                gameTitle={gameId ? `Partida #${gameId}` : "Partida"}
                scheduledTime={new Date().toLocaleDateString()} // Esto debería venir de la base de datos
                playersOnline={[]} // Esto debería venir de la base de datos
                timeUntilStart={300} // 5 minutos (300 segundos)
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
