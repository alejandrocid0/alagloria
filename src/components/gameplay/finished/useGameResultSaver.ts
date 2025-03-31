
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
      // Solo guardar resultados si:
      // 1. El usuario está autenticado
      // 2. No se han guardado ya
      // 3. La partida tiene preguntas respondidas (totalAnswers > 0)
      // 4. Se ha establecido un ranking válido (myRank > 0)
      // 5. Hay respuestas correctas registradas o el total es mayor que 0
      if (!user || resultSaved || totalAnswers <= 0 || myRank <= 0 || (correctAnswers === 0 && totalAnswers === 0)) {
        console.log('No se guardan resultados:', {
          noUser: !user,
          yaGuardado: resultSaved,
          sinPreguntas: totalAnswers <= 0,
          rankInvalido: myRank <= 0,
          sinRespuestas: correctAnswers === 0 && totalAnswers === 0
        });
        return;
      }
      
      try {
        // Verificar si el juego está realmente en estado "finished"
        const gameState = await gameService.getLiveGameState(gameId);
        
        if (!gameState || gameState.status !== 'finished') {
          console.log('No se guardan resultados: el juego no está en estado "finished"');
          return;
        }
        
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
