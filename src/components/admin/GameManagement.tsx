import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Save, ImagePlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Define schema for options
const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "El texto de la opción es requerido"),
});

// Define schema for questions
const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
  correctOption: z.string(),
  options: z.array(optionSchema).min(3, "Debe haber al menos 3 opciones"),
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

const GameManagement = () => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      description: '',
      gameDate: new Date().toISOString().split('T')[0],
      gameTime: '18:00',
      questions: [
        {
          id: crypto.randomUUID(),
          text: '',
          correctOption: '',
          options: Array(5).fill(0).map((_, i) => ({
            id: String.fromCharCode(65 + i), // A, B, C, D, E
            text: '',
          })),
        },
      ],
    },
  });
  
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
      
      const progressTracker = (progress: number) => {
        const percent = progress * 100;
        setUploadProgress(percent);
      };
      
      const { error: uploadError, data } = await supabase.storage
        .from('game-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw uploadError;
      }
      
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

  const onSubmit = async (data: GameFormValues) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting game:", data);
      
      const gameDateTime = new Date(`${data.gameDate}T${data.gameTime}`);
      
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert({
          title: data.title,
          description: data.description,
          date: gameDateTime.toISOString(),
          created_by: currentUser.id,
        })
        .select()
        .single();
      
      if (gameError) {
        throw new Error(`Error al crear la partida: ${gameError.message}`);
      }
      
      if (imageFile) {
        const imageUrl = await uploadImage(gameData.id);
        if (imageUrl) {
          const { error: updateError } = await supabase
            .from('games')
            .update({ image_url: imageUrl })
            .eq('id', gameData.id);
          
          if (updateError) {
            console.error('Error updating game with image URL:', updateError);
          }
        }
      }
      
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            game_id: gameData.id,
            question_text: question.text,
            correct_option: question.correctOption,
            position: i + 1,
          })
          .select()
          .single();
        
        if (questionError) {
          throw new Error(`Error al crear la pregunta ${i+1}: ${questionError.message}`);
        }
        
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          const { error: optionError } = await supabase
            .from('options')
            .insert({
              question_id: questionData.id,
              option_text: option.text,
              option_id: option.id,
              position: j + 1,
            });
          
          if (optionError) {
            throw new Error(`Error al crear la opción ${option.id} para la pregunta ${i+1}: ${optionError.message}`);
          }
        }
      }
      
      toast({
        title: "¡Éxito!",
        description: "La partida ha sido creada correctamente",
      });
      
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);
      
    } catch (error) {
      console.error("Error submitting game:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al crear la partida",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nueva Partida</CardTitle>
        <CardDescription>
          Completa el formulario para crear una nueva partida con sus preguntas y opciones.
        </CardDescription>
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
                          <span>Seleccionar imagen</span>
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
                      {questionField.options.map((option, optionIndex) => (
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
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Guardando...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Partida
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GameManagement;
