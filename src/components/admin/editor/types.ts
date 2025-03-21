
import { z } from 'zod';

// Define schema for options
export const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "El texto de la opción es requerido"),
  option_id: z.string().optional(),
  question_id: z.string().optional(),
  position: z.number().optional(),
});

// Define schema for questions
export const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(3, "La pregunta debe tener al menos 3 caracteres"),
  correctOption: z.string(),
  options: z.array(optionSchema).min(3, "Debe haber al menos 3 opciones"),
  position: z.number().optional(),
  question_id: z.string().optional(),
  difficulty: z.enum(['guiri', 'sevillano', 'nazareno', 'costalero', 'capataz']).optional(),
});

// Define schema for the game form
export const gameFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  gameDate: z.string().min(1, "La fecha es requerida"),
  gameTime: z.string().min(1, "La hora es requerida"),
  category: z.enum(['curiosidades', 'historia', 'ediciones-semana-santa', 'misterios', 'palios', 'mundo-costal']).optional().default('curiosidades'),
  questions: z.array(questionSchema).min(1, "Debe haber al menos 1 pregunta"),
});

export type GameFormValues = z.infer<typeof gameFormSchema>;
export type QuestionFormValues = z.infer<typeof questionSchema>;
export type OptionFormValues = z.infer<typeof optionSchema>;

export interface Question {
  id: string;
  game_id: string;
  question_text: string;
  correct_option: string;
  position: number;
  difficulty?: string;
}

export interface Option {
  id: string;
  question_id: string;
  option_text: string;
  option_id: string;
  position: number;
}

export interface GameEditorProps {
  game: {
    id: string;
    title: string;
    description: string;
    date: string;
    image_url?: string;
    category?: string;
  };
  onClose: () => void;
}

export interface GameEditorMetadataProps {
  imageFile: File | null;
  imagePreview: string | null;
  uploadProgress: number;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface GameEditorActionsProps {
  onClose: () => void;
  isSaving: boolean;
}
