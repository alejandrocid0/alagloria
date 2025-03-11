
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      game_results: {
        Row: {
          id: string
          user_id: string
          game_id: string
          game_title: string
          date: string
          position: number
          entry_fee: number
          correct_answers: number
          total_answers: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          game_title: string
          date?: string
          position: number
          entry_fee: number
          correct_answers: number
          total_answers: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          game_title?: string
          date?: string
          position?: number
          entry_fee?: number
          correct_answers?: number
          total_answers?: number
          created_at?: string
        }
      }
    }
  }
}
