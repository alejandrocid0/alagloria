
import { z } from 'zod';

// Schema de validación para el formulario
export const levelSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  icon_name: z.string().min(1, 'Seleccione un icono'),
  required_correct_answers: z.coerce
    .number()
    .int('Debe ser un número entero')
    .min(0, 'El valor mínimo es 0'),
  level_order: z.coerce.number().int('Debe ser un número entero').min(1, 'El orden mínimo es 1'),
  category: z.string().min(1, 'Seleccione una categoría'),
});

// Tipo para el formulario
export type LevelFormValues = z.infer<typeof levelSchema>;

// Lista de iconos disponibles para el formulario
export const availableIcons = [
  'award',
  'medal',
  'trophy',
  'star',
  'crown',
  'badge',
  'certificate',
  'heart',
  'gift',
  'gem',
  'zap',
];
