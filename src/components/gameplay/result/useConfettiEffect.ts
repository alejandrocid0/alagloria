
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const useConfettiEffect = (isCorrect: boolean, points: number) => {
  useEffect(() => {
    if (isCorrect && points > 0) {
      // Confetti más elaborado para respuestas correctas
      const duration = 3000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#5D3891', '#9747FF', '#8235F3'],
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#5D3891', '#9747FF', '#8235F3'],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [isCorrect, points]);
};
