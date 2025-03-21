
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const uploadGameImage = async (
  gameId: string, 
  imageFile: File | null, 
  setUploadProgress: (progress: number) => void
): Promise<string | null> => {
  if (!imageFile) return null;
  
  try {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${gameId}.${fileExt}`;
    const filePath = `game-images/${fileName}`;
    
    setUploadProgress(10);
    
    const { error: uploadError } = await supabase.storage
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
