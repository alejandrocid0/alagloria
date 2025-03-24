
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultHeaderProps {
  isCorrect: boolean;
  lastPoints: number;
}

const ResultHeader: React.FC<ResultHeaderProps> = ({ isCorrect, lastPoints }) => {
  return (
    <div className="text-center mb-8">
      <motion.div
        animate={{ 
          scale: isCorrect ? [1, 1.1, 1] : [1, 0.9, 1],
          y: isCorrect ? [0, -15, 0] : [0, -5, 0],
          rotate: isCorrect ? [0, 5, -5, 0] : 0,
          boxShadow: isCorrect ? [
            "0 0 0 rgba(93, 56, 145, 0)",
            "0 0 20px rgba(93, 56, 145, 0.3)",
            "0 0 0 rgba(93, 56, 145, 0)"
          ] : "none"
        }}
        transition={{ 
          duration: 0.7,
          ease: "easeInOut",
          boxShadow: { repeat: isCorrect ? 3 : 0, duration: 1.5 }
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
    </div>
  );
};

export default ResultHeader;
