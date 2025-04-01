
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FeedbackDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  gameTitle: string;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  gameTitle
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendSuggestion } = useAuth();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error('Por favor, escribe un mensaje antes de enviar');
      return;
    }

    setIsSubmitting(true);
    try {
      // Include the game title in the message for more context
      const fullMessage = `[Feedback de partida "${gameTitle}"]: ${message}`;
      
      const { error } = await sendSuggestion(fullMessage);
      
      if (error) {
        toast.error('No se pudo enviar tu feedback. Por favor, inténtalo de nuevo.');
        console.error('Error al enviar feedback:', error);
      } else {
        toast.success('¡Gracias por tu feedback! Lo valoramos mucho.');
        setMessage('');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error en el envío de feedback:', error);
      toast.error('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-gloria-purple">
            ¿Qué te ha parecido la partida?
          </DialogTitle>
          <DialogDescription>
            Tu opinión nos ayuda a mejorar la aplicación y crear mejores partidas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <Textarea
            placeholder="Cuéntanos tu experiencia, sugerencias o ideas de mejora..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px]"
          />
          
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-1"
            >
              <X size={16} />
              No ahora
            </Button>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !message.trim()}
              className="bg-gloria-purple hover:bg-gloria-purple/90"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enviando...
                </>
              ) : (
                'Enviar feedback'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
