import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateMealPlanInput,
  UpdateMealPlanInput,
  GenerateMealPlanInput,
} from "../lib/types";
import {
  fetchMealPlans,
  fetchMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
} from "../lib/api";

export function useMealPlans() {
  return useQuery({
    queryKey: ["mealPlans"],
    queryFn: fetchMealPlans,
  });
}

export function useMealPlan(id: number) {
  return useQuery({
    queryKey: ["mealPlan", id],
    queryFn: () => fetchMealPlan(id),
  });
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMealPlanInput) => createMealPlan(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
    },
  });
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateMealPlanInput;
    }) => updateMealPlan(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
      void queryClient.invalidateQueries({
        queryKey: ["mealPlan", variables.id],
      });
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMealPlan(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
    },
  });
}

export function useGenerateMealPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GenerateMealPlanInput) => generateMealPlan(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mealPlans"] });
    },
  });
}
