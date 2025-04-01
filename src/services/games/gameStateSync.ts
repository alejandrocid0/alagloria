
import { gameScheduling } from './modules/gameScheduling';
import { gameStateUpdates } from './modules/gameStateUpdates';
import { gameTimeSync } from './modules/gameTimeSync';
import { gameResults } from './modules/gameResults';

/**
 * Servicio simplificado para gestionar la sincronización del estado del juego
 */
export const gameStateSync = {
  // Scheduling
  checkScheduledGames: gameScheduling.checkScheduledGames,
  scheduleGame: gameScheduling.scheduleGame,
  startGame: gameScheduling.startGame,
  
  // State updates
  getGameState: gameStateUpdates.getGameState,
  subscribeToGameChanges: gameStateUpdates.subscribeToGameChanges,
  advanceGameState: gameStateUpdates.advanceGameState,
  
  // Time synchronization
  syncWithServerTime: gameTimeSync.syncWithServerTime,
  
  // Game results
  saveGameResults: gameResults.saveGameResults
};
