
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useGameEditorForm } from './useGameEditorForm';
import GameEditorMetadata from './GameEditorMetadata';
import GameEditorQuestions from './GameEditorQuestions';
import GameEditorActions from './GameEditorActions';
import { GameEditorProps } from './types';

const GameEditor: React.FC<GameEditorProps> = ({ game, onClose }) => {
  const {
    form,
    isLoading,
    isSaving,
    imageFile,
    imagePreview,
    uploadProgress,
    handleImageChange,
    onSubmit
  } = useGameEditorForm(game, onClose);

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
            <GameEditorMetadata 
              imageFile={imageFile}
              imagePreview={imagePreview}
              uploadProgress={uploadProgress}
              handleImageChange={handleImageChange}
            />
            
            <GameEditorQuestions />
            
            <GameEditorActions onClose={onClose} isSaving={isSaving} />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GameEditor;
