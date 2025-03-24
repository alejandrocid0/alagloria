
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface GenerateGameFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    gameDate: string;
    gameTime: string;
    category: string;
    numQuestions: number;
  }) => void;
  isSubmitting: boolean;
  categories: { value: string; label: string }[];
}

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  gameDate: z.string().min(1, "La fecha es requerida"),
  gameTime: z.string().min(1, "La hora es requerida"),
  category: z.string().min(1, "Seleccione una categoría"),
  numQuestions: z.coerce.number().min(5, "Debe seleccionar al menos 5 preguntas").max(20, "No puede seleccionar más de 20 preguntas")
});

// Define el tipo basado en el schema de zod
type FormValues = z.infer<typeof formSchema>;

const GenerateGameForm = ({ 
  onSubmit, 
  isSubmitting,
  categories 
}: GenerateGameFormProps) => {
  // Obtener fecha y hora actual para los valores por defecto
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const defaultDate = nextWeek.toISOString().split('T')[0];
  const defaultTime = '19:00';
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      gameDate: defaultDate,
      gameTime: defaultTime,
      category: "curiosidades",
      numQuestions: 10
    }
  });

  // Aseguramos que los valores pasados a onSubmit no sean opcionales
  const handleSubmit = (values: FormValues) => {
    // Al usar FormValues y provenir de zodResolver, TypeScript garantiza que los valores 
    // requeridos por el esquema existen y no son opcionales
    onSubmit({
      title: values.title,
      description: values.description,
      gameDate: values.gameDate,
      gameTime: values.gameTime,
      category: values.category,
      numQuestions: values.numQuestions
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Cuestionario de Curiosidades" {...field} />
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
                  placeholder="Breve descripción del cuestionario"
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
            name="gameDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gameTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
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
        
        <FormField
          control={form.control}
          name="numQuestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de preguntas</FormLabel>
              <FormControl>
                <Input type="number" min="5" max="20" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Generando..." : "Generar Juego"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default GenerateGameForm;
