
import { useState, useEffect } from 'react';
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
    
    setSelectedIdx(index);
    onAnswer(index, timeRemaining);
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
        {options.map((option, index) => (
          <OptionButton
            key={index}
            index={index}
            text={option}
            selectedIdx={selectedIdx}
            correctAnswer={correctAnswer}
            answered={answered}
            showResult={showResult}
            onClick={handleOptionClick}
          />
        ))}
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
