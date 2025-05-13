
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  category?: string;
  date: string; // ISO date string
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizWithDetails extends Quiz {
  creator_name?: string;
  participants_count?: number;
}
