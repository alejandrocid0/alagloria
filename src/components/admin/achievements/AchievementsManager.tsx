
import { useState, useEffect } from 'react';
import { 
  fetchAchievements, 
  createAchievement, 
  deleteAchievement 
} from '@/services/achievementService';
import { Achievement } from '@/types/achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
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
import AchievementForm from './AchievementForm';
import AchievementIcon from '@/components/achievements/AchievementIcon';
import { toast } from 'sonner';

const AchievementsManager = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState('cofrade');
  
  useEffect(() => {
    loadAchievements();
    
    // Suscribirse a cambios en logros
    const channel = supabase
      .channel('public:achievements')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'achievements'
        }, 
        () => {
          loadAchievements();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filtrar logros por categoría
  const filteredAchievements = achievements.filter(
    a => a.category === activeCategory
  );
  
  // Cargar todos los logros
  const loadAchievements = async () => {
    setLoading(true);
    try {
      const data = await fetchAchievements();
      setAchievements(data);
    } catch (error) {
      console.error('Error al cargar logros:', error);
      toast.error('Error al cargar los logros');
    } finally {
      setLoading(false);
    }
  };
  
  // Crear un nuevo logro
  const handleCreateAchievement = async (data: Omit<Achievement, 'id' | 'created_at' | 'created_by'>) => {
    setSubmitting(true);
    try {
      const newAchievement = await createAchievement(data);
      if (newAchievement) {
        toast.success('Logro creado correctamente');
        setOpenDialog(false);
      } else {
        toast.error('Error al crear el logro');
      }
    } catch (error) {
      console.error('Error al crear logro:', error);
      toast.error('Error al crear el logro');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Eliminar un logro
  const handleDeleteAchievement = async (id: string) => {
    try {
      const success = await deleteAchievement(id);
      if (success) {
        toast.success('Logro eliminado correctamente');
      } else {
        toast.error('Error al eliminar el logro');
      }
    } catch (error) {
      console.error('Error al eliminar logro:', error);
      toast.error('Error al eliminar el logro');
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Administración de Logros</CardTitle>
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
        <CardTitle>Administración de Logros</CardTitle>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Logro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Logro</DialogTitle>
            </DialogHeader>
            <AchievementForm 
              onSubmit={handleCreateAchievement} 
              isSubmitting={submitting}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cofrade" onValueChange={setActiveCategory}>
          <TabsList className="mb-4">
            <TabsTrigger value="cofrade">Cofrades</TabsTrigger>
            <TabsTrigger value="general">Generales</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeCategory}>
            {filteredAchievements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay logros en esta categoría.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setOpenDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer logro
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Respuestas</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAchievements.map(achievement => (
                    <TableRow key={achievement.id}>
                      <TableCell>
                        <AchievementIcon 
                          achievement={achievement} 
                          earned={true} 
                          size={20}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{achievement.name}</TableCell>
                      <TableCell>{achievement.description}</TableCell>
                      <TableCell className="text-right">{achievement.required_correct_answers}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar logro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará el logro y todas sus asignaciones a usuarios.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-700"
                                onClick={() => handleDeleteAchievement(achievement.id)}
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

export default AchievementsManager;
