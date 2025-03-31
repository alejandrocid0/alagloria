
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimeSync } from '@/hooks/liveGame/useTimeSync';

interface QuestionTimerProps {
  timeRemaining: number;
  selectedOption: string | null;
  onTimeExpired: () => void;
  startTime?: number;
}

export const useQuestionTimer = ({ 
  timeRemaining: initialTime, 
  selectedOption,
  onTimeExpired,
  startTime
}: QuestionTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [flashWarning, setFlashWarning] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(200);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(startTime || Date.now());
  
  // Get synchronized time
  const { getAdjustedTime } = useTimeSync();
  
  // Función para calcular puntos potenciales basados en tiempo restante
  const calculatePotentialPoints = useCallback((seconds: number) => {
    const basePoints = 200;
    const percentage = seconds / initialTime;
    return Math.max(1, Math.round(basePoints * percentage));
  }, [initialTime]);
  
  // Efecto para gestionar el contador de tiempo
  useEffect(() => {
    // Si no hay un tiempo inicial, no iniciar el temporizador
    if (initialTime <= 0) return;
    
    // Inicializar el contador
    const adjustedInitialTime = startTime 
      ? Math.max(0, initialTime - Math.floor((getAdjustedTime() - startTime) / 1000))
      : initialTime;
    
    setSecondsLeft(adjustedInitialTime);
    setPotentialPoints(calculatePotentialPoints(adjustedInitialTime));
    setIsWarning(adjustedInitialTime <= 10);
    setIsUrgent(adjustedInitialTime <= 5);
    setFlashWarning(adjustedInitialTime <= 5);
    setHasPulsed(adjustedInitialTime <= 15);
    
    // Guardar referencia al tiempo de inicio
    startTimeRef.current = startTime || getAdjustedTime();
    
    // No iniciar el temporizador si ya se ha seleccionado una opción
    if (selectedOption) return;
    
    // Establecer un intervalo para actualizar el tiempo cada segundo
    const timer = window.setInterval(() => {
      const elapsedSeconds = Math.floor((getAdjustedTime() - startTimeRef.current) / 1000);
      const newSecondsLeft = Math.max(0, initialTime - elapsedSeconds);
      
      setSecondsLeft(newSecondsLeft);
      
      // Actualizar puntos potenciales
      setPotentialPoints(calculatePotentialPoints(newSecondsLeft));
      
      // Activar advertencias basadas en el tiempo restante
      if (newSecondsLeft <= 5 && !isUrgent) {
        setIsUrgent(true);
        setFlashWarning(true);
        setTimeout(() => setFlashWarning(false), 500);
      } else if (newSecondsLeft <= 10 && !isWarning) {
        setIsWarning(true);
      }
      
      // Activar pulso de animación a los 15 segundos
      if (newSecondsLeft <= 15 && !hasPulsed) {
        setHasPulsed(true);
      }
      
      // Si el tiempo se agota, enviar respuesta automática
      if (newSecondsLeft <= 0) {
        clearInterval(timer);
        onTimeExpired();
      }
    }, 1000);
    
    timerRef.current = timer;
    
    // Limpiar intervalo al desmontar
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    initialTime, 
    selectedOption, 
    calculatePotentialPoints, 
    onTimeExpired, 
    startTime,
    getAdjustedTime
  ]);
  
  // Detener el temporizador cuando se selecciona una opción
  useEffect(() => {
    if (selectedOption && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [selectedOption]);
  
  return {
    secondsLeft,
    isWarning,
    isUrgent,
    flashWarning,
    hasPulsed,
    potentialPoints,
    startTime: startTimeRef.current
  };
};
