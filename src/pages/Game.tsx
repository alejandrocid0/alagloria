
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
  
  // Redireccionar a login si no hay usuario y no es la demo
  useEffect(() => {
    if (!user && gameId !== 'demo-123') {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, gameId]);
  
  // Verificar el estado del juego al cargar
  useEffect(() => {
    const checkGameState = async () => {
      if (!gameId) return;
      
      try {
        // Intentar obtener el estado del juego
        const gameState = await fetchGameState(gameId);
        
        // Si el juego no existe aún o está en estado de espera
        if (!gameState || gameState.status === 'waiting') {
          console.log('El juego aún no está activo o está en espera, redirigiendo a la sala de espera');
          navigate(`/game/${gameId}/waiting`);
        }
      } catch (err) {
        console.error('Error al verificar estado del juego:', err);
      }
    };
    
    checkGameState();
  }, [gameId, navigate]);
  
  // Para la demo o usuarios autenticados
  if (gameId === 'demo-123' || user) {
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
  }
  
  return null;
};

export default Game;
