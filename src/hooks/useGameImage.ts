
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useGameImage = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const resetImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadProgress(0);
  };

  return {
    imageFile,
    imagePreview,
    uploadProgress,
    handleImageChange,
    uploadImage,
    resetImage,
    setUploadProgress
  };
};
