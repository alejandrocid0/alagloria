
import { useGameInitialization } from './gameplay/useGameInitialization';
import { useGameActions } from './gameplay/useGameActions';
import { useGameCountdown } from './gameplay/useGameCountdown';
import { useAnswerHandler } from './gameplay/useAnswerHandler';

export const useGamePlayState = () => {
  // Inicialización de datos del juego
  const {
    gameId,
    quizTitle,
    loading,
    error,
    gameQuestions,
    ranking,
    myRank,
    setRanking,
    setMyRank
  } = useGameInitialization();

  // Acciones básicas del juego (estado, preguntas, opciones, etc.)
  const {
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
  } = useGameActions();

  // Manejo de temporizadores y cambios de estado automáticos
  const { countdown } = useGameCountdown({
    currentState,
    selectedOption,
    currentQuestion,
    gameQuestionsLength: gameQuestions.length,
    onStateChange: setCurrentState,
    onCurrentQuestionChange: setCurrentQuestion,
    onSelectedOptionChange: setSelectedOption,
    onTimeRemainingChange: setTimeRemaining
  });

  // Manejo de respuestas y puntuaciones
  const { handleSelectOption } = useAnswerHandler({
    gameId,
    currentQuestion,
    gameQuestions,
    myPoints,
    timeRemaining,
    ranking,
    onStateChange: setCurrentState,
    onMyPointsChange: setMyPoints,
    onLastPointsChange: setLastPoints,
    onRankingChange: setRanking,
    onMyRankChange: setMyRank
  });

  return {
    gameId,
    quizTitle,
    loading,
    error,
    currentState,
    countdown,
    currentQuestion,
    selectedOption,
    timeRemaining,
    myPoints,
    ranking,
    myRank,
    lastPoints,
    gameQuestions,
    startGame,
    handleSelectOption
  };
};

export default useGamePlayState;
