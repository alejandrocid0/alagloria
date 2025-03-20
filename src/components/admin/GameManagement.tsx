
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { gameFormSchema, GameFormValues } from './schemas/gameFormSchema';
import { useGameImage } from '@/hooks/useGameImage';
import { gameService } from '@/services/gameService';
import GameMetadataForm from './GameMetadataForm';
import QuestionCard from './QuestionCard';
import { useNavigate } from 'react-router-dom';

const GameManagement = () => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { 
    imageFile, 
    imagePreview, 
    uploadProgress, 
    handleImageChange, 
    uploadImage, 
    resetImage, 
    setUploadProgress 
  } = useGameImage();
  
  const form = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: {
      title: '',
      description: '',
      gameDate: new Date().toISOString().split('T')[0],
      gameTime: '18:00',
      category: 'semana-santa', // Default to Semana Santa
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

  const onSubmit = async (data: GameFormValues) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una partida",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting game:", data);
      
      // Create the game
      const gameData = await gameService.createGame(data, currentUser.id);
      
      // Upload image if provided
      if (imageFile) {
        const imageUrl = await uploadImage(gameData.id);
        if (imageUrl) {
          await gameService.updateGameImage(gameData.id, imageUrl);
        }
      }
      
      // Create questions and options
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        
        const questionData = await gameService.createQuestion(
          gameData.id,
          question.text,
          question.correctOption,
          i + 1
        );
        
        // Create options for each question
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          await gameService.createOption(
            questionData.id,
            option.text,
            option.id,
            j + 1
          );
        }
      }
      
      toast({
        title: "¡Éxito!",
        description: "La partida ha sido creada correctamente",
      });
      
      form.reset();
      resetImage();
      
      // Redirect to games list
      navigate("/admin?tab=games-list");
      
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
            <GameMetadataForm 
              imageFile={imageFile}
              imagePreview={imagePreview}
              uploadProgress={uploadProgress}
              onImageChange={handleImageChange}
            />
            
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
                <QuestionCard
                  key={questionField.id}
                  questionIndex={questionIndex}
                  onRemove={() => handleRemoveQuestion(questionIndex)}
                />
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
