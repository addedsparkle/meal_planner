import { useQuery } from "@tanstack/react-query";
import { fetchShoppingList } from "../lib/api";

export function shoppingListQueryKey(mealPlanId: number) {
  return ["shoppingList", mealPlanId] as const;
}

export function useShoppingList(mealPlanId: number | null) {
  return useQuery({
    queryKey: mealPlanId !== null ? shoppingListQueryKey(mealPlanId) : ["shoppingList", null],
    queryFn: () => fetchShoppingList(mealPlanId!),
    enabled: mealPlanId !== null,
  });
}
