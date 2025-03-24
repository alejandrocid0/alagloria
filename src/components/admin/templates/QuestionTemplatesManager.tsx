
import { useState, useEffect } from 'react';
import { 
  fetchQuestionTemplates,
  createQuestionTemplate,
  deleteQuestionTemplate,
  generateGameFromTemplates,
  QuestionTemplate
} from '@/services/templateService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import QuestionTemplateForm from './QuestionTemplateForm';
import GenerateGameForm from './GenerateGameForm';
import { SEMANA_SANTA_CATEGORIES } from '../schemas/gameFormSchema';

const difficultyLabels: Record<string, string> = {
  'fácil': 'Fácil',
  'normal': 'Normal',
  'difícil': 'Difícil'
};

const categoryLabels: Record<string, string> = {
  'curiosidades': 'Curiosidades',
  'historia': 'Historia',
  'ediciones-semana-santa': 'Ediciones Semana Santa',
  'misterios': 'Misterios',
  'palios': 'Palios',
  'mundo-costal': 'Mundo Costal'
};

const QuestionTemplatesManager = () => {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('curiosidades');
  
  useEffect(() => {
    loadTemplates();
    
    // Suscribirse a cambios en plantillas
    const channel = supabase
      .channel('public:question_templates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'question_templates'
        }, 
        () => {
          loadTemplates();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCategory]);
  
  // Filtrar plantillas por categoría
  const filteredTemplates = templates.filter(
    t => t.category === activeCategory
  );
  
  // Cargar todas las plantillas
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchQuestionTemplates(activeCategory);
      setTemplates(data);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      toast.error('Error al cargar las plantillas');
    } finally {
      setLoading(false);
    }
  };
  
  // Crear una nueva plantilla
  const handleCreateTemplate = async (data: { 
    question_text: string; 
    category: string;
    difficulty: string;
  }) => {
    setSubmitting(true);
    try {
      await createQuestionTemplate({
        question_text: data.question_text,
        category: data.category,
        difficulty: data.difficulty
      });
      
      toast.success('Plantilla creada correctamente');
      setOpenDialog(false);
      loadTemplates();
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      toast.error('Error al crear la plantilla');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Eliminar una plantilla
  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteQuestionTemplate(id);
      toast.success('Plantilla eliminada correctamente');
      loadTemplates();
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      toast.error('Error al eliminar la plantilla');
    }
  };
  
  // Generar un juego a partir de plantillas
  const handleGenerateGame = async (data: {
    title: string;
    description: string;
    gameDate: string;
    gameTime: string;
    category: string;
    numQuestions: number;
  }) => {
    setSubmitting(true);
    try {
      const gameId = await generateGameFromTemplates(
        data.title,
        data.description,
        data.gameDate,
        data.gameTime,
        data.category,
        data.numQuestions
      );
      
      toast.success('Juego generado correctamente');
      setOpenGenerateDialog(false);
    } catch (error) {
      console.error('Error al generar juego:', error);
      toast.error('Error al generar el juego');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Preguntas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Plantillas de Preguntas</CardTitle>
        <div className="flex space-x-2">
          <Dialog open={openGenerateDialog} onOpenChange={setOpenGenerateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Wand2 className="mr-2 h-4 w-4" />
                Generar Juego
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generar Juego desde Plantillas</DialogTitle>
              </DialogHeader>
              <GenerateGameForm 
                onSubmit={handleGenerateGame}
                isSubmitting={submitting}
                categories={SEMANA_SANTA_CATEGORIES.map(cat => ({
                  value: cat,
                  label: categoryLabels[cat] || cat
                }))}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Plantilla
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Nueva Plantilla</DialogTitle>
              </DialogHeader>
              <QuestionTemplateForm 
                onSubmit={handleCreateTemplate} 
                isSubmitting={submitting}
                categories={SEMANA_SANTA_CATEGORIES.map(cat => ({
                  value: cat,
                  label: categoryLabels[cat] || cat
                }))}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curiosidades" onValueChange={setActiveCategory}>
          <TabsList className="mb-4">
            {SEMANA_SANTA_CATEGORIES.map(category => (
              <TabsTrigger key={category} value={category}>
                {categoryLabels[category] || category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeCategory}>
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay plantillas en esta categoría.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setOpenDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera plantilla
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pregunta</TableHead>
                    <TableHead>Dificultad</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.question_text}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          template.difficulty === 'fácil' 
                            ? 'bg-green-100 text-green-800' 
                            : template.difficulty === 'difícil' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {difficultyLabels[template.difficulty] || template.difficulty}
                        </span>
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará la plantilla y todas sus opciones.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-700"
                                onClick={() => handleDeleteTemplate(template.id)}
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuestionTemplatesManager;
