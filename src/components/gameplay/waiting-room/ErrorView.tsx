
import React from 'react';

interface ErrorViewProps {
  error: string;
  onRetry: () => void;
}

const ErrorView = ({ error, onRetry }: ErrorViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-red-600 mb-2">Error de conexión</h2>
      <p className="text-gray-700 mb-4">{error}</p>
      <button 
        onClick={onRetry} 
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Reintentar
      </button>
    </div>
  );
};

export default ErrorView;
