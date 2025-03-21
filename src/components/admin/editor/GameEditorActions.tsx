
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { GameEditorActionsProps } from './types';

const GameEditorActions: React.FC<GameEditorActionsProps> = ({ onClose, isSaving }) => {
  return (
    <div className="flex space-x-3">
      <Button type="button" variant="outline" onClick={onClose}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <>Guardando...</>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </>
        )}
      </Button>
    </div>
  );
};

export default GameEditorActions;
