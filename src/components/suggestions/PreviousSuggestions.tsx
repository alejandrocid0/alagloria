
import React, { useState, useEffect } from 'react';
import { Suggestion } from '@/contexts/auth/types';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent } from '@/components/ui/card';

interface PreviousSuggestionsProps {
  user: User | null;
}

const PreviousSuggestions: React.FC<PreviousSuggestionsProps> = ({ user }) => {
  const [previousSuggestions, setPreviousSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener sugerencias previas del usuario
  const fetchPreviousSuggestions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_suggestions')
        .select('*')
        .eq('user_id', user.id)
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
      setLoading(false);
    }
  };

  // Event listener para actualizar cuando se crea una nueva sugerencia
  useEffect(() => {
    const handleSuggestionCreated = () => {
      fetchPreviousSuggestions();
    };

    window.addEventListener('suggestion:created', handleSuggestionCreated);
    
    return () => {
      window.removeEventListener('suggestion:created', handleSuggestionCreated);
    };
  }, [user]);

  // Cargar sugerencias al montar el componente
  useEffect(() => {
    if (user) {
      fetchPreviousSuggestions();
    }
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Tus sugerencias anteriores</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-4 border-gloria-purple border-t-transparent rounded-full"></div>
        </div>
      ) : previousSuggestions.length > 0 ? (
        <div className="space-y-4">
          {previousSuggestions.map((suggestion) => (
            <Card 
              key={suggestion.id} 
              className="border rounded-md p-4 bg-gray-50"
            >
              <CardContent className="p-0">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 py-4">No has enviado ninguna sugerencia todavía.</p>
      )}
    </div>
  );
};

export default PreviousSuggestions;
