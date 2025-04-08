
import { useState } from 'react';
import { UserLevel } from '@/types/userLevels';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import FormFields from './components/FormFields';
import { levelSchema, LevelFormValues } from './schema/levelFormSchema';

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
    // Asegurarse de que todos los campos requeridos estén presentes
    const formData: Omit<UserLevel, 'id' | 'created_at' | 'created_by'> = {
      name: values.name,
      description: values.description,
      icon_name: values.icon_name,
      required_correct_answers: values.required_correct_answers,
      level_order: values.level_order,
      category: values.category,
    };
    
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormFields isEditing={isEditing} />
        
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
