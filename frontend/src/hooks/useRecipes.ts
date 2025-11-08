import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recipesApi } from "../lib/api";
import { addNewRecipeWithIngredients } from "../lib/recipes";
import type { RecipeIn } from "../types/Recipe";

export const useRecipes = () => {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: recipesApi.getAll,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: RecipeIn) => addNewRecipeWithIngredients(recipe),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
