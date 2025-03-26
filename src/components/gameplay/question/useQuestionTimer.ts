
import { useState, useEffect, useRef } from 'react';

interface QuestionTimerProps {
  timeRemaining: number;
  selectedOption: string | null;
  onTimeExpired?: () => void;
}

export const useQuestionTimer = ({ 
  timeRemaining, 
  selectedOption,
  onTimeExpired
}: QuestionTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining);
  const [potentialPoints, setPotentialPoints] = useState(200);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [flashWarning, setFlashWarning] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reiniciar cuando cambia el tiempo total
  useEffect(() => {
    setSecondsLeft(timeRemaining);
  }, [timeRemaining]);
  
  // Temporizador principal
  useEffect(() => {
    // Si ya se seleccionó una opción o el tiempo se acabó, no necesitamos el temporizador
    if (selectedOption || secondsLeft <= 0) {
      if (secondsLeft <= 0 && onTimeExpired) {
        onTimeExpired();
      }
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
    
    // Empezar temporizador
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        const newValue = prev - 1;
        
        // Si llegamos a cero, limpiar el intervalo y llamar a onTimeExpired
        if (newValue <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          if (onTimeExpired) {
            onTimeExpired();
          }
          return 0;
        }
        
        return newValue;
      });
    }, 1000);
    
    // Limpiar temporizador al desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedOption, secondsLeft, onTimeExpired]);
  
  // Calcular puntos potenciales basados en el tiempo
  useEffect(() => {
    // Solo actualizar si no se ha seleccionado respuesta
    if (!selectedOption) {
      const percentage = secondsLeft / timeRemaining;
      setPotentialPoints(Math.round(200 * percentage));
    }
  }, [secondsLeft, timeRemaining, selectedOption]);
  
  // Gestionar estados de advertencia
  useEffect(() => {
    const warningThreshold = timeRemaining * 0.3; // 30% del tiempo
    const urgentThreshold = timeRemaining * 0.15; // 15% del tiempo
    
    setIsWarning(secondsLeft <= warningThreshold);
    setIsUrgent(secondsLeft <= urgentThreshold);
    
    // Flash warning cuando queda poco tiempo
    if (secondsLeft <= 5 && !hasPulsed) {
      setFlashWarning(true);
      setHasPulsed(true);
      
      const flashTimer = setTimeout(() => {
        setFlashWarning(false);
      }, 500);
      
      return () => clearTimeout(flashTimer);
    }
  }, [secondsLeft, timeRemaining, hasPulsed]);
  
  return {
    secondsLeft,
    potentialPoints,
    hasPulsed,
    isWarning,
    isUrgent,
    flashWarning
  };
};
