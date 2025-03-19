
interface QuestionProgressProps {
  questionNumber?: number;
  totalQuestions?: number;
}

const QuestionProgress = ({ questionNumber, totalQuestions }: QuestionProgressProps) => {
  if (!questionNumber || !totalQuestions) return null;
  
  return (
    <div className="mb-4 flex justify-between items-center">
      <span className="text-sm font-medium text-gloria-purple">
        Pregunta {questionNumber} de {totalQuestions}
      </span>
      <div className="w-1/2 bg-gray-200 h-1 rounded-full overflow-hidden">
        <div 
          className="h-1 bg-gloria-purple rounded-full"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuestionProgress;
