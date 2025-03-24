
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionDetailsProps {
  currentQuestionData: QuizQuestion;
  selectedOption: string | null;
  isCorrect: boolean;
}

const QuestionDetails: React.FC<QuestionDetailsProps> = ({ 
  currentQuestionData, 
  selectedOption, 
  isCorrect 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="font-serif font-semibold text-gloria-purple">Detalles de la pregunta</h3>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Pregunta:</h4>
          <p className="text-gray-900">{currentQuestionData.question}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Tu respuesta:</h4>
          {selectedOption ? (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={cn(
                "p-3 rounded-lg border-2 flex items-center",
                isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
              )}
            >
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
              )}
              <span>
                {currentQuestionData.options.find(o => o.id === selectedOption)?.text || "No seleccionada"}
              </span>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-3 rounded-lg border-2 border-red-300 bg-red-50 flex items-center"
            >
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <span>No seleccionaste ninguna respuesta</span>
            </motion.div>
          )}
        </div>
        
        <AnimatePresence>
          {!isCorrect && (
            <motion.div
              initial={{ x: -10, opacity: 0, height: 0 }}
              animate={{ x: 0, opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h4 className="font-medium text-gray-700 mb-2">Respuesta correcta:</h4>
              <div className="p-3 rounded-lg border-2 border-green-300 bg-green-50 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span>
                  {currentQuestionData.options.find(o => o.id === currentQuestionData.correctOption)?.text || "Error en datos"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default QuestionDetails;
