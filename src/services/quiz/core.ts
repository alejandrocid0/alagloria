
import { Quiz } from '@/types/quiz';
import { quizzes, convertToAppQuiz } from './types';

// Obtain all quizzes
export const getAllQuizzes = (): Quiz[] => {
  return quizzes.map(quiz => convertToAppQuiz(quiz));
};

// Obtain a quiz by its ID
export const getQuizById = (quizId: string): Quiz | undefined => {
  const quiz = quizzes.find(quiz => quiz.id === quizId);
  return quiz ? convertToAppQuiz(quiz) : undefined;
};

// Obtain quizzes by category
export const getQuizzesByCategory = (category: string): Quiz[] => {
  return quizzes
    .filter(quiz => quiz.category === category)
    .map(quiz => convertToAppQuiz(quiz));
};
