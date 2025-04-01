
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import LiveGameRenderer from '@/components/gameplay/LiveGameRenderer';
import GamePlayLoading from '@/components/gameplay/GamePlayLoading';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const GamePlay = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Función para manejar la recarga manual de datos
  const handleManualRefresh = () => {
    toast({
      title: "Actualizando datos",
      description: "Recargando información de la partida"
    });
    
    // Recargar la página para obtener los datos más recientes
    window.location.reload();
  };
  
  // Show loading state
  if (isLoading) {
    return <GamePlayLoading />;
  }
  
  // Only render if user is authenticated
  if (!user) return null;
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> 
              Recargar datos
            </Button>
          </div>
          
          {/* Renderizar el juego en vivo */}
          <LiveGameRenderer />
        </div>
      </div>
    </div>
  );
};

export default GamePlay;
