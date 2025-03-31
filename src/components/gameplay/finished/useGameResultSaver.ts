
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
  const [saveAttempts, setSaveAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
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
          
          // Si han pasado más de 3 intentos y seguimos sin poder guardar, notificar al usuario
          if (saveAttempts >= 3) {
            setError('No se pudieron guardar los resultados: el juego no ha finalizado correctamente');
            toast({
              title: "No se pudieron guardar resultados",
              description: "La partida no ha finalizado correctamente",
              variant: "destructive",
            });
          } else {
            // Incrementar intentos y programar otro intento en 5 segundos
            setSaveAttempts(prev => prev + 1);
            setTimeout(saveResults, 5000);
          }
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
        setError(null);
        gameNotifications.resultsSaved();
      } catch (error) {
        console.error('Error al guardar resultados:', error);
        setError('Error al guardar resultados');
        
        // Solo mostrar la notificación en el primer intento fallido
        if (saveAttempts === 0) {
          toast({
            title: "Error al guardar tus resultados",
            description: "Hubo un problema guardando tus estadísticas",
            variant: "destructive",
          });
        }
        
        // Incrementar intentos y programar otro intento si no hemos llegado al límite
        if (saveAttempts < 3) {
          setSaveAttempts(prev => prev + 1);
          setTimeout(saveResults, 5000);
        }
      }
    };
    
    saveResults();
  }, [user, gameId, myRank, gameTitle, correctAnswers, totalAnswers, resultSaved, saveAttempts]);
  
  return { resultSaved, error, saveAttempts };
};
