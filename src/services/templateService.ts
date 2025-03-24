
import { supabase } from '@/integrations/supabase/client';

export interface QuestionTemplate {
  id: string;
  category: string;
  question_text: string;
  difficulty: string;
  created_at: string;
}

export interface OptionTemplate {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  position: number;
}

export async function fetchQuestionTemplates(category?: string) {
  let query = supabase
    .from('question_templates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error al cargar plantillas de preguntas:', error);
    throw new Error(`Error al cargar plantillas: ${error.message}`);
  }
  
  return data || [];
}

export async function fetchQuestionTemplateWithOptions(questionId: string) {
  // Obtener la pregunta
  const { data: question, error: questionError } = await supabase
    .from('question_templates')
    .select('*')
    .eq('id', questionId)
    .single();
  
  if (questionError) {
    console.error('Error al cargar plantilla de pregunta:', questionError);
    throw new Error(`Error al cargar plantilla: ${questionError.message}`);
  }
  
  // Obtener las opciones
  const { data: options, error: optionsError } = await supabase
    .from('option_templates')
    .select('*')
    .eq('question_id', questionId)
    .order('position', { ascending: true });
  
  if (optionsError) {
    console.error('Error al cargar opciones de plantilla:', optionsError);
    throw new Error(`Error al cargar opciones: ${optionsError.message}`);
  }
  
  return {
    question,
    options: options || []
  };
}

export async function createQuestionTemplate(data: Omit<QuestionTemplate, 'id' | 'created_at'>) {
  const { data: newQuestion, error } = await supabase
    .from('question_templates')
    .insert({
      category: data.category,
      question_text: data.question_text,
      difficulty: data.difficulty
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear plantilla de pregunta:', error);
    throw new Error(`Error al crear plantilla: ${error.message}`);
  }
  
  return newQuestion;
}

export async function updateQuestionTemplate(
  id: string, 
  data: Partial<Omit<QuestionTemplate, 'id' | 'created_at'>>
) {
  const { data: updatedQuestion, error } = await supabase
    .from('question_templates')
    .update({
      category: data.category,
      question_text: data.question_text,
      difficulty: data.difficulty
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar plantilla de pregunta:', error);
    throw new Error(`Error al actualizar plantilla: ${error.message}`);
  }
  
  return updatedQuestion;
}

export async function deleteQuestionTemplate(id: string) {
  const { error } = await supabase
    .from('question_templates')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error al eliminar plantilla de pregunta:', error);
    throw new Error(`Error al eliminar plantilla: ${error.message}`);
  }
  
  return true;
}

export async function createOptionTemplate(
  questionId: string, 
  optionText: string, 
  isCorrect: boolean,
  position: number
) {
  const { data: newOption, error } = await supabase
    .from('option_templates')
    .insert({
      question_id: questionId,
      option_text: optionText,
      is_correct: isCorrect,
      position: position
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error al crear opción de plantilla:', error);
    throw new Error(`Error al crear opción: ${error.message}`);
  }
  
  return newOption;
}

export async function updateOptionTemplate(
  id: string,
  data: Partial<Omit<OptionTemplate, 'id' | 'question_id'>>
) {
  const { data: updatedOption, error } = await supabase
    .from('option_templates')
    .update({
      option_text: data.option_text,
      is_correct: data.is_correct,
      position: data.position
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error al actualizar opción de plantilla:', error);
    throw new Error(`Error al actualizar opción: ${error.message}`);
  }
  
  return updatedOption;
}

export async function generateGameFromTemplates(
  title: string,
  description: string,
  gameDate: string,
  gameTime: string,
  category: string,
  numQuestions: number
) {
  // Convertir fecha y hora a formato ISO
  const gameDateTime = new Date(`${gameDate}T${gameTime}`);
  
  // Llamar a la función de base de datos
  const { data, error } = await supabase
    .rpc('generate_game_from_templates', {
      p_title: title,
      p_description: description,
      p_date: gameDateTime.toISOString(),
      p_category: category,
      p_num_questions: numQuestions,
      p_created_by: (await supabase.auth.getSession()).data.session?.user.id
    });
  
  if (error) {
    console.error('Error al generar juego desde plantillas:', error);
    throw new Error(`Error al generar juego: ${error.message}`);
  }
  
  return data;
}
