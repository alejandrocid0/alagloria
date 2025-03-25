
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import TimerBar from './TimerBar';
import OptionButton from './OptionButton';
import ResultExplanation from './ResultExplanation';
import PointsDisplay from './PointsDisplay';
import QuestionProgress from './QuestionProgress';
import AnswerResult from './AnswerResult';
import useOptionsManager from './hooks/useOptionsManager';
import useQuestionTimer from './hooks/useQuestionTimer';

interface QuestionCardProps {
  question: string;
  options: string[];
  correctAnswer?: number;
  timeLimit: number;  // in seconds
  onAnswer: (optionIndex: number, timeRemaining: number) => void;
  answered?: boolean;
  selectedOption?: number;
  showResult?: boolean;
  questionNumber?: number;
  totalQuestions?: number;
}

const QuestionCard = ({
  question,
  options,
  correctAnswer,
  timeLimit,
  onAnswer,
  answered = false,
  selectedOption,
  showResult = false,
  questionNumber,
  totalQuestions
}: QuestionCardProps) => {
  // Extracting options randomization and selection logic to a custom hook
  const { randomizedOptions, selectedIdx, setSelectedIdx } = useOptionsManager({
    options,
    selectedOption,
    showResult,
    answered
  });
  
  // Extracting timer logic to a custom hook
  const { timeRemaining, animateTimeWarning } = useQuestionTimer({
    timeLimit,
    answered,
    selectedIdx,
    onAnswer
  });
  
  // Handle option selection
  const handleOptionClick = (index: number) => {
    if (answered) return;
    
    // Traducir el índice aleatorizado al índice original para mantener correcta la respuesta
    const option = randomizedOptions[index];
    const originalIndex = typeof option === 'string' ? index : option.originalIndex;
    
    setSelectedIdx(originalIndex);
    onAnswer(originalIndex, timeRemaining);
  };
  
  return (
    <motion.div 
      className="glass-panel p-6 md:p-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Question progress */}
      <QuestionProgress 
        questionNumber={questionNumber} 
        totalQuestions={totalQuestions} 
      />
      
      {/* Timer bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <TimerBar 
            timeRemaining={timeRemaining} 
            timeLimit={timeLimit} 
            animateTimeWarning={animateTimeWarning} 
          />
          
          <AnswerResult 
            selectedOption={selectedIdx} 
            correctAnswer={correctAnswer} 
            showResult={showResult} 
          />
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-serif text-gloria-purple mb-6">{question}</h3>
      
      {!answered && !showResult && (
        <PointsDisplay 
          timeRemaining={timeRemaining} 
          timeLimit={timeLimit} 
        />
      )}
      
      <div className="space-y-3">
        {randomizedOptions.map((option, index) => {
          // Si estamos mostrando resultados, usar los índices originales
          const displayIndex = showResult 
            ? (typeof option === 'string' ? index : option.originalIndex) 
            : index;
          const text = typeof option === 'string' ? option : option.text;
          
          return (
            <OptionButton
              key={index}
              index={displayIndex}
              text={text}
              selectedIdx={selectedIdx}
              correctAnswer={correctAnswer}
              answered={answered}
              showResult={showResult}
              onClick={() => handleOptionClick(index)}
            />
          );
        })}
      </div>
      
      {showResult && (
        <ResultExplanation 
          correctAnswer={correctAnswer || 0} 
          selectedIdx={selectedIdx} 
        />
      )}
    </motion.div>
  );
};

export default QuestionCard;
