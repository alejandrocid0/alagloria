
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { submitPlayerAnswer } from './playerUtils';
import { fetchUserAchievements } from '@/services/achievementService';
import { toast } from 'sonner';

export const usePlayerAnswers = (
  gameId: string | undefined,
  gameState: any,
  setLeaderboard: (leaderboard: any[]) => void,
  isConnected: boolean,
  scheduleReconnect: () => void
) => {
  const { user } = useAuth();
  const [lastAnswerResult, setLastAnswerResult] = useState<any>(null);
  const [previousAchievements, setPreviousAchievements] = useState<string[]>([]);
  const [isFetchingAchievements, setIsFetchingAchievements] = useState(false);

  // Función para enviar respuesta
  const submitAnswer = async (optionId: string, answerTimeMs: number) => {
    if (!gameId || !user || !gameState || !isConnected) {
      console.error('No se puede enviar respuesta: falta información necesaria');
      return;
    }
    
    try {
      // Si no hemos cargado los logros previos, los cargamos
      if (!isFetchingAchievements && previousAchievements.length === 0) {
        setIsFetchingAchievements(true);
        const userAchievements = await fetchUserAchievements(user.id);
        setPreviousAchievements(userAchievements.map(ua => ua.achievement_id));
        setIsFetchingAchievements(false);
      }
      
      // Enviar respuesta
      const result = await submitPlayerAnswer(
        gameId,
        user.id,
        gameState.current_question,
        optionId,
        answerTimeMs
      );
      
      setLastAnswerResult({
        isCorrect: result.is_correct,
        points: result.points,
        correctOption: result.correctOption
      });
      
      // Verificar si hay nuevos logros obtenidos
      setTimeout(async () => {
        try {
          const newAchievements = await fetchUserAchievements(user.id);
          const newAchievementsIds = newAchievements.map(ua => ua.achievement_id);
          
          const justEarnedAchievements = newAchievements.filter(
            ua => !previousAchievements.includes(ua.achievement_id)
          );
          
          // Mostrar notificaciones para los nuevos logros
          justEarnedAchievements.forEach(achievement => {
            if (achievement.achievement) {
              toast.success(
                `¡Nuevo logro desbloqueado: ${achievement.achievement.name}!`,
                {
                  description: achievement.achievement.description,
                  duration: 5000
                }
              );
            }
          });
          
          // Actualizar la lista de logros previos
          setPreviousAchievements(newAchievementsIds);
        } catch (err) {
          console.error('Error al verificar nuevos logros:', err);
        }
      }, 1000); // Esperar 1 segundo después de enviar la respuesta
      
    } catch (err) {
      console.error('Error al enviar respuesta:', err);
      if (isConnected) {
        scheduleReconnect(); // Programar reconexión en caso de error
      }
    }
  };

  return { lastAnswerResult, submitAnswer };
};
