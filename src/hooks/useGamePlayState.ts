
import { useGameInitialization } from './gameplay/useGameInitialization';
import { useGameActions } from './gameplay/useGameActions';
import { useGameCountdown } from './gameplay/useGameCountdown';
import { useAnswerHandler } from './gameplay/useAnswerHandler';

export const useGamePlayState = (gameId: string) => {
  // Inicialización de datos del juego
  const {
    gameQuestions,
    gameInfo,
    isLoading,
    error
  } = useGameInitialization(gameId);

  // Crear variables dummy para satisfacer el tipo esperado mientras implementamos correctamente
  const ranking = [];
  const myRank = 0;
  const setRanking = () => {};
  const setMyRank = () => {};

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
  const { countdown, timeRemaining: questionTimeRemaining } = useGameCountdown({
    currentState,
    selectedOption,
    currentQuestion,
    gameQuestionsLength: gameQuestions.length,
    onStateChange: (state) => setCurrentState(state as any),
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
    timeRemaining: questionTimeRemaining,
    ranking,
    onStateChange: (state) => setCurrentState(state as any),
    onMyPointsChange: setMyPoints,
    onLastPointsChange: setLastPoints,
    onRankingChange: setRanking,
    onMyRankChange: setMyRank
  });

  return {
    gameId,
    quizTitle: gameInfo?.title,
    loading: isLoading,
    error,
    currentState,
    countdown,
    currentQuestion,
    selectedOption,
    timeRemaining: questionTimeRemaining,
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
