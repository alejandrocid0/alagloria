
import { Link } from 'react-router-dom';

interface EarlyWaitingStateProps {
  gameId: string | undefined;
}

const EarlyWaitingState = ({ gameId }: EarlyWaitingStateProps) => {
  return (
    <div className="text-center p-8">
      <h2 className="text-xl font-medium text-gloria-purple mb-4">
        La partida aún no ha comenzado
      </h2>
      <p className="text-gray-600 mb-4">
        Esta partida está programada para comenzar en más de 5 minutos. 
        Por favor, ve a la sala de espera hasta que sea el momento.
      </p>
      <Link 
        to={`/game/${gameId}/waiting`} 
        className="inline-block bg-gloria-purple text-white px-4 py-2 rounded hover:bg-gloria-purple/90 transition-colors"
      >
        Ir a la sala de espera
      </Link>
    </div>
  );
};

export default EarlyWaitingState;
