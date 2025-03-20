
import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  isSubmitting: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isSubmitting }) => {
  return (
    <Button type="submit" className="w-full" disabled={isSubmitting}>
      {isSubmitting ? (
        <>Guardando...</>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Guardar Partida
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
