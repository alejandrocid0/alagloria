
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import GamePlayLoading from '@/components/gameplay/GamePlayLoading';
import { useAuth } from '@/contexts/AuthContext';
import GameControls from '@/components/gameplay/GameControls';
import { toast } from '@/hooks/use-toast';

const GamePlay = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  
  // Función para manejar la recarga manual de datos
  const handleManualRefresh = () => {
    toast({
      title: "Actualizando datos",
      description: "Recargando información de la partida"
    });
    
    // Recargar la página para obtener los datos más recientes
    window.location.reload();
  };
  
  // Mostrar para usuarios autenticados o para la partida demo
  if (!user && gameId !== 'demo-123') return null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <GameControls onRefresh={handleManualRefresh} />
          
          {/* Renderizar el juego en vivo */}
          <LiveGameRenderer />
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
