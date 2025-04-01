
import { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useConfettiEffect = (isWinner?: boolean, pointsEarned = 0) => {
  // Función para disparar confeti cuando el usuario gana
  const triggerWinnerConfetti = useCallback(() => {
    if (!isWinner) return;
    
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
    
    // Cancelar cualquier intervalo existente
    let currentInterval: NodeJS.Timeout;
    
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      
      // Ajustar frecuencia basada en el tiempo restante
      const particleCount = 50 * (timeLeft / duration);
      
      // Lanzar confeti desde ambos lados
      confetti({
        particleCount: Math.floor(randomInRange(particleCount * 0.5, particleCount)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 0 },
        colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
      });
      
      confetti({
        particleCount: Math.floor(randomInRange(particleCount * 0.5, particleCount)),
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: 1 },
        colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
      });
      
    }, 250);
    
    currentInterval = interval;
    
    return () => clearInterval(currentInterval);
  }, [isWinner]);
  
  // Función para disparar confeti más pequeño para respuestas correctas
  const triggerPointsConfetti = useCallback(() => {
    if (pointsEarned <= 0) return;
    
    // Más confeti para puntuaciones altas
    const isHighScore = pointsEarned > 150;
    
    confetti({
      particleCount: isHighScore ? 150 : 80,
      spread: isHighScore ? 70 : 50,
      origin: { y: 0.6 },
      colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
    });
  }, [pointsEarned]);
  
  // Efecto para el confeti ganador
  useEffect(() => {
    if (isWinner) {
      const cleanup = triggerWinnerConfetti();
      return cleanup;
    }
  }, [isWinner, triggerWinnerConfetti]);
  
  // Efecto para el confeti de puntos
  useEffect(() => {
    if (pointsEarned > 0) {
      triggerPointsConfetti();
    }
  }, [pointsEarned, triggerPointsConfetti]);
  
  return {
    triggerWinnerConfetti,
    triggerPointsConfetti
  };
};
