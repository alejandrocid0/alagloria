
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  required_correct_answers: number;
  category: string;
  created_at: string;
  created_by: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface AchievementWithProgress {
  achievement: Achievement;
  earned: boolean;
  earned_at?: string;
  progress: number; // 0-100 percentage
  current_count: number;
}
