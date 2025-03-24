
import { useForm } from 'react-hook-form';
import { Achievement } from '@/types/achievements';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const achievementSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  icon_name: z.string().min(1, 'Selecciona un icono'),
  required_correct_answers: z.coerce.number().int().min(1, 'Debe ser al menos 1'),
  category: z.string().min(1, 'Selecciona una categoría'),
});

interface AchievementFormProps {
  onSubmit: (data: z.infer<typeof achievementSchema>) => void;
  initialData?: Partial<Achievement>;
  isSubmitting?: boolean;
}

// Iconos disponibles
const availableIcons = [
  { value: 'award', label: 'Premio' },
  { value: 'star', label: 'Estrella' },
  { value: 'trophy', label: 'Trofeo' },
  { value: 'medal', label: 'Medalla' },
  { value: 'book', label: 'Libro' },
  { value: 'heart', label: 'Corazón' },
  { value: 'thumbsup', label: 'Pulgar arriba' },
  { value: 'target', label: 'Diana' },
  { value: 'check', label: 'Verificado' },
  { value: 'clock', label: 'Reloj' },
];

// Categorías disponibles
const availableCategories = [
  { value: 'cofrade', label: 'Cofrade' },
  { value: 'general', label: 'General' },
];

const AchievementForm = ({ 
  onSubmit, 
  initialData = {}, 
  isSubmitting = false 
}: AchievementFormProps) => {
  const form = useForm<z.infer<typeof achievementSchema>>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      name: initialData.name || '',
      description: initialData.description || '',
      icon_name: initialData.icon_name || '',
      required_correct_answers: initialData.required_correct_answers || 1,
      category: initialData.category || 'cofrade',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del logro</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Maestro cofrade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ej: Has contestado correctamente a 50 preguntas sobre Semana Santa" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icono</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un icono" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableIcons.map(icon => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCategories.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="required_correct_answers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Respuestas correctas requeridas</FormLabel>
              <FormControl>
                <Input type="number" min="1" step="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Guardando...
            </>
          ) : (
            'Guardar logro'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AchievementForm;
