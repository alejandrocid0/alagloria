
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ContentContextType {
  content: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  getText: (key: string, defaultText?: string) => string;
}

const ContentContext = createContext<ContentContextType>({
  content: {},
  isLoading: true,
  error: null,
  getText: () => '',
});

export const useContent = () => useContext(ContentContext);

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('content_items')
          .select('key, content');
        
        if (error) throw error;
        
        // Convertir a un objeto con clave-valor para fácil acceso
        const contentMap = (data || []).reduce((acc, item) => {
          acc[item.key] = item.content;
          return acc;
        }, {} as Record<string, string>);
        
        setContent(contentMap);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Error al cargar el contenido');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
    
    // Suscribirse a cambios en el contenido
    const channel = supabase
      .channel('public:content_items')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'content_items' 
        }, 
        (payload) => {
          // Actualizar el contenido en tiempo real
          setContent(prev => ({
            ...prev,
            [payload.new.key]: payload.new.content
          }));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Función para obtener texto por clave
  const getText = (key: string, defaultText: string = ''): string => {
    return content[key] !== undefined ? content[key] : defaultText;
  };

  return (
    <ContentContext.Provider value={{ content, isLoading, error, getText }}>
      {children}
    </ContentContext.Provider>
  );
};
