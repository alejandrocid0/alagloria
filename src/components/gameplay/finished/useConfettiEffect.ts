
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export const useConfettiEffect = () => {
  useEffect(() => {
    // Diferentes estilos de confetti para hacer más festiva la pantalla
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 }
      });
      
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 }
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }, []);
};
