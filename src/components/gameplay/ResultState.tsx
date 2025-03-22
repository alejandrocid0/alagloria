
import React, { useEffect } from 'react';
import { motion, useAnimate } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Award, TrendingUp, Timer, Sparkles } from 'lucide-react';
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
  
  // Lanzar confetti y animar puntos si la respuesta es correcta
  useEffect(() => {
    if (isCorrect && lastPoints > 0) {
      // Confetti más elaborado para respuestas correctas
      const duration = 3000;
      const end = Date.now() + duration;
      
      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#5D3891', '#9747FF', '#8235F3'],
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#5D3891', '#9747FF', '#8235F3'],
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
      
      // Animar el contador de puntos con un efecto más elaborado
      animatePoints(
        pointsScope.current,
        { 
          scale: [1, 1.5, 1],
          y: [20, -10, 0],
          opacity: [0, 1] 
        },
        { 
          duration: 0.7,
          ease: "backOut"
        }
      );
    }
  }, [isCorrect, lastPoints, animatePoints]);
  
  return (
    <motion.div 
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="py-6"
    >
      <div className="text-center mb-8">
        <motion.div
          animate={{ 
            scale: isCorrect ? [1, 1.1, 1] : [1, 0.9, 1],
            y: isCorrect ? [0, -15, 0] : [0, -5, 0],
            rotate: isCorrect ? [0, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: 0.7,
            ease: "easeInOut" 
          }}
          className={cn(
            "inline-flex items-center justify-center rounded-full p-3",
            isCorrect ? "bg-green-100" : "bg-red-100"
          )}
        >
          {isCorrect ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-serif font-bold mt-4 mb-2"
        >
          {isCorrect ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600"
        >
          {isCorrect 
            ? "¡Excelente trabajo! Has respondido correctamente." 
            : "No te preocupes, aún tienes más oportunidades."}
        </motion.p>
        
        {isCorrect && (
          <motion.div 
            ref={pointsScope}
            className="mt-4 inline-flex items-center justify-center bg-gloria-gold/20 text-gloria-gold px-4 py-2 rounded-full"
          >
            {lastPoints > 500 ? (
              <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            ) : (
              <Award className="w-5 h-5 mr-2" />
            )}
            <span className="font-bold text-lg">+{lastPoints} puntos</span>
          </motion.div>
        )}
      </div>
      
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
          
          {!isCorrect && (
            <motion.div
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
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
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 1] }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-center text-gray-500 flex items-center justify-center"
      >
        <Timer className="w-4 h-4 mr-2 animate-pulse" />
        Preparándose para la siguiente pregunta...
      </motion.div>
    </motion.div>
  );
};

export default ResultState;
