
import { useState, useEffect } from 'react';
import { Player, Question } from '@/types/game';
import { mockQuestions } from '@/data/mockQuestions';

const useGameState = (gameId: string | undefined) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | undefined>(undefined);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Set up mock players data
  useEffect(() => {
    const mockPlayers: Player[] = [
      { id: '1', name: 'Usuario', avatar: '', score: 0, rank: 1, lastAnswer: null },
      { id: '2', name: 'María García', avatar: '', score: 0, rank: 2, lastAnswer: null },
      { id: '3', name: 'Juan Pérez', avatar: '', score: 0, rank: 3, lastAnswer: null },
      { id: '4', name: 'Ana Rodríguez', avatar: '', score: 0, rank: 4, lastAnswer: null },
      { id: '5', name: 'Carlos López', avatar: '', score: 0, rank: 5, lastAnswer: null },
      { id: '6', name: 'Laura Martínez', avatar: '', score: 0, rank: 6, lastAnswer: null },
      { id: '7', name: 'Diego Sánchez', avatar: '', score: 0, rank: 7, lastAnswer: null },
      { id: '8', name: 'Sofía Fernández', avatar: '', score: 0, rank: 8, lastAnswer: null },
    ];
    
    setPlayers(mockPlayers);
  }, []);
  
  const handleAnswer = (optionIndex: number, timeRemaining: number) => {
    setAnswered(true);
    setSelectedOption(optionIndex);
    setTimeLeft(timeRemaining);
    
    const currentQ = mockQuestions[currentQuestion];
    let pointsEarned = 0;
    
    // Calculate points based on correct answer and time remaining
    if (optionIndex === currentQ.correctOption) {
      // Base points + time bonus
      pointsEarned = 100 + Math.round((timeRemaining / currentQ.timeLimit) * 100);
      
      // Update player score and last answer status
      setPlayers(prev => {
        const updated = [...prev];
        const userIndex = updated.findIndex(p => p.id === '1');
        
        if (userIndex !== -1) {
          updated[userIndex] = {
            ...updated[userIndex],
            score: updated[userIndex].score + pointsEarned,
            lastAnswer: 'correct'
          };
        }
        
        // Update other players randomly
        updated.forEach((player, index) => {
          if (index !== userIndex) {
            const randomPoints = Math.random() > 0.4 ? Math.round(Math.random() * 200) : 0;
            player.score += randomPoints;
            player.lastAnswer = randomPoints > 0 ? 'correct' : 'incorrect';
          }
        });
        
        // Sort by score and update ranks
        return updated.sort((a, b) => b.score - a.score).map((player, idx) => ({
          ...player,
          rank: idx + 1
        }));
      });
      
      setScore(prev => prev + pointsEarned);
    } else {
      // Set incorrect answer for user
      setPlayers(prev => {
        const updated = [...prev];
        const userIndex = updated.findIndex(p => p.id === '1');
        
        if (userIndex !== -1) {
          updated[userIndex] = {
            ...updated[userIndex],
            lastAnswer: 'incorrect'
          };
        }
        
        // Update other players randomly
        updated.forEach((player, index) => {
          if (index !== userIndex) {
            const randomPoints = Math.random() > 0.4 ? Math.round(Math.random() * 200) : 0;
            player.score += randomPoints;
            player.lastAnswer = randomPoints > 0 ? 'correct' : 'incorrect';
          }
        });
        
        // Sort by score and update ranks
        return updated.sort((a, b) => b.score - a.score).map((player, idx) => ({
          ...player,
          rank: idx + 1
        }));
      });
    }
    
    // Show leaderboard after a short delay
    setTimeout(() => {
      setShowLeaderboard(true);
    }, 2000);
    
    // If this was the last question, mark the game as complete
    if (currentQuestion === mockQuestions.length - 1) {
      setTimeout(() => {
        setGameComplete(true);
      }, 4000);
    } else {
      // Start countdown to next question
      setTimeout(() => {
        setCountdown(5);
        
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              
              // Move to next question
              setTimeout(() => {
                setShowLeaderboard(false);
                setAnswered(false);
                setSelectedOption(undefined);
                setCurrentQuestion(prev => prev + 1);
                setCountdown(null);
              }, 1000);
              
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, 4000);
    }
  };

  return {
    currentQuestion,
    answered,
    selectedOption,
    score,
    timeLeft,
    players,
    showLeaderboard,
    countdown,
    gameComplete,
    handleAnswer,
    questions: mockQuestions,
  };
};

export default useGameState;
