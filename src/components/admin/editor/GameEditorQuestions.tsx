
import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DIFFICULTY_LEVELS } from '../schemas/gameFormSchema';

const GameEditorQuestions = () => {
  const form = useFormContext();
  
  const { fields: questionsFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const difficultyLabels: Record<string, string> = {
    'guiri': 'Guiri',
    'sevillano': 'Sevillano',
    'nazareno': 'Nazareno',
    'costalero': 'Costalero',
    'capataz': 'Capataz'
  };

  const handleAddQuestion = () => {
    appendQuestion({
      id: crypto.randomUUID(),
      text: '',
      correctOption: '',
      options: Array(5).fill(0).map((_, i) => ({
        id: String.fromCharCode(65 + i), // A, B, C, D, E
        text: '',
      })),
      position: questionsFields.length + 1,
      difficulty: 'sevillano',
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (questionsFields.length > 1) {
      removeQuestion(index);
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
          onClick={handleAddQuestion}
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Pregunta
        </Button>
      </div>
      
      {questionsFields.map((questionField, questionIndex) => (
        <Card key={questionField.id} className="border border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Pregunta {questionIndex + 1}
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveQuestion(questionIndex)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name={`questions.${questionIndex}.difficulty`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dificultad</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Nivel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIFFICULTY_LEVELS.map(level => (
                            <SelectItem key={level} value={level}>
                              {difficultyLabels[level] || level}
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
              {form.getValues(`questions.${questionIndex}.options`).map((option, optionIndex) => (
                <div key={option.id} className="flex items-center gap-3">
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.correctOption`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-1 space-y-0">
                        <FormControl>
                          <input
                            type="radio"
                            id={`question-${questionIndex}-option-${option.id}`}
                            checked={field.value === option.id}
                            onChange={() => field.onChange(option.id)}
                            className="w-4 h-4 text-gloria-purple"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="font-medium w-7">{option.id}.</div>
                  <FormField
                    control={form.control}
                    name={`questions.${questionIndex}.options.${optionIndex}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder={`Opción ${option.id}`} {...field} />
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
      ))}
    </div>
  );
};

export default GameEditorQuestions;
