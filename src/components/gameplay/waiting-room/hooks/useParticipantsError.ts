
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useParticipantsError = (
  participantsError: any, 
  refetchParticipants: () => void
) => {
  useEffect(() => {
    if (participantsError) {
      console.error("[WaitingRoom] Error loading participants:", participantsError);
      toast({
        title: "Error de conexión",
        description: "Hubo un problema al cargar los participantes. Intentando reconectar...",
        variant: "destructive",
      });
      
      // Intentar recargar después de un breve retraso
      const retryTimer = setTimeout(() => {
        refetchParticipants();
      }, 5000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [participantsError, refetchParticipants]);
};
