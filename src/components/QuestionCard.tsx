
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface QuestionCardProps {
  question: string;
  options: string[];
  correctAnswer?: number;
  timeLimit: number;  // in seconds
  onAnswer: (optionIndex: number, timeRemaining: number) => void;
  answered?: boolean;
  selectedOption?: number;
  showResult?: boolean;
}

const QuestionCard = ({
  question,
  options,
  correctAnswer,
  timeLimit,
  onAnswer,
  answered = false,
  selectedOption,
  showResult = false
}: QuestionCardProps) => {
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(selectedOption);
  
  // Handle countdown timer
  useEffect(() => {
    if (answered || timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [answered, timeRemaining]);
  
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
  const progressColor = progressWidth > 50 
    ? 'bg-green-500' 
    : progressWidth > 20 
      ? 'bg-yellow-500' 
      : 'bg-red-500';
  
  return (
    <div className="glass-panel p-6 md:p-8 max-w-3xl mx-auto">
      {/* Timer bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-gloria-purple" />
            <span className="text-sm font-medium">
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
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${progressColor}`} 
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-serif text-gloria-purple mb-6">{question}</h3>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <div 
            key={index}
            className={getOptionClassName(index)}
            onClick={() => handleOptionClick(index)}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
