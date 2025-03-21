
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string; // String type for ID
  question: string;
  options: QuizOption[];
  correctOption: string;
  position: number; // For ordering the questions
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
}
