
import Button from '@/components/Button';

interface ErrorStateProps {
  errorMessage: string | null;
}

const ErrorState = ({ errorMessage }: ErrorStateProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <h2 className="text-xl font-serif font-semibold text-gloria-purple mb-4">
        {errorMessage || "No se encontraron preguntas para este cuestionario"}
      </h2>
      <Button variant="primary" href="/games">
        Volver a partidas
      </Button>
    </div>
  );
};

export default ErrorState;
