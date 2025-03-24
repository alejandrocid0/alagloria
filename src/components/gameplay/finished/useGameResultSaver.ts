
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { gameService } from '@/services/games';
import { toast } from '@/hooks/use-toast';
import { gameNotifications } from '@/components/ui/notification-toast';

interface SaveResultProps {
  gameId: string;
  gameTitle?: string;
  myRank: number;
  correctAnswers: number;
  totalAnswers: number;
}

export const useGameResultSaver = ({
  gameId,
  gameTitle = "Partida",
  myRank,
  correctAnswers,
  totalAnswers
}: SaveResultProps) => {
  const { user } = useAuth();
  const [resultSaved, setResultSaved] = useState(false);
  
  useEffect(() => {
    const saveResults = async () => {
      if (!user || resultSaved) return;
      
      try {
        // Verificar si ya existe un resultado para evitar duplicados
        const exists = await gameService.checkExistingGameResult(gameId);
        if (exists) {
          console.log('Los resultados ya están guardados');
          setResultSaved(true);
          return;
        }
        
        // Guardar resultados
        await gameService.saveGameResult({
          gameId,
          gameTitle,
          position: myRank,
          correctAnswers,
          totalAnswers,
          entryFee: 0 // Ya no se usa el campo entry_fee
        });
        
        console.log('Resultados guardados correctamente');
        setResultSaved(true);
        gameNotifications.resultsSaved();
      } catch (error) {
        console.error('Error al guardar resultados:', error);
        toast({
          title: "Error al guardar tus resultados",
          description: "Hubo un problema guardando tus estadísticas",
          variant: "destructive",
        });
      }
    };
    
    saveResults();
  }, [user, gameId, myRank, gameTitle, correctAnswers, totalAnswers, resultSaved]);
  
  return { resultSaved };
};
