
import React from 'react';
import Button from '@/components/Button';

interface FinalActionsProps {
  hasGameStarted: boolean;
  isWithinFiveMinutes: boolean;
  handlePlayNow: () => void;
}

const FinalActions = ({ hasGameStarted, isWithinFiveMinutes, handlePlayNow }: FinalActionsProps) => {
  return (
    <>
      {hasGameStarted && (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePlayNow}
            className="w-full mt-4"
          >
            Unirse a la partida en curso
          </Button>
        </div>
      )}
      
      {isWithinFiveMinutes && !hasGameStarted && (
        <div className="mt-4 bg-gloria-purple/5 rounded-lg p-4 text-center">
          <p className="text-gloria-purple font-medium">Estamos a menos de 5 minutos del inicio de la partida</p>
          <p className="text-sm text-gray-600 mt-1">Prepárate para jugar, la partida comenzará automáticamente.</p>
        </div>
      )}
    </>
  );
};

export default FinalActions;
