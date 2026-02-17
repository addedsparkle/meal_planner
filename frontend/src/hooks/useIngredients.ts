import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateIngredientInput,
  UpdateIngredientInput,
} from "../lib/types";
import {
  fetchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../lib/api";

export function useIngredients(search?: string) {
  return useQuery({
    queryKey: ["ingredients", search],
    queryFn: () => fetchIngredients(search),
  });
}

export function useCreateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIngredientInput) => createIngredient(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useUpdateIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateIngredientInput;
    }) => updateIngredient(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}

export function useDeleteIngredient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteIngredient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
    },
  });
}
