
import { supabase } from '@/integrations/supabase/client';
import { GameFormValues } from '@/components/admin/schemas/gameFormSchema';

export async function createGame(data: GameFormValues, userId: string) {
  const gameDateTime = new Date(`${data.gameDate}T${data.gameTime}`);
  
  // Log the userId to help debug
  console.log('Creating game with userId:', userId);
  
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .insert({
      title: data.title,
      description: data.description,
      date: gameDateTime.toISOString(),
      created_by: userId,
      category: data.category
    })
    .select()
    .single();
  
  if (gameError) {
    console.error('Error creating game:', gameError);
    throw new Error(`Error al crear la partida: ${gameError.message}`);
  }
  
  return gameData;
}

export async function updateGameImage(gameId: string, imageUrl: string) {
  const { error: updateError } = await supabase
    .from('games')
    .update({ image_url: imageUrl })
    .eq('id', gameId);
  
  if (updateError) {
    console.error('Error updating game with image URL:', updateError);
    throw new Error(`Error al actualizar la imagen: ${updateError.message}`);
  }
}

export async function fetchGames() {
  // Usar la nueva vista games_with_details en lugar de la tabla games directamente
  const { data: gamesData, error } = await supabase
    .from('games_with_details')
    .select()
    .order('date', { ascending: true });
  
  if (error) {
    console.error('Error fetching games:', error);
    throw new Error(`Error al cargar partidas: ${error.message}`);
  }
  
  return gamesData || [];
}
