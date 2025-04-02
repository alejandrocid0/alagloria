
import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-gloria-purple border-t-transparent rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-serif font-bold text-gloria-purple mb-2">Uniendo a la partida...</h3>
        <p className="text-gray-500">Cargando preguntas y preparando el juego</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
