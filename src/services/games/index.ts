
import * as core from './core';
import * as questions from './questions';
import * as participants from './participants';
import * as liveGame from './liveGame';

// Re-export all functions from the various modules
export const gameService = {
  // Core game functions
  createGame: core.createGame,
  updateGameImage: core.updateGameImage,
  fetchGames: core.fetchGames,
  
  // Question and option management
  createQuestion: questions.createQuestion,
  createOption: questions.createOption,
  
  // Participant management
  joinGame: participants.joinGame,
  leaveGame: participants.leaveGame,
  getGameParticipants: participants.getGameParticipants,
  
  // Live game functionality
  getLiveGameState: liveGame.getLiveGameState,
  subscribeToGameUpdates: liveGame.subscribeToGameUpdates,
  submitAnswer: liveGame.submitAnswer,
  getGameLeaderboard: liveGame.getGameLeaderboard,
  subscribeToLeaderboardUpdates: liveGame.subscribeToLeaderboardUpdates
};
