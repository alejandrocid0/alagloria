
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const useConfettiEffect = (isCorrect: boolean = true, points: number = 0) => {
  useEffect(() => {
    if (isCorrect && points > 0) {
      // Determinar la intensidad del efecto según los puntos
      const isHighScore = points > 150;
      const isExceptionalScore = points > 180;
      
      // Colores de confetti basados en la marca
      const colors = ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'];
      
      // Lanzar confetti central con más intensidad para puntuaciones altas
      confetti({
        particleCount: isHighScore ? 100 : 50,
        spread: isHighScore ? 90 : 60,
        origin: { y: 0.6 },
        colors,
        gravity: 1.2,
        scalar: isHighScore ? 1.2 : 1,
        disableForReducedMotion: true,
      });
      
      // Para puntajes excepcionales, añadir efectos adicionales
      if (isExceptionalScore) {
        // Efecto lateral izquierdo con retraso
        setTimeout(() => {
          confetti({
            particleCount: 30,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.5 },
            colors,
            gravity: 1,
            scalar: 1.2,
            disableForReducedMotion: true,
          });
          
          // Efecto lateral derecho simultáneo
          confetti({
            particleCount: 30,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.5 },
            colors,
            gravity: 1,
            scalar: 1.2,
            disableForReducedMotion: true,
          });
        }, 300);
        
        // Efecto final para puntuaciones máximas
        if (points > 195) {
          setTimeout(() => {
            confetti({
              particleCount: 80,
              startVelocity: 30,
              spread: 360,
              origin: { x: 0.5, y: 0.5 },
              colors,
              ticks: 200,
              disableForReducedMotion: true,
            });
          }, 600);
        }
      }
    }
  }, [isCorrect, points]);
};

export default useConfettiEffect;
