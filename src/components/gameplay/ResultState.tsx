
import React, { useEffect } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Award, TrendingUp, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const [pointsScope, animatePoints] = useAnimate();
  
  // Comprobar si la respuesta seleccionada es correcta
  const isCorrect = selectedOption === currentQuestionData.correctOption;
  
  // Lanzar confetti si la respuesta es correcta
  useEffect(() => {
    if (isCorrect && lastPoints > 0) {
      // Lanzar confetti desde la parte superior
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Animar el contador de puntos
      animatePoints(
        pointsScope.current,
        { scale: [1, 1.5, 1], opacity: [0, 1] },
        { duration: 0.5 }
      );
    }
  }, [isCorrect, lastPoints, animatePoints]);
  
  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="py-6"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            y: [0, -10, 0] 
          }}
          transition={{ 
            duration: 0.5,
            ease: "easeInOut" 
          }}
          className={cn(
            "inline-flex items-center justify-center rounded-full p-2",
            isCorrect ? "bg-green-100" : "bg-red-100"
          )}
        >
          {isCorrect ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
        </motion.div>
        
        <h2 className="text-2xl font-serif font-bold mt-4 mb-2">
          {isCorrect ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
        </h2>
        
        <p className="text-gray-600">
          {isCorrect 
            ? "¡Excelente trabajo! Has respondido correctamente." 
            : "No te preocupes, aún tienes más oportunidades."}
        </p>
        
        {isCorrect && (
          <motion.div 
            ref={pointsScope}
            className="mt-4 inline-flex items-center justify-center bg-gloria-gold/20 text-gloria-gold px-4 py-2 rounded-full"
          >
            <Award className="w-5 h-5 mr-2" />
            <span className="font-bold text-lg">+{lastPoints} puntos</span>
          </motion.div>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
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
              <div className={cn(
                "p-3 rounded-lg border-2 flex items-center",
                isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
              )}>
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span>
                  {currentQuestionData.options.find(o => o.id === selectedOption)?.text || "No seleccionada"}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-lg border-2 border-red-300 bg-red-50 flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span>No seleccionaste ninguna respuesta</span>
              </div>
            )}
          </div>
          
          {!isCorrect && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Respuesta correcta:</h4>
              <div className="p-3 rounded-lg border-2 border-green-300 bg-green-50 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span>
                  {currentQuestionData.options.find(o => o.id === currentQuestionData.correctOption)?.text || "Error en datos"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center text-gray-500">
        Preparándose para la siguiente pregunta...
      </div>
    </motion.div>
  );
};

export default ResultState;
