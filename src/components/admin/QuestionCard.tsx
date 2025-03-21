
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GameFormValues, DIFFICULTY_LEVELS } from './schemas/gameFormSchema';

interface QuestionCardProps {
  questionIndex: number;
  onRemove: () => void;
}

const QuestionCard = ({ questionIndex, onRemove }: QuestionCardProps) => {
  const { control } = useFormContext<GameFormValues>();

  // Función para formatear el nombre del nivel de dificultad
  const formatDifficultyName = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
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
          </div>
          
          <div>
            <FormField
              control={control}
              name={`questions.${questionIndex}.difficulty`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de dificultad</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || 'sevillano'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {formatDifficultyName(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
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
