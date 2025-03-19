
interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  myPoints: number;
}

const ProgressBar = ({ 
  currentQuestion, 
  totalQuestions, 
  myPoints 
}: ProgressBarProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          Pregunta {currentQuestion + 1} de {totalQuestions}
        </span>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">Puntos: </span>
          <span className="text-lg font-semibold text-gloria-purple">{myPoints}</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-gloria-gold h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
