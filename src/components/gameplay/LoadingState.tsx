
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LoadingStateProps {
  message?: string;
  showBackButton?: boolean;
}

const LoadingState = ({ 
  message = "Cargando cuestionario...", 
  showBackButton = true 
}: LoadingStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <h2 className="text-xl font-serif font-semibold text-gloria-purple mb-4">
        {message}
      </h2>
      <div className="w-16 h-16 border-4 border-gloria-purple border-t-transparent rounded-full animate-spin mx-auto my-4"></div>
      {showBackButton && (
        <Button 
          variant="outline" 
          onClick={() => navigate('/games')}
          className="mt-4"
        >
          Volver a partidas
        </Button>
      )}
    </div>
  );
};

export default LoadingState;
