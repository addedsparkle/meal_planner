import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecipeInput } from "../lib/types";
import {
  fetchRecipes,
  fetchRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  importRecipesCsv,
} from "../lib/api";

export function useRecipes() {
  return useQuery({
    queryKey: ["recipes"],
    queryFn: fetchRecipes,
  });
}

export function useRecipe(id: number) {
  return useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetchRecipe(id),
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RecipeInput) => createRecipe(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecipeInput }) =>
      updateRecipe(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["recipes"] });
      void queryClient.invalidateQueries({
        queryKey: ["recipe", variables.id],
      });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRecipe(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recipes"] });
    },
  });
}

export function useImportRecipesCsv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importRecipesCsv(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recipes"] });
      void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}
