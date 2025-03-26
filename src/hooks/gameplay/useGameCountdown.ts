
import { useState, useEffect, useRef } from 'react';

type GameState = 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';

interface UseGameCountdownProps {
  currentState: GameState;
  selectedOption: string | null;
  currentQuestion: number;
  gameQuestionsLength: number;
  onStateChange: (newState: GameState) => void;
  onCurrentQuestionChange: (newQuestion: number) => void;
  onSelectedOptionChange: (option: string | null) => void;
  onTimeRemainingChange: (time: number) => void;
}

export const useGameCountdown = ({
  currentState,
  selectedOption,
  currentQuestion,
  gameQuestionsLength,
  onStateChange,
  onCurrentQuestionChange,
  onSelectedOptionChange,
  onTimeRemainingChange
}: UseGameCountdownProps) => {
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Limpiar cualquier timer existente cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Limpiar cualquier timer existente cuando cambie el estado
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (currentState === 'waiting') {
      console.log('Estado: waiting - Iniciando cuenta atrás de 5 segundos');
      setCountdown(5);
      
      timerRef.current = setInterval(() => {
        setCountdown(prev => {
          const newValue = prev - 1;
          console.log(`Cuenta atrás de espera: ${newValue} segundos`);
          
          if (newValue <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            console.log('Cuenta atrás finalizada - Cambiando a estado question');
            onStateChange('question');
            return 0;
          }
          return newValue;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
    
    if (currentState === 'question') {
      console.log('Estado: question - Iniciando cuenta atrás de 20 segundos');
      let currentTimeRemaining = 20; // Valor inicial
      onTimeRemainingChange(currentTimeRemaining);
      
      timerRef.current = setInterval(() => {
        currentTimeRemaining = currentTimeRemaining - 1;
        console.log(`Tiempo restante para responder: ${currentTimeRemaining} segundos`);
        onTimeRemainingChange(currentTimeRemaining);
        
        if (currentTimeRemaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          console.log('Tiempo agotado para responder - Cambiando a estado result');
          // Auto advance when time runs out, regardless of user selection
          onStateChange('result');
          if (!selectedOption) {
            console.log('No se seleccionó ninguna opción - Marcando como timeout');
            onSelectedOptionChange('timeout'); // Mark as timeout
          }
        }
      }, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    }
    
    if (currentState === 'result') {
      console.log('Estado: result - Mostrando resultado por 3 segundos');
      
      timerRef.current = setTimeout(() => {
        console.log(`Fin de mostrar resultado - ${currentQuestion < gameQuestionsLength - 1 ? 'Mostrando leaderboard' : 'Finalizando partida'}`);
        
        if (currentQuestion < gameQuestionsLength - 1) {
          onStateChange('leaderboard');
        } else {
          onStateChange('finished');
        }
        
        timerRef.current = null;
      }, 3000);
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
    
    if (currentState === 'leaderboard') {
      console.log('Estado: leaderboard - Mostrando clasificación por 5 segundos');
      
      timerRef.current = setTimeout(() => {
        console.log('Fin de mostrar leaderboard - Pasando a siguiente pregunta');
        onCurrentQuestionChange(currentQuestion + 1);
        onSelectedOptionChange(null);
        onTimeRemainingChange(20);
        onStateChange('question');
        
        timerRef.current = null;
      }, 5000);
      
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [
    currentState, 
    currentQuestion, 
    selectedOption, 
    gameQuestionsLength, 
    onStateChange, 
    onCurrentQuestionChange, 
    onSelectedOptionChange,
    onTimeRemainingChange
  ]);

  return {
    countdown
  };
};
