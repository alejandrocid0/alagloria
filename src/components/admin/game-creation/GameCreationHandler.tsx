
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';
import { useGameImage } from '@/hooks/useGameImage';
import { GameFormValues } from '../schemas/gameFormSchema';

export function useGameCreation() {
  const { user, currentUser } = useAuth();
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

  const handleSubmit = async (data: GameFormValues) => {
    const userId = user?.id || currentUser?.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para crear una partida",
        variant: "destructive",
      });
      return false;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting game:", data);
      console.log("User ID:", userId);
      
      // Create the game
      const gameData = await gameService.createGame(data, userId);
      console.log("Game created successfully:", gameData);
      
      // Upload image if provided
      if (imageFile) {
        console.log("Uploading image for game:", gameData.id);
        const imageUrl = await uploadImage(gameData.id);
        if (imageUrl) {
          await gameService.updateGameImage(gameData.id, imageUrl);
          console.log("Image updated successfully");
        }
      }
      
      // Create questions and options
      console.log("Creating questions:", data.questions.length);
      for (let i = 0; i < data.questions.length; i++) {
        const question = data.questions[i];
        
        const questionData = await gameService.createQuestion(
          gameData.id,
          question.text,
          question.correctOption,
          i + 1
        );
        console.log("Question created:", questionData);
        
        // Create options for each question
        console.log("Creating options for question:", questionData.id);
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
      
      resetImage();
      
      // Redirect to games list
      navigate("/admin?tab=games-list");
      
      return true;
    } catch (error) {
      console.error("Error submitting game:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al crear la partida",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    imageFile,
    imagePreview,
    uploadProgress,
    handleImageChange,
    handleSubmit
  };
}
