
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuestionCard from '../QuestionCard';
import { toast } from '@/hooks/use-toast';

interface QuestionsListProps {
  questionsFields: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const QuestionsList: React.FC<QuestionsListProps> = ({ 
  questionsFields, 
  onAdd, 
  onRemove 
}) => {
  const handleRemoveQuestion = (index: number) => {
    if (questionsFields.length > 1) {
      onRemove(index);
    } else {
      toast({
        title: "Error",
        description: "Debe haber al menos una pregunta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Preguntas</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Pregunta
        </Button>
      </div>
      
      {questionsFields.map((questionField, questionIndex) => (
        <QuestionCard
          key={questionField.id}
          questionIndex={questionIndex}
          onRemove={() => handleRemoveQuestion(questionIndex)}
        />
      ))}
    </div>
  );
};

export default QuestionsList;
