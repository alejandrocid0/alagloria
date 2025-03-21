
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GameFormValues } from './schemas/gameFormSchema';

interface QuestionCardProps {
  questionIndex: number;
  onRemove: () => void;
}

const QuestionCard = ({ questionIndex, onRemove }: QuestionCardProps) => {
  const { control } = useFormContext<GameFormValues>();

  return (
    <Card key={`question-${questionIndex}`} className="border border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Pregunta {questionIndex + 1}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name={`questions.${questionIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto de la pregunta</FormLabel>
              <FormControl>
                <Input placeholder="Ej. ¿Cuál es la hermandad más antigua de Sevilla?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Opciones (selecciona la correcta)</FormLabel>
          {['A', 'B', 'C', 'D', 'E'].map((optionId, optionIndex) => (
            <div key={optionId} className="flex items-center gap-3">
              <FormField
                control={control}
                name={`questions.${questionIndex}.correctOption`}
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <input
                        type="radio"
                        id={`question-${questionIndex}-option-${optionId}`}
                        checked={field.value === optionId}
                        onChange={() => field.onChange(optionId)}
                        className="w-4 h-4 text-gloria-purple"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="font-medium w-7">{optionId}.</div>
              <FormField
                control={control}
                name={`questions.${questionIndex}.options.${optionIndex}.text`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={`Opción ${optionId}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
