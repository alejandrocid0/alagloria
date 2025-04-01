
import { useEffect, RefObject } from 'react';
import confetti from 'canvas-confetti';

export const useConfettiEffect = (targetRef: RefObject<HTMLElement>, isWinner?: boolean, pointsEarned = 0) => {
  useEffect(() => {
    // For winning the game or top positions
    if (isWinner) {
      // Launch confetti for end of game
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
        
        // Adjust frequency based on remaining time
        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from both sides
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
    // For correct answers during the game
    else if (pointsEarned > 0) {
      // More confetti for high scores
      const isHighScore = pointsEarned > 150;
      
      confetti({
        particleCount: isHighScore ? 150 : 80,
        spread: isHighScore ? 70 : 50,
        origin: { y: 0.6 },
        colors: ['#5D3891', '#9D76C1', '#E5B8F4', '#FACBEA'],
      });
    }
  }, [isWinner, pointsEarned]);
};
