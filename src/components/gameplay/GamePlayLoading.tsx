
import { Loader2 } from 'lucide-react';

const GamePlayLoading = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <Loader2 className="w-12 h-12 mx-auto text-gloria-purple animate-spin" />
        <h3 className="mt-4 text-xl font-medium text-gray-800">
          Cargando partida...
        </h3>
        <p className="mt-2 text-gray-600">
          Preparando la sala de espera para ti.
        </p>
      </div>
    </div>
  );
};

export default GamePlayLoading;
