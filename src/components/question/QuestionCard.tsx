
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import TimerBar from './TimerBar';
import OptionButton from './OptionButton';
import ResultExplanation from './ResultExplanation';
import PointsDisplay from './PointsDisplay';
import QuestionProgress from './QuestionProgress';
import AnswerResult from './AnswerResult';

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
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(selectedOption);
  const [animateTimeWarning, setAnimateTimeWarning] = useState(false);
  
  // Aleatorizar opciones al iniciar, pero mantener el índice correcto
  const randomizedOptions = useMemo(() => {
    // Si estamos mostrando resultados, no mezclar para no confundir al usuario
    if (showResult || answered) {
      return options;
    }
    
    // Crear array de objetos con el texto y el índice original
    const optionsWithIndex = options.map((text, index) => ({ text, originalIndex: index }));
    
    // Mezclar el array
    for (let i = optionsWithIndex.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionsWithIndex[i], optionsWithIndex[j]] = [optionsWithIndex[j], optionsWithIndex[i]];
    }
    
    return optionsWithIndex;
  }, [options, showResult, answered]);
  
  // Handle countdown timer
  useEffect(() => {
    if (answered || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        
        // Trigger warning animation when less than 30% time remaining
        if (prev / timeLimit <= 0.3 && !animateTimeWarning) {
          setAnimateTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [answered, timeRemaining, timeLimit, animateTimeWarning]);
  
  // Auto-submit when timer reaches zero
  useEffect(() => {
    if (timeRemaining === 0 && !answered && selectedIdx !== undefined) {
      onAnswer(selectedIdx, 0);
    }
  }, [timeRemaining, answered, selectedIdx, onAnswer]);
  
  const handleOptionClick = (index: number) => {
    if (answered) return;
    
    // Traducir el índice aleatorizado al índice original para mantener correcta la respuesta
    const originalIndex = randomizedOptions[index].originalIndex;
    
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
          const displayIndex = showResult ? option.originalIndex : index;
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
