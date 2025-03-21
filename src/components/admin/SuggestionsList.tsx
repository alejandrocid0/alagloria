
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Suggestion } from '@/contexts/auth/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const SuggestionsList = () => {
  const [suggestions, setSuggestions] = useState<(Suggestion & { user_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Cargar sugerencias al montar el componente
  useEffect(() => {
    fetchSuggestions();
  }, []);

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
      } else {
        toast.success('Estado actualizado correctamente.');
        // Actualizar localmente
        setSuggestions(prevSuggestions => 
          prevSuggestions.map(suggestion => 
            suggestion.id === id ? { ...suggestion, status: newStatus } : suggestion
          )
        );
      }
    } catch (error) {
      toast.error('Ocurrió un error inesperado.');
      console.error('Error in updateSuggestionStatus:', error);
    }
  };

  // Buscar sugerencias
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Consulta para obtener todas las sugerencias
      const { data, error } = await supabase
        .from('user_suggestions')
        .select(`
          *,
          profiles(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching suggestions:', error);
        toast.error('Error al cargar las sugerencias.');
      } else {
        // Mapear los datos para incluir el nombre del usuario
        const formattedData = data.map(item => ({
          id: item.id,
          email: item.email,
          message: item.message,
          created_at: item.created_at,
          status: item.status as 'pending' | 'reviewed' | 'implemented',
          user_name: item.profiles?.name || 'Usuario'
        }));
        setSuggestions(formattedData);
      }
    } catch (error) {
      console.error('Error in fetchSuggestions:', error);
      toast.error('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de sugerencias
  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = 
      suggestion.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suggestion.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (suggestion.user_name && suggestion.user_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || suggestion.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Buzón de Sugerencias de Usuarios</h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar por mensaje, email o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select 
            value={statusFilter} 
            onValueChange={setStatusFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="reviewed">Revisada</SelectItem>
              <SelectItem value="implemented">Implementada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={fetchSuggestions}
          variant="outline"
          className="md:w-auto"
        >
          Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-gloria-purple border-t-transparent rounded-full"></div>
        </div>
      ) : filteredSuggestions.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuggestions.map((suggestion) => (
                <TableRow key={suggestion.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{suggestion.user_name}</div>
                      <div className="text-sm text-gray-500">{suggestion.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="truncate">{suggestion.message}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(suggestion.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      suggestion.status === 'pending' ? 'bg-yellow-500' :
                      suggestion.status === 'reviewed' ? 'bg-blue-500' :
                      suggestion.status === 'implemented' ? 'bg-green-500' :
                      'bg-gray-500'
                    }>
                      {suggestion.status === 'pending' ? 'Pendiente' :
                       suggestion.status === 'reviewed' ? 'Revisada' :
                       suggestion.status === 'implemented' ? 'Implementada' :
                       suggestion.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={suggestion.status}
                      onValueChange={(value) => updateSuggestionStatus(
                        suggestion.id, 
                        value as 'pending' | 'reviewed' | 'implemented'
                      )}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Cambiar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="reviewed">Revisada</SelectItem>
                        <SelectItem value="implemented">Implementada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No se encontraron sugerencias.</p>
        </div>
      )}
    </div>
  );
};

export default SuggestionsList;
