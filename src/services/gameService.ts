
import { supabase } from '@/integrations/supabase/client';
import { GameFormValues } from '@/components/admin/schemas/gameFormSchema';

export const gameService = {
  async createGame(data: GameFormValues, userId: string) {
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
  },
  
  async updateGameImage(gameId: string, imageUrl: string) {
    const { error: updateError } = await supabase
      .from('games')
      .update({ image_url: imageUrl })
      .eq('id', gameId);
    
    if (updateError) {
      console.error('Error updating game with image URL:', updateError);
      throw new Error(`Error al actualizar la imagen: ${updateError.message}`);
    }
  },
  
  async createQuestion(gameId: string, questionText: string, correctOption: string, position: number, difficulty: string = 'sevillano') {
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .insert({
        game_id: gameId,
        question_text: questionText,
        correct_option: correctOption,
        position: position,
        difficulty: difficulty, // Añadimos el campo de dificultad
      })
      .select()
      .single();
    
    if (questionError) {
      console.error('Error creating question:', questionError);
      throw new Error(`Error al crear la pregunta ${position}: ${questionError.message}`);
    }
    
    return questionData;
  },
  
  async createOption(questionId: string, optionText: string, optionId: string, position: number) {
    const { error: optionError } = await supabase
      .from('options')
      .insert({
        question_id: questionId,
        option_text: optionText,
        option_id: optionId,
        position: position,
      });
    
    if (optionError) {
      console.error('Error creating option:', optionError);
      throw new Error(`Error al crear la opción ${optionId}: ${optionError.message}`);
    }
  },
  
  async fetchGames() {
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
  },

  async joinGame(gameId: string, userId: string) {
    // Verificar si el usuario ya está registrado para esta partida
    const { data: existingParticipation, error: checkError } = await supabase
      .from('game_participants')
      .select()
      .eq('game_id', gameId)
      .eq('user_id', userId);
    
    if (checkError) {
      console.error('Error checking participation:', checkError);
      throw new Error(`Error al verificar participación: ${checkError.message}`);
    }
    
    // Si el usuario ya está registrado, no hacemos nada
    if (existingParticipation && existingParticipation.length > 0) {
      return { alreadyJoined: true };
    }
    
    // Registrar al usuario como participante
    const { error: joinError } = await supabase
      .from('game_participants')
      .insert({
        game_id: gameId,
        user_id: userId
      });
    
    if (joinError) {
      console.error('Error joining game:', joinError);
      throw new Error(`Error al unirse a la partida: ${joinError.message}`);
    }
    
    return { success: true };
  },
  
  async leaveGame(gameId: string, userId: string) {
    const { error: leaveError } = await supabase
      .from('game_participants')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId);
    
    if (leaveError) {
      console.error('Error leaving game:', leaveError);
      throw new Error(`Error al abandonar la partida: ${leaveError.message}`);
    }
    
    return { success: true };
  },
  
  async getGameParticipants(gameId: string) {
    const { data, error } = await supabase
      .from('game_participants')
      .select('count')
      .eq('game_id', gameId);
    
    if (error) {
      console.error('Error counting participants:', error);
      throw new Error(`Error al contar participantes: ${error.message}`);
    }
    
    // Convert count to number properly
    return data && data[0] ? parseInt(String(data[0].count)) : 0;
  },

  // Nuevas funciones para partidas en tiempo real
  async getLiveGameState(gameId: string) {
    const { data, error } = await supabase
      .from('live_games')
      .select('*')
      .eq('id', gameId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching live game state:', error);
      throw new Error(`Error al obtener el estado de la partida: ${error.message}`);
    }
    
    return data;
  },

  async subscribeToGameUpdates(gameId: string, callback: (payload: any) => void) {
    // Suscribirse a los cambios en live_games
    return supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'live_games',
          filter: `id=eq.${gameId}`
        },
        callback
      )
      .subscribe();
  },

  async submitAnswer(gameId: string, userId: string, questionPosition: number, selectedOption: string, answerTimeMs: number) {
    // Obtener la pregunta actual
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .eq('position', questionPosition)
      .maybeSingle();
    
    if (questionError || !questionData) {
      console.error('Error fetching question:', questionError);
      throw new Error('Error al obtener la pregunta');
    }
    
    // Verificar si la respuesta es correcta
    const isCorrect = questionData.correct_option === selectedOption;
    
    // Calcular puntos (más puntos si responde más rápido)
    let points = 0;
    if (isCorrect) {
      // Fórmula: 100 puntos base + bonus por tiempo (máx 100 adicionales)
      const timeBonus = Math.max(0, 100 - (answerTimeMs / 200)); 
      points = Math.round(100 + timeBonus);
    }
    
    // Guardar la respuesta
    const { data: answerData, error: answerError } = await supabase
      .from('live_game_answers')
      .insert({
        game_id: gameId,
        user_id: userId,
        question_position: questionPosition,
        selected_option: selectedOption,
        is_correct: isCorrect,
        points: points,
        answer_time_ms: answerTimeMs
      })
      .select()
      .single();
    
    if (answerError) {
      console.error('Error submitting answer:', answerError);
      throw new Error(`Error al enviar respuesta: ${answerError.message}`);
    }
    
    return {
      ...answerData,
      correctOption: questionData.correct_option
    };
  },

  async getGameLeaderboard(gameId: string) {
    // Consulta para obtener el ranking de jugadores por puntos
    const { data, error } = await supabase
      .rpc('get_game_leaderboard', { game_id: gameId });
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      
      // Si la función RPC falla (porque aún no se ha creado),
      // intentamos usar una consulta directa como alternativa
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('live_game_answers')
        .select(`
          user_id,
          points,
          profiles!inner (name)
        `)
        .eq('game_id', gameId)
        .order('points', { ascending: false });
      
      if (fallbackError) {
        console.error('Error fetching fallback leaderboard:', fallbackError);
        throw new Error(`Error al obtener la clasificación: ${fallbackError.message}`);
      }
      
      // Formatear y agrupar resultados por usuario
      const userScores = {};
      fallbackData.forEach(row => {
        const userId = row.user_id;
        if (!userScores[userId]) {
          userScores[userId] = {
            user_id: userId,
            name: row.profiles.name,
            total_points: 0,
          };
        }
        userScores[userId].total_points += row.points;
      });
      
      return Object.values(userScores)
        .sort((a: any, b: any) => b.total_points - a.total_points);
    }
    
    return data;
  },

  async subscribeToLeaderboardUpdates(gameId: string, callback: (payload: any) => void) {
    // Suscribirse a los cambios en live_game_answers
    return supabase
      .channel(`leaderboard-${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'live_game_answers',
          filter: `game_id=eq.${gameId}`
        },
        callback
      )
      .subscribe();
  }
};
