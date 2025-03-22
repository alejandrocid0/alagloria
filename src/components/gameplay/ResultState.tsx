
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { QuizQuestion } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface ResultStateProps {
  currentQuestionData: QuizQuestion;
  selectedOption: string | null;
  lastPoints: number;
}

const ResultState = ({ currentQuestionData, selectedOption, lastPoints }: ResultStateProps) => {
  const isCorrect = selectedOption === currentQuestionData.correctOption;
  
  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          {isCorrect ? (
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          ) : (
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          )}
        </div>
        
        <h2 className="text-xl md:text-2xl font-serif font-semibold mb-2">
          {isCorrect 
            ? "¡Respuesta correcta!" 
            : "Respuesta incorrecta"}
        </h2>
        
        {isCorrect && (
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-gloria-purple">
              +{lastPoints} puntos
            </p>
          </div>
        )}
        
        <p className="text-gray-600 mb-6">
          {currentQuestionData.question}
        </p>
      </div>
      
      <div className="grid gap-3">
        {currentQuestionData.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectOption = option.id === currentQuestionData.correctOption;
          
          return (
            <div
              key={option.id}
              className={cn(
                "w-full text-left p-4 rounded-lg border",
                isCorrectOption 
                  ? "border-green-500 bg-green-50" 
                  : isSelected 
                    ? "border-red-500 bg-red-50" 
                    : "border-gray-200"
              )}
            >
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium text-sm",
                  isCorrectOption
                    ? "bg-green-500 text-white"
                    : isSelected
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-700"
                )}>
                  {option.id.toUpperCase()}
                </div>
                <span className={cn(
                  "font-medium",
                  isCorrectOption
                    ? "text-green-700"
                    : isSelected
                      ? "text-red-700"
                      : "text-gray-800"
                )}>
                  {option.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ResultState;
