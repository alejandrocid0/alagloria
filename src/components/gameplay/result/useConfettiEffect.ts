
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const useConfettiEffect = (isCorrect: boolean, points: number) => {
  useEffect(() => {
    if (isCorrect && points > 0) {
      // Más confetti para puntajes altos
      const isHighScore = points > 150;
      
      // Lanzar confetti central
      confetti({
        particleCount: isHighScore ? 100 : 50,
        spread: isHighScore ? 90 : 60,
        origin: { y: 0.6 },
        colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
      });
      
      // Para puntajes muy altos, añadir efectos adicionales
      if (points > 180) {
        setTimeout(() => {
          confetti({
            particleCount: 30,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
          });
          
          confetti({
            particleCount: 30,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
          });
        }, 300);
      }
    }
  }, [isCorrect, points]);
};
