
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ContentPageEditor from './ContentPageEditor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ContentItem } from './ContentItemEditor';

// Páginas disponibles para edición
const availablePages = [
  { id: 'home', name: 'Página de Inicio' },
  { id: 'how-to-play', name: 'Cómo Jugar' },
  { id: 'games', name: 'Partidas' },
  { id: 'dashboard', name: 'Panel del Usuario' },
  { id: 'common', name: 'Elementos Comunes' },
];

const ContentManager = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar contenido
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('content_items')
          .select('*')
          .order('section', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setContentItems(data || []);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('No se pudo cargar el contenido. Intente de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  // Actualizar contenido
  const handleUpdateContent = async (key: string, newValue: string) => {
    try {
      // Optimistic update
      setContentItems(prevItems => 
        prevItems.map(item => 
          item.key === key 
            ? { ...item, content: newValue, updated_at: new Date().toISOString() } 
            : item
        )
      );
      
      // Send to database
      const { error } = await supabase
        .from('content_items')
        .update({ 
          content: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);
      
      if (error) throw error;
      
      toast({
        title: "Contenido actualizado",
        description: "El texto ha sido actualizado correctamente.",
      });
    } catch (err) {
      console.error('Error updating content:', err);
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: "No se pudo actualizar el contenido. Intente de nuevo.",
      });
      
      // Revert the optimistic update
      const { data } = await supabase
        .from('content_items')
        .select('*')
        .eq('key', key)
        .single();
      
      if (data) {
        setContentItems(prevItems => 
          prevItems.map(item => 
            item.key === key ? data : item
          )
        );
      }
    }
  };

  if (!profile?.is_admin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acceso denegado</AlertTitle>
        <AlertDescription>
          No tienes permisos para acceder a esta sección.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Contenido</CardTitle>
        <CardDescription>
          Modifica los textos que aparecen en la aplicación. Los cambios se reflejarán inmediatamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {availablePages.map(page => (
              <TabsTrigger key={page.id} value={page.id}>
                {page.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {availablePages.map(page => (
            <TabsContent key={page.id} value={page.id}>
              <ContentPageEditor 
                pageId={page.id}
                isLoading={isLoading}
                contentItems={contentItems.filter(item => item.page === page.id)}
                onUpdateContent={handleUpdateContent}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentManager;
