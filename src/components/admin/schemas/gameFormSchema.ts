
import { z } from 'zod';

// Define schema for options
export const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "El texto de la opción es requerido"),
});

// Define schema for questions
export const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
  correctOption: z.string(),
  options: z.array(optionSchema).min(3, "Debe haber al menos 3 opciones"),
});

// Define schema for the game form
export const gameFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  gameDate: z.string().min(1, "La fecha es requerida"),
  gameTime: z.string().min(1, "La hora es requerida"),
  category: z.string().min(1, "La categoría es requerida"),
  questions: z.array(questionSchema).min(1, "Debe haber al menos 1 pregunta"),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;
export type QuestionFormValues = z.infer<typeof questionSchema>;
export type OptionFormValues = z.infer<typeof optionSchema>;
