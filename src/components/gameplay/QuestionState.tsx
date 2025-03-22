
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock, Award, BrainCircuit, AlertCircle, Timer } from 'lucide-react';

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
  const [isUrgent, setIsUrgent] = useState(false);
  const [potentialPoints, setPotentialPoints] = useState(1000);
  const [flashWarning, setFlashWarning] = useState(false);
  
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
        
        // Activar urgencia cuando quedan 3 segundos o menos
        if (newValue <= 3 && !isUrgent) {
          setIsUrgent(true);
          // Destello rápido para llamar la atención
          setFlashWarning(true);
          setTimeout(() => setFlashWarning(false), 200);
        }
        
        // Calcular puntos potenciales basados en el tiempo restante
        const pointsPercent = Math.max(0, newValue / timeRemaining);
        setPotentialPoints(Math.round(1000 * pointsPercent));
        
        return Math.max(0, newValue);
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeRemaining, selectedOption, isWarning, isUrgent]);
  
  // Verificar si una opción está seleccionada
  const isOptionSelected = (optionId: string) => selectedOption === optionId;
  
  // Verificar si el tiempo se está acabando (últimos 5 segundos)
  const isTimeRunningOut = secondsLeft <= 5;
  
  // Opciones variantes para el grid de opciones
  const optionsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const optionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <motion.div 
      key="question"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="py-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <motion.div 
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full text-white font-bold text-xl",
              isTimeRunningOut 
                ? (isUrgent ? "bg-red-600" : "bg-red-500") 
                : secondsLeft <= 10 
                  ? "bg-yellow-500" 
                  : "bg-gloria-purple"
            )}
            animate={{ 
              scale: isTimeRunningOut ? [1, 1.1, 1] : 1,
              boxShadow: isUrgent 
                ? ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 10px rgba(239, 68, 68, 0.1)", "0 0 0 0 rgba(239, 68, 68, 0)"] 
                : "none"
            }}
            transition={{ 
              duration: 0.8, 
              repeat: isTimeRunningOut ? Infinity : 0,
              repeatDelay: 0.2
            }}
          >
            {secondsLeft}
          </motion.div>
          <div>
            <h3 className="text-sm text-gray-500 mb-1">Tiempo restante</h3>
            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  isTimeRunningOut 
                    ? (isUrgent ? "bg-red-600" : "bg-red-500") 
                    : secondsLeft <= 10 
                      ? "bg-yellow-500" 
                      : "bg-gloria-purple"
                )}
                initial={{ width: "100%" }}
                animate={{ 
                  width: `${(secondsLeft / timeRemaining) * 100}%`,
                  opacity: flashWarning ? [1, 0.5, 1] : 1
                }}
                transition={{ 
                  duration: 0.4,
                  opacity: { duration: 0.2 }
                }}
              />
            </div>
          </div>
        </div>
        
        <motion.div 
          className="flex items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="bg-gloria-cream/30 rounded-lg px-4 py-2.5 flex items-center"
            whileHover={{ scale: 1.03 }}
            animate={{ 
              y: isTimeRunningOut && !selectedOption ? [0, -2, 0] : 0
            }}
            transition={{ 
              y: { 
                repeat: isTimeRunningOut && !selectedOption ? Infinity : 0, 
                duration: 0.5 
              }
            }}
          >
            <Award className={cn(
              "w-5 h-5 mr-2",
              isTimeRunningOut && !selectedOption ? "text-red-500" : "text-gloria-gold"
            )} />
            <div>
              <div className="text-xs text-gray-500">Puntos potenciales</div>
              <div className={cn(
                "font-bold transition-colors",
                isTimeRunningOut && !selectedOption ? "text-red-500" : "text-gloria-purple"
              )}>
                {potentialPoints}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center mb-4">
          <BrainCircuit className="w-6 h-6 text-gloria-purple mr-2" />
          <h2 className="text-xl md:text-2xl font-serif font-bold text-gloria-purple">
            {currentQuestionData.question}
          </h2>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          variants={optionsContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {currentQuestionData.options.map((option, index) => {
            const isSelected = isOptionSelected(option.id);
            
            return (
              <motion.button
                key={option.id}
                variants={optionVariants}
                whileHover={{ scale: selectedOption ? 1 : 1.02, boxShadow: selectedOption ? "none" : "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
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
                
                <div className="flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gloria-purple/10 text-gloria-purple mr-3 text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="block text-base md:text-lg font-medium">
                    {option.text}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 italic"
          >
            <Timer className="inline-block w-4 h-4 mr-1" />
            Espera mientras los demás jugadores responden...
          </motion.div>
        )}
        
        {isTimeRunningOut && !selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              boxShadow: isUrgent ? ["0 0 0 0 rgba(239, 68, 68, 0)", "0 0 0 5px rgba(239, 68, 68, 0.2)", "0 0 0 0 rgba(239, 68, 68, 0)"] : "none" 
            }}
            transition={{ 
              boxShadow: { repeat: isUrgent ? Infinity : 0, duration: 1 }
            }}
            className="bg-red-50 border border-red-100 rounded-lg p-3 text-center text-red-600 mt-4"
          >
            <AlertCircle className="inline-block w-5 h-5 mr-2 animate-pulse" />
            ¡El tiempo se está agotando! Selecciona una respuesta rápido.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionState;
