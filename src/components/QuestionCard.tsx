
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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
  
  const getOptionClassName = (index: number) => {
    let className = "relative p-4 border rounded-lg transition-all duration-200 cursor-pointer";
    
    if (!answered && !showResult) {
      className += " hover:border-gloria-purple hover:bg-gloria-purple/5";
      className += selectedIdx === index ? " border-gloria-purple bg-gloria-purple/5" : " border-gray-200";
    } else if (showResult) {
      if (index === correctAnswer) {
        className += " border-green-500 bg-green-50";
      } else if (selectedIdx === index && index !== correctAnswer) {
        className += " border-red-500 bg-red-50";
      } else {
        className += " border-gray-200 opacity-70";
      }
    }
    
    return className;
  };
  
  // Calculate progress bar width
  const progressWidth = (timeRemaining / timeLimit) * 100;
  let progressColor = progressWidth > 50 
    ? 'bg-green-500' 
    : progressWidth > 20 
      ? 'bg-yellow-500' 
      : 'bg-red-500';
  
  // Progress variants for animation
  const progressVariants = {
    normal: { width: `${progressWidth}%` },
    warning: { 
      width: `${progressWidth}%`,
      scale: [1, 1.03, 1],
      transition: { 
        scale: { 
          repeat: Infinity,
          duration: 0.5
        },
        width: { 
          duration: 1
        }
      }
    }
  };

  // Points calculation preview
  const calculatePotentialPoints = () => {
    if (timeLimit === 0) return 0;
    const basePoints = 100;
    const timeBonus = Math.round((timeRemaining / timeLimit) * 100);
    return basePoints + timeBonus;
  };
  
  return (
    <motion.div 
      className="glass-panel p-6 md:p-8 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Question progress */}
      {questionNumber && totalQuestions && (
        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gloria-purple">
            Pregunta {questionNumber} de {totalQuestions}
          </span>
          <div className="w-1/2 bg-gray-200 h-1 rounded-full overflow-hidden">
            <div 
              className="h-1 bg-gloria-purple rounded-full"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Timer bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock size={16} className={`mr-2 ${timeRemaining < timeLimit * 0.3 ? 'text-red-500' : 'text-gloria-purple'}`} />
            <span className={`text-sm font-medium ${timeRemaining < timeLimit * 0.3 ? 'text-red-500' : ''}`}>
              {timeRemaining > 0 ? `${timeRemaining}s restantes` : "¡Tiempo agotado!"}
            </span>
          </div>
          {showResult && selectedIdx !== undefined && (
            <div className="flex items-center">
              {selectedIdx === correctAnswer ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle size={16} className="mr-1" />
                  <span className="text-sm font-medium">¡Correcto!</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle size={16} className="mr-1" />
                  <span className="text-sm font-medium">Incorrecto</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div 
            className={`h-2 rounded-full ${progressColor}`}
            variants={progressVariants}
            animate={animateTimeWarning ? "warning" : "normal"}
          />
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-serif text-gloria-purple mb-6">{question}</h3>
      
      {!answered && !showResult && (
        <div className="mb-4 flex items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <AlertCircle size={16} className="text-blue-500 mr-2" />
          <span className="text-sm text-blue-700">
            Puntos posibles: <strong>{calculatePotentialPoints()}</strong> (100 base + {Math.round((timeRemaining / timeLimit) * 100)} por tiempo)
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.div 
            key={index}
            className={getOptionClassName(index)}
            onClick={() => handleOptionClick(index)}
            whileHover={!answered ? { scale: 1.01 } : {}}
            whileTap={!answered ? { scale: 0.99 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full border border-current flex items-center justify-center text-sm mr-3 mt-0.5">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="text-base">{option}</div>
            </div>
            
            {showResult && index === correctAnswer && (
              <div className="absolute top-2 right-2 text-green-600">
                <CheckCircle size={18} />
              </div>
            )}
            
            {showResult && selectedIdx === index && index !== correctAnswer && (
              <div className="absolute top-2 right-2 text-red-600">
                <XCircle size={18} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {showResult && (
        <motion.div 
          className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <h4 className="font-medium text-gloria-purple mb-2">Explicación</h4>
          <p className="text-sm text-gray-700">
            {correctAnswer !== undefined && selectedIdx === correctAnswer 
              ? "¡Respuesta correcta! Has sumado puntos en base a tu velocidad de respuesta."
              : "La respuesta correcta es la opción " + String.fromCharCode(65 + (correctAnswer || 0)) + "."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
