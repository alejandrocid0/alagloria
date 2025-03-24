
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

interface QuestionTemplateFormProps {
  onSubmit: (data: {
    question_text: string;
    category: string;
    difficulty: string;
  }) => void;
  isSubmitting: boolean;
  categories: { value: string; label: string }[];
}

const formSchema = z.object({
  question_text: z.string().min(5, "La pregunta debe tener al menos 5 caracteres"),
  category: z.string().min(1, "Seleccione una categoría"),
  difficulty: z.string().min(1, "Seleccione una dificultad")
});

// Define el tipo basado en el schema de zod
type FormValues = z.infer<typeof formSchema>;

const QuestionTemplateForm = ({ 
  onSubmit, 
  isSubmitting,
  categories 
}: QuestionTemplateFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question_text: "",
      category: "curiosidades",
      difficulty: "normal"
    }
  });

  // Aseguramos que los valores pasados a onSubmit no sean opcionales
  const handleSubmit = (values: FormValues) => {
    // Al usar FormValues y provenir de zodResolver, TypeScript garantiza que los valores 
    // requeridos por el esquema existen y no son opcionales
    onSubmit({
      question_text: values.question_text,
      category: values.category,
      difficulty: values.difficulty
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="question_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pregunta</FormLabel>
              <FormControl>
                <Input placeholder="Ej. ¿Cuál es la hermandad más antigua de Sevilla?" {...field} />
              </FormControl>
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
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dificultad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una dificultad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fácil">Fácil</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="difícil">Difícil</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Plantilla"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuestionTemplateForm;
