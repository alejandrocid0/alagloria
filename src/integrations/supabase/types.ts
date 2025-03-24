export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements_old: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string
          icon_name: string
          id: string
          name: string
          required_correct_answers: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description: string
          icon_name: string
          id?: string
          name: string
          required_correct_answers: number
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          required_correct_answers?: number
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      game_participants: {
        Row: {
          created_at: string | null
          game_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_participants_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      game_results: {
        Row: {
          correct_answers: number
          created_at: string
          date: string
          entry_fee: number
          game_id: string
          game_title: string
          id: string
          position: number
          total_answers: number
          user_id: string
        }
        Insert: {
          correct_answers?: number
          created_at?: string
          date?: string
          entry_fee?: number
          game_id: string
          game_title: string
          id?: string
          position: number
          total_answers?: number
          user_id: string
        }
        Update: {
          correct_answers?: number
          created_at?: string
          date?: string
          entry_fee?: number
          game_id?: string
          game_title?: string
          id?: string
          position?: number
          total_answers?: number
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          date: string
          description: string | null
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_game_answers: {
        Row: {
          answer_time_ms: number
          created_at: string
          game_id: string
          id: string
          is_correct: boolean
          points: number
          question_position: number
          selected_option: string
          user_id: string
        }
        Insert: {
          answer_time_ms: number
          created_at?: string
          game_id: string
          id?: string
          is_correct: boolean
          points: number
          question_position: number
          selected_option: string
          user_id: string
        }
        Update: {
          answer_time_ms?: number
          created_at?: string
          game_id?: string
          id?: string
          is_correct?: boolean
          points?: number
          question_position?: number
          selected_option?: string
          user_id?: string
        }
        Relationships: []
      }
      live_games: {
        Row: {
          countdown: number
          current_question: number
          id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          countdown?: number
          current_question?: number
          id: string
          started_at?: string
          status: string
          updated_at?: string
        }
        Update: {
          countdown?: number
          current_question?: number
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_games_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_games_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "games_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      option_templates: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean
          option_text: string
          position: number
          question_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_text: string
          position: number
          question_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean
          option_text?: string
          position?: number
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "option_templates_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      options: {
        Row: {
          created_at: string
          id: string
          option_id: string
          option_text: string
          position: number
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          option_text: string
          position: number
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          option_text?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          correct_answers_by_category: Json | null
          created_at: string
          current_level_id: string | null
          current_level_progress: number | null
          email: string
          id: string
          is_admin: boolean | null
          name: string
        }
        Insert: {
          correct_answers_by_category?: Json | null
          created_at?: string
          current_level_id?: string | null
          current_level_progress?: number | null
          email: string
          id: string
          is_admin?: boolean | null
          name: string
        }
        Update: {
          correct_answers_by_category?: Json | null
          created_at?: string
          current_level_id?: string | null
          current_level_progress?: number | null
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_level_id_fkey"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "user_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      question_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          difficulty: string | null
          id: string
          question_text: string
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          id?: string
          question_text: string
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          id?: string
          question_text?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_option: string
          created_at: string
          game_id: string
          id: string
          position: number
          question_text: string
          updated_at: string
        }
        Insert: {
          correct_option: string
          created_at?: string
          game_id: string
          id?: string
          position: number
          question_text: string
          updated_at?: string
        }
        Update: {
          correct_option?: string
          created_at?: string
          game_id?: string
          id?: string
          position?: number
          question_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements_old: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements_old"
            referencedColumns: ["id"]
          },
        ]
      }
      user_level_progress: {
        Row: {
          current_level_id: string | null
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          current_level_id?: string | null
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          current_level_id?: string | null
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_level_progress_current_level_id_fkey"
            columns: ["current_level_id"]
            isOneToOne: false
            referencedRelation: "user_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          icon_name: string
          id: string
          level_order: number
          name: string
          required_correct_answers: number
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          description: string
          icon_name: string
          id?: string
          level_order: number
          name: string
          required_correct_answers: number
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          icon_name?: string
          id?: string
          level_order?: number
          name?: string
          required_correct_answers?: number
        }
        Relationships: []
      }
      user_suggestions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      games_with_details: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          creator_name: string | null
          date: string | null
          description: string | null
          id: string | null
          image_url: string | null
          participants_count: number | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_scheduled_games: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_scheduled_games: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_game_from_templates: {
        Args: {
          p_title: string
          p_description: string
          p_date: string
          p_category: string
          p_num_questions: number
          p_created_by: string
        }
        Returns: string
      }
      get_game_leaderboard: {
        Args: {
          game_id: string
        }
        Returns: {
          user_id: string
          name: string
          total_points: number
          last_answer: string
        }[]
      }
      get_live_game_state: {
        Args: {
          game_id: string
        }
        Returns: {
          id: string
          status: string
          current_question: number
          countdown: number
          started_at: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      start_live_game: {
        Args: {
          game_id: string
        }
        Returns: undefined
      }
      submit_game_answer: {
        Args: {
          p_game_id: string
          p_user_id: string
          p_question_position: number
          p_selected_option: string
          p_answer_time_ms: number
        }
        Returns: {
          is_correct: boolean
          points: number
          correctoption: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
