
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import ResultHeader from './result/ResultHeader';
import PointsAnimation from './result/PointsAnimation';
import QuestionDetails from './result/QuestionDetails';
import NextQuestionIndicator from './result/NextQuestionIndicator';
import { useConfettiEffect } from './result/useConfettiEffect';

interface ResultStateProps {
  currentQuestionData: QuizQuestion;
  selectedOption: string | null;
  lastPoints: number;
}

const ResultState: React.FC<ResultStateProps> = ({
  currentQuestionData,
  selectedOption,
  lastPoints,
}) => {
  const pointsRef = useRef<HTMLDivElement>(null);
  
  // Comprobar si la respuesta seleccionada es correcta
  const isCorrect = selectedOption === currentQuestionData.correctOption;
  
  // Use custom hook for confetti effect
  useConfettiEffect(isCorrect, lastPoints);
  
  // Animate points counter if answer is correct
  useEffect(() => {
    if (isCorrect && lastPoints > 0 && pointsRef.current) {
      const animation = pointsRef.current.animate(
        [
          { scale: 1, y: 20, opacity: 0 },
          { scale: 1.5, y: -10, opacity: 1 },
          { scale: 1, y: 0, opacity: 1 }
        ],
        {
          duration: 700,
          easing: 'cubic-bezier(.36,.07,.19,.97)'
        }
      );
      
      return () => {
        animation.cancel();
      };
    }
  }, [isCorrect, lastPoints]);
  
  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="py-6"
    >
      <ResultHeader isCorrect={isCorrect} lastPoints={lastPoints} />
      
      <PointsAnimation 
        pointsRef={pointsRef} 
        points={lastPoints} 
        isVisible={isCorrect && lastPoints > 0} 
      />
      
      <QuestionDetails 
        currentQuestionData={currentQuestionData}
        selectedOption={selectedOption}
        isCorrect={isCorrect}
      />
      
      <NextQuestionIndicator />
    </motion.div>
  );
};

export default ResultState;
