
export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string; // Cambiado de number a string para compatibilidad con UUID
  question: string;
  options: QuizOption[];
  correctOption: string;
  position: number; // Añadido para mantener el orden de las preguntas
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: QuizQuestion[];
}
