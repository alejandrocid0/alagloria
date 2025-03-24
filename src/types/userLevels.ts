
export interface UserLevel {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  required_correct_answers: number;
  level_order: number;
  category: string;
  created_at: string;
  created_by: string;
}

export interface UserLevelProgress {
  id: string;
  user_id: string;
  current_level_id: string;
  earned_at: string;
  user_level?: UserLevel;
}

export interface UserLevelWithProgress {
  level: UserLevel;
  isCurrentLevel: boolean;
  isAchieved: boolean; 
  progress: number; // 0-100 percentage
  currentAnswers: number;
  nextLevelAnswers?: number; // Requisito para el siguiente nivel
}
