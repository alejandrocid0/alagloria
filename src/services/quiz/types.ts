
/**
 * Represents a quiz question with options
 */
export interface QuizQuestion {
  id: string;
  text: string;
  position: number;
  correctOption: string;
  options: QuizQuestionOption[];
}

/**
 * Represents a single option for a quiz question
 */
export interface QuizQuestionOption {
  id: string;
  optionId: string;
  text: string;
}

/**
 * Represents a submission of a quiz answer
 */
export interface QuizSubmission {
  gameId: string;
  userId: string;
  questionPosition: number;
  selectedOption: string;
  answerTimeMs?: number;
}
