import { supabase } from '../lib/supabase'
import type { Database } from '../types/database.types'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeWithIngredients = Recipe & {
  recipe_ingredients: {
    quantity: number
    unit: string
    notes: string | null
    ingredients: {
      name: string
      category: string | null
    }
  }[]
}

// Fetch recipes
const fetchRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')

  if (error) {
    throw new Error(`Error fetching recipes: ${error.message}`)
  }

  return data // TypeScript knows this is Recipe[]
}

// Fetch recipe with ingredients
const fetchRecipeWithIngredients = async (recipeId: string): Promise<RecipeWithIngredients | null> => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        quantity,
        unit,
        notes,
        ingredients (
          name,
          category
        )
      )
    `)
    .eq('id', recipeId)
    .single()

  if (error) {
    throw new Error(`Error fetching recipe: ${error.message}`)
  }

  return data as RecipeWithIngredients
}

export {fetchRecipes, fetchRecipeWithIngredients}