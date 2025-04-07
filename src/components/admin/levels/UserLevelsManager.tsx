
import { useState, useEffect } from 'react';
import { 
  fetchUserLevels, 
  createUserLevel, 
  deleteUserLevel,
  updateUserLevel
} from '@/services/userLevelService';
import { UserLevel } from '@/types/userLevels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit } from 'lucide-react';
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
import UserLevelForm from './UserLevelForm';
import LevelIcon from '@/components/levels/LevelIcon';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const UserLevelsManager = () => {
  const [levels, setLevels] = useState<UserLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<UserLevel | null>(null);
  const [activeCategory, setActiveCategory] = useState('cofrade');
  
  useEffect(() => {
    loadLevels();
    
    // Suscribirse a cambios en niveles
    const channel = supabase
      .channel('public:user_levels')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_levels'
        }, 
        () => {
          loadLevels();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  // Filtrar niveles por categoría
  const filteredLevels = levels
    .filter(l => l.category === activeCategory)
    .sort((a, b) => a.level_order - b.level_order);
  
  // Cargar todos los niveles
  const loadLevels = async () => {
    setLoading(true);
    try {
      const data = await fetchUserLevels();
      setLevels(data);
    } catch (error) {
      console.error('Error al cargar niveles:', error);
      toast.error('Error al cargar los niveles');
    } finally {
      setLoading(false);
    }
  };
  
  // Crear un nuevo nivel
  const handleCreateLevel = async (data: Omit<UserLevel, 'id' | 'created_at' | 'created_by'>) => {
    setSubmitting(true);
    try {
      const newLevel = await createUserLevel(data);
      if (newLevel) {
        toast.success('Nivel creado correctamente');
        setOpenDialog(false);
      } else {
        toast.error('Error al crear el nivel');
      }
    } catch (error) {
      console.error('Error al crear nivel:', error);
      toast.error('Error al crear el nivel');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Editar un nivel existente
  const handleEditLevel = async (data: Omit<UserLevel, 'id' | 'created_at' | 'created_by'>) => {
    if (!currentLevel) return;
    
    setSubmitting(true);
    try {
      const updatedLevel = await updateUserLevel(currentLevel.id, data);
      if (updatedLevel) {
        toast.success('Nivel actualizado correctamente');
        setEditDialog(false);
        setCurrentLevel(null);
      } else {
        toast.error('Error al actualizar el nivel');
      }
    } catch (error) {
      console.error('Error al actualizar nivel:', error);
      toast.error('Error al actualizar el nivel');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Abrir diálogo de edición
  const openEditDialog = (level: UserLevel) => {
    setCurrentLevel(level);
    setEditDialog(true);
  };
  
  // Eliminar un nivel
  const handleDeleteLevel = async (id: string) => {
    try {
      const success = await deleteUserLevel(id);
      if (success) {
        toast.success('Nivel eliminado correctamente');
      } else {
        toast.error('Error al eliminar el nivel');
      }
    } catch (error) {
      console.error('Error al eliminar nivel:', error);
      toast.error('Error al eliminar el nivel');
    }
  };
  
  // Cambiar el orden de un nivel
  const handleReorderLevel = async (level: UserLevel, direction: 'up' | 'down') => {
    const otherLevels = filteredLevels.filter(l => l.id !== level.id);
    
    // No podemos mover más arriba del primero
    if (direction === 'up' && level.level_order <= 1) {
      return;
    }
    
    // No podemos mover más abajo del último
    if (direction === 'down' && level.level_order >= filteredLevels.length) {
      return;
    }
    
    try {
      // Encontrar nivel para intercambiar
      const targetOrder = direction === 'up' 
        ? level.level_order - 1 
        : level.level_order + 1;
      
      const targetLevel = filteredLevels.find(l => l.level_order === targetOrder);
      
      if (!targetLevel) return;
      
      // Actualizar ambos niveles
      const { error: error1 } = await supabase
        .from('user_levels')
        .update({ level_order: targetOrder })
        .eq('id', level.id);
        
      const { error: error2 } = await supabase
        .from('user_levels')
        .update({ level_order: level.level_order })
        .eq('id', targetLevel.id);
      
      if (error1 || error2) {
        throw new Error(error1?.message || error2?.message);
      }
      
      toast.success('Orden actualizado');
      loadLevels();
    } catch (error) {
      console.error('Error al reordenar niveles:', error);
      toast.error('Error al reordenar niveles');
    }
  };
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Administración de Niveles</CardTitle>
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
        <CardTitle>Administración de Niveles</CardTitle>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Nivel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Nivel</DialogTitle>
            </DialogHeader>
            <UserLevelForm 
              onSubmit={handleCreateLevel} 
              isSubmitting={submitting}
              nextOrder={filteredLevels.length + 1}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cofrade" onValueChange={setActiveCategory}>
          <TabsList className="mb-4">
            <TabsTrigger value="cofrade">Cofrades</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeCategory}>
            {filteredLevels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay niveles en esta categoría.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setOpenDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primer nivel
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
                    <TableHead className="text-center">Orden</TableHead>
                    <TableHead className="w-28"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLevels.map(level => (
                    <TableRow key={level.id}>
                      <TableCell>
                        <LevelIcon 
                          level={level} 
                          achieved={true} 
                          size={20}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{level.name}</TableCell>
                      <TableCell>{level.description}</TableCell>
                      <TableCell className="text-right">{level.required_correct_answers}</TableCell>
                      <TableCell className="text-center">{level.level_order}</TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleReorderLevel(level, 'up')}
                            disabled={level.level_order <= 1}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleReorderLevel(level, 'down')}
                            disabled={level.level_order >= filteredLevels.length}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7 text-amber-500 hover:text-amber-700"
                            onClick={() => openEditDialog(level)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar nivel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará el nivel y podría afectar a usuarios que lo hayan alcanzado.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-700"
                                  onClick={() => handleDeleteLevel(level.id)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {/* Diálogo de edición */}
            <Dialog open={editDialog} onOpenChange={setEditDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Editar Nivel</DialogTitle>
                </DialogHeader>
                {currentLevel && (
                  <UserLevelForm 
                    onSubmit={handleEditLevel} 
                    isSubmitting={submitting}
                    initialValues={currentLevel}
                    isEditing={true}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserLevelsManager;
