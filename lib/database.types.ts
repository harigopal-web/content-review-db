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
      entries: {
        Row: {
          id: string
          title: string
          year: number
          score: number
          medium: 'Movie' | 'TV' | null
          type: string | null
          tags: string[] | null
          hall_of_fame: boolean | null
          poster_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          year: number
          score: number
          medium?: 'Movie' | 'TV' | null
          type?: string | null
          tags?: string[] | null
          hall_of_fame?: boolean | null
          poster_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          year?: number
          score?: number
          medium?: 'Movie' | 'TV' | null
          type?: string | null
          tags?: string[] | null
          hall_of_fame?: boolean | null
          poster_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          entry_id: string
          vote_type: 'agree' | 'disagree-higher' | 'disagree-lower'
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          vote_type: 'agree' | 'disagree-higher' | 'disagree-lower'
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          vote_type?: 'agree' | 'disagree-higher' | 'disagree-lower'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
