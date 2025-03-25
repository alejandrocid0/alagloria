
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
  
  const handleSelectOption = (optionId: string) => {
    if (optionId === "time_expired") {
      // Si es una expiración de tiempo, simplemente pasamos al estado de resultado
      onStateChange('result');
      return;
    }
    
    // Calculate points based only on time percentage (max 200 points)
    const pointsPercent = timeRemaining / 20; // Assuming 20 seconds is the default time
    const isCorrect = optionId === gameQuestions[currentQuestion]?.correctOption;
    
    if (isCorrect) {
      const pointsEarned = Math.round(200 * pointsPercent);
      onLastPointsChange(pointsEarned);
      onMyPointsChange(myPoints + pointsEarned);
      
      const newRanking = [...ranking];
      const myPosition = newRanking.findIndex(player => player.id === 2);
      
      if (myPosition !== -1) {
        newRanking[myPosition].points += pointsEarned;
        
        newRanking.forEach((player, idx) => {
          if (player.id !== 2) {
            const randomBonus = Math.random() > 0.5 ? Math.floor(Math.random() * pointsEarned) : 0;
            player.points += randomBonus;
          }
        });
        
        newRanking.sort((a, b) => b.points - a.points);
        onRankingChange(newRanking);
        
        const newRank = newRanking.findIndex(player => player.id === 2) + 1;
        onMyRankChange(newRank);
      }
      
      toast({
        title: "¡Respuesta correcta!",
        description: `Has ganado ${pointsEarned} puntos`,
        variant: "default"
      });
    } else {
      if (gameId !== 'demo-123') {
        const newRanking = [...ranking];
        newRanking.forEach((player, idx) => {
          if (player.id !== 2) {
            const randomBonus = Math.random() > 0.3 ? Math.floor(Math.random() * 200) : 0;
            player.points += randomBonus;
          }
        });
        
        newRanking.sort((a, b) => b.points - a.points);
        onRankingChange(newRanking);
        
        const newRank = newRanking.findIndex(player => player.id === 2) + 1;
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
