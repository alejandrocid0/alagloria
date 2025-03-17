import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Plus, Trash2, Save, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Define schema for options
const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "El texto de la opción es requerido"),
  option_id: z.string().optional(),
  question_id: z.string().optional(),
  position: z.number().optional(),
});

// Define schema for questions
const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
  correctOption: z.string(),
  options: z.array(optionSchema).min(3, "Debe haber al menos 3 opciones"),
  position: z.number().optional(),
  question_id: z.string().optional(),
});

// Define schema for the game form
const gameFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  gameDate: z.string().min(1, "La fecha es requerida"),
  gameTime: z.string().min(1, "La hora es requerida"),
  questions: z.array(questionSchema).min(1, "Debe haber al menos 1 pregunta"),
});

type GameFormValues = z.infer<typeof gameFormSchema>;

interface GameEditorProps {
  game: {
    id: string;
    title: string;
    description: string;
    date: string;
    image_url?: string;
  };
  onClose: () => void;
}

interface Question {
  id: string;
  game_id: string;
  question_text: string;
  correct_option: string;
  position: number;
}

interface Option {
  id: string;
  question_id: string;
  option_text: string;
  option_id: string;
  position: number;
}

const GameEditor: React.FC<GameEditorProps> = ({ game, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(game.image_url || null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: game.title,
      description: game.description,
      gameDate: '',
      gameTime: '',
      questions: [],
    },
  });

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setIsLoading(true);

        // Parse date and time
        const gameDate = new Date(game.date);
        const dateStr = gameDate.toISOString().split('T')[0];
        const timeStr = gameDate.toTimeString().slice(0, 5);

        form.setValue('gameDate', dateStr);
        form.setValue('gameTime', timeStr);

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('game_id', game.id)
          .order('position', { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        // Fetch options for all questions
        if (questionsData && questionsData.length > 0) {
          const questionIds = questionsData.map(q => q.id);
          
          const { data: optionsData, error: optionsError } = await supabase
            .from('options')
            .select('*')
            .in('question_id', questionIds)
            .order('position', { ascending: true });

          if (optionsError) throw optionsError;
          setOptions(optionsData || []);

          // Format questions and options for the form
          const formattedQuestions = questionsData.map(question => {
            const questionOptions = optionsData?.filter(o => o.question_id === question.id) || [];
            
            return {
              id: question.id,
              text: question.question_text,
              correctOption: question.correct_option,
              position: question.position,
              options: questionOptions.map(option => ({
                id: option.option_id,
                text: option.option_text,
                option_id: option.id,
                position: option.position,
                question_id: option.question_id,
              })),
            };
          });

          form.setValue('questions', formattedQuestions);
        }
      } catch (error) {
        console.error('Error fetching game details:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los detalles de la partida',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails();
  }, [game.id, game.date, game.title, game.description, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (gameId: string): Promise<string | null> => {
    if (!imageFile) return null;
    
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${gameId}.${fileExt}`;
      const filePath = `game-images/${fileName}`;
      
      // Create a progress tracker
      const progressTracker = (progress: number) => {
        const percent = progress * 100;
        setUploadProgress(percent);
      };
      
      // Fix: Remove onUploadProgress from options and track progress separately
      const { error: uploadError, data } = await supabase.storage
        .from('game-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Set upload as complete
      setUploadProgress(100);
      
      const { data: { publicUrl } } = supabase.storage
        .from('game-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    }
  };

  const { fields: questionsFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

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

  const onSubmit = async (data: GameFormValues) => {
    setIsSaving(true);
    
    try {
      console.log("Updating game:", data);
      
      // Combine date and time for game date
      const gameDateTime = new Date(`${data.gameDate}T${data.gameTime}`);
      
      // 1. Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(game.id);
      }
      
      // 2. Update game
      const updateData: any = {
        title: data.title,
        description: data.description,
        date: gameDateTime.toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Add image URL if available
      if (imageUrl) {
        updateData.image_url = imageUrl;
      }
      
      const { error: gameError } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', game.id);
      
      if (gameError) {
        throw new Error(`Error al actualizar la partida: ${gameError.message}`);
      }
      
      // 2. Handle questions (update existing, delete removed, add new)
      const existingQuestionIds = questions.map(q => q.id);
      const formQuestionIds = data.questions
        .filter(q => q.question_id) // Only consider existing questions
        .map(q => q.id);
      
      // Delete questions that are no longer in the form
      const questionsToDelete = existingQuestionIds.filter(id => !formQuestionIds.includes(id));
      
      if (questionsToDelete.length > 0) {
        const { error: deleteQuestionsError } = await supabase
          .from('questions')
          .delete()
          .in('id', questionsToDelete);
        
        if (deleteQuestionsError) {
          throw new Error(`Error al eliminar preguntas: ${deleteQuestionsError.message}`);
        }
      }
      
      // Update or insert questions
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        const isNewQuestion = !question.question_id;
        
        if (isNewQuestion) {
          // Insert new question
          const { data: newQuestion, error: newQuestionError } = await supabase
            .from('questions')
            .insert({
              game_id: game.id,
              question_text: question.text,
              correct_option: question.correctOption,
              position: i + 1,
            })
            .select()
            .single();
          
          if (newQuestionError) {
            throw new Error(`Error al crear la pregunta ${i+1}: ${newQuestionError.message}`);
          }
          
          // Insert new options
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            
            const { error: newOptionError } = await supabase
              .from('options')
              .insert({
                question_id: newQuestion.id,
                option_text: option.text,
                option_id: option.id,
                position: j + 1,
              });
            
            if (newOptionError) {
              throw new Error(`Error al crear la opción ${option.id} para la pregunta ${i+1}: ${newOptionError.message}`);
            }
          }
        } else {
          // Update existing question
          const { error: updateQuestionError } = await supabase
            .from('questions')
            .update({
              question_text: question.text,
              correct_option: question.correctOption,
              position: i + 1,
            })
            .eq('id', question.id);
          
          if (updateQuestionError) {
            throw new Error(`Error al actualizar la pregunta ${i+1}: ${updateQuestionError.message}`);
          }
          
          // Handle options (update existing)
          for (let j = 0; j < question.options.length; j++) {
            const option = question.options[j];
            
            if (option.option_id) {
              // Update existing option
              const { error: updateOptionError } = await supabase
                .from('options')
                .update({
                  option_text: option.text,
                  position: j + 1,
                })
                .eq('id', option.option_id);
              
              if (updateOptionError) {
                throw new Error(`Error al actualizar la opción ${option.id} para la pregunta ${i+1}: ${updateOptionError.message}`);
              }
            } else {
              // Insert new option
              const { error: newOptionError } = await supabase
                .from('options')
                .insert({
                  question_id: question.id,
                  option_text: option.text,
                  option_id: option.id,
                  position: j + 1,
                });
              
              if (newOptionError) {
                throw new Error(`Error al crear la opción ${option.id} para la pregunta ${i+1}: ${newOptionError.message}`);
              }
            }
          }
        }
      }
      
      toast({
        title: "¡Éxito!",
        description: "La partida ha sido actualizada correctamente",
      });
      
      onClose();
    } catch (error) {
      console.error("Error updating game:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al actualizar la partida",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse bg-gloria-purple/20 h-8 w-64 rounded-md mb-4 mx-auto"></div>
        <div className="animate-pulse bg-gloria-purple/10 h-4 w-48 rounded-md mx-auto"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <Button variant="ghost" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardTitle>Editar Partida: {game.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Partida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Especial Semana Santa 2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve descripción de la partida"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Imagen de la partida</FormLabel>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer">
                        <div className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium text-white bg-gloria-purple rounded-md hover:bg-gloria-purple/90">
                          <ImagePlus className="w-4 h-4 mr-2" />
                          <span>{imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageChange}
                          />
                        </div>
                      </label>
                      {imageFile && (
                        <span className="text-sm text-gray-500">
                          {imageFile.name}
                        </span>
                      )}
                    </div>
                    
                    {imagePreview && (
                      <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={imagePreview} 
                          alt="Vista previa" 
                          className="w-full h-40 object-cover"
                        />
                      </div>
                    )}
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-gloria-purple h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="gameDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gameTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
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
            
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GameEditor;
