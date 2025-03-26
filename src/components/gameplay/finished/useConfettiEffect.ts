
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const useConfettiEffect = (isCorrect?: boolean, pointsEarned = 0) => {
  useEffect(() => {
    // Si no hay indicación de respuesta correcta, asumimos que es 
    // para el final del juego (pantalla de resultados)
    if (isCorrect === undefined) {
      // Lanzar confetti para el final del juego
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        // Ajustar la frecuencia según el tiempo restante
        const particleCount = 50 * (timeLeft / duration);
        
        // Lanzar confetti desde ambos lados
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
      
      return () => clearInterval(interval);
    } 
    // Para respuestas correctas durante el juego
    else if (isCorrect && pointsEarned > 0) {
      // Más confetti para puntajes altos
      const isHighScore = pointsEarned > 150;
      
      confetti({
        particleCount: isHighScore ? 150 : 80,
        spread: isHighScore ? 70 : 50,
        origin: { y: 0.6 },
        colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
      });
    }
  }, [isCorrect, pointsEarned]);
};
