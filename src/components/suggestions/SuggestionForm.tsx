
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Esquema de validación para el formulario de sugerencias
const suggestionSchema = z.object({
  message: z.string().min(10, {
    message: 'Tu sugerencia debe tener al menos 10 caracteres.',
  }),
});

// Tipado para el formulario
type SuggestionFormValues = z.infer<typeof suggestionSchema>;

const SuggestionForm = () => {
  const { user, profile, sendSuggestion } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      message: '',
    },
  });

  // Enviar una nueva sugerencia
  const onSubmit = async (values: SuggestionFormValues) => {
    setSubmitting(true);
    try {
      const { error } = await sendSuggestion(values.message);
      if (error) {
        toast.error('No se pudo enviar tu sugerencia. Por favor, intenta de nuevo.');
        console.error('Error sending suggestion:', error);
      } else {
        toast.success('¡Gracias por tu sugerencia! La revisaremos pronto.');
        form.reset();
        // Notificar al componente padre para actualizar la lista de sugerencias
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('suggestion:created'));
        }
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      console.error('Error in onSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Envía tu sugerencia</h2>
      <p className="text-gray-600 mb-4">
        Nos encantaría saber qué opinas sobre "A la Gloria". Tus sugerencias nos ayudan a mejorar.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tu sugerencia</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Escribe aquí tu sugerencia o comentario..." 
                    className="min-h-[150px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-500">
              Enviando como: <span className="font-medium">{profile?.email || user?.email}</span>
            </p>
            <Button 
              type="submit" 
              className="ml-auto bg-gloria-purple hover:bg-gloria-purple/90"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enviando...
                </>
              ) : (
                'Enviar Sugerencia'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SuggestionForm;
