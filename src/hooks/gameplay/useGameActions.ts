
import { useState } from 'react';

type GameState = 'waiting' | 'question' | 'result' | 'leaderboard' | 'finished';

export const useGameActions = () => {
  const [currentState, setCurrentState] = useState<GameState>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [myPoints, setMyPoints] = useState(0);
  const [lastPoints, setLastPoints] = useState(0);

  const startGame = () => {
    setCurrentState('question');
  };

  return {
    currentState,
    setCurrentState,
    currentQuestion,
    setCurrentQuestion,
    selectedOption,
    setSelectedOption,
    timeRemaining,
    setTimeRemaining,
    myPoints,
    setMyPoints,
    lastPoints,
    setLastPoints,
    startGame
  };
};
