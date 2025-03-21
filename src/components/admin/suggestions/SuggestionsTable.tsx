
import React from 'react';
import { SuggestionWithUser } from '@/hooks/useSuggestions';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface SuggestionsTableProps {
  suggestions: SuggestionWithUser[];
  onStatusChange: (id: string, status: 'pending' | 'reviewed' | 'implemented') => void;
}

const SuggestionsTable: React.FC<SuggestionsTableProps> = ({ 
  suggestions, 
  onStatusChange 
}) => {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se encontraron sugerencias.</p>
      </div>
    );
  }

  return (
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
          {suggestions.map((suggestion) => (
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
                <StatusBadge status={suggestion.status} />
              </TableCell>
              <TableCell>
                <Select 
                  defaultValue={suggestion.status}
                  onValueChange={(value) => onStatusChange(
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
  );
};

interface StatusBadgeProps {
  status: 'pending' | 'reviewed' | 'implemented';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const badgeClass = 
    status === 'pending' ? 'bg-yellow-500' :
    status === 'reviewed' ? 'bg-blue-500' :
    status === 'implemented' ? 'bg-green-500' :
    'bg-gray-500';
  
  const statusText = 
    status === 'pending' ? 'Pendiente' :
    status === 'reviewed' ? 'Revisada' :
    status === 'implemented' ? 'Implementada' :
    status;

  return <Badge className={badgeClass}>{statusText}</Badge>;
};

export default SuggestionsTable;
