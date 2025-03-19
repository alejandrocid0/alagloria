
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  errorMessage: string | null;
  showBackButton?: boolean;
}

const ErrorState = ({ 
  errorMessage, 
  showBackButton = true 
}: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <h2 className="text-xl font-serif font-semibold text-gloria-purple mb-4">
        {errorMessage || "No se encontraron preguntas para este cuestionario"}
      </h2>
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

export default ErrorState;
