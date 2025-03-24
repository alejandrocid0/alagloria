
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
import { 
  User, UserRound, Users, UsersRound, 
  Badge, BadgeCheck, Trophy
} from 'lucide-react';

interface UserLevelFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    icon_name: string;
    required_correct_answers: number;
    level_order: number;
    category: string;
  }) => void;
  isSubmitting: boolean;
  nextOrder: number;
}

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z.string().min(5, "La descripción debe tener al menos 5 caracteres"),
  icon_name: z.string().min(1, "Seleccione un icono"),
  required_correct_answers: z.coerce.number().min(0, "Debe ser un número positivo"),
  level_order: z.coerce.number().min(1, "El orden debe ser al menos 1"),
  category: z.string().min(1, "Seleccione una categoría")
});

// Iconos disponibles
const iconOptions = [
  { value: 'user', label: 'Usuario', icon: User },
  { value: 'user-round', label: 'Usuario Redondeado', icon: UserRound },
  { value: 'users', label: 'Usuarios', icon: Users },
  { value: 'users-round', label: 'Usuarios Redondeados', icon: UsersRound },
  { value: 'badge', label: 'Insignia', icon: Badge },
  { value: 'badge-check', label: 'Insignia Verificada', icon: BadgeCheck },
  { value: 'trophy', label: 'Trofeo', icon: Trophy }
];

// Define el tipo basado en el schema de zod
type FormValues = z.infer<typeof formSchema>;

const UserLevelForm = ({ 
  onSubmit, 
  isSubmitting,
  nextOrder 
}: UserLevelFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon_name: "user",
      required_correct_answers: 0,
      level_order: nextOrder,
      category: "cofrade"
    }
  });

  // Aseguramos que los valores pasados a onSubmit no sean opcionales
  const handleSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      description: values.description,
      icon_name: values.icon_name,
      required_correct_answers: values.required_correct_answers,
      level_order: values.level_order,
      category: values.category
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Nivel</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Nazareno" {...field} />
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
                  placeholder="Ej. Has alcanzado un nivel intermedio de conocimiento..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="icon_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icono</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un icono" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {iconOptions.map((icon) => {
                    const Icon = icon.icon;
                    return (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center">
                          <Icon className="mr-2 h-4 w-4" />
                          {icon.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="required_correct_answers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Respuestas correctas requeridas</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="level_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
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
                  <SelectItem value="cofrade">Cofrade</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Nivel"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserLevelForm;
