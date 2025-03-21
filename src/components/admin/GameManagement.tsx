
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import GameMetadataForm from './GameMetadataForm';
import QuestionsList from './game-creation/QuestionsList';
import SubmitButton from './game-creation/SubmitButton';
import useGameForm from './game-creation/useGameForm';
import { useGameCreation } from './game-creation/GameCreationHandler';
import { toast } from '@/hooks/use-toast';

const GameManagement = () => {
  const { 
    form, 
    questionsFields, 
    handleAddQuestion, 
    handleRemoveQuestion,
    isSubmitting: formSubmitting 
  } = useGameForm();
  
  const {
    isSubmitting,
    imageFile,
    imagePreview,
    uploadProgress,
    handleImageChange,
    handleSubmit
  } = useGameCreation();

  const onSubmit = async (data: any) => {
    const success = await handleSubmit(data);
    if (success) {
      form.reset();
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
            
            <QuestionsList 
              questionsFields={questionsFields.fields}
              onAdd={handleAddQuestion}
              onRemove={(index) => handleRemoveQuestion(index, questionsFields.fields.length, (message) => {
                toast({
                  title: "Error",
                  description: message,
                  variant: "destructive"
                });
              })}
            />
            
            <SubmitButton isSubmitting={isSubmitting} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GameManagement;
