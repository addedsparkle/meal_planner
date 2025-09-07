import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recipesApi } from '../lib/api'
import type { Recipe } from '../types/Recipe'

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: recipesApi.getAll,
  })
}

export const useCreateRecipe = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (recipe: Omit<Recipe, 'id'>) => recipesApi.create(recipe),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recipes'] })
    },
  })
}