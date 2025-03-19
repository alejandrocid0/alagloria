
import Button from '@/components/Button';

const LoadingState = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center">
      <h2 className="text-xl font-serif font-semibold text-gloria-purple mb-4">
        Cargando cuestionario...
      </h2>
      <div className="w-16 h-16 border-4 border-gloria-purple border-t-transparent rounded-full animate-spin mx-auto my-4"></div>
      <Button variant="primary" href="/games">
        Volver a partidas
      </Button>
    </div>
  );
};

export default LoadingState;
