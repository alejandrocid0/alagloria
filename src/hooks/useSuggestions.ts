
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Suggestion } from '@/contexts/auth/types';
import { toast } from 'sonner';

export type SuggestionWithUser = Suggestion & { user_name?: string };

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState<SuggestionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Actualizar estado de sugerencia
  const updateSuggestionStatus = async (id: string, newStatus: 'pending' | 'reviewed' | 'implemented') => {
    try {
      const { error } = await supabase
        .from('user_suggestions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        toast.error('Error al actualizar el estado.');
        console.error('Error updating suggestion:', error);
        return false;
      } else {
        toast.success('Estado actualizado correctamente.');
        // Actualizar localmente
        setSuggestions(prevSuggestions => 
          prevSuggestions.map(suggestion => 
            suggestion.id === id ? { ...suggestion, status: newStatus } : suggestion
          )
        );
        return true;
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado.');
      console.error('Error in updateSuggestionStatus:', error);
      return false;
    }
  };

  // Buscar sugerencias
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Primero obtenemos todas las sugerencias
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('user_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (suggestionsError) {
        console.error('Error fetching suggestions:', suggestionsError);
        toast.error('Error al cargar las sugerencias.');
        setLoading(false);
        return;
      }

      // Ahora necesitamos obtener los nombres de los usuarios
      const formattedData = await Promise.all(
        suggestionsData.map(async (item) => {
          // Obtenemos el perfil del usuario para cada sugerencia
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', item.user_id)
            .single();

          if (profileError) {
            console.log('Error fetching profile for user', item.user_id, profileError);
            return {
              id: item.id,
              email: item.email,
              message: item.message,
              created_at: item.created_at,
              status: item.status as 'pending' | 'reviewed' | 'implemented',
              user_name: 'Usuario' // Valor por defecto si no encontramos el perfil
            };
          }

          return {
            id: item.id,
            email: item.email,
            message: item.message,
            created_at: item.created_at,
            status: item.status as 'pending' | 'reviewed' | 'implemented',
            user_name: profileData?.name || 'Usuario'
          };
        })
      );

      setSuggestions(formattedData);
    } catch (error) {
      console.error('Error in fetchSuggestions:', error);
      toast.error('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar sugerencias al montar el componente
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // Filtrado de sugerencias
  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = 
      suggestion.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (suggestion.user_name && suggestion.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return {
    suggestions: filteredSuggestions,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateSuggestionStatus,
    refreshSuggestions: fetchSuggestions
  };
};
