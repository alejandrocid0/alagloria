
// Export all quiz service functions
export * from './core';
export * from './types';

// Define a quizService object for backward compatibility
import * as quizServiceFunctions from './core';

export const quizService = {
  getQuizById: quizServiceFunctions.getQuizById,
  getAllQuizzes: quizServiceFunctions.getAllQuizzes,
  getQuizzesByCategory: quizServiceFunctions.getQuizzesByCategory
};
