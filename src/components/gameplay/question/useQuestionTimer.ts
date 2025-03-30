
import { useState, useEffect, useCallback } from 'react';

interface QuestionTimerProps {
  timeRemaining: number;
  selectedOption: string | null;
  onTimeExpired: () => void;
}

export const useQuestionTimer = ({ 
  timeRemaining, 
  selectedOption,
  onTimeExpired
}: QuestionTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining);
  const [isWarning, setIsWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [flashWarning, setFlashWarning] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(200);
  const [timerId, setTimerId] = useState<number | null>(null);
  
  // Función para calcular puntos potenciales basados en tiempo restante
  const calculatePotentialPoints = useCallback((seconds: number) => {
    const basePoints = 200;
    const percentage = seconds / timeRemaining;
    return Math.max(1, Math.round(basePoints * percentage));
  }, [timeRemaining]);
  
  // Efecto para gestionar el contador de tiempo
  useEffect(() => {
    // Inicializar el contador
    setSecondsLeft(timeRemaining);
    setPotentialPoints(200);
    setIsWarning(false);
    setIsUrgent(false);
    setFlashWarning(false);
    setHasPulsed(false);
    
    // No iniciar el temporizador si ya se ha seleccionado una opción
    if (selectedOption) return;
    
    // Establecer un intervalo para actualizar el tiempo cada segundo
    const timer = window.setInterval(() => {
      setSecondsLeft(prev => {
        const newValue = prev - 1;
        
        // Actualizar puntos potenciales
        setPotentialPoints(calculatePotentialPoints(newValue));
        
        // Activar advertencias basadas en el tiempo restante
        if (newValue <= 5 && !isUrgent) {
          setIsUrgent(true);
          setFlashWarning(true);
          setTimeout(() => setFlashWarning(false), 500);
        } else if (newValue <= 10 && !isWarning) {
          setIsWarning(true);
        }
        
        // Activar pulso de animación a los 15 segundos
        if (newValue === 15 && !hasPulsed) {
          setHasPulsed(true);
        }
        
        // Si el tiempo se agota, enviar respuesta automática
        if (newValue <= 0) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        
        return newValue;
      });
    }, 1000);
    
    setTimerId(timer);
    
    // Limpiar intervalo al desmontar
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    timeRemaining, 
    selectedOption, 
    calculatePotentialPoints, 
    onTimeExpired, 
    isWarning, 
    isUrgent, 
    hasPulsed
  ]);
  
  // Detener el temporizador cuando se selecciona una opción
  useEffect(() => {
    if (selectedOption && timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  }, [selectedOption, timerId]);
  
  return {
    secondsLeft,
    isWarning,
    isUrgent,
    flashWarning,
    hasPulsed,
    potentialPoints
  };
};
