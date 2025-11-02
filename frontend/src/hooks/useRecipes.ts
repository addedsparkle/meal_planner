import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recipesApi, type RecipeCreateParams } from "../lib/api";

export const useRecipes = () => {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: recipesApi.getAll,
  });
};

export const useCreateRecipe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipe: RecipeCreateParams) => recipesApi.create(recipe),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
};
