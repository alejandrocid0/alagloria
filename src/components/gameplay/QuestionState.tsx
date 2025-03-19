
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizQuestion } from '@/types/quiz';

interface QuestionStateProps {
  currentQuestionData: QuizQuestion;
  timeRemaining: number;
  myRank: number;
  selectedOption: string | null;
  handleSelectOption: (optionId: string) => void;
}

const QuestionState = ({ 
  currentQuestionData, 
  timeRemaining, 
  myRank, 
  selectedOption, 
  handleSelectOption 
}: QuestionStateProps) => {
  return (
    <motion.div 
      key="question"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gloria-purple mr-2" />
            <span className={cn(
              "font-semibold",
              timeRemaining <= 5 ? "text-red-500" : "text-gloria-purple"
            )}>
              {timeRemaining} segundos
            </span>
          </div>
          
          <div className="text-sm text-gray-500">
            Ranking: {myRank}º
          </div>
        </div>
        
        <h2 className="text-xl md:text-2xl font-serif font-semibold text-gloria-purple mb-6">
          {currentQuestionData.question}
        </h2>
        
        <div className="grid gap-3">
          {currentQuestionData.options.map((option) => (
            <button
              key={option.id}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all duration-200",
                selectedOption === option.id
                  ? "border-gloria-purple bg-gloria-purple/10"
                  : "border-gray-200 hover:border-gloria-purple/50 hover:bg-gloria-purple/5"
              )}
              onClick={() => handleSelectOption(option.id)}
              disabled={selectedOption !== null}
            >
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3 font-medium text-sm",
                  selectedOption === option.id
                    ? "bg-gloria-purple text-white"
                    : "bg-gray-100 text-gray-700"
                )}>
                  {option.id.toUpperCase()}
                </div>
                <span className="text-gray-800 font-medium">{option.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionState;
