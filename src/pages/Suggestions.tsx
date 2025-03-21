
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Suggestion } from '@/contexts/auth/types';

// Esquema de validación para el formulario de sugerencias
const suggestionSchema = z.object({
  message: z.string().min(10, {
    message: 'Tu sugerencia debe tener al menos 10 caracteres.',
  }),
});

// Tipado para el formulario
type SuggestionFormValues = z.infer<typeof suggestionSchema>;

const Suggestions = () => {
  const { user, profile, loading, sendSuggestion } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [previousSuggestions, setPreviousSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const form = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionSchema),
    defaultValues: {
      message: '',
    },
  });

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { redirectTo: '/suggestions' } });
    } else if (user) {
      // Cargar sugerencias previas
      fetchPreviousSuggestions();
    }
  }, [user, loading, navigate]);

  // Obtener sugerencias previas del usuario
  const fetchPreviousSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_suggestions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggestions:', error);
      } else {
        // Cast the status to the correct type
        const typedData = data?.map(item => ({
          ...item,
          status: item.status as 'pending' | 'reviewed' | 'implemented'
        })) || [];
        
        setPreviousSuggestions(typedData);
      }
    } catch (error) {
      console.error('Error in fetchPreviousSuggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

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
        // Recargar sugerencias
        fetchPreviousSuggestions();
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      console.error('Error in onSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gloria-purple">Cargando...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <h1 className="text-3xl font-serif font-bold text-gloria-purple mb-6">
          Buzón de Sugerencias
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Formulario de sugerencia */}
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

          {/* Sugerencias anteriores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Tus sugerencias anteriores</h2>
            
            {loadingSuggestions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-4 border-gloria-purple border-t-transparent rounded-full"></div>
              </div>
            ) : previousSuggestions.length > 0 ? (
              <div className="space-y-4">
                {previousSuggestions.map((suggestion) => (
                  <div 
                    key={suggestion.id} 
                    className="border rounded-md p-4 bg-gray-50"
                  >
                    <p className="mb-2">{suggestion.message}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>
                        {new Date(suggestion.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="capitalize">
                        Estado: {
                          suggestion.status === 'pending' ? 'Pendiente' :
                          suggestion.status === 'reviewed' ? 'Revisada' :
                          suggestion.status === 'implemented' ? 'Implementada' : 
                          suggestion.status
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 py-4">No has enviado ninguna sugerencia todavía.</p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Suggestions;
