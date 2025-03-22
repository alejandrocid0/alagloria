
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, Award, BrainCircuit } from 'lucide-react';

interface QuestionStateProps {
  currentQuestionData: QuizQuestion;
  timeRemaining: number;
  myRank: number;
  selectedOption: string | null;
  handleSelectOption: (optionId: string) => void;
}

const QuestionState: React.FC<QuestionStateProps> = ({
  currentQuestionData,
  timeRemaining,
  myRank,
  selectedOption,
  handleSelectOption,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(timeRemaining);
  const [isWarning, setIsWarning] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(1000);
  
  // Manejar la cuenta regresiva y los puntos potenciales
  useEffect(() => {
    if (selectedOption) return; // Detener cuando se ha seleccionado una opción
    
    setSecondsLeft(timeRemaining);
    
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        const newValue = prev - 1;
        
        // Activar advertencia cuando quedan 5 segundos o menos
        if (newValue <= 5 && !isWarning) {
          setIsWarning(true);
        }
        
        // Calcular puntos potenciales basados en el tiempo restante
        const pointsPercent = Math.max(0, newValue / timeRemaining);
        setPotentialPoints(Math.round(1000 * pointsPercent));
        
        return Math.max(0, newValue);
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, selectedOption, isWarning]);
  
  // Verificar si una opción está seleccionada
  const isOptionSelected = (optionId: string) => selectedOption === optionId;
  
  // Verificar si el tiempo se está acabando (últimos 5 segundos)
  const isTimeRunningOut = secondsLeft <= 5;
  
  return (
    <motion.div 
      key="question"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="py-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full text-white font-bold",
            isTimeRunningOut ? "bg-red-500 animate-pulse" : "bg-gloria-purple"
          )}>
            {secondsLeft}
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Tiempo restante</h3>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  isTimeRunningOut ? "bg-red-500" : "bg-gloria-purple"
                )}
                initial={{ width: "100%" }}
                animate={{ width: `${(secondsLeft / timeRemaining) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-gloria-cream/30 rounded-lg px-3 py-2 flex items-center">
            <Award className="w-5 h-5 text-gloria-gold mr-2" />
            <div>
              <div className="text-xs text-gray-500">Puntos potenciales</div>
              <div className="font-bold text-gloria-purple">{potentialPoints}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <BrainCircuit className="w-6 h-6 text-gloria-purple mr-2" />
          <h2 className="text-xl md:text-2xl font-serif font-bold text-gloria-purple">
            {currentQuestionData.question}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestionData.options.map((option) => {
            const isSelected = isOptionSelected(option.id);
            
            return (
              <motion.button
                key={option.id}
                whileHover={{ scale: selectedOption ? 1 : 1.02 }}
                whileTap={{ scale: selectedOption ? 1 : 0.98 }}
                onClick={() => !selectedOption && handleSelectOption(option.id)}
                disabled={selectedOption !== null}
                className={cn(
                  "relative p-4 rounded-lg border-2 text-left transition-all",
                  isSelected 
                    ? "border-gloria-purple bg-gloria-purple/10" 
                    : selectedOption 
                      ? "border-gray-200 bg-gray-50 opacity-70" 
                      : "border-gray-200 hover:border-gloria-purple/50 hover:bg-gloria-purple/5"
                )}
              >
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle className="w-6 h-6 text-gloria-purple" />
                  </motion.div>
                )}
                
                <span className="block text-base md:text-lg font-medium">
                  {option.text}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
      
      {selectedOption && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-gray-500 italic"
        >
          Espera mientras los demás jugadores responden...
        </motion.div>
      )}
      
      {isTimeRunningOut && !selectedOption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 border border-red-100 rounded-lg p-3 text-center text-red-600 mt-4"
        >
          <Clock className="inline-block w-5 h-5 mr-2 animate-pulse" />
          ¡El tiempo se está agotando! Selecciona una respuesta rápido.
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuestionState;
