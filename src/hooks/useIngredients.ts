import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ingredientsApi } from '../lib/api'
import type { Ingredient } from '../types/Ingredient'

export const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: ingredientsApi.getAll,
  })
}

export const useCreateRecipe = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (ingredient: Omit<Ingredient, 'id'>) => ingredientsApi.create(ingredient),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ingredients'] })
    },
  })
}