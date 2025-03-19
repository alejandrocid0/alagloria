
import { CheckCircle, XCircle } from 'lucide-react';

interface AnswerResultProps {
  selectedOption?: number;
  correctAnswer?: number;
  showResult: boolean;
}

const AnswerResult = ({ selectedOption, correctAnswer, showResult }: AnswerResultProps) => {
  if (!showResult || correctAnswer === undefined || selectedOption === undefined) return null;
  
  return (
    <div className="flex items-center">
      {selectedOption === correctAnswer ? (
        <div className="flex items-center text-green-600">
          <CheckCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">¡Correcto!</span>
        </div>
      ) : (
        <div className="flex items-center text-red-600">
          <XCircle size={16} className="mr-1" />
          <span className="text-sm font-medium">Incorrecto</span>
        </div>
      )}
    </div>
  );
};

export default AnswerResult;
