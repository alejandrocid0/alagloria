
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizQuestion } from '@/types/quiz';

interface ResultStateProps {
  currentQuestionData: QuizQuestion;
  selectedOption: string | null;
  lastPoints: number;
}

const ResultState = ({ 
  currentQuestionData, 
  selectedOption, 
  lastPoints 
}: ResultStateProps) => {
  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="text-center py-6"
    >
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-serif font-semibold text-gloria-purple mb-4">
          {currentQuestionData.question}
        </h2>
        
        <div className="grid gap-3">
          {currentQuestionData.options.map((option) => {
            const isCorrect = option.id === currentQuestionData.correctOption;
            const isSelected = selectedOption === option.id;
            
            return (
              <div
                key={option.id}
                className={cn(
                  "w-full text-left p-4 rounded-lg border",
                  isCorrect
                    ? "border-green-500 bg-green-50"
                    : isSelected
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200"
                )}
              >
                <div className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium text-sm",
                    isCorrect
                      ? "bg-green-500 text-white"
                      : isSelected
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700"
                  )}>
                    {isCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : isSelected ? (
                      <X className="h-4 w-4" />
                    ) : (
                      option.id.toUpperCase()
                    )}
                  </div>
                  <span className="text-gray-800 font-medium">{option.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedOption === currentQuestionData.correctOption ? (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
          <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-green-800 mb-1">¡Respuesta correcta!</h3>
          <p className="text-sm text-green-600">Has ganado {lastPoints} puntos</p>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
          <X className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-800 mb-1">Respuesta incorrecta</h3>
          <p className="text-sm text-red-600">La respuesta correcta era: {
            currentQuestionData.options.find(
              option => option.id === currentQuestionData.correctOption
            )?.text
          }</p>
        </div>
      )}
    </motion.div>
  );
};

export default ResultState;
