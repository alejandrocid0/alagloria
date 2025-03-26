
import { useState, useEffect, useCallback } from 'react';
import { gameNotifications } from '@/components/ui/notification-toast';

export const useGameStateValues = (
  gameState: any,
  currentQuestion: any,
  leaderboardData: any[],
  lastAnswerResult: any,
  submitAnswer: (optionId: string) => void
) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [myRank, setMyRank] = useState(0);
  const [myPoints, setMyPoints] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);
  
  // Reset selected option when question changes
  useEffect(() => {
    if (gameState?.status === 'question') {
      setSelectedOption(null);
    }
  }, [gameState?.current_question, gameState?.status]);
  
  // Update my rank and points from leaderboard
  useEffect(() => {
    if (leaderboardData && leaderboardData.length > 0) {
      // Encontrar mi jugador (supone que el primer jugador en la lista es el usuario actual)
      const myPlayer = leaderboardData[0];
      
      if (myPlayer) {
        setMyRank(myPlayer.rank);
        setMyPoints(myPlayer.points);
      }
    }
  }, [leaderboardData]);
  
  // Update last points gained from answer result
  useEffect(() => {
    if (lastAnswerResult && lastAnswerResult.pointsGained) {
      setLastPoints(lastAnswerResult.pointsGained);
      
      // Mostrar notificación basada en el resultado
      if (lastAnswerResult.isCorrect) {
        gameNotifications.correctAnswer(lastAnswerResult.pointsGained);
      } else {
        gameNotifications.wrongAnswer();
      }
    }
  }, [lastAnswerResult]);
  
  // Handle selecting an option
  const handleSelectOption = useCallback((optionId: string) => {
    // Si ya hay una opción seleccionada, no hacer nada
    if (selectedOption) return;
    
    // Establecer la opción seleccionada
    setSelectedOption(optionId);
    
    // Enviar la respuesta al servidor
    submitAnswer(optionId);
    
    // Aplicar efectos visuales o sonoros aquí si se desea
  }, [selectedOption, submitAnswer]);
  
  // Crear un array de jugadores ordenado para el tablero de líderes
  const leaderboard = leaderboardData?.map(player => ({
    ...player,
    // Añadir un campo para un avatar por defecto si no tiene
    avatar: player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=5D3891&color=fff`
  })) || [];
  
  return {
    selectedOption,
    setSelectedOption,
    leaderboard,
    myRank,
    myPoints,
    lastPoints,
    handleSelectOption
  };
};
