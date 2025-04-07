
import { useState } from 'react';
import { UserLevel } from '@/types/userLevels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Esquema de validación para el formulario
const levelSchema = z.object({
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
type LevelFormValues = z.infer<typeof levelSchema>;

interface UserLevelFormProps {
  onSubmit: (data: Omit<UserLevel, 'id' | 'created_at' | 'created_by'>) => void;
  isSubmitting: boolean;
  initialValues?: Partial<UserLevel>;
  nextOrder?: number;
  isEditing?: boolean;
}

const UserLevelForm = ({
  onSubmit,
  isSubmitting,
  initialValues,
  nextOrder = 1,
  isEditing = false,
}: UserLevelFormProps) => {
  // Configurar valores por defecto del formulario
  const defaultValues: Partial<LevelFormValues> = {
    name: '',
    description: '',
    icon_name: 'award',
    required_correct_answers: 0,
    level_order: nextOrder,
    category: 'cofrade',
    ...initialValues,
  };

  // Inicializar react-hook-form
  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues,
  });

  // Manejar envío del formulario
  const handleSubmit = (values: LevelFormValues) => {
    onSubmit(values);
  };

  // Lista de iconos disponibles
  const availableIcons = [
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Campo de nombre */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nombre del nivel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Campo de descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Descripción del nivel" rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selección de icono */}
        <FormField
          control={form.control}
          name="icon_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icono</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un icono" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableIcons.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Campo de respuestas requeridas */}
          <FormField
            control={form.control}
            name="required_correct_answers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Respuestas correctas requeridas</FormLabel>
                <FormControl>
                  <Input type="number" {...field} min="0" placeholder="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campo de orden */}
          <FormField
            control={form.control}
            name="level_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden de nivel</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    min="1"
                    placeholder="1"
                    disabled={isEditing} // Deshabilitar si estamos editando
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Selección de categoría */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cofrade">Cofrade</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Botones de acción */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar nivel' : 'Crear nivel'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserLevelForm;
