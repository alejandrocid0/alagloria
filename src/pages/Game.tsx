
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import { fetchGameState } from '@/hooks/liveGame/gameStateUtils';
import { useAuth } from '@/contexts/AuthContext';

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Redireccionar a login si no hay usuario
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate]);
  
  // Verificar el estado del juego al cargar
  useEffect(() => {
    const checkGameState = async () => {
      if (!gameId) return;
      
      try {
        // Intentar obtener el estado del juego
        const gameState = await fetchGameState(gameId);
        
        // Si el juego no existe aún o no está activo, y tiene una fecha programada
        if (!gameState || gameState.status === 'pending') {
          console.log('El juego aún no está activo, redirigiendo a la sala de espera');
          navigate(`/game/${gameId}/waiting`);
        }
      } catch (err) {
        console.error('Error al verificar estado del juego:', err);
      }
    };
    
    checkGameState();
  }, [gameId, navigate]);
  
  return (
    <>
      <Navbar />
      
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <LiveGameRenderer />
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Game;
