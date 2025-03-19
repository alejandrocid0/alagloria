
import { motion } from 'framer-motion';

interface ResultExplanationProps {
  correctAnswer: number;
  selectedIdx?: number;
}

const ResultExplanation = ({ correctAnswer, selectedIdx }: ResultExplanationProps) => {
  return (
    <motion.div 
      className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <h4 className="font-medium text-gloria-purple mb-2">Explicación</h4>
      <p className="text-sm text-gray-700">
        {correctAnswer !== undefined && selectedIdx === correctAnswer 
          ? "¡Respuesta correcta! Has sumado puntos en base a tu velocidad de respuesta."
          : "La respuesta correcta es la opción " + String.fromCharCode(65 + correctAnswer) + "."}
      </p>
    </motion.div>
  );
};

export default ResultExplanation;
