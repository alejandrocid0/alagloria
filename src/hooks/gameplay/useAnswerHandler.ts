
import { toast } from '@/hooks/use-toast';
import { Player } from '@/types/game';

type GameState = 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';

interface UseAnswerHandlerProps {
  gameId: string | undefined;
  currentQuestion: number;
  gameQuestions: any[];
  myPoints: number;
  timeRemaining: number;
  ranking: Player[];
  onStateChange: (newState: GameState) => void;
  onMyPointsChange: (points: number) => void;
  onLastPointsChange: (points: number) => void;
  onRankingChange: (ranking: Player[]) => void;
  onMyRankChange: (rank: number) => void;
}

export const useAnswerHandler = ({
  gameId,
  currentQuestion,
  gameQuestions,
  myPoints,
  timeRemaining,
  ranking,
  onStateChange,
  onMyPointsChange,
  onLastPointsChange,
  onRankingChange,
  onMyRankChange
}: UseAnswerHandlerProps) => {
  
  /**
   * Calcula los puntos basados en el tiempo restante
   */
  const calculatePoints = (timeRemainingSeconds: number): number => {
    const pointsPercent = timeRemainingSeconds / 20; // Asumiendo 20 segundos como tiempo máximo
    return Math.round(200 * pointsPercent);
  };

  /**
   * Actualiza la clasificación cuando una respuesta es correcta
   */
  const updateRanking = (pointsEarned: number): Player[] => {
    const newRanking = [...ranking];
    const myPlayerId = "2"; // ID del jugador actual
    
    // Encuentra la posición del jugador actual
    const myPosition = newRanking.findIndex(player => player.id === myPlayerId);
    
    if (myPosition !== -1) {
      // Actualiza los puntos del jugador actual
      newRanking[myPosition].points += pointsEarned;
      
      // Actualiza los puntos de los demás jugadores (simulación)
      newRanking.forEach(player => {
        if (player.id !== myPlayerId) {
          const randomBonus = Math.random() > 0.5 ? Math.floor(Math.random() * pointsEarned) : 0;
          player.points += randomBonus;
        }
      });
      
      // Reordena por puntos (mayor a menor)
      return [...newRanking].sort((a, b) => b.points - a.points);
    }
    
    return newRanking;
  };

  /**
   * Maneja la selección de una opción
   */
  const handleSelectOption = (optionId: string) => {
    if (optionId === "time_expired") {
      // Si es una expiración de tiempo, simplemente pasamos al estado de resultado
      onStateChange('result');
      return;
    }
    
    // Convertir a string el ID de la opción correcta para comparación
    const correctOptionStr = String(gameQuestions[currentQuestion]?.correctOption);
    const isCorrect = optionId === correctOptionStr;
    
    if (isCorrect) {
      const pointsEarned = calculatePoints(timeRemaining);
      onLastPointsChange(pointsEarned);
      onMyPointsChange(myPoints + pointsEarned);
      
      const updatedRanking = updateRanking(pointsEarned);
      onRankingChange(updatedRanking);
      
      // Actualiza el ranking del jugador
      const newRank = updatedRanking.findIndex(player => player.id === "2") + 1;
      onMyRankChange(newRank);
      
      toast({
        title: "¡Respuesta correcta!",
        description: `Has ganado ${pointsEarned} puntos`,
        variant: "default"
      });
    } else {
      // Actualización para el caso de respuesta incorrecta
      if (gameId !== 'demo-123') {
        const updatedRanking = [...ranking];
        
        // Simula puntos para otros jugadores
        updatedRanking.forEach(player => {
          if (player.id !== "2") {
            const randomBonus = Math.random() > 0.3 ? Math.floor(Math.random() * 200) : 0;
            player.points += randomBonus;
          }
        });
        
        const sortedRanking = [...updatedRanking].sort((a, b) => b.points - a.points);
        onRankingChange(sortedRanking);
        
        const newRank = sortedRanking.findIndex(player => player.id === "2") + 1;
        onMyRankChange(newRank);
      }
      
      toast({
        title: "Respuesta incorrecta",
        description: "No has ganado puntos en esta pregunta",
        variant: "destructive"
      });
    }
    
    onStateChange('result');
  };

  return {
    handleSelectOption
  };
};
