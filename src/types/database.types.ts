export interface Database {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          name: string
          instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          instructions?: string | null
          created_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          name: string
          category: string | null
          default_unit: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          default_unit?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          default_unit?: string | null
          created_at?: string
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
          notes: string | null
        }
        Insert: {
          id?: string
          recipe_id: string
          ingredient_id: string
          quantity: number
          unit: string
          notes?: string | null
        }
        Update: {
          id?: string
          recipe_id?: string
          ingredient_id?: string
          quantity?: number
          unit?: string
          notes?: string | null
        }
      }
    }
  }
}